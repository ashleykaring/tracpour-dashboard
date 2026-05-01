import { router } from 'expo-router';
import { useMemo } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/empty-state';
import { JobHeader } from '@/components/job-header';
import { LoadRow } from '@/components/load-row';
import { LoadingState } from '@/components/loading-state';
import { MetricCard } from '@/components/metric-card';
import { ProgressCard } from '@/components/progress-card';
import { Screen } from '@/components/screen';
import { SectionHeader } from '@/components/section-header';
import { StatGrid } from '@/components/stat-grid';
import { SurfaceCard } from '@/components/surface-card';
import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';
import { formatDateTime } from '@/lib/format';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { completeActivePour } from '@/lib/api';

export default function LiveScreen() {
  const { job, isLoading, metrics, loads } = useDashboardData();

  const recentLoads = useMemo(
    () =>
      [...loads]
        .filter((load) => load.status === 'incomplete' || load.completedAt)
        .sort((left, right) => {
          if (left.status === 'incomplete' && right.status !== 'incomplete') {
            return -1;
          }

          if (right.status === 'incomplete' && left.status !== 'incomplete') {
            return 1;
          }

          return (right.completedAt ?? '').localeCompare(left.completedAt ?? '');
        })
        .slice(0, 5),
    [loads]
  );

  if (!isLoading && !job) {
    return (
      <Screen scrollable>
        <EmptyState
          title="No active pour"
          message="Start a pour to begin tracking yardage and truck activity.">
          <Pressable onPress={() => router.replace('/create-job')} style={styles.primaryButton}>
            <ThemedButtonText>Start Pour</ThemedButtonText>
          </Pressable>
        </EmptyState>
      </Screen>
    );
  }

  function handleEndPour() {
    Alert.alert('End pour?', 'This will complete the active pour and return to setup.', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'End Pour',
        style: 'destructive',
        onPress: () => {
          void completeActivePour().then(() => {
            router.replace('/create-job');
          });
        },
      },
    ]);
  }

  return (
    <Screen scrollable>
      <JobHeader job={job} />

      {isLoading || !job || !metrics ? (
        <LoadingState label="Loading live pour dashboard..." />
      ) : (
        <>
          <MetricCard
            label="Total Poured"
            value={`${metrics.totalPoured.toFixed(1)} CY`}
            helper={`Last completed load ${metrics.lastCompletedAt ? formatDateTime(metrics.lastCompletedAt) : 'not available yet'}`}
          />

          <ProgressCard metrics={metrics} />

          <StatGrid
            items={[
              {
                label: 'Expected Yardage',
                value: `${metrics.expectedYardage.toFixed(1)} CY`,
                span: 'full',
              },
              {
                label: 'Remaining Yardage',
                value: `${metrics.remainingYardage.toFixed(1)} CY`,
                span: 'half',
              },
              {
                label: 'Completed Trucks',
                value: `${metrics.completedTruckCount}`,
                span: 'half',
              },
            ]}
          />

          <SurfaceCard>
            <SectionHeader title="Recent Loads" />

            {recentLoads.length === 0 ? (
              <EmptyState
                title="Awaiting first truck"
                message="Truck activity will appear here automatically as events come in."
              />
            ) : (
              <View style={styles.recentLoadsList}>
                {recentLoads.map((load) => (
                  <LoadRow key={load.id} load={load} />
                ))}
              </View>
            )}
          </SurfaceCard>

          <Pressable onPress={handleEndPour} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
            <ThemedButtonText color={Colors.light.accent}>End Pour</ThemedButtonText>
          </Pressable>
        </>
      )}
    </Screen>
  );
}

function ThemedButtonText({ children, color = Colors.light.navText }: { children: string; color?: string }) {
  return (
    <ThemedText type="smallBold" style={{ color }}>
      {children}
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  recentLoadsList: {
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  primaryButton: {
    minHeight: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.navNavy,
    marginTop: Spacing.two,
  },
  secondaryButton: {
    minHeight: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.light.cardBorder,
    backgroundColor: Colors.light.backgroundElement,
  },
  pressed: {
    opacity: 0.82,
  },
});
