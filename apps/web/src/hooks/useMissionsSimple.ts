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

export function useMissionsSimple() {
    const [missions, setMissions] = useState<Mission[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchMissions = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            console.log('useMissionsSimple: Fetching missions...');
            console.log('useMissionsSimple: URL:', 'https://us-central1-ensei-6c8e0.cloudfunctions.net/api/v1/missions');

            const response = await fetch('https://us-central1-ensei-6c8e0.cloudfunctions.net/api/v1/missions');

            console.log('useMissionsSimple: Response status:', response.status);
            console.log('useMissionsSimple: Response ok:', response.ok);
            console.log('useMissionsSimple: Response headers:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                const errorText = await response.text();
                console.error('useMissionsSimple: Error response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const data = await response.json();
            console.log('useMissionsSimple: Received data:', data);
            console.log('useMissionsSimple: Data type:', typeof data);
            console.log('useMissionsSimple: Is array:', Array.isArray(data));

            const missionsArray = Array.isArray(data) ? data : [];
            setMissions(missionsArray);
            console.log('useMissionsSimple: Set missions:', missionsArray.length);
        } catch (err) {
            console.error('useMissionsSimple: Error:', err);
            console.error('useMissionsSimple: Error type:', typeof err);
            console.error('useMissionsSimple: Error message:', err instanceof Error ? err.message : 'Unknown error');
            setError(err instanceof Error ? err.message : 'Failed to fetch missions');
            setMissions([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMissions();
    }, [fetchMissions]);

    return {
        missions,
        loading,
        error,
        refetch: fetchMissions
    };
}
