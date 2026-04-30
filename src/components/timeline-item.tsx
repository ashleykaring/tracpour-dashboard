import { StyleSheet, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';
import { formatDateTime } from '@/lib/format';
import type { ActivityEvent } from '@/lib/types';

import { ThemedText } from './themed-text';

type TimelineItemProps = {
  event: ActivityEvent;
  isLast: boolean;
};

export function TimelineItem({ event, isLast }: TimelineItemProps) {
  const isStart = event.type === 'engine_start';

  return (
    <View style={styles.row}>
      <View style={styles.rail}>
        <View style={[styles.dot, { backgroundColor: isStart ? Colors.light.success : Colors.light.accent }]} />
        {!isLast ? <View style={styles.line} /> : null}
      </View>
      <View style={styles.content}>
        <ThemedText type="smallBold">{isStart ? 'Pouring started' : 'Pouring stopped'}</ThemedText>
        <ThemedText themeColor="textSecondary">{formatDateTime(event.timestamp)}</ThemedText>
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
