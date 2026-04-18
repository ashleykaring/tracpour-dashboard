import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/empty-state';
import { LoadingState } from '@/components/loading-state';
import { Screen } from '@/components/screen';
import { SectionHeader } from '@/components/section-header';
import { SurfaceCard } from '@/components/surface-card';
import { TicketRow } from '@/components/ticket-row';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useDashboardData } from '@/hooks/use-dashboard-data';

export default function TicketsScreen() {
  const { job, isLoading, loads } = useDashboardData();

  const completedLoads = useMemo(
    () =>
      [...loads]
        .filter((load) => load.status === 'completed')
        .sort((left, right) => (right.completedAt ?? '').localeCompare(left.completedAt ?? '')),
    [loads]
  );
  const incompleteLoads = useMemo(
    () => [...loads].filter((load) => load.status === 'incomplete'),
    [loads]
  );

  return (
    <Screen scrollable>
      <View style={styles.header}>
        <ThemedText type="eyebrow">Tickets</ThemedText>
        <ThemedText type="screenTitle">{job?.name ?? 'Active job'}</ThemedText>
      </View>

      {isLoading ? (
        <LoadingState label="Loading ticket records..." />
      ) : (
        <>
          <SurfaceCard>
            <SectionHeader title="Completed" subtitle={`${completedLoads.length} load records`} />
            {completedLoads.length === 0 ? (
              <EmptyState
                title="No completed tickets"
                message="Completed loads with ticket status will appear here."
              />
            ) : (
              <View style={styles.ticketList}>
                {completedLoads.map((load) => (
                  <TicketRow key={load.id} load={load} />
                ))}
              </View>
            )}
          </SurfaceCard>

          <SurfaceCard>
            <SectionHeader title="Incomplete" subtitle={`${incompleteLoads.length} load records`} />
            {incompleteLoads.length === 0 ? (
              <EmptyState
                title="No incomplete records"
                message="Loads missing a fully paired completed ticket state will show up here."
              />
            ) : (
              <View style={styles.ticketList}>
                {incompleteLoads.map((load) => (
                  <TicketRow key={load.id} load={load} />
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
  header: {
    gap: Spacing.two,
  },
  ticketList: {
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
});
