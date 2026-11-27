import assert from 'node:assert/strict';
import test from 'node:test';
import ExcelJS from 'exceljs';

import { handleDashboard } from '../supabase/functions/dashboard/service';

type Row = Record<string, any>;

// Simulate RLS in addition to the handler's explicit owner filters. These tests
// exercise handler behavior; the SQL tests exercise real Postgres policies.
function makeClient(userId: string, tables: Record<string, Row[]>) {
  class Query {
    filters: ((row: Row) => boolean)[] = [(row) => row.user_id === userId];
    mode: 'select' | 'update' | 'insert' = 'select';
    value: Row = {};
    constructor(private table: string) {}
    select() { return this; }
    eq(key: string, value: unknown) { this.filters.push((row) => row[key] === value); return this; }
    is(key: string, value: unknown) { return this.eq(key, value); }
    order() { return this; }
    limit() { return this; }
    update(value: Row) { this.mode = 'update'; this.value = value; return this; }
    insert(value: Row) { this.mode = 'insert'; this.value = value; return this; }
    run() {
      if (this.mode === 'insert') {
        const row: Row = { id: `new-${tables[this.table].length}`, created_at: new Date().toISOString(), ...this.value };
        if (row.user_id !== userId) return { data: null, error: { code: '42501' } };
        tables[this.table].push(row);
        return { data: [row], error: null };
      }
      const rows = tables[this.table].filter((row) => this.filters.every((filter) => filter(row)));
      if (this.mode === 'update') rows.forEach((row) => Object.assign(row, this.value));
      return { data: rows, error: null };
    }
    async maybeSingle() { const { data, error } = this.run(); return { data: data?.[0] ?? null, error }; }
    single() { return this.maybeSingle(); }
    then(resolve: (value: unknown) => unknown) { return Promise.resolve(this.run()).then(resolve); }
  }
  return {
    from: (table: string) => new Query(table),
    rpc: (_name: string, input: Row) => ({
      single: async () => {
        if (tables.pours.some((p) => p.user_id === userId && p.status === 'active')) return { data: null, error: { code: '23505' } };
        const row = { id: `pour-${userId}`, user_id: userId, name: input.p_name, expected_yardage: input.p_expected_yardage,
          status: 'active', started_at: input.p_started_at ?? new Date().toISOString(), supplier_order_number: input.p_supplier_order_number,
          supplier_plant_id: input.p_supplier_plant_id, supplier_name: input.p_supplier_name, supplier_plant_name: input.p_supplier_plant_name,
          supplier_platform: input.p_supplier_platform };
        tables.pours.push(row);
        return { data: row, error: null };
      },
    }),
  };
}

function fixtures() {
  const tables: Record<string, Row[]> = {
    pours: [], loads: [], activity_events: [], trucking_tickets: [],
  };
  return { tables, a: makeClient('user-a', tables), b: makeClient('user-b', tables) };
}

async function call(client: any, userId: string, body: Row, method = 'POST') {
  const request = new Request('https://example.test/dashboard', { method, ...(method === 'POST' ? { body: JSON.stringify(body) } : {}) });
  return handleDashboard(request, client, userId, ExcelJS);
}

test('users can each start a pour without seeing or completing the other user’s pour', async () => {
  const { tables, a, b } = fixtures();
  assert.equal((await call(a, 'user-a', { action: 'start', name: 'A', expectedYardage: 20, user_id: 'user-b' })).status, 200);
  assert.equal(tables.pours[0].user_id, 'user-a');
  assert.equal(await (await call(b, 'user-b', { action: 'active' })).json(), null);
  assert.equal((await call(b, 'user-b', { action: 'complete' })).status, 404);
  assert.equal((await call(b, 'user-b', { action: 'start', name: 'B', expectedYardage: 30 })).status, 200);
  assert.equal((await call(a, 'user-a', { action: 'start', name: 'Again', expectedYardage: 1 })).status, 409);
  assert.equal((await (await call(a, 'user-a', { action: 'active' })).json()).name, 'A');
  assert.equal((await (await call(b, 'user-b', { action: 'active' })).json()).name, 'B');
  assert.equal((await call(a, 'user-a', { action: 'complete' })).status, 200);
  assert.equal(tables.pours.find((p) => p.user_id === 'user-b')?.status, 'active');
});

test('tickets cannot be attached to another user’s pour or exported across accounts', async () => {
  const { tables, a, b } = fixtures();
  const aId = '20000000-0000-0000-0000-000000000001';
  const bId = '20000000-0000-0000-0000-000000000002';
  tables.pours.push({ id: aId, user_id: 'user-a', name: 'A', status: 'active', expected_yardage: 10, started_at: new Date().toISOString() },
    { id: bId, user_id: 'user-b', name: 'B', status: 'active', expected_yardage: 20, started_at: new Date().toISOString() });
  assert.equal((await call(a, 'user-a', { action: 'create-ticket', jobId: bId, ticketNumber: 'stolen' })).status, 404);
  assert.equal((await call(a, 'user-a', { action: 'create-ticket', jobId: aId, ticketNumber: 'A-1', user_id: 'user-b' })).status, 200);
  assert.equal(tables.trucking_tickets[0].user_id, 'user-a');
  assert.deepEqual(await (await call(b, 'user-b', { action: 'tickets' })).json(), []);
  const response = await call(a, 'user-a', { action: 'export-tickets' });
  assert.equal(response.status, 200);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(Buffer.from(await response.arrayBuffer()) as any);
  assert.equal(workbook.getWorksheet('Tickets')?.getRow(9).getCell(1).value, 'A-1');
  const otherResponse = await call(b, 'user-b', { action: 'export-tickets' });
  const otherWorkbook = new ExcelJS.Workbook();
  await otherWorkbook.xlsx.load(Buffer.from(await otherResponse.arrayBuffer()) as any);
  assert.equal(otherWorkbook.getWorksheet('Tickets')?.getRow(9).getCell(1).value, null);
});

test('invalid input and unsupported operations are rejected', async () => {
  const { a } = fixtures();
  assert.equal((await call(a, 'user-a', { action: 'start', name: '', expectedYardage: 10 })).status, 400);
  assert.equal((await call(a, 'user-a', { action: 'start', name: 'A', expectedYardage: -1 })).status, 400);
  assert.equal((await call(a, 'user-a', { action: 'create-ticket', downloadUrl: 'javascript:alert(1)' })).status, 400);
  assert.equal((await call(a, 'user-a', { action: 'unknown' })).status, 400);
  assert.equal((await call(a, 'user-a', {}, 'GET')).status, 405);
});
