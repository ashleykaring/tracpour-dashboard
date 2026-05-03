import { requireData, supabase, throwIfSupabaseError } from '../db';
import type { TruckingTicketRecord } from '../records';
import { getActivePourRecord } from './pours';

const UNASSIGNED_TICKET_ATTACH_WINDOW_HOURS = 24;

type CreateTicketInput = {
  jobId?: string;
  ticketNumber?: string;
  downloadUrl?: string;
  truckLabel?: string;
  deliveredAt?: string;
  yardage?: number;
  status?: 'available' | 'pending';
};

export async function createOrUpdateTicket(input: CreateTicketInput) {
  const jobId = await resolveTicketJobId(input.jobId);

  if (input.jobId && !jobId) {
    return null;
  }

  const existingTicket = await getExistingTicket(jobId, input);

  if (existingTicket) {
    const ticket = await updateTicket(existingTicket, input);

    return {
      created: false,
      ticket,
    };
  }

  const ticket = await createTicket(jobId, input);

  return {
    created: true,
    ticket,
  };
}

export async function attachRecentUnassignedTicketsToPour(jobId: string) {
  const cutoff = new Date(
    Date.now() - UNASSIGNED_TICKET_ATTACH_WINDOW_HOURS * 60 * 60 * 1000
  ).toISOString();

  const { data, error } = await supabase
    .from('trucking_tickets')
    .update({
      job_id: jobId,
    })
    .is('job_id', null)
    .gte('created_at', cutoff)
    .select('*')
    .returns<TruckingTicketRecord[]>();

  throwIfSupabaseError(error);
  return data ?? [];
}

async function resolveTicketJobId(jobId?: string) {
  if (jobId) {
    const { data, error } = await supabase
      .from('pours')
      .select('id')
      .eq('id', jobId)
      .maybeSingle<{ id: string }>();

    throwIfSupabaseError(error);
    return data?.id ?? null;
  }

  const activePour = await getActivePourRecord();
  return activePour?.id ?? null;
}

async function getExistingTicket(jobId: string | null, input: CreateTicketInput) {
  if (input.ticketNumber) {
    const ticketByNumber = await getExistingTicketByField(jobId, 'ticket_number', input.ticketNumber);

    if (ticketByNumber) {
      return ticketByNumber;
    }
  }

  if (input.downloadUrl) {
    return getExistingTicketByField(jobId, 'download_url', input.downloadUrl);
  }

  return null;
}

async function getExistingTicketByField(
  jobId: string | null,
  field: 'ticket_number' | 'download_url',
  value: string
) {
  const query = supabase
    .from('trucking_tickets')
    .select('*')
    .eq(field, value)
    .order('created_at', { ascending: false })
    .limit(1);

  const { data, error } = await (jobId ? query.eq('job_id', jobId) : query.is('job_id', null))
    .maybeSingle<TruckingTicketRecord>();

  throwIfSupabaseError(error);
  return data;
}

async function createTicket(jobId: string | null, input: CreateTicketInput) {
  const { data, error } = await supabase
    .from('trucking_tickets')
    .insert({
      job_id: jobId,
      status: resolveInsertedStatus(input),
      truck_label: input.truckLabel ?? null,
      ticket_number: input.ticketNumber ?? null,
      delivered_at: input.deliveredAt ?? null,
      yardage: input.yardage ?? null,
      download_url: input.downloadUrl ?? null,
    })
    .select('*')
    .single<TruckingTicketRecord>();

  throwIfSupabaseError(error);
  return requireData(data, 'Unable to create trucking ticket.');
}

async function updateTicket(existingTicket: TruckingTicketRecord, input: CreateTicketInput) {
  const { data, error } = await supabase
    .from('trucking_tickets')
    .update({
      status: resolveUpdatedStatus(existingTicket, input),
      ticket_number: input.ticketNumber ?? existingTicket.ticket_number,
      truck_label: input.truckLabel ?? existingTicket.truck_label,
      delivered_at: input.deliveredAt ?? existingTicket.delivered_at,
      yardage: input.yardage ?? existingTicket.yardage,
      download_url: input.downloadUrl ?? existingTicket.download_url,
    })
    .eq('id', existingTicket.id)
    .select('*')
    .single<TruckingTicketRecord>();

  throwIfSupabaseError(error);
  return requireData(data, 'Unable to update trucking ticket.');
}

function resolveInsertedStatus(input: CreateTicketInput) {
  return input.status ?? (input.downloadUrl ? 'available' : 'pending');
}

function resolveUpdatedStatus(existingTicket: TruckingTicketRecord, input: CreateTicketInput) {
  return input.status ?? (input.downloadUrl ? 'available' : existingTicket.status);
}
