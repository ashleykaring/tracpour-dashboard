/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#11212D',
    background: '#F4F1EA',
    backgroundElement: '#FBFAF6',
    backgroundSelected: '#E9E2D4',
    textSecondary: '#5D6A73',
    accent: '#C88635',
    accentMuted: '#F0D9BD',
    success: '#2E8B57',
    successMuted: '#D6EADC',
    progressTrack: '#E1D8C8',
    cardBorder: '#E4DAC8',
    shadow: '#61513C',
  },
  dark: {
    text: '#F7F4EF',
    background: '#141A1D',
    backgroundElement: '#1B2429',
    backgroundSelected: '#243138',
    textSecondary: '#9EADB6',
    accent: '#E2A257',
    accentMuted: '#49311A',
    success: '#6AD29A',
    successMuted: '#183124',
    progressTrack: '#2B363D',
    cardBorder: '#2D3940',
    shadow: '#000000',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'sans-serif',
    serif: 'serif',
    rounded: 'sans-serif',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 48,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
