import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { BarlowCondensed_700Bold } from '@expo-google-fonts/barlow-condensed';
import { Barlow_600SemiBold } from '@expo-google-fonts/barlow';

import { AuthProvider, useAuth } from '@/lib/auth';

export default function RootLayout() {
  return <AuthProvider><AuthenticatedStack /></AuthProvider>;
}

function AuthenticatedStack() {
  const { session, loading, recovery } = useAuth();
  const [fontsLoaded] = useFonts({ Barlow_600SemiBold, BarlowCondensed_700Bold });
  if (!fontsLoaded) return null;
  return (
      <Stack key={session?.user.id ?? 'guest'} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="reset-password" />
        <Stack.Protected guard={Boolean(session) && !loading && !recovery}>
          <Stack.Screen name="create-job" />
          <Stack.Screen name="live" />
          <Stack.Screen name="tickets" />
          <Stack.Screen name="history" />
        </Stack.Protected>
      </Stack>
  );
}
