import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useMemo } from 'react';
import { Alert, Linking, Pressable, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/empty-state';
import { LoadingState } from '@/components/loading-state';
import { Screen } from '@/components/screen';
import { SectionHeader } from '@/components/section-header';
import { SurfaceCard } from '@/components/surface-card';
import { TicketRow } from '@/components/ticket-row';
import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { getActivePourTicketsExportUrl } from '@/lib/api';

export default function TicketsScreen() {
  const { job, isLoading, tickets } = useDashboardData();
  const ticketsExportUrl = useMemo(() => getActivePourTicketsExportUrl(), []);

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
  const canExportTickets = Boolean(job && ticketsExportUrl);

  async function handleExportTickets() {
    if (!ticketsExportUrl) {
      Alert.alert('Export unavailable', 'Ticket export is only available when connected to the backend.');
      return;
    }

    try {
      await Linking.openURL(ticketsExportUrl);
    } catch {
      Alert.alert('Export failed', 'Unable to open the ticket export.');
    }
  }

  return (
    <Screen scrollable>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <ThemedText type="eyebrow">Tickets</ThemedText>
          <ThemedText type="screenTitle" style={styles.jobTitle}>
            {job?.name ?? 'Active pour'}
          </ThemedText>
        </View>
        {canExportTickets ? (
          <View style={styles.headerActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Export tickets to Excel"
              onPress={handleExportTickets}
              style={({ pressed }) => [styles.exportButton, pressed && styles.pressed]}
            >
              <MaterialCommunityIcons name="file-excel-outline" size={18} color={Colors.light.navText} />
              <ThemedText type="smallBold" style={styles.exportButtonText}>
                Export
              </ThemedText>
            </Pressable>
          </View>
        ) : null}
      </View>

      {isLoading ? (
        <LoadingState label="Loading ticket records..." />
      ) : (
        <>
          <SurfaceCard>
            <SectionHeader title="Trucking Tickets" subtitle={`${availableTicketCount} available`} />
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.three,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.one,
  },
  jobTitle: {
    fontFamily: 'BarlowCondensed_700Bold',
  },
  headerActions: {
    alignItems: 'flex-end',
    gap: Spacing.two,
    marginTop: Spacing.three + Spacing.one,
  },
  exportButton: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    borderRadius: 14,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    backgroundColor: Colors.light.accent,
  },
  exportButtonText: {
    color: Colors.light.navText,
  },
  pressed: {
    opacity: 0.82,
  },
  ticketList: {
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
});
