// apps/web/src/hooks/useWallet.ts
import { useEffect, useRef, useState } from 'react';
import { authedFetch } from '@/lib/api';

export function useWallet() {
  const [balance, setBalance] = useState<{ honors: number } | null>(null);
  const [txs, setTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const inflight = useRef<Promise<void> | null>(null);

  const fetchBalance = async () => {
    const data = await authedFetch('/v1/wallet/summary');
    setBalance({ honors: data.availableHonors ?? 0 });
  };
  const fetchTransactions = async () => {
    const data = await authedFetch('/v1/wallet/transactions');
    setTxs(data.items || []);
  };

  const refreshWallet = async () => {
    if (inflight.current) return inflight.current;
    inflight.current = (async () => {
      setLoading(true);
      try {
        await fetchBalance();
        await fetchTransactions();
      } finally {
        setLoading(false);
        inflight.current = null;
      }
    })();
    return inflight.current;
  };

  useEffect(() => { refreshWallet(); }, []);
  useEffect(() => {
    const onVis = () => document.visibilityState === 'visible' && refreshWallet();
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  return { balance, transactions: txs, loading, refreshWallet };
}
