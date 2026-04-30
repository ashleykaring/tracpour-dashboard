import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/empty-state';
import { JobHeader } from '@/components/job-header';
import { LoadRow } from '@/components/load-row';
import { LoadingState } from '@/components/loading-state';
import { MetricCard } from '@/components/metric-card';
import { ProgressCard } from '@/components/progress-card';
import { Screen } from '@/components/screen';
import { SectionHeader } from '@/components/section-header';
import { StatGrid } from '@/components/stat-grid';
import { SurfaceCard } from '@/components/surface-card';
import { Spacing } from '@/constants/theme';
import { formatDateTime } from '@/lib/format';
import { useDashboardData } from '@/hooks/use-dashboard-data';

export default function LiveScreen() {
  const { job, isLoading, metrics, loads } = useDashboardData();

  const recentLoads = useMemo(
    () =>
      [...loads]
        .filter((load) => load.status === 'completed' && load.completedAt)
        .sort((left, right) => (right.completedAt ?? '').localeCompare(left.completedAt ?? ''))
        .slice(0, 5),
    [loads]
  );

  if (!isLoading && !job) {
    return (
      <Screen scrollable>
        <EmptyState
          title="No active pour"
          message="Start a pour to begin tracking yardage and truck activity."
        />
      </Screen>
    );
  }

  return (
    <Screen scrollable>
      <JobHeader job={job} />

      {isLoading || !job || !metrics ? (
        <LoadingState label="Loading live pour dashboard..." />
      ) : (
        <>
          <MetricCard
            label="Total Poured"
            value={`${metrics.totalPoured.toFixed(1)} CY`}
            helper={`Last completed load ${metrics.lastCompletedAt ? formatDateTime(metrics.lastCompletedAt) : 'not available yet'}`}
          />

          <ProgressCard metrics={metrics} />

          <StatGrid
            items={[
              {
                label: 'Expected Yardage',
                value: `${metrics.expectedYardage.toFixed(1)} CY`,
                span: 'full',
              },
              {
                label: 'Remaining Yardage',
                value: `${metrics.remainingYardage.toFixed(1)} CY`,
                span: 'half',
              },
              {
                label: 'Completed Trucks',
                value: `${metrics.completedTruckCount}`,
                span: 'half',
              },
            ]}
          />

          <SurfaceCard>
            <SectionHeader title="Recent Loads" />

            {recentLoads.length === 0 ? (
              <EmptyState
                title="Awaiting first truck"
                message="Completed loads will appear here automatically as they come in."
              />
            ) : (
              <View style={styles.recentLoadsList}>
                {recentLoads.map((load) => (
                  <LoadRow key={load.id} load={load} />
                ))}
              </View>
            )}
          </SurfaceCard>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  recentLoadsList: {
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
});
