import { useState, useEffect, useCallback } from 'react';

interface Mission {
    id: string;
    title?: string;
    platform?: string;
    description?: string;
    instructions?: string;
    status: string;
    created_at: string;
    created_by: string;
}

interface DashboardStats {
    missionsCreated: number;
    totalHonors: number;
    pendingReviews: number;
    usdValue: number;
}

export function useDashboardSimple() {
    const [stats, setStats] = useState<DashboardStats>({
        missionsCreated: 0,
        totalHonors: 0,
        pendingReviews: 0,
        usdValue: 0
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadDashboardStats = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            console.log('useDashboardSimple: Loading dashboard stats...');

            // Load all missions
            const response = await fetch('https://us-central1-ensei-6c8e0.cloudfunctions.net/api/v1/missions');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const allMissions = await response.json();
            console.log('useDashboardSimple: Received all missions:', allMissions?.length || 0);

            // Get current user ID
            const userData = localStorage.getItem('user');
            const userId = userData ? JSON.parse(userData).id : null;
            console.log('useDashboardSimple: User ID:', userId);

            // Filter missions created by current user
            const userMissions = Array.isArray(allMissions)
                ? allMissions.filter(mission => mission.created_by === userId)
                : [];

            console.log('useDashboardSimple: User missions:', userMissions.length);

            // For now, set wallet balance to 0 (can be implemented later)
            const walletBalance = { honors: 0, usd: 0 };

            setStats({
                missionsCreated: userMissions.length,
                totalHonors: walletBalance.honors || 0,
                pendingReviews: 0, // TODO: Implement pending reviews count
                usdValue: walletBalance.usd || 0
            });

            console.log('useDashboardSimple: Dashboard stats loaded:', {
                missionsCreated: userMissions.length,
                totalHonors: walletBalance.honors,
                usdValue: walletBalance.usd
            });
        } catch (err) {
            console.error('useDashboardSimple: Error loading dashboard stats:', err);
            setError(err instanceof Error ? err.message : 'Failed to load dashboard stats');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDashboardStats();
    }, [loadDashboardStats]);

    return {
        stats,
        loading,
        error,
        refetch: loadDashboardStats
    };
}

