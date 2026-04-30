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
  const { job, isLoading, tickets } = useDashboardData();

  const sortedTickets = useMemo(
    () =>
      [...tickets].sort((left, right) => {
        if (left.deliveredAt && right.deliveredAt) {
          return right.deliveredAt.localeCompare(left.deliveredAt);
        }

        return left.id.localeCompare(right.id);
      }),
    [tickets]
  );
  const availableTicketCount = useMemo(
    () => sortedTickets.filter((ticket) => ticket.downloadUrl).length,
    [sortedTickets]
  );

  return (
    <Screen scrollable>
      <View style={styles.header}>
        <ThemedText type="eyebrow">Tickets</ThemedText>
        <ThemedText type="screenTitle" style={styles.jobTitle}>
          {job?.name ?? 'Active pour'}
        </ThemedText>
      </View>

      {isLoading ? (
        <LoadingState label="Loading ticket records..." />
      ) : (
        <>
          <SurfaceCard>
            <SectionHeader title="Ticket Links" subtitle={`${availableTicketCount} available`} />
            {sortedTickets.length === 0 ? (
              <EmptyState
                title="No ticket links yet"
                message="Ticket download links will appear here as trucking tickets are added."
              />
            ) : (
              <View style={styles.ticketList}>
                {sortedTickets.map((ticket) => (
                  <TicketRow key={ticket.id} ticket={ticket} />
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
  jobTitle: {
    fontFamily: 'BarlowCondensed_700Bold',
  },
  ticketList: {
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
});
