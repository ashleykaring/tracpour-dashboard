import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';
import { formatDateTime } from '@/lib/format';
import type { TruckingTicket } from '@/lib/types';

import { StatusPill } from './status-pill';
import { ThemedText } from './themed-text';

type TicketRowProps = {
  ticket: TruckingTicket;
};

export function TicketRow({ ticket }: TicketRowProps) {
  const canDownload = Boolean(ticket.downloadUrl);
  const displayLabel = ticket.ticketNumber ? `Ticket ${ticket.ticketNumber}` : 'Ticket link';
  const statusLabel = ticket.status === 'available' ? 'available' : 'pending';
  const supportingDetails = [
    ticket.truckLabel,
    ticket.deliveredAt ? formatDateTime(ticket.deliveredAt) : null,
  ].filter(Boolean);
  const hasBottomRow = typeof ticket.yardage === 'number' || canDownload;

  return (
    <View style={styles.row}>
      <View style={styles.topRow}>
        <View style={styles.copy}>
          <ThemedText type="smallBold">{displayLabel}</ThemedText>
          {supportingDetails.length > 0 ? (
            <ThemedText themeColor="textSecondary">{supportingDetails.join(' | ')}</ThemedText>
          ) : null}
        </View>
        <StatusPill label={statusLabel} tone={ticket.status === 'available' ? 'success' : 'neutral'} />
      </View>

      {hasBottomRow ? (
        <View style={styles.bottomRow}>
          {typeof ticket.yardage === 'number' ? (
            <ThemedText type="dataPoint">{`${ticket.yardage.toFixed(1)} CY`}</ThemedText>
          ) : (
            <View />
          )}
          {canDownload ? (
            <Pressable onPress={() => Linking.openURL(ticket.downloadUrl!)} style={styles.button}>
              <ThemedText type="smallBold" style={styles.buttonText}>
                Download Ticket
              </ThemedText>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    borderRadius: 20,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    backgroundColor: 'rgba(255,255,255,0.04)',
    gap: Spacing.two,
  },
  topRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.half,
  },
  bottomRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
  button: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: Colors.light.accent,
  },
  buttonText: {
    color: Colors.light.navText,
    flexShrink: 1,
  },
});
