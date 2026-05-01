export const EVENT_TYPES = ['truck_enter', 'truck_leave', 'engine_start', 'engine_stop'] as const;
export type IngestEventType = (typeof EVENT_TYPES)[number];

export const LOAD_YARDAGE_DEFAULT = 9.5;

export type DashboardSummary = {
  totalPoured: number;
  expectedYardage: number;
  remainingYardage: number;
  completedTruckCount: number;
  progressPercentage: number;
  lastCompletedAt: string | null;
};
