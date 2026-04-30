import {
  getMockActivePour,
  getMockLoadsForActivePour,
  getMockPourActivity,
  getMockTicketsForActivePour,
  startMockPour,
} from './mock-data';
import { computeDashboardMetrics } from './dashboard';
import type {
  ActivityEvent,
  CreateJobInput,
  DashboardMetrics,
  Job,
  Load,
  StartPourInput,
  TruckingTicket,
} from './types';

const MOCK_DELAY_MS = 350;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), MOCK_DELAY_MS);
  });
}

// TODO: Replace these mock implementations with calls to the backend API.
// The backend, not the mobile app, will receive raw TCP events on port 5002,
// process engine/truck events into app-friendly pour/load/activity records,
// and later accept ticket-related data for download links.
export async function getActivePour(): Promise<Job | null> {
  return delay(getMockActivePour());
}

export async function startPour(input: StartPourInput): Promise<Job> {
  return delay(startMockPour(input));
}

export async function getLoadsForActivePour(): Promise<Load[]> {
  return delay(getMockLoadsForActivePour());
}

export async function getPourActivity(): Promise<ActivityEvent[]> {
  return delay(getMockPourActivity());
}

export async function getTicketsForActivePour(): Promise<TruckingTicket[]> {
  return delay(getMockTicketsForActivePour());
}

export async function getDashboardSummary(): Promise<DashboardMetrics | null> {
  const activePour = getMockActivePour();

  if (!activePour) {
    return delay(null);
  }

  return delay(computeDashboardMetrics(activePour, getMockLoadsForActivePour()));
}

export const getActiveJob = getActivePour;
export const getLoadsForActiveJob = getLoadsForActivePour;

export async function createJob(input: CreateJobInput): Promise<Job> {
  return startPour(input);
}
