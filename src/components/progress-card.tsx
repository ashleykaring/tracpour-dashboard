import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import type { DashboardMetrics } from '@/lib/types';

import { ProgressBar } from './progress-bar';
import { SurfaceCard } from './surface-card';
import { ThemedText } from './themed-text';

type ProgressCardProps = {
  metrics: DashboardMetrics;
};

export function ProgressCard({ metrics }: ProgressCardProps) {
  return (
    <SurfaceCard style={styles.card}>
      <View style={styles.row}>
        <View style={styles.copy}>
          <ThemedText type="smallBold">Pour Progress</ThemedText>
          <ThemedText themeColor="textSecondary">
            {`${metrics.totalPoured.toFixed(1)} of ${metrics.expectedYardage.toFixed(1)} CY`}
          </ThemedText>
        </View>
        <ThemedText type="dataPoint">{`${Math.round(metrics.progressPercentage)}%`}</ThemedText>
      </View>

      <ProgressBar progress={metrics.progressPercentage} />
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: Spacing.two,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
});
