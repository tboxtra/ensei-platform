'use client';

import { useState, useEffect } from 'react';

export default function TestMissionsPage() {
    const [missions, setMissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchMissions = async () => {
        setLoading(true);
        setError(null);

        try {
            console.log('Testing direct API call...');
            const response = await fetch('https://us-central1-ensei-6c8e0.cloudfunctions.net/api/v1/missions');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('API Response:', data);

            setMissions(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('API Error:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch missions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMissions();
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Mission Loading Test</h1>

                <div className="mb-6">
                    <button
                        onClick={fetchMissions}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded"
                    >
                        {loading ? 'Loading...' : 'Refresh Missions'}
                    </button>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                        <h2 className="text-red-400 font-bold mb-2">Error:</h2>
                        <p className="text-red-300">{error}</p>
                    </div>
                )}

                {loading && (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-2">Loading missions...</p>
                    </div>
                )}

                {!loading && !error && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4">
                            Missions Found: {missions.length}
                        </h2>

                        <div className="space-y-4">
                            {missions.map((mission, index) => (
                                <div key={mission.id || index} className="bg-gray-800 rounded-lg p-4">
                                    <h3 className="font-semibold text-lg mb-2">
                                        {mission.title || mission.platform || 'Untitled Mission'}
                                    </h3>
                                    <p className="text-gray-300 mb-2">
                                        {mission.description || mission.instructions || 'No description'}
                                    </p>
                                    <div className="text-sm text-gray-400">
                                        <p>ID: {mission.id}</p>
                                        <p>Status: {mission.status}</p>
                                        <p>Created: {mission.created_at}</p>
                                        <p>Created by: {mission.created_by}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

