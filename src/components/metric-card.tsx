import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';

import { SurfaceCard } from './surface-card';
import { ThemedText } from './themed-text';

type MetricCardProps = {
  label: string;
  value: string;
  helper: string;
};

export function MetricCard({ label, value, helper }: MetricCardProps) {
  return (
    <SurfaceCard style={styles.card}>
      <ThemedText type="eyebrow">{label}</ThemedText>
      <View style={styles.metricRow}>
        <ThemedText type="hero">{value}</ThemedText>
      </View>
      <ThemedText themeColor="textSecondary">{helper}</ThemedText>
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.two,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
});
