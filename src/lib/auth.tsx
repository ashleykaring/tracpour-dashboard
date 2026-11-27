import type { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { AppState, Platform } from 'react-native';

import { supabase } from '@/lib/supabase';

type AuthState = {
  session: Session | null;
  loading: boolean;
  recovery: boolean;
  linkError: string | null;
  finishRecovery: () => void;
  clearLinkError: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(Boolean(supabase));
  const [recovery, setRecovery] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    const client = supabase;
    let active = true;

    const { data: { subscription } } = client.auth.onAuthStateChange((event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      if (event === 'PASSWORD_RECOVERY') setRecovery(true);
      if (event === 'SIGNED_OUT') setRecovery(false);
      if (event === 'INITIAL_SESSION') setLoading(false);
    });

    // Supabase handles browser callbacks. Native deep links must establish the
    // session explicitly because React Native has no browser URL to inspect.
    async function handleNativeLink(url: string) {
      if (Platform.OS === 'web') return;
      const hashIndex = url.indexOf('#');
      const queryIndex = url.indexOf('?');
      const params = new URLSearchParams(hashIndex >= 0 ? url.slice(hashIndex + 1) :
        queryIndex >= 0 ? url.slice(queryIndex + 1) : '');
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      const error = params.get('error_description');
      if (error) {
        if (active) setLinkError(error);
        return;
      }
      if (params.get('type') === 'recovery' && active) setRecovery(true);
      if (accessToken && refreshToken) {
        if (active) setLinkError(null);
        const result = await client.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
        if (active && result.error) setLinkError(result.error.message);
      }
    }

    const linkSubscription = Linking.addEventListener('url', ({ url }) => { void handleNativeLink(url); });
    if (Platform.OS !== 'web') {
      void Linking.getInitialURL().then((url) => { if (url) void handleNativeLink(url); });
    }
    const appStateSubscription = Platform.OS === 'web' ? null : AppState.addEventListener('change', (state) => {
      if (state === 'active') client.auth.startAutoRefresh();
      else client.auth.stopAutoRefresh();
    });
    if (Platform.OS !== 'web' && AppState.currentState === 'active') client.auth.startAutoRefresh();

    return () => {
      active = false;
      subscription.unsubscribe();
      linkSubscription.remove();
      appStateSubscription?.remove();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, loading, recovery, linkError, finishRecovery: () => setRecovery(false), clearLinkError: () => setLinkError(null) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
