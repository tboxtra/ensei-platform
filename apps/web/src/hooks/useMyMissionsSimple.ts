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
    type?: string;
    model?: string;
    category?: string;
    difficulty?: string;
    participants_count?: number;
    max_participants?: number;
    cap?: number;
    deadline?: string;
    total_cost_honors?: number;
    participants?: number;
    submissions?: number;
    approved_submissions?: number;

    // Link fields for embedded content
    tweetLink?: string;
    contentLink?: string;
    link?: string;
    tweet_link?: string;
    content_link?: string;

    completion_rate?: number;
}

export function useMyMissionsSimple() {
    const [missions, setMissions] = useState<Mission[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchMyMissions = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            console.log('useMyMissionsSimple: Fetching my missions...');

            // Get Firebase token
            const token = localStorage.getItem('firebaseToken');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch('https://us-central1-ensei-6c8e0.cloudfunctions.net/api/v1/missions/my', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const myMissions = await response.json();
            console.log('useMyMissionsSimple: Received my missions:', myMissions?.length || 0);
            setMissions(Array.isArray(myMissions) ? myMissions : []);
        } catch (err) {
            console.error('useMyMissionsSimple: Error:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch my missions');
            setMissions([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMyMissions();
    }, [fetchMyMissions]);

    return {
        missions,
        loading,
        error,
        refetch: fetchMyMissions
    };
}
