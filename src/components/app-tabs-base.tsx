import { router, usePathname } from 'expo-router';
import React, { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from './themed-text';

const HEADER_HEIGHT = 108;

export default function AppTabsBase({ children }: PropsWithChildren) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <SafeAreaView
        edges={['top']}
        style={[
          styles.header,
          {
            paddingTop: insets.top + Spacing.two,
            backgroundColor: theme.background,
            borderBottomColor: theme.cardBorder,
          },
        ]}>
        <View style={styles.navInner}>
          <ThemedText type="screenTitle" style={styles.title}>
            TracPour
          </ThemedText>

          <View
            style={[
              styles.tabBar,
              {
                backgroundColor: theme.backgroundElement,
                borderColor: theme.cardBorder,
              },
            ]}>
            <TabButton
              label="Live"
              isFocused={pathname === '/live' || pathname === '/'}
              onPress={() => router.replace('/live')}
            />
            <TabButton
              label="Tickets"
              isFocused={pathname === '/tickets'}
              onPress={() => router.replace('/tickets')}
            />
            <TabButton
              label="History"
              isFocused={pathname === '/history'}
              onPress={() => router.replace('/history')}
            />
          </View>
        </View>
      </SafeAreaView>

      <View style={[styles.content, { paddingTop: HEADER_HEIGHT + insets.top }]}>{children}</View>
    </SafeAreaView>
  );
}

type TabButtonProps = {
  label: string;
  isFocused: boolean;
  onPress: () => void;
};

function TabButton({ label, isFocused, onPress }: TabButtonProps) {
  const theme = useTheme();

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.tabButton, pressed && styles.pressed]}>
      <View
        style={[
          styles.tabButtonInner,
          {
            backgroundColor: isFocused ? theme.backgroundSelected : 'transparent',
          },
        ]}>
        <ThemedText type="smallBold" themeColor={isFocused ? 'text' : 'textSecondary'}>
          {label}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  navInner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.two,
  },
  title: {
    textAlign: 'left',
  },
  tabBar: {
    flexDirection: 'row',
    gap: Spacing.one,
    borderRadius: 20,
    borderWidth: 1,
    padding: Spacing.one,
  },
  tabButton: {
    flex: 1,
  },
  tabButtonInner: {
    minHeight: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.two,
  },
  pressed: {
    opacity: 0.8,
  },
  content: {
    flex: 1,
  },
});
