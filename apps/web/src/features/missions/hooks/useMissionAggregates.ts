/**
 * Mission Aggregates Hook
 * 
 * Reads public mission aggregates for progress counts
 * This data is world-readable and updated by Cloud Functions
 */

import { useQuery } from '@tanstack/react-query';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import type { MissionAggregates } from '../types/mission-aggregates';

const db = getFirestore();

/**
 * Get mission aggregates (public data)
 */
async function getMissionAggregates(missionId: string): Promise<MissionAggregates | null> {
    try {
        const aggRef = doc(db, 'missions', missionId, 'aggregates', 'counters');
        const aggSnap = await getDoc(aggRef);

        if (!aggSnap.exists()) {
            return null;
        }

        const data = aggSnap.data();
        return {
            taskCounts: data.taskCounts || {},
            totalCompletions: data.totalCompletions || 0,
            winnersPerTask: data.winnersPerTask || null,
            taskCount: data.taskCount || 0,
            updatedAt: data.updatedAt?.toDate?.() || new Date()
        };
    } catch (error: any) {
        // Handle permission denied gracefully
        if (error.code === 'permission-denied') {
            console.warn('Permission denied for mission aggregates - user may not have access');
            return null;
        } else {
            console.error('Error getting mission aggregates:', error);
            return null;
        }
    }
}

/**
 * Hook to get mission aggregates
 */
export function useMissionAggregates(missionId: string) {
    return useQuery({
        queryKey: ['mission-aggregates', missionId],
        queryFn: () => getMissionAggregates(missionId),
        enabled: !!missionId,
        staleTime: 1000 * 30, // 30 seconds
        gcTime: 1000 * 60 * 5, // 5 minutes
        refetchInterval: 1000 * 30, // Refetch every 30 seconds for real-time updates
    });
}


