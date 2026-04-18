import { BarlowCondensed_700Bold } from '@expo-google-fonts/barlow-condensed';
import { Barlow_600SemiBold } from '@expo-google-fonts/barlow';
import { Slot, usePathname } from 'expo-router';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import React from 'react';

import AppTabs from '@/components/app-tabs';

export default function TabLayout() {
  const pathname = usePathname();
  const [fontsLoaded] = useFonts({
    Barlow_600SemiBold,
    BarlowCondensed_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const isDashboardRoute = pathname === '/live' || pathname === '/tickets' || pathname === '/history';

  return (
    <ThemeProvider value={DefaultTheme}>
      {isDashboardRoute ? (
        <AppTabs>
          <Slot />
        </AppTabs>
      ) : (
        <Slot />
      )}
    </ThemeProvider>
  );
}
