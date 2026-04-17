import { mockJob, mockLoads } from './mock-data';
import type { Job, Load } from './types';

const MOCK_DELAY_MS = 350;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), MOCK_DELAY_MS);
  });
}

export async function getActiveJob(): Promise<Job | null> {
  return delay(mockJob);
}

export async function getLoadsForActiveJob(): Promise<Load[]> {
  return delay(mockLoads);
}
