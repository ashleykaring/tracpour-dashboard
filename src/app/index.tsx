import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';

import { LoadingState } from '@/components/loading-state';
import { Screen } from '@/components/screen';
import { getActiveJob } from '@/lib/api';

export default function IndexScreen() {
  const [target, setTarget] = useState<'/live' | '/create-job' | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function resolveTarget() {
      const activeJob = await getActiveJob();

      if (!isMounted) {
        return;
      }

      setTarget(activeJob ? '/live' : '/create-job');
    }

    void resolveTarget();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!target) {
    return (
      <Screen>
        <LoadingState label="Checking for an active job..." />
      </Screen>
    );
  }

  return <Redirect href={target as never} />;
}
