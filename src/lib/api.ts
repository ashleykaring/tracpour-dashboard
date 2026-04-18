import { createMockJob, getMockActiveJob, getMockLoads } from './mock-data';
import type { CreateJobInput, Job, Load } from './types';

const MOCK_DELAY_MS = 350;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), MOCK_DELAY_MS);
  });
}

export async function getActiveJob(): Promise<Job | null> {
  return delay(getMockActiveJob());
}

export async function getLoadsForActiveJob(): Promise<Load[]> {
  return delay(getMockLoads());
}

export async function createJob(input: CreateJobInput): Promise<Job> {
  return delay(createMockJob(input));
}
