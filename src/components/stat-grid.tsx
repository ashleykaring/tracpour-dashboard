import { StyleSheet, View } from 'react-native';

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
  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <SurfaceCard key={item.label} style={styles.item}>
          <ThemedText themeColor="textSecondary" type="small">
            {item.label}
          </ThemedText>
          <ThemedText type="statValue">{item.value}</ThemedText>
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
    minWidth: '47%',
    flexGrow: 1,
    gap: Spacing.one,
  },
});
