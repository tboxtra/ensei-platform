/**
 * Mission Progress Client Utilities
 * 
 * Client-side functions for reading mission progress summaries.
 * These provide fast, single-document reads instead of complex aggregations.
 */

import { getFirestore, doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';

export interface MissionProgressBadge {
    done: number;
    total: number;
    missionCompleted: boolean;
    lastUpdated?: Date;
}

export interface MissionProgressSummary {
    userId: string;
    missionId: string;
    verifiedTaskIds: string[];
    verifiedCount: number;
    totalTasks: number;
    missionCompleted: boolean;
    completedAt?: Date;
    updatedAt: Date;
}

/**
 * Read mission progress for a specific user and mission
 * Returns fast progress data for UI badges and displays
 */
export async function readMissionProgressBadge(
    userId: string,
    missionId: string
): Promise<MissionProgressBadge> {
    const db = getFirestore();
    const progressId = `${missionId}_${userId}`;

    try {
        const snap = await getDoc(doc(db, 'mission_progress', progressId));

        if (!snap.exists()) {
            return { done: 0, total: 0, missionCompleted: false };
        }

        const data = snap.data();
        return {
            done: data.verifiedCount ?? 0,
            total: data.totalTasks ?? 0,
            missionCompleted: !!data.missionCompleted,
            lastUpdated: data.updatedAt?.toDate?.() || new Date()
        };
    } catch (error) {
        console.error('Error reading mission progress:', error);
        return { done: 0, total: 0, missionCompleted: false };
    }
}

/**
 * Get all mission progress for a specific user
 * Useful for user dashboards and progress overviews
 */
export async function getUserMissionProgress(userId: string): Promise<MissionProgressSummary[]> {
    const db = getFirestore();

    try {
        const q = query(
            collection(db, 'mission_progress'),
            where('userId', '==', userId),
            orderBy('updatedAt', 'desc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                userId: data.userId,
                missionId: data.missionId,
                verifiedTaskIds: data.verifiedTaskIds || [],
                verifiedCount: data.verifiedCount || 0,
                totalTasks: data.totalTasks || 0,
                missionCompleted: !!data.missionCompleted,
                completedAt: data.completedAt?.toDate?.(),
                updatedAt: data.updatedAt?.toDate?.() || new Date()
            };
        });
    } catch (error) {
        console.error('Error getting user mission progress:', error);
        return [];
    }
}

/**
 * Get all progress summaries for a specific mission
 * Useful for mission owner dashboards and analytics
 */
export async function getMissionProgressForMission(missionId: string): Promise<MissionProgressSummary[]> {
    const db = getFirestore();

    try {
        const q = query(
            collection(db, 'mission_progress'),
            where('missionId', '==', missionId),
            orderBy('updatedAt', 'desc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                userId: data.userId,
                missionId: data.missionId,
                verifiedTaskIds: data.verifiedTaskIds || [],
                verifiedCount: data.verifiedCount || 0,
                totalTasks: data.totalTasks || 0,
                missionCompleted: !!data.missionCompleted,
                completedAt: data.completedAt?.toDate?.(),
                updatedAt: data.updatedAt?.toDate?.() || new Date()
            };
        });
    } catch (error) {
        console.error('Error getting mission progress for mission:', error);
        return [];
    }
}

/**
 * Get mission progress statistics for a user
 * Returns aggregated stats for dashboards
 */
export async function getUserMissionProgressStats(userId: string): Promise<{
    totalMissions: number;
    completedMissions: number;
    totalTasksCompleted: number;
    totalTasksAvailable: number;
    completionRate: number;
}> {
    const progress = await getUserMissionProgress(userId);

    const totalMissions = progress.length;
    const completedMissions = progress.filter(p => p.missionCompleted).length;
    const totalTasksCompleted = progress.reduce((sum, p) => sum + p.verifiedCount, 0);
    const totalTasksAvailable = progress.reduce((sum, p) => sum + p.totalTasks, 0);
    const completionRate = totalTasksAvailable > 0 ? (totalTasksCompleted / totalTasksAvailable) * 100 : 0;

    return {
        totalMissions,
        completedMissions,
        totalTasksCompleted,
        totalTasksAvailable,
        completionRate: Math.round(completionRate * 100) / 100
    };
}

/**
 * Get mission progress statistics for a specific mission
 * Returns aggregated stats for mission analytics
 */
export async function getMissionProgressStats(missionId: string): Promise<{
    totalParticipants: number;
    completedParticipants: number;
    totalTasksCompleted: number;
    totalTasksAvailable: number;
    completionRate: number;
}> {
    const progress = await getMissionProgressForMission(missionId);

    const totalParticipants = progress.length;
    const completedParticipants = progress.filter(p => p.missionCompleted).length;
    const totalTasksCompleted = progress.reduce((sum, p) => sum + p.verifiedCount, 0);
    const totalTasksAvailable = progress.length > 0 ? progress[0].totalTasks * totalParticipants : 0;
    const completionRate = totalTasksAvailable > 0 ? (totalTasksCompleted / totalTasksAvailable) * 100 : 0;

    return {
        totalParticipants,
        completedParticipants,
        totalTasksCompleted,
        totalTasksAvailable,
        completionRate: Math.round(completionRate * 100) / 100
    };
}
