import type { ActivityEvent, Job, Load, StartPourInput, TruckingTicket } from './types';

export const mockScenario = 'setup' as 'setup' | 'active-empty' | 'active-demo';

export const defaultJobTemplate: Job = {
  id: 'job-001',
  name: 'Riverside Bridge',
  expectedYardage: 118,
  status: 'active',
  startedAt: '2026-04-17T06:15:00.000Z',
};

let currentJob: Job | null = null;
let currentLoads: Load[] = [];
let currentActivity: ActivityEvent[] = [];
let currentTickets: TruckingTicket[] = [];

function addMinutes(value: string, minutes: number) {
  return new Date(new Date(value).getTime() + minutes * 60 * 1000).toISOString();
}

function buildMockLoads(jobId: string, startedAt: string): Load[] {
  return [
    {
      id: `${jobId}-load-001`,
      jobId,
      sequenceNumber: 1,
      completedAt: addMinutes(startedAt, 18),
      yardage: 9.5,
      yardageSource: 'default',
      status: 'completed',
    },
    {
      id: `${jobId}-load-002`,
      jobId,
      sequenceNumber: 2,
      completedAt: addMinutes(startedAt, 41),
      yardage: 9.5,
      yardageSource: 'default',
      status: 'completed',
    },
    {
      id: `${jobId}-load-003`,
      jobId,
      sequenceNumber: 3,
      completedAt: addMinutes(startedAt, 63),
      yardage: 9.5,
      yardageSource: 'default',
      status: 'completed',
    },
    {
      id: `${jobId}-load-004`,
      jobId,
      sequenceNumber: 4,
      completedAt: addMinutes(startedAt, 86),
      yardage: 9.5,
      yardageSource: 'default',
      status: 'completed',
    },
    {
      id: `${jobId}-load-005`,
      jobId,
      sequenceNumber: 5,
      completedAt: addMinutes(startedAt, 112),
      yardage: 9.5,
      yardageSource: 'default',
      status: 'completed',
    },
    {
      id: `${jobId}-load-006`,
      jobId,
      sequenceNumber: 6,
      completedAt: addMinutes(startedAt, 139),
      yardage: 9.5,
      yardageSource: 'default',
      status: 'completed',
    },
    {
      id: `${jobId}-load-007`,
      jobId,
      sequenceNumber: 7,
      yardage: 9.5,
      yardageSource: 'default',
      status: 'incomplete',
    },
  ];
}

function buildMockTickets(jobId: string, startedAt: string): TruckingTicket[] {
  return [
    {
      id: `${jobId}-ticket-001`,
      jobId,
      status: 'available',
      truckLabel: 'Truck 14',
      ticketNumber: 'TP-1042',
      deliveredAt: addMinutes(startedAt, 22),
      yardage: 9.5,
      downloadUrl: 'https://example.com/tickets/tp-1042.pdf',
    },
    {
      id: `${jobId}-ticket-002`,
      jobId,
      status: 'available',
      truckLabel: 'Truck 09',
      ticketNumber: 'TP-1043',
      deliveredAt: addMinutes(startedAt, 47),
      yardage: 9.8,
      downloadUrl: 'https://example.com/tickets/tp-1043.pdf',
    },
    {
      id: `${jobId}-ticket-003`,
      jobId,
      status: 'pending',
      truckLabel: 'Truck 22',
      deliveredAt: addMinutes(startedAt, 68),
      yardage: 9.5,
    },
    {
      id: `${jobId}-ticket-004`,
      jobId,
      status: 'available',
      truckLabel: 'Truck 03',
      ticketNumber: 'TP-1045',
      deliveredAt: addMinutes(startedAt, 91),
      yardage: 10.1,
      downloadUrl: 'https://example.com/tickets/tp-1045.pdf',
    },
  ];
}

function buildMockActivity(jobId: string, startedAt: string): ActivityEvent[] {
  return [
    {
      id: `${jobId}-activity-001`,
      jobId,
      type: 'engine_start',
      timestamp: addMinutes(startedAt, 0),
    },
    {
      id: `${jobId}-activity-002`,
      jobId,
      type: 'engine_stop',
      timestamp: addMinutes(startedAt, 44),
    },
    {
      id: `${jobId}-activity-003`,
      jobId,
      type: 'engine_start',
      timestamp: addMinutes(startedAt, 58),
    },
    {
      id: `${jobId}-activity-004`,
      jobId,
      type: 'engine_stop',
      timestamp: addMinutes(startedAt, 116),
    },
    {
      id: `${jobId}-activity-005`,
      jobId,
      type: 'engine_start',
      timestamp: addMinutes(startedAt, 128),
    },
  ];
}

function createDemoJobFromTemplate() {
  currentJob = defaultJobTemplate;
  currentLoads = buildMockLoads(defaultJobTemplate.id, defaultJobTemplate.startedAt);
  currentActivity = buildMockActivity(defaultJobTemplate.id, defaultJobTemplate.startedAt);
  currentTickets = buildMockTickets(defaultJobTemplate.id, defaultJobTemplate.startedAt);
}

export function getMockActivePour() {
  if (currentJob) {
    return currentJob;
  }

  if (mockScenario === 'active-demo') {
    createDemoJobFromTemplate();
    return currentJob;
  }

  if (mockScenario === 'active-empty') {
    currentJob = defaultJobTemplate;
    currentLoads = [];
    currentTickets = [];
    currentActivity = [
      {
        id: `${defaultJobTemplate.id}-activity-001`,
        jobId: defaultJobTemplate.id,
        type: 'engine_start',
        timestamp: defaultJobTemplate.startedAt,
      },
    ];
    return currentJob;
  }

  return null;
}

export function getMockLoadsForActivePour() {
  return currentJob ? currentLoads : [];
}

export function getMockPourActivity() {
  return currentJob ? currentActivity : [];
}

export function getMockTicketsForActivePour() {
  return currentJob ? currentTickets : [];
}

export function startMockPour(input: StartPourInput) {
  const jobId = `job-${Date.now()}`;
  const startedAt = input.startedAt ?? new Date(Date.now() - 150 * 60 * 1000).toISOString();

  currentJob = {
    id: jobId,
    name: input.name.trim(),
    expectedYardage: input.expectedYardage,
    status: 'active',
    startedAt,
  };
  currentLoads = buildMockLoads(jobId, startedAt);
  currentActivity = buildMockActivity(jobId, startedAt);
  currentTickets = buildMockTickets(jobId, startedAt);

  return currentJob;
}

export const getMockActiveJob = getMockActivePour;
export const getMockLoads = getMockLoadsForActivePour;
export const createMockJob = startMockPour;
