import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from './themed-text';

type StatusPillProps = {
  label: string;
  tone?: 'success' | 'accent' | 'neutral';
};

export function StatusPill({ label, tone = 'success' }: StatusPillProps) {
  const theme = useTheme();
  const backgroundColor =
    tone === 'accent' ? theme.accentMuted : tone === 'neutral' ? theme.backgroundSelected : theme.successMuted;
  const textColor = tone === 'accent' ? theme.accent : tone === 'neutral' ? theme.textSecondary : theme.success;

  return (
    <View style={[styles.pill, { backgroundColor }]}>
      <ThemedText type="smallBold" style={{ color: textColor }}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
});
