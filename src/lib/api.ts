import {
  getMockActivePour,
  getMockLoadsForActivePour,
  getMockPourActivity,
  getMockSupplierOrderForActivePour,
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
  SupplierOrder,
  TruckingTicket,
} from './types';

const MOCK_DELAY_MS = 350;
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, '');
const USE_BACKEND_OVERRIDE = process.env.EXPO_PUBLIC_USE_BACKEND;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), MOCK_DELAY_MS);
  });
}

function shouldUseBackend() {
  if (USE_BACKEND_OVERRIDE === 'true') {
    return true;
  }

  if (USE_BACKEND_OVERRIDE === 'false') {
    return false;
  }

  return Boolean(API_BASE_URL);
}

function isLocalHostname(hostname: string) {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname.endsWith('.local') ||
    /^10\./.test(hostname) ||
    /^192\.168\./.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
  );
}

function isLocalRuntime() {
  if (typeof window === 'undefined') {
    return true;
  }

  return isLocalHostname(window.location.hostname);
}

function getApiBaseUrl() {
  if (!API_BASE_URL) {
    throw new Error('EXPO_PUBLIC_API_BASE_URL is required when backend mode is enabled.');
  }

  return API_BASE_URL;
}

function assertMockDataAllowed() {
  if (USE_BACKEND_OVERRIDE === 'false' || isLocalRuntime()) {
    return;
  }

  throw new Error('Backend API URL is not configured. Refusing to use mock data on a deployed web app.');
}

async function requestFromBackend<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
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

  assertMockDataAllowed();
  return delay(await getMockActivePour());
}

export async function startPour(input: StartPourInput): Promise<Job> {
  if (shouldUseBackend()) {
    return requestFromBackend<Job>('/api/pours/start', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  assertMockDataAllowed();
  return delay(await startMockPour(input));
}

export async function getLoadsForActivePour(): Promise<Load[]> {
  if (shouldUseBackend()) {
    return requestFromBackend<Load[]>('/api/pours/active/loads');
  }

  assertMockDataAllowed();
  return delay(await getMockLoadsForActivePour());
}

export async function getPourActivity(): Promise<ActivityEvent[]> {
  if (shouldUseBackend()) {
    return requestFromBackend<ActivityEvent[]>('/api/pours/active/activity');
  }

  assertMockDataAllowed();
  return delay(await getMockPourActivity());
}

export async function getTicketsForActivePour(): Promise<TruckingTicket[]> {
  if (shouldUseBackend()) {
    return requestFromBackend<TruckingTicket[]>('/api/pours/active/tickets');
  }

  assertMockDataAllowed();
  return delay(await getMockTicketsForActivePour());
}

export function getActivePourTicketsExportUrl() {
  if (!shouldUseBackend() || !API_BASE_URL) {
    return null;
  }

  return `${API_BASE_URL}/api/pours/active/tickets.xlsx`;
}

export async function getSupplierOrderForActivePour(): Promise<SupplierOrder | null> {
  if (shouldUseBackend()) {
    return requestFromBackend<SupplierOrder | null>('/api/pours/active/supplier-order');
  }

  assertMockDataAllowed();
  return delay(await getMockSupplierOrderForActivePour());
}

export async function getDashboardSummary(): Promise<DashboardMetrics | null> {
  if (shouldUseBackend()) {
    return requestFromBackend<DashboardMetrics | null>('/api/pours/active/summary');
  }

  assertMockDataAllowed();
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

  assertMockDataAllowed();
  return delay(await completeMockActivePour());
}

export const getActiveJob = getActivePour;
export const getLoadsForActiveJob = getLoadsForActivePour;

export async function createJob(input: CreateJobInput): Promise<Job> {
  return startPour(input);
}
