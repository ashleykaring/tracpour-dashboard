import type {
  ActivityEventRecord,
  LoadRecord,
  PourRecord,
  TruckingTicketRecord,
} from './records';

export function serializePour(pour: PourRecord) {
  return {
    id: pour.id,
    name: pour.name,
    expectedYardage: pour.expected_yardage,
    status: pour.status,
    startedAt: pour.started_at,
    endedAt: pour.ended_at ?? undefined,
  };
}

export function serializeLoad(load: LoadRecord) {
  return {
    id: load.id,
    jobId: load.job_id,
    sequenceNumber: load.sequence_number,
    status: load.status,
    completedAt: load.completed_at ?? undefined,
    yardage: load.yardage,
    yardageSource: load.yardage_source,
  };
}

export function serializeActivityEvent(event: ActivityEventRecord) {
  return {
    id: event.id,
    jobId: event.job_id,
    type: event.type,
    timestamp: event.timestamp,
  };
}

export function serializeTruckingTicket(ticket: TruckingTicketRecord) {
  return {
    id: ticket.id,
    jobId: ticket.job_id,
    status: ticket.status,
    truckLabel: ticket.truck_label ?? undefined,
    ticketNumber: ticket.ticket_number ?? undefined,
    deliveredAt: ticket.delivered_at ?? undefined,
    yardage: ticket.yardage ?? undefined,
    downloadUrl: ticket.download_url ?? undefined,
  };
}
