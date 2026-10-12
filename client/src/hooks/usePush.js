import { useCallback, useEffect, useState } from 'react';

import { pushClient } from '@/lib/pushClient';

export function usePush() {
  const [status, setStatus] = useState('checking');
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    const next = await pushClient.detect();
    setStatus(next);
    return next;
  }, []);

  useEffect(() => {
    let active = true;
    pushClient.detect().then((next) => active && setStatus(next));
    return () => {
      active = false;
    };
  }, []);

  // Runs a task, then re-reads the real status and returns it
  const run = useCallback(
    async (task) => {
      setBusy(true);
      let next;
      try {
        await task();
      } finally {
        next = await refresh();
        setBusy(false);
      }
      return next;
    },
    [refresh]
  );

  const enable = useCallback(() => run(pushClient.enable), [run]);
  const disable = useCallback(() => run(pushClient.disable), [run]);

  return { status, busy, enable, disable };
}