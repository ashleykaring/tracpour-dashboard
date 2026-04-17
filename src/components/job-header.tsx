import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import type { Job } from '@/lib/types';

import { StatusPill } from './status-pill';
import { ThemedText } from './themed-text';

type JobHeaderProps = {
  job: Job | null;
};

export function JobHeader({ job }: JobHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.copy}>
          <ThemedText type="eyebrow">Active Job</ThemedText>
          <ThemedText type="screenTitle">{job?.name ?? 'Loading active job'}</ThemedText>
        </View>
        <StatusPill label={job?.status ?? 'active'} />
      </View>
      <ThemedText themeColor="textSecondary" style={styles.subcopy}>
        Running yardage progress for the active concrete pour.
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.three,
  },
  copy: {
    flex: 1,
    gap: Spacing.one,
  },
  subcopy: {
    maxWidth: 420,
  },
});
