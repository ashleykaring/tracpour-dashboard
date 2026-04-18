import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/empty-state';
import { LoadingState } from '@/components/loading-state';
import { Screen } from '@/components/screen';
import { SectionHeader } from '@/components/section-header';
import { SurfaceCard } from '@/components/surface-card';
import { TimelineItem } from '@/components/timeline-item';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useDashboardData } from '@/hooks/use-dashboard-data';

export default function HistoryScreen() {
  const { job, loads, isLoading } = useDashboardData();

  const completedLoads = useMemo(
    () =>
      [...loads]
        .filter((load) => load.status === 'completed' && load.completedAt)
        .sort((left, right) => (right.completedAt ?? '').localeCompare(left.completedAt ?? '')),
    [loads]
  );

  return (
    <Screen scrollable>
      <View style={styles.header}>
        <ThemedText type="eyebrow">Job Timeline</ThemedText>
        <ThemedText type="screenTitle">{job?.name ?? 'Active job'}</ThemedText>
      </View>

      <SurfaceCard>
        <SectionHeader title="Completed Loads" />

        {isLoading ? (
          <LoadingState label="Loading completed load history..." />
        ) : completedLoads.length === 0 ? (
          <EmptyState
            title="No completed loads yet"
            message="Completed truck activity will appear here as load events arrive."
          />
        ) : (
          <View style={styles.timeline}>
            {completedLoads.map((load, index) => (
              <TimelineItem key={load.id} load={load} isLast={index === completedLoads.length - 1} />
            ))}
          </View>
        )}
      </SurfaceCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.two,
  },
  timeline: {
    gap: Spacing.one,
  },
});
