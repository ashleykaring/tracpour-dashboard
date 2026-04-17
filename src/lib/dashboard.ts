import type { DashboardMetrics, Job, Load } from './types';

export function computeDashboardMetrics(job: Job, loads: Load[]): DashboardMetrics {
  const completedLoads = loads.filter((load) => load.status === 'completed');
  const totalPoured = completedLoads.reduce((sum, load) => sum + load.yardage, 0);
  const remainingYardage = Math.max(job.expectedYardage - totalPoured, 0);
  const rawProgress = job.expectedYardage > 0 ? (totalPoured / job.expectedYardage) * 100 : 0;
  const latestCompletedLoad = [...completedLoads]
    .filter((load) => load.completedAt)
    .sort((left, right) => (right.completedAt ?? '').localeCompare(left.completedAt ?? ''))[0];

  return {
    totalPoured,
    expectedYardage: job.expectedYardage,
    remainingYardage,
    completedTruckCount: completedLoads.length,
    progressPercentage: Math.min(rawProgress, 100),
    lastCompletedAt: latestCompletedLoad?.completedAt ?? null,
  };
}
