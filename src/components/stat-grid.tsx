import { StyleSheet, View, useWindowDimensions } from 'react-native';

import { Spacing } from '@/constants/theme';

import { SurfaceCard } from './surface-card';
import { ThemedText } from './themed-text';

type StatGridItem = {
  label: string;
  value: string;
};

type StatGridProps = {
  items: StatGridItem[];
};

export function StatGrid({ items }: StatGridProps) {
  const { width } = useWindowDimensions();
  const isNarrow = width < 420;

  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <SurfaceCard key={item.label} style={[styles.item, isNarrow ? styles.itemFull : styles.itemHalf]}>
          <ThemedText themeColor="textSecondary" type="small">
            {item.label}
          </ThemedText>
          <ThemedText type="statValue" style={styles.value}>
            {item.value}
          </ThemedText>
        </SurfaceCard>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  item: {
    flexGrow: 1,
    minWidth: 0,
    gap: Spacing.one,
  },
  itemHalf: {
    width: '47%',
  },
  itemFull: {
    width: '100%',
  },
  value: {
    flexShrink: 1,
  },
});
