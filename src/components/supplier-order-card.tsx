import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import type { SupplierOrder } from '@/lib/types';

import { SectionHeader } from './section-header';
import { StatusPill } from './status-pill';
import { SurfaceCard } from './surface-card';
import { ThemedText } from './themed-text';

type SupplierOrderCardProps = {
  supplierOrder: SupplierOrder;
  totalPoured: number;
};

export function SupplierOrderCard({ supplierOrder, totalPoured }: SupplierOrderCardProps) {
  const delta = supplierOrder.batchedYardage - totalPoured;
  const deltaLabel =
    delta > 0.05
      ? 'Plant ahead of pump'
      : delta < -0.05
        ? 'Pump ahead of plant'
        : 'Plant and pump aligned';
  const supplierDataPoints = [
    supplierOrder.supplierPlantName
      ? {
          label: 'Plant',
          value: supplierOrder.supplierPlantName,
        }
      : null,
    {
      label: 'Mix Design',
      value: supplierOrder.mixDesign,
    },
    {
      label: 'Ordered',
      value: `${supplierOrder.orderedYardage.toFixed(1)} CY`,
    },
    {
      label: 'Batched to Date',
      value: `${supplierOrder.batchedYardage.toFixed(1)} CY`,
    },
    {
      label: 'Trucks En Route',
      value: `${supplierOrder.trucksEnRoute}`,
    },
    {
      label: 'Next ETA',
      value:
        typeof supplierOrder.nextTruckEtaMinutes === 'number'
          ? `${supplierOrder.nextTruckEtaMinutes} min`
          : 'Not available',
    },
  ].filter((item): item is { label: string; value: string } => Boolean(item));

  return (
    <SurfaceCard style={styles.card}>
      <View style={styles.headerRow}>
        <SectionHeader title="Supplier Order" subtitle={`Order ${supplierOrder.orderNumber}`} />
        <StatusPill label={supplierOrder.platform} tone="neutral" />
      </View>

      <View style={styles.grid}>
        {supplierDataPoints.map((item, index) => (
          <SupplierDataPoint
            key={item.label}
            label={item.label}
            value={item.value}
            isRightColumn={index % 2 === 1}
          />
        ))}
      </View>

      <View style={styles.reconciliation}>
        <ThemedText type="smallBold">Plant / Pump Reconciliation</ThemedText>
        <ComparisonRow label="Placed by TracPour" value={`${totalPoured.toFixed(1)} CY`} />
        <ComparisonRow label="Batched by Plant" value={`${supplierOrder.batchedYardage.toFixed(1)} CY`} />
        <View style={styles.deltaRow}>
          <ThemedText type="smallBold">{deltaLabel}</ThemedText>
          <ThemedText type="dataPoint">{`${formatSignedYardage(delta)} CY`}</ThemedText>
        </View>
      </View>
    </SurfaceCard>
  );
}

function SupplierDataPoint({
  label,
  value,
  isRightColumn = false,
}: {
  label: string;
  value: string;
  isRightColumn?: boolean;
}) {
  return (
    <View style={[styles.dataPoint, isRightColumn && styles.dataPointRight]}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText type="dataPoint" style={styles.value}>
        {value}
      </ThemedText>
    </View>
  );
}

function ComparisonRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.comparisonRow}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText type="smallBold">{value}</ThemedText>
    </View>
  );
}

function formatSignedYardage(value: number) {
  if (Math.abs(value) <= 0.05) {
    return '0.0';
  }

  return `${value > 0 ? '+' : '-'}${Math.abs(value).toFixed(1)}`;
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.three,
  },
  headerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  dataPoint: {
    width: '47%',
    flexGrow: 1,
    minWidth: 132,
    gap: Spacing.half,
  },
  dataPointRight: {
    paddingLeft: Spacing.three,
  },
  value: {
    flexShrink: 1,
  },
  reconciliation: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(17,33,45,0.1)',
    paddingTop: Spacing.three,
    gap: Spacing.two,
  },
  comparisonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  deltaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
});
