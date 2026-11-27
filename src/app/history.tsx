import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/empty-state';
import AppTabs from '@/components/app-tabs';
import { LoadingState } from '@/components/loading-state';
import { RequestError } from '@/components/request-error';
import { Screen } from '@/components/screen';
import { SectionHeader } from '@/components/section-header';
import { SurfaceCard } from '@/components/surface-card';
import { TimelineItem } from '@/components/timeline-item';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useDashboardData } from '@/hooks/use-dashboard-data';

export default function HistoryScreen() {
  return <AppTabs><HistoryContent /></AppTabs>;
}

function HistoryContent() {
  const { job, activity, isLoading, error, retry, isRefreshing } = useDashboardData();

  const activityEvents = useMemo(
    () => [...activity].sort((left, right) => left.timestamp.localeCompare(right.timestamp)),
    [activity]
  );

  return (
    <Screen scrollable>
      <View style={styles.header}>
        <ThemedText type="eyebrow">Pour Timeline</ThemedText>
        <ThemedText type="screenTitle" style={styles.jobTitle}>
          {job?.name ?? 'Active pour'}
        </ThemedText>
      </View>

      {error ? <RequestError message={error} onRetry={retry} isRetrying={isRefreshing} /> : null}

      {!error || job ? (
        <SurfaceCard>
          <SectionHeader title="Pour Activity" subtitle={`${activityEvents.length} engine events`} />

          {isLoading ? (
            <LoadingState label="Loading pour activity..." />
          ) : activityEvents.length === 0 ? (
            <EmptyState
              title="No activity yet"
              message="Engine start and stop activity will appear here as events are processed."
            />
          ) : (
            <View style={styles.timeline}>
              {activityEvents.map((event, index) => (
                <TimelineItem
                  key={event.id}
                  event={event}
                  nextEvent={activityEvents[index + 1]}
                  isLast={index === activityEvents.length - 1}
                />
              ))}
            </View>
          )}
        </SurfaceCard>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.two,
  },
  jobTitle: {
    fontFamily: 'BarlowCondensed_700Bold',
  },
  timeline: {
    gap: Spacing.one,
    marginTop: Spacing.two,
  },
});
