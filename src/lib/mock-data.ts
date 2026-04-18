import type { CreateJobInput, Job, Load } from "./types";

export const mockScenario = "active-demo" as
  | "setup"
  | "active-empty"
  | "active-demo";

export const defaultJobTemplate: Job = {
  id: "job-001",
  name: "Riverside Bridge",
  expectedYardage: 118,
  status: "active",
  startedAt: "2026-04-17T06:15:00.000Z",
};

export const mockLoads: Load[] = [
  {
    id: "load-001",
    sequenceNumber: 1,
    completedAt: "2026-04-17T13:10:00.000Z",
    yardage: 9.5,
    yardageSource: "default",
    ticketDownloadUrl: "https://example.com/tickets/load-001.pdf",
    status: "completed",
    truckLabel: "Truck 14",
  },
  {
    id: "load-002",
    sequenceNumber: 2,
    completedAt: "2026-04-17T13:32:00.000Z",
    yardage: 9.8,
    yardageSource: "actual",
    ticketDownloadUrl: "https://example.com/tickets/load-002.pdf",
    status: "completed",
    truckLabel: "Truck 09",
  },
  {
    id: "load-003",
    sequenceNumber: 3,
    completedAt: "2026-04-17T13:57:00.000Z",
    yardage: 9.5,
    yardageSource: "default",
    status: "completed",
    truckLabel: "Truck 22",
  },
  {
    id: "load-004",
    sequenceNumber: 4,
    completedAt: "2026-04-17T14:18:00.000Z",
    yardage: 10.1,
    yardageSource: "actual",
    ticketDownloadUrl: "https://example.com/tickets/load-004.pdf",
    status: "completed",
    truckLabel: "Truck 03",
  },
  {
    id: "load-005",
    sequenceNumber: 5,
    completedAt: "2026-04-17T14:44:00.000Z",
    yardage: 9.5,
    yardageSource: "default",
    ticketDownloadUrl: "https://example.com/tickets/load-005.pdf",
    status: "completed",
    truckLabel: "Truck 18",
  },
  {
    id: "load-006",
    sequenceNumber: 6,
    completedAt: "2026-04-17T15:05:00.000Z",
    yardage: 9.4,
    yardageSource: "actual",
    status: "completed",
    truckLabel: "Truck 27",
  },
  {
    id: "load-007",
    sequenceNumber: 7,
    completedAt: "2026-04-17T15:31:00.000Z",
    yardage: 9.5,
    yardageSource: "default",
    ticketDownloadUrl: "https://example.com/tickets/load-007.pdf",
    status: "completed",
    truckLabel: "Truck 11",
  },
  {
    id: "load-008",
    sequenceNumber: 8,
    completedAt: "2026-04-17T15:54:00.000Z",
    yardage: 9.7,
    yardageSource: "actual",
    ticketDownloadUrl: "https://example.com/tickets/load-008.pdf",
    status: "completed",
    truckLabel: "Truck 05",
  },
  {
    id: "load-009",
    sequenceNumber: 9,
    yardage: 9.5,
    yardageSource: "default",
    status: "incomplete",
    truckLabel: "Truck 31",
  },
  {
    id: "load-010",
    sequenceNumber: 10,
    yardage: 9.5,
    yardageSource: "default",
    ticketDownloadUrl: "https://example.com/tickets/load-010.pdf",
    status: "incomplete",
    truckLabel: "Truck 17",
  },
];

let currentJob: Job | null = null;
let currentLoads: Load[] = [];

export function getMockActiveJob() {
  if (currentJob) {
    return currentJob;
  }

  if (mockScenario === "setup") {
    return null;
  }

  return defaultJobTemplate;
}

export function getMockLoads() {
  if (currentJob) {
    return currentLoads;
  }

  if (mockScenario === "active-demo") {
    return mockLoads;
  }

  return [];
}

export function createMockJob(input: CreateJobInput) {
  currentJob = {
    id: `job-${Date.now()}`,
    name: input.name.trim(),
    expectedYardage: input.expectedYardage,
    status: "active",
    startedAt: input.startedAt ?? new Date().toISOString(),
  };
  currentLoads = [];

  return currentJob;
}
