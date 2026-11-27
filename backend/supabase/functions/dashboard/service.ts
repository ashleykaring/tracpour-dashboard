// The authenticated client and verified user ID are supplied by the edge
// entrypoint. Keeping the handler independent of the runtime allows testing it.
type Client = any;
type WorkbookLibrary = any;

class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

function check(error: { code?: string; message?: string } | null) {
  if (!error) return;
  if (error.code === '23505') throw new ApiError(409, 'A pour is already active. End it before starting another.');
  if (error.code === '22023' || error.code === '22P02') throw new ApiError(400, 'Invalid request data.');
  console.error('Dashboard database operation failed', error.code);
  throw new ApiError(500, 'Unable to complete the request.');
}

function text(value: unknown, max = 200): string | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string' || value.trim().length > max) throw new ApiError(400, 'Invalid text value.');
  return value.trim() || undefined;
}

function date(value: unknown): string | undefined {
  const result = text(value, 64);
  if (result && (!/^\d{4}-\d\d-\d\dT/.test(result) || !Number.isFinite(Date.parse(result)))) {
    throw new ApiError(400, 'Invalid timestamp.');
  }
  return result;
}

function serializePour(p: any) {
  return { id: p.id, name: p.name, expectedYardage: p.expected_yardage, status: p.status,
    startedAt: p.started_at, endedAt: p.ended_at ?? undefined,
    supplierOrderNumber: p.supplier_order_number ?? undefined, supplierPlantId: p.supplier_plant_id ?? undefined,
    supplierPlantName: p.supplier_plant_name ?? undefined, supplierName: p.supplier_name ?? undefined,
    supplierPlatform: p.supplier_platform ?? undefined };
}

function serializeTicket(t: any) {
  return { id: t.id, jobId: t.job_id ?? undefined, status: t.status, truckLabel: t.truck_label ?? undefined,
    ticketNumber: t.ticket_number ?? undefined, deliveredAt: t.delivered_at ?? undefined,
    yardage: t.yardage ?? undefined, downloadUrl: t.download_url ?? undefined };
}

async function activePour(client: Client, userId: string) {
  const { data, error } = await client.from('pours').select('*').eq('user_id', userId)
    .eq('status', 'active').maybeSingle();
  check(error);
  return data;
}

async function ticketsFor(client: Client, userId: string, jobId: string) {
  const { data, error } = await client.from('trucking_tickets').select('*').eq('user_id', userId)
    .eq('job_id', jobId).order('delivered_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });
  check(error);
  return data ?? [];
}

function supplierOrder(pour: any) {
  if (!pour.supplier_order_number || !pour.supplier_plant_id) return null;
  return { id: `${pour.id}-supplier-order`, pourId: pour.id, orderNumber: pour.supplier_order_number,
    supplierName: pour.supplier_name ?? 'Other', supplierPlantName: pour.supplier_plant_name ?? undefined,
    platform: pour.supplier_platform === 'cemex_go_mock' ? 'CEMEX Go-style API mock' :
      pour.supplier_platform === 'manual' ? 'Manual / No API connected' : 'Command Alkon-style API mock',
    mixDesign: '4000 PSI', orderedYardage: 344, batchedYardage: 47.5,
    trucksEnRoute: 2, nextTruckEtaMinutes: 12, lastSyncedAt: new Date().toISOString() };
}

async function workbookResponse(pour: any, tickets: any[], ExcelJS: WorkbookLibrary) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'TracPour';
  const sheet = workbook.addWorksheet('Tickets', { views: [{ state: 'frozen', ySplit: 8 }] });
  sheet.columns = [18, 16, 22, 12, 14, 28, 22].map((width) => ({ width }));
  const cellDate = (value: string | null) => {
    if (!value) return '';
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed;
  };
  for (const row of [['Pour', pour.name], ['Pour ID', pour.id], ['Started At', cellDate(pour.started_at)],
    ['Expected Yardage', pour.expected_yardage], ['Supplier', pour.supplier_name ?? ''],
    ['Supplier Order', pour.supplier_order_number ?? ''], []]) sheet.addRow(row);
  for (let row = 1; row <= 6; row++) sheet.getRow(row).getCell(1).font = { bold: true };
  const header = sheet.addRow(['Ticket #', 'Truck', 'Delivered At', 'Yardage', 'Status', 'Download', 'Created At']);
  header.font = { bold: true };
  header.eachCell((cell: any) => { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE7EEF8' } }; });
  for (const ticket of tickets) {
    const row = sheet.addRow([ticket.ticket_number ?? '', ticket.truck_label ?? '', cellDate(ticket.delivered_at),
      ticket.yardage ?? '', ticket.status, ticket.download_url ? { text: 'Open ticket', hyperlink: ticket.download_url } : '',
      cellDate(ticket.created_at)]);
    row.getCell(3).numFmt = 'm/d/yyyy h:mm AM/PM';
    row.getCell(4).numFmt = '0.00';
    row.getCell(7).numFmt = 'm/d/yyyy h:mm AM/PM';
    if (ticket.download_url) row.getCell(6).font = { color: { argb: 'FF1D4ED8' }, underline: true };
  }
  const buffer = await workbook.xlsx.writeBuffer();
  const filename = (pour.name.trim().replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'pour') + '-tickets.xlsx';
  return new Response(buffer, { headers: {
    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'Content-Disposition': `attachment; filename="${filename}"`,
    'Access-Control-Expose-Headers': 'Content-Disposition',
  } });
}

async function createTicket(client: Client, userId: string, input: any) {
  const jobId = text(input.jobId, 36);
  if (jobId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(jobId)) throw new ApiError(400, 'Invalid pour ID.');
  const ticketNumber = text(input.ticketNumber);
  const downloadUrl = text(input.downloadUrl, 2048);
  if (!ticketNumber && !downloadUrl) throw new ApiError(400, 'Provide a ticket number or download URL.');
  if (downloadUrl) {
    try { if (!['http:', 'https:'].includes(new URL(downloadUrl).protocol)) throw new Error(); }
    catch { throw new ApiError(400, 'Invalid download URL.'); }
  }
  const truckLabel = text(input.truckLabel) ?? (text(input.truck) ? `Truck ${text(input.truck)}` : undefined);
  const deliveredAt = date(input.deliveredAt);
  const yardage = input.yardage ?? input.quant;
  if (yardage != null && (typeof yardage !== 'number' || !Number.isFinite(yardage) || yardage <= 0)) throw new ApiError(400, 'Invalid yardage.');
  const status = input.status;
  if (status != null && status !== 'available' && status !== 'pending') throw new ApiError(400, 'Invalid ticket status.');

  let resolvedId = jobId;
  if (jobId) {
    const { data, error } = await client.from('pours').select('id').eq('user_id', userId).eq('id', jobId).maybeSingle();
    check(error);
    if (!data) throw new ApiError(404, 'Pour not found.');
  } else resolvedId = (await activePour(client, userId))?.id;

  async function find(field: string, value: string) {
    let query = client.from('trucking_tickets').select('*').eq('user_id', userId).eq(field, value);
    query = resolvedId ? query.eq('job_id', resolvedId) : query.is('job_id', null);
    const { data, error } = await query.order('created_at', { ascending: false }).limit(1).maybeSingle();
    check(error);
    return data;
  }
  const existing = (ticketNumber && await find('ticket_number', ticketNumber)) || (downloadUrl && await find('download_url', downloadUrl));
  const row = { user_id: userId, job_id: resolvedId ?? null, status: status ?? (downloadUrl ? 'available' : existing?.status ?? 'pending'),
    ticket_number: ticketNumber ?? existing?.ticket_number ?? null, truck_label: truckLabel ?? existing?.truck_label ?? null,
    delivered_at: deliveredAt ?? existing?.delivered_at ?? null, yardage: yardage ?? existing?.yardage ?? null,
    download_url: downloadUrl ?? existing?.download_url ?? null };
  const operation = existing ? client.from('trucking_tickets').update(row).eq('user_id', userId).eq('id', existing.id) :
    client.from('trucking_tickets').insert(row);
  const { data, error } = await operation.select('*').single();
  check(error);
  return serializeTicket(data);
}

export async function handleDashboard(request: Request, client: Client, userId: string, ExcelJS: WorkbookLibrary): Promise<Response> {
  try {
    if (request.method !== 'POST') throw new ApiError(405, 'Method not allowed.');
    const input = await request.json().catch(() => { throw new ApiError(400, 'Invalid JSON.'); });
    if (!input || typeof input !== 'object' || Array.isArray(input)) throw new ApiError(400, 'Invalid request.');
    const action = input.action;
    let output: unknown;
    if (action === 'start') {
      const name = text(input.name);
      if (!name || typeof input.expectedYardage !== 'number' || !Number.isFinite(input.expectedYardage) || input.expectedYardage <= 0) throw new ApiError(400, 'Enter a name and positive expected yardage.');
      const { data, error } = await client.rpc('start_user_pour', {
        p_name: name, p_expected_yardage: input.expectedYardage, p_started_at: date(input.startedAt) ?? null,
        p_supplier_order_number: text(input.supplierOrderNumber) ?? null, p_supplier_plant_id: text(input.supplierPlantId) ?? null,
        p_supplier_plant_name: text(input.supplierPlantName) ?? null, p_supplier_name: text(input.supplierName) ?? null,
        p_supplier_platform: text(input.supplierPlatform) ?? null,
      }).single();
      check(error);
      output = serializePour(data);
    } else if (action === 'create-ticket') {
      output = await createTicket(client, userId, input);
    } else {
      if (!['active', 'complete', 'loads', 'activity', 'tickets', 'supplier-order', 'export-tickets'].includes(action)) throw new ApiError(400, 'Unknown action.');
      const pour = await activePour(client, userId);
      if (action === 'active') output = pour ? serializePour(pour) : null;
      else if (action === 'complete') {
        if (!pour) throw new ApiError(404, 'There is no active pour to complete.');
        const timestamp = new Date().toISOString();
        const { data, error } = await client.from('pours').update({ status: 'completed', ended_at: timestamp, updated_at: timestamp })
          .eq('user_id', userId).eq('id', pour.id).eq('status', 'active').select('*').maybeSingle();
        check(error);
        if (!data) throw new ApiError(404, 'There is no active pour to complete.');
        output = serializePour(data);
      } else if (action === 'supplier-order') output = pour ? supplierOrder(pour) : null;
      else if (action === 'export-tickets') {
        if (!pour) throw new ApiError(404, 'There is no active pour to export.');
        return await workbookResponse(pour, await ticketsFor(client, userId, pour.id), ExcelJS);
      } else if (action === 'tickets') output = pour ? (await ticketsFor(client, userId, pour.id)).map(serializeTicket) : [];
      else if (!pour) output = [];
      else if (action === 'loads') {
        const { data, error } = await client.from('loads').select('*').eq('user_id', userId).eq('job_id', pour.id).order('sequence_number');
        check(error);
        output = (data ?? []).map((l: any) => ({ id: l.id, jobId: l.job_id, sequenceNumber: l.sequence_number,
          status: l.status, completedAt: l.completed_at ?? undefined, yardage: l.yardage, yardageSource: l.yardage_source }));
      } else {
        const { data, error } = await client.from('activity_events').select('*').eq('user_id', userId).eq('job_id', pour.id).order('timestamp', { ascending: false });
        check(error);
        output = (data ?? []).map((a: any) => ({ id: a.id, jobId: a.job_id, type: a.type, timestamp: a.timestamp }));
      }
    }
    return Response.json(output);
  } catch (error) {
    if (error instanceof ApiError) return Response.json({ message: error.message }, { status: error.status });
    console.error('Dashboard request failed');
    return Response.json({ message: 'Unable to complete the request.' }, { status: 500 });
  }
}
