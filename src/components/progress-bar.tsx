import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type ProgressBarProps = {
  progress: number;
};

export function ProgressBar({ progress }: ProgressBarProps) {
  const theme = useTheme();

  return (
    <View style={[styles.track, { backgroundColor: theme.progressTrack }]}>
      <View
        style={[
          styles.fill,
          {
            width: `${Math.min(Math.max(progress, 0), 100)}%`,
            backgroundColor: theme.accent,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 14,
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
});
