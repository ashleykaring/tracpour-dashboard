import { requireData, supabase, throwIfSupabaseError } from '../db';
import { LOAD_YARDAGE_DEFAULT, type IngestEventType } from '../domain';
import type { LoadRecord, RawEventRecord } from '../records';
import { getActivePourRecord } from './pours';

type IngestEventInput = {
  type: IngestEventType;
  timestamp?: string;
};

export async function ingestEvent(input: IngestEventInput) {
  const eventTimestamp = input.timestamp ?? new Date().toISOString();
  const activePour = await getActivePourRecord();

  const rawEvent = await createRawEvent({
    type: input.type,
    timestamp: eventTimestamp,
    jobId: activePour?.id ?? null,
    payloadJson: input,
  });

  if (!activePour) {
    return {
      accepted: true,
      assigned: false,
      reason: 'NO_ACTIVE_POUR',
      rawEventId: rawEvent.id,
    };
  }

  const processed = await processAssignedEvent(activePour.id, input.type, eventTimestamp);

  return {
    accepted: true,
    assigned: true,
    jobId: activePour.id,
    rawEventId: rawEvent.id,
    processed,
  };
}

async function createRawEvent(input: {
  type: IngestEventType;
  timestamp: string;
  jobId: string | null;
  payloadJson: unknown;
}) {
  const { data, error } = await supabase
    .from('raw_events')
    .insert({
      type: input.type,
      timestamp: input.timestamp,
      job_id: input.jobId,
      payload_json: input.payloadJson,
    })
    .select('*')
    .single<RawEventRecord>();

  throwIfSupabaseError(error);
  return requireData(data, 'Unable to save raw event.');
}

async function processAssignedEvent(jobId: string, type: IngestEventType, timestamp: string) {
  if (type === 'engine_start' || type === 'engine_stop') {
    const { data, error } = await supabase
      .from('activity_events')
      .insert({
        job_id: jobId,
        type,
        timestamp,
      })
      .select('id')
      .single<{ id: string }>();

    throwIfSupabaseError(error);
    const activityEvent = requireData(data, 'Unable to create activity event.');

    return {
      kind: 'activity_event',
      id: activityEvent.id,
    };
  }

  if (type === 'truck_leave') {
    const sequenceNumber = await getNextLoadSequenceNumber(jobId);
    const { data, error } = await supabase
      .from('loads')
      .insert({
        job_id: jobId,
        sequence_number: sequenceNumber,
        status: 'completed',
        completed_at: timestamp,
        yardage: LOAD_YARDAGE_DEFAULT,
        yardage_source: 'default',
      })
      .select('*')
      .single<LoadRecord>();

    throwIfSupabaseError(error);
    const load = requireData(data, 'Unable to create load.');

    return {
      kind: 'load',
      id: load.id,
      sequenceNumber,
    };
  }

  return {
    kind: 'raw_event_only',
  };
}

async function getNextLoadSequenceNumber(jobId: string) {
  const { data, error } = await supabase
    .from('loads')
    .select('sequence_number')
    .eq('job_id', jobId)
    .order('sequence_number', { ascending: false })
    .limit(1)
    .maybeSingle<Pick<LoadRecord, 'sequence_number'>>();

  throwIfSupabaseError(error);
  return (data?.sequence_number ?? 0) + 1;
}
