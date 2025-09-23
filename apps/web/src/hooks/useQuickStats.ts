/**
 * useQuickStats Hook
 * 
 * Real-time user statistics for Quick Stats display
 * Uses Firestore onSnapshot for instant updates
 */

import { doc, getDoc, onSnapshot } from 'firebase/firestore';
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

        // Use getDoc first to check if document exists, then onSnapshot for real-time updates
        const loadStats = async () => {
            try {
                const snapshot = await getDoc(statsRef);
                if (snapshot.exists()) {
                    const data = snapshot.data();
                    setStats({
                        missionsCreated: Number(data.missionsCreated ?? 0),
                        missionsCompleted: Number(data.missionsCompleted ?? 0),
                        tasksDone: Number(data.tasksDone ?? 0),
                        totalEarned: Number(data.totalEarned ?? 0),
                    });
                } else {
                    // No stats document exists yet, use defaults
                    console.log(`No stats document found for user ${uid}, using defaults`);
                    setStats({
                        missionsCreated: 0,
                        missionsCompleted: 0,
                        tasksDone: 0,
                        totalEarned: 0,
                    });
                }
                setLoading(false);
            } catch (err: any) {
                if (err.code === 'permission-denied') {
                    console.warn('Permission denied for stats - user may not have access');
                    setStats({
                        missionsCreated: 0,
                        missionsCompleted: 0,
                        tasksDone: 0,
                        totalEarned: 0,
                    });
                } else {
                    console.error('Error loading stats:', err);
                    setError(err);
                }
                setLoading(false);
            }
        };

        loadStats();

        // Set up real-time listener for updates
        const unsubscribe = onSnapshot(
            statsRef,
            (snapshot) => {
                try {
                    if (snapshot.exists()) {
                        const data = snapshot.data();
                        setStats({
                            missionsCreated: Number(data.missionsCreated ?? 0),
                            missionsCompleted: Number(data.missionsCompleted ?? 0),
                            tasksDone: Number(data.tasksDone ?? 0),
                            totalEarned: Number(data.totalEarned ?? 0),
                        });
                    }
                } catch (err) {
                    console.error('Error processing real-time stats update:', err);
                }
            },
            (err: any) => {
                // Handle permission denied gracefully for real-time updates
                if (err.code === 'permission-denied') {
                    console.debug('Permission denied for real-time stats updates (expected)');
                } else {
                    console.error('Error in real-time stats listener:', err);
                }
            }
        );

        return () => unsubscribe();
    }, [uid]);

    return { stats, loading, error };
}


