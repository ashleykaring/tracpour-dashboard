import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { supabase } from '@/lib/supabase';

export function SignOutButton({ light = false }: { light?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function signOut() {
    if (!supabase || busy) return;
    setBusy(true);
    const { error: result } = await supabase.auth.signOut();
    if (result) setError(result.message);
    setBusy(false);
  }
  return <View>
    <Pressable accessibilityRole="button" onPress={() => { void signOut(); }} disabled={busy} style={{ padding: 8 }}>
      <Text style={{ color: light ? '#F5F7FA' : '#1A3A5C', fontWeight: '600' }}>{busy ? 'Signing out…' : 'Sign out'}</Text>
    </Pressable>
    {error && <Text accessibilityRole="alert" style={{ color: light ? '#FFFFFF' : '#B42318' }}>{error}</Text>}
  </View>;
}
