export type JobStatus = 'active' | 'completed';
export type YardageSource = 'default' | 'actual';
export type LoadStatus = 'completed' | 'incomplete';
export type ActivityEventType = 'engine_start' | 'engine_stop';
export type TruckingTicketStatus = 'available' | 'pending';

export type Job = {
  id: string;
  name: string;
  expectedYardage: number;
  status: JobStatus;
  startedAt: string;
  endedAt?: string;
  supplierOrderNumber?: string;
  supplierPlantId?: string;
  supplierPlantName?: string;
  supplierName?: string;
  supplierPlatform?: string;
};

export type Load = {
  id: string;
  jobId: string;
  sequenceNumber: number;
  completedAt?: string;
  yardage: number;
  yardageSource: YardageSource;
  status: LoadStatus;
};

export type ActivityEvent = {
  id: string;
  jobId: string;
  type: ActivityEventType;
  timestamp: string;
};

export type TruckingTicket = {
  id: string;
  jobId: string;
  status: TruckingTicketStatus;
  truckLabel?: string;
  ticketNumber?: string;
  deliveredAt?: string;
  yardage?: number;
  downloadUrl?: string;
};

export type DashboardMetrics = {
  totalPoured: number;
  expectedYardage: number;
  remainingYardage: number;
  completedTruckCount: number;
  progressPercentage: number;
  lastCompletedAt: string | null;
};

export type SupplierOrder = {
  id: string;
  pourId: string;
  orderNumber: string;
  supplierName: string;
  supplierPlantName?: string;
  platform: string;
  mixDesign: string;
  orderedYardage: number;
  batchedYardage: number;
  deliveredYardage?: number;
  trucksEnRoute: number;
  nextTruckEtaMinutes?: number;
  lastSyncedAt?: string;
};

export type StartPourInput = {
  name: string;
  expectedYardage: number;
  startedAt?: string;
  supplierOrderNumber?: string;
  supplierPlantId?: string;
  supplierPlantName?: string;
  supplierName?: string;
  supplierPlatform?: string;
};

export type CreateJobInput = StartPourInput;
