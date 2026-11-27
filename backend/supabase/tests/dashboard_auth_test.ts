import { withSupabase } from 'npm:@supabase/server@1.9.2';
import { exportJWK, generateKeyPair, SignJWT } from 'npm:jose@6';
import ExcelJS from 'npm:exceljs@4.4.0';
import { handleDashboard } from '../functions/dashboard/service.ts';

Deno.test('the Supabase wrapper rejects missing or invalid JWTs and exposes the verified user ID', async () => {
  const { publicKey, privateKey } = await generateKeyPair('ES256', { extractable: true });
  const jwk = { ...await exportJWK(publicKey), kid: 'test-key', alg: 'ES256', use: 'sig' };
  Deno.env.set('SUPABASE_URL', 'https://example.supabase.co');
  Deno.env.set('SUPABASE_PUBLISHABLE_KEYS', JSON.stringify({ default: 'sb_publishable_test' }));
  Deno.env.set('SUPABASE_JWKS', JSON.stringify({ keys: [jwk] }));
  const handler = withSupabase({ auth: 'user' }, (_request, ctx) =>
    Promise.resolve(Response.json({ id: ctx.userClaims!.id }))
  );
  const url = 'https://example.supabase.co/functions/v1/dashboard';
  const missing = await handler(new Request(url, { method: 'POST' }));
  if (missing.status !== 401) throw new Error(`Expected 401 for missing credentials, got ${missing.status}`);
  const invalid = await handler(new Request(url, { method: 'POST', headers: { Authorization: 'Bearer invalid' } }));
  if (invalid.status !== 401) throw new Error(`Expected 401 for an invalid token, got ${invalid.status}`);
  const token = await new SignJWT({ role: 'authenticated' })
    .setProtectedHeader({ alg: 'ES256', kid: 'test-key' })
    .setSubject('10000000-0000-0000-0000-000000000001')
    .setIssuer('https://example.supabase.co/auth/v1')
    .setAudience('authenticated')
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(privateKey);
  const valid = await handler(new Request(url, { method: 'POST', headers: { Authorization: `Bearer ${token}` } }));
  const body = await valid.json();
  if (valid.status !== 200 || body.id !== '10000000-0000-0000-0000-000000000001') {
    throw new Error(`Expected verified user identity, got status ${valid.status}`);
  }
});

Deno.test('ticket export produces a readable workbook in the Deno runtime', async () => {
  const pour = { id: 'pour-1', user_id: 'user-1', name: 'Test', status: 'active',
    expected_yardage: 12, started_at: '2026-01-01T00:00:00Z' };
  const ticket = { user_id: 'user-1', job_id: 'pour-1', ticket_number: 'T-1', status: 'available',
    download_url: 'https://example.com/ticket', created_at: '2026-01-01T00:00:00Z' };
  const client = { from(table: string) {
    const query = {
      select() { return query; }, eq() { return query; }, order() { return query; },
      maybeSingle() { return Promise.resolve({ data: pour, error: null }); },
      then(resolve: (value: unknown) => unknown) { return Promise.resolve({ data: table === 'trucking_tickets' ? [ticket] : [], error: null }).then(resolve); },
    };
    return query;
  } };
  const response = await handleDashboard(new Request('https://example.test', {
    method: 'POST', body: JSON.stringify({ action: 'export-tickets' }),
  }), client, 'user-1', ExcelJS);
  if (response.status !== 200) throw new Error(`Expected workbook, got ${response.status}`);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(new Uint8Array(await response.arrayBuffer()) as any);
  if (workbook.getWorksheet('Tickets')?.getRow(9).getCell(1).value !== 'T-1') throw new Error('Workbook is missing the ticket');
});
