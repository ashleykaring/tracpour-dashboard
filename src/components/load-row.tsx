import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { formatDateTime } from '@/lib/format';
import type { Load } from '@/lib/types';

import { StatusPill } from './status-pill';
import { ThemedText } from './themed-text';

type LoadRowProps = {
  load: Load;
};

export function LoadRow({ load }: LoadRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <ThemedText type="smallBold">{load.truckLabel ?? `Load ${load.sequenceNumber}`}</ThemedText>
        <ThemedText themeColor="textSecondary">
          {load.completedAt ? formatDateTime(load.completedAt) : 'Waiting for completion'}
        </ThemedText>
      </View>
      <View style={styles.right}>
        <ThemedText type="dataPoint">{`${load.yardage.toFixed(1)} yd`}</ThemedText>
        <StatusPill label={load.yardageSource} tone={load.yardageSource === 'actual' ? 'accent' : 'neutral'} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.two,
  },
  left: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.half,
  },
  right: {
    minWidth: 88,
    alignItems: 'flex-end',
    gap: Spacing.one,
  },
});
