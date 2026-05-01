import {
  getMockActivePour,
  getMockLoadsForActivePour,
  getMockPourActivity,
  getMockTicketsForActivePour,
  completeMockActivePour,
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
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, '');

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), MOCK_DELAY_MS);
  });
}

function shouldUseBackend() {
  return Boolean(API_BASE_URL);
}

async function requestFromBackend<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Backend request failed with ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function getActivePour(): Promise<Job | null> {
  if (shouldUseBackend()) {
    return requestFromBackend<Job | null>('/api/pours/active');
  }

  return delay(await getMockActivePour());
}

export async function startPour(input: StartPourInput): Promise<Job> {
  if (shouldUseBackend()) {
    return requestFromBackend<Job>('/api/pours/start', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  return delay(await startMockPour(input));
}

export async function getLoadsForActivePour(): Promise<Load[]> {
  if (shouldUseBackend()) {
    return requestFromBackend<Load[]>('/api/pours/active/loads');
  }

  return delay(await getMockLoadsForActivePour());
}

export async function getPourActivity(): Promise<ActivityEvent[]> {
  if (shouldUseBackend()) {
    return requestFromBackend<ActivityEvent[]>('/api/pours/active/activity');
  }

  return delay(await getMockPourActivity());
}

export async function getTicketsForActivePour(): Promise<TruckingTicket[]> {
  if (shouldUseBackend()) {
    return requestFromBackend<TruckingTicket[]>('/api/pours/active/tickets');
  }

  return delay(await getMockTicketsForActivePour());
}

export async function getDashboardSummary(): Promise<DashboardMetrics | null> {
  if (shouldUseBackend()) {
    return requestFromBackend<DashboardMetrics | null>('/api/pours/active/summary');
  }

  const activePour = await getMockActivePour();

  if (!activePour) {
    return delay(null);
  }

  return delay(computeDashboardMetrics(activePour, await getMockLoadsForActivePour()));
}

export async function completeActivePour(): Promise<Job | null> {
  if (shouldUseBackend()) {
    return requestFromBackend<Job>('/api/pours/active/complete', {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }

  return delay(await completeMockActivePour());
}

export const getActiveJob = getActivePour;
export const getLoadsForActiveJob = getLoadsForActivePour;

export async function createJob(input: CreateJobInput): Promise<Job> {
  return startPour(input);
}
