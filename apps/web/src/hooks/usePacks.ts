// apps/web/src/hooks/usePacks.ts
import { useEffect, useRef, useState } from 'react';
import { authedFetch } from '@/lib/api';

export function usePacks() {
  const [entitlements, setEntitlements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const inflight = useRef<Promise<void> | null>(null);

  const refreshEntitlements = async () => {
    if (inflight.current) return inflight.current;
    inflight.current = (async () => {
      setLoading(true);
      try {
        const data = await authedFetch('/v1/entitlements');
        setEntitlements((data?.items || []).filter((e: any) => e.status === 'active'));
      } finally {
        setLoading(false);
        inflight.current = null;
      }
    })();
    return inflight.current;
  };

  useEffect(() => { refreshEntitlements(); }, []);
  useEffect(() => {
    const onVis = () => document.visibilityState === 'visible' && refreshEntitlements();
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  return { entitlements, isLoadingEntitlements: loading, refreshEntitlements };
}
