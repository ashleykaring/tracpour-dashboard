export type JobStatus = 'active' | 'paused' | 'complete';
export type YardageSource = 'default' | 'actual';
export type LoadStatus = 'completed' | 'incomplete';

export type Job = {
  id: string;
  name: string;
  expectedYardage: number;
  status: JobStatus;
  startedAt: string;
  endedAt?: string;
};

export type Load = {
  id: string;
  sequenceNumber: number;
  completedAt?: string;
  yardage: number;
  yardageSource: YardageSource;
  ticketDownloadUrl?: string;
  status: LoadStatus;
  truckLabel?: string;
};

export type DashboardMetrics = {
  totalPoured: number;
  expectedYardage: number;
  remainingYardage: number;
  completedTruckCount: number;
  progressPercentage: number;
  lastCompletedAt: string | null;
};
