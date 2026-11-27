import * as Linking from 'expo-linking';
import { router, usePathname } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

type Mode = 'sign-in' | 'sign-up' | 'forgot-password';

export function AuthGate() {
  const { session, loading, recovery, linkError, finishRecovery, clearLinkError } = useAuth();
  const pathname = usePathname();
  const [mode, setMode] = useState<Mode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resetting = recovery || pathname === '/reset-password';

  function changeMode(next: Mode) {
    setMode(next);
    setPassword('');
    setConfirmPassword('');
    setMessage(null);
    setError(null);
    clearLinkError();
  }

  async function submit() {
    if (!supabase || busy) return;
    setError(null);
    setMessage(null);
    if (resetting && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      if (resetting) {
        const { error: updateError } = await supabase.auth.updateUser({ password });
        if (updateError) throw updateError;
        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) throw signOutError;
        finishRecovery();
        setPassword('');
        setConfirmPassword('');
        setMode('sign-in');
        setMessage('Password updated. Sign in with your new password.');
        router.replace('/');
      } else if (mode === 'forgot-password') {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: Linking.createURL('reset-password'),
        });
        if (resetError) throw resetError;
        setMessage('If an account exists for that email, a password reset link will be sent.');
      } else if (mode === 'sign-up') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: Linking.createURL('/') },
        });
        if (signUpError) throw signUpError;
        if (!data.session) {
          setPassword('');
          setMessage('Check your email for a confirmation link, then sign in.');
        } else setPassword('');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (signInError) throw signInError;
        setPassword('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    if (!supabase || busy) return;
    setBusy(true);
    setError(null);
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) setError(signOutError.message);
    else setPassword('');
    setBusy(false);
  }

  const title = resetting ? 'Choose a new password' : session ? 'Your account is ready' :
    mode === 'sign-up' ? 'Create your account' : mode === 'forgot-password' ? 'Reset your password' : 'Welcome back';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.brand}>Trac<Text style={styles.brandAccent}>Pour</Text></Text>
          <Text style={styles.title}>{title}</Text>
          {!supabase ? (
            <Text style={styles.body}>Set the Supabase project URL and publishable key to continue.</Text>
          ) : loading ? (
            <ActivityIndicator color="#1A3A5C" accessibilityLabel="Loading session" />
          ) : resetting && !session ? (
            <>
              <Text style={styles.body}>{linkError ?? 'This reset link is invalid or expired. Request a new one.'}</Text>
              <Action label="Request another link" onPress={() => { finishRecovery(); changeMode('forgot-password'); router.replace('/'); }} />
            </>
          ) : session && !resetting ? (
            <>
              <Text style={styles.body}>Signed in as {session.user.email}.</Text>
              <Text style={styles.body}>Pour tracking will be available soon.</Text>
              {error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
              <Action label={busy ? 'Signing out…' : 'Sign out'} onPress={() => { void signOut(); }} disabled={busy} />
            </>
          ) : (
            <>
              {!resetting && (
                <Field label="Email" value={email} onChangeText={setEmail} autoComplete="email" keyboardType="email-address" />
              )}
              {(resetting || mode !== 'forgot-password') && (
                <Field label={resetting ? 'New password' : 'Password'} value={password} onChangeText={setPassword}
                  autoComplete={resetting || mode === 'sign-up' ? 'new-password' : 'current-password'} secureTextEntry />
              )}
              {resetting && <Field label="Confirm new password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />}
              {(error || linkError) && <Text accessibilityRole="alert" style={styles.error}>{error || linkError}</Text>}
              {message && <Text accessibilityRole="alert" style={styles.message}>{message}</Text>}
              <Action label={busy ? 'Please wait…' : resetting ? 'Update password' : mode === 'sign-up' ? 'Create account' : mode === 'forgot-password' ? 'Send reset link' : 'Sign in'}
                onPress={() => { void submit(); }} disabled={busy || (!resetting && !email.trim()) || ((resetting || mode !== 'forgot-password') && !password)} />
              {!resetting && mode === 'sign-in' && <Link label="Forgot password?" onPress={() => changeMode('forgot-password')} />}
              {!resetting && <Link label={mode === 'sign-in' ? 'Create an account' : 'Back to sign in'} onPress={() => changeMode(mode === 'sign-in' ? 'sign-up' : 'sign-in')} />}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  autoComplete?: 'email' | 'new-password' | 'current-password';
  keyboardType?: 'email-address';
  secureTextEntry?: boolean;
};

function Field({ label, ...props }: FieldProps) {
  return <View style={styles.field}><Text style={styles.label}>{label}</Text>
    <TextInput {...props} accessibilityLabel={label} autoCapitalize="none" autoCorrect={false} style={styles.input} />
  </View>;
}

function Action({ label, onPress, disabled = false }: { label: string; onPress: () => void; disabled?: boolean }) {
  return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={[styles.button, disabled && styles.disabled]}>
    <Text style={styles.buttonText}>{label}</Text>
  </Pressable>;
}

function Link({ label, onPress }: { label: string; onPress: () => void }) {
  return <Pressable accessibilityRole="button" onPress={onPress}><Text style={styles.link}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F3F4F6' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 440, alignSelf: 'center', backgroundColor: '#FFFFFF', borderRadius: 20, padding: 28, gap: 16 },
  brand: { color: '#1A3A5C', fontSize: 32, fontWeight: '800' },
  brandAccent: { color: '#3A94CC' },
  title: { color: '#11212D', fontSize: 24, fontWeight: '700' },
  body: { color: '#5D6A73', fontSize: 16, lineHeight: 23 },
  field: { gap: 6 },
  label: { color: '#11212D', fontSize: 14, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, color: '#11212D', fontSize: 16 },
  button: { backgroundColor: '#1A3A5C', borderRadius: 10, padding: 14, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  disabled: { opacity: 0.45 },
  link: { color: '#1A3A5C', textAlign: 'center', fontSize: 15, fontWeight: '600' },
  error: { color: '#B42318', lineHeight: 20 },
  message: { color: '#207547', lineHeight: 20 },
});
