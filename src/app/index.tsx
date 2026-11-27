import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';

import { AuthGate } from '@/components/auth-gate';
import { LoadingState } from '@/components/loading-state';
import { RequestError } from '@/components/request-error';
import { Screen } from '@/components/screen';
import { SignOutButton } from '@/components/sign-out-button';
import { getActivePour } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function IndexScreen() {
  const { session, loading, recovery } = useAuth();
  if (loading || !session || recovery) return <AuthGate />;
  return <SignedInHome key={session.user.id} />;
}

function SignedInHome() {
  const [target, setTarget] = useState<'/live' | '/create-job' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryAttempt, setRetryAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    getActivePour().then((pour) => { if (active) setTarget(pour ? '/live' : '/create-job'); })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : 'Unable to check for an active pour.'); });
    return () => { active = false; };
  }, [retryAttempt]);

  if (error) return <Screen><RequestError message={error} onRetry={() => { setError(null); setRetryAttempt((n) => n + 1); }} /><SignOutButton /></Screen>;
  if (!target) return <Screen><LoadingState label="Checking for an active job..." /></Screen>;
  return <Redirect href={target} />;
}
