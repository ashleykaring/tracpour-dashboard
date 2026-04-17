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
import { ThemedText } from '@/components/themed-text';
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
        .slice(0, 4),
    [loads]
  );

  return (
    <Screen scrollable>
      <JobHeader job={job} />

      {isLoading || !job || !metrics ? (
        <LoadingState label="Loading live pour dashboard..." />
      ) : (
        <>
          <MetricCard
            label="Total Poured"
            value={`${metrics.totalPoured.toFixed(1)} yd`}
            helper={`Last completed load ${metrics.lastCompletedAt ? formatDateTime(metrics.lastCompletedAt) : 'not available yet'}`}
          />

          <ProgressCard metrics={metrics} />

          <StatGrid
            items={[
              {
                label: 'Expected Yardage',
                value: `${job.expectedYardage.toFixed(1)} yd`,
              },
              {
                label: 'Remaining Yardage',
                value: `${metrics.remainingYardage.toFixed(1)} yd`,
              },
              {
                label: 'Completed Trucks',
                value: `${metrics.completedTruckCount}`,
              },
              {
                label: 'Last Load Time',
                value: metrics.lastCompletedAt ? formatDateTime(metrics.lastCompletedAt) : 'Waiting',
              },
            ]}
          />

          <SurfaceCard>
            <SectionHeader
              title="Recent Loads"
              subtitle={metrics.completedTruckCount > 0 ? 'Most recent completed trucks.' : 'No recent activity yet.'}
            />

            {recentLoads.length === 0 ? (
              <EmptyState
                title="Awaiting first truck"
                message="Completed loads will appear here automatically as they come in."
              />
            ) : (
              <View style={styles.list}>
                {recentLoads.map((load) => (
                  <LoadRow key={load.id} load={load} />
                ))}
              </View>
            )}
          </SurfaceCard>

          <View style={styles.statusLine}>
            <ThemedText type="smallBold">Status</ThemedText>
            <ThemedText themeColor="textSecondary">Awaiting next truck.</ThemedText>
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.two,
  },
  statusLine: {
    gap: Spacing.one,
    marginTop: Spacing.one,
  },
});
