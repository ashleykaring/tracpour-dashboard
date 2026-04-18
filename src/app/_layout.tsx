import { BarlowCondensed_700Bold } from '@expo-google-fonts/barlow-condensed';
import { Barlow_600SemiBold } from '@expo-google-fonts/barlow';
import { Slot } from 'expo-router';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import React from 'react';

import AppTabs from '@/components/app-tabs';

export default function TabLayout() {
  const [fontsLoaded] = useFonts({
    Barlow_600SemiBold,
    BarlowCondensed_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider value={DefaultTheme}>
      <AppTabs>
        <Slot />
      </AppTabs>
    </ThemeProvider>
  );
}
