/**
 * useQuickStats Hook
 * 
 * Real-time user statistics for Quick Stats display
 * Uses Firestore onSnapshot for instant updates
 */

import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { getFirestore } from 'firebase/firestore';
import type { UserStats } from '../types/user-stats';

const db = getFirestore();

export interface QuickStatsData {
    missionsCreated: number;
    missionsCompleted: number;
    tasksDone: number;
    totalEarned: number;
}

export function useQuickStats(uid?: string) {
    const [stats, setStats] = useState<QuickStatsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!uid) {
            setStats(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        const statsRef = doc(db, `users/${uid}/stats/summary`);

    const unsubscribe = onSnapshot(
      statsRef,
      (snapshot) => {
        try {
          const data = snapshot.data();
          if (data) {
            setStats({
              missionsCreated: data.missionsCreated ?? 0,
              missionsCompleted: data.missionsCompleted ?? 0,
              tasksDone: data.tasksDone ?? 0,
              totalEarned: data.totalEarned ?? 0,
            });
          } else {
            // No stats document exists yet, use defaults
            setStats({
              missionsCreated: 0,
              missionsCompleted: 0,
              tasksDone: 0,
              totalEarned: 0,
            });
          }
          setLoading(false);
        } catch (err) {
          console.error('Error processing stats data:', err);
          setError(err as Error);
          setLoading(false);
        }
      },
      (err: any) => {
        // Handle permission denied gracefully
        if (err.code === 'permission-denied') {
          console.warn('Permission denied for stats - user may not have access');
          // Set default stats instead of error
          setStats({
            missionsCreated: 0,
            missionsCompleted: 0,
            tasksDone: 0,
            totalEarned: 0,
          });
          setLoading(false);
        } else {
          console.error('Error listening to stats:', err);
          setError(err);
          setLoading(false);
        }
      }
    );

        return () => unsubscribe();
    }, [uid]);

    return { stats, loading, error };
}


