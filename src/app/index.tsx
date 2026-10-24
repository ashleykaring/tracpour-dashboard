import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';

import { LoadingState } from '@/components/loading-state';
import { RequestError } from '@/components/request-error';
import { Screen } from '@/components/screen';
import { getActivePour } from '@/lib/api';

export default function IndexScreen() {
  const [target, setTarget] = useState<'/live' | '/create-job' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryAttempt, setRetryAttempt] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function resolveTarget() {
      try {
        const activeJob = await getActivePour();

        if (isMounted) {
          setTarget(activeJob ? '/live' : '/create-job');
        }
      } catch (error) {
        if (isMounted) {
          setError(error instanceof Error ? error.message : 'Unable to check for an active pour.');
        }
      }
    }

    void resolveTarget();

    return () => {
      isMounted = false;
    };
  }, [retryAttempt]);

  if (error) {
    return (
      <Screen>
        <RequestError
          message={error}
          onRetry={() => {
            setError(null);
            setRetryAttempt((attempt) => attempt + 1);
          }}
        />
      </Screen>
    );
  }

  if (!target) {
    return (
      <Screen>
        <LoadingState label="Checking for an active job..." />
      </Screen>
    );
  }

  return <Redirect href={target as never} />;
}
