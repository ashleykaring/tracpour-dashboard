import { StyleSheet, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';
import { formatDateTime } from '@/lib/format';
import type { Load } from '@/lib/types';

import { ThemedText } from './themed-text';

type TimelineItemProps = {
  load: Load;
  isLast: boolean;
};

export function TimelineItem({ load, isLast }: TimelineItemProps) {
  return (
    <View style={styles.row}>
      <View style={styles.rail}>
        <View style={styles.dot} />
        {!isLast ? <View style={styles.line} /> : null}
      </View>
      <View style={styles.content}>
        <ThemedText type="smallBold">{load.truckLabel ?? `Load ${load.sequenceNumber}`}</ThemedText>
        <ThemedText themeColor="textSecondary">
          {load.completedAt ? formatDateTime(load.completedAt) : 'Time pending'}
        </ThemedText>
        <ThemedText type="dataPoint">{`${load.yardage.toFixed(1)} yd poured`}</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  rail: {
    width: 20,
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 999,
    backgroundColor: Colors.light.accent,
    marginTop: 6,
  },
  line: {
    width: 2,
    flex: 1,
    marginTop: 6,
    backgroundColor: Colors.light.cardBorder,
  },
  content: {
    flex: 1,
    minWidth: 0,
    paddingBottom: Spacing.three,
    gap: Spacing.half,
  },
});
