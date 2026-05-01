import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { formatDateTime } from '@/lib/format';
import type { Load } from '@/lib/types';

import { ThemedText } from './themed-text';

type LoadRowProps = {
  load: Load;
};

export function LoadRow({ load }: LoadRowProps) {
  const isInProgress = load.status === 'incomplete';

  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <ThemedText type="smallBold">{`Load ${load.sequenceNumber}`}</ThemedText>
        <ThemedText themeColor="textSecondary">
          {isInProgress ? 'Truck on site' : load.completedAt ? formatDateTime(load.completedAt) : 'Waiting for completion'}
        </ThemedText>
      </View>
      <View style={styles.right}>
        <ThemedText type="dataPoint">{isInProgress ? 'In progress' : `${load.yardage.toFixed(1)} CY`}</ThemedText>
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
