import { StyleSheet, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';
import { formatDateTime } from '@/lib/format';
import type { ActivityEvent } from '@/lib/types';

import { ThemedText } from './themed-text';

type TimelineItemProps = {
  event: ActivityEvent;
  nextEvent?: ActivityEvent;
  isLast: boolean;
};

export function TimelineItem({ event, nextEvent, isLast }: TimelineItemProps) {
  const isStart = event.type === 'engine_start';
  const lineTone = isStart && nextEvent?.type === 'engine_stop' ? 'pouring' : 'idle';

  return (
    <View style={styles.row}>
      <View style={styles.rail}>
        <View style={[styles.dot, { backgroundColor: isStart ? Colors.light.success : Colors.light.accent }]} />
        {!isLast ? <View style={[styles.line, lineTone === 'pouring' ? styles.pouringLine : styles.idleLine]} /> : null}
      </View>
      <View style={styles.content}>
        <ThemedText type="smallBold">{isStart ? 'Pouring started' : 'Pouring stopped'}</ThemedText>
        <ThemedText themeColor="textSecondary">{formatDateTime(event.timestamp)}</ThemedText>
        {!isLast ? (
          <ThemedText type="small" themeColor="textSecondary">
            {lineTone === 'pouring' ? 'Pouring until next stop' : 'Idle until next start'}
          </ThemedText>
        ) : null}
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
  },
  pouringLine: {
    width: 4,
    borderRadius: 999,
    backgroundColor: Colors.light.success,
  },
  idleLine: {
    backgroundColor: Colors.light.cardBorder,
  },
  content: {
    flex: 1,
    minWidth: 0,
    paddingBottom: Spacing.three,
    gap: Spacing.half,
  },
});
