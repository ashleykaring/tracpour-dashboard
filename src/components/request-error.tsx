import { Pressable, StyleSheet } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';

import { SurfaceCard } from './surface-card';
import { ThemedText } from './themed-text';

type RequestErrorProps = {
  message: string;
  onRetry: () => void;
  isRetrying?: boolean;
};

export function RequestError({ message, onRetry, isRetrying = false }: RequestErrorProps) {
  return (
    <SurfaceCard style={styles.card}>
      <ThemedText type="smallBold" accessibilityRole="alert">Unable to update data</ThemedText>
      <ThemedText themeColor="textSecondary">{message}</ThemedText>
      <Pressable
        accessibilityRole="button"
        disabled={isRetrying}
        onPress={onRetry}
        style={styles.button}
      >
        <ThemedText type="smallBold" style={styles.buttonText}>
          {isRetrying ? 'Retrying...' : 'Retry'}
        </ThemedText>
      </Pressable>
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.two },
  button: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: Colors.light.navNavy,
  },
  buttonText: { color: Colors.light.navText },
});
