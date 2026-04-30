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
  const displayLabel = ticket.truckLabel ?? ticket.ticketNumber ?? 'Ticket pending';
  const statusLabel = ticket.status === 'available' ? 'available' : 'pending';

  return (
    <View style={styles.row}>
      <View style={styles.topRow}>
        <View style={styles.copy}>
          <ThemedText type="smallBold">{displayLabel}</ThemedText>
          <ThemedText themeColor="textSecondary">
            {ticket.deliveredAt ? formatDateTime(ticket.deliveredAt) : 'Delivery time pending'}
          </ThemedText>
        </View>
        <StatusPill label={statusLabel} tone={ticket.status === 'available' ? 'success' : 'neutral'} />
      </View>

      <View style={styles.bottomRow}>
        <ThemedText type="dataPoint">
          {typeof ticket.yardage === 'number' ? `${ticket.yardage.toFixed(1)} CY` : 'Yardage pending'}
        </ThemedText>
        {canDownload ? (
          <Pressable onPress={() => Linking.openURL(ticket.downloadUrl!)} style={styles.button}>
            <ThemedText type="smallBold" style={styles.buttonText}>
              Download Ticket
            </ThemedText>
          </Pressable>
        ) : (
          <ThemedText themeColor="textSecondary">Ticket unavailable</ThemedText>
        )}
      </View>
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
