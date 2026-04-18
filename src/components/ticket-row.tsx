import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';
import { formatDateTime } from '@/lib/format';
import type { Load } from '@/lib/types';

import { StatusPill } from './status-pill';
import { ThemedText } from './themed-text';

type TicketRowProps = {
  load: Load;
};

export function TicketRow({ load }: TicketRowProps) {
  const canDownload = Boolean(load.ticketDownloadUrl);

  return (
    <View style={styles.row}>
      <View style={styles.topRow}>
        <View style={styles.copy}>
          <ThemedText type="smallBold">{load.truckLabel ?? `Load ${load.sequenceNumber}`}</ThemedText>
          <ThemedText themeColor="textSecondary">
            {load.completedAt ? formatDateTime(load.completedAt) : 'Time pending'}
          </ThemedText>
        </View>
        <StatusPill
          label={load.status}
          tone={load.status === 'completed' ? 'success' : 'neutral'}
        />
      </View>

      <View style={styles.bottomRow}>
        <ThemedText type="dataPoint">{`${load.yardage.toFixed(1)} yd`}</ThemedText>
        {canDownload ? (
          <Pressable onPress={() => Linking.openURL(load.ticketDownloadUrl!)} style={styles.button}>
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
    color: '#08121B',
    flexShrink: 1,
  },
});
