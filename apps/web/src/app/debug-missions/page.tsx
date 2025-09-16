'use client';

import { useState, useEffect } from 'react';

export default function DebugMissionsPage() {
    const [missions, setMissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [debugInfo, setDebugInfo] = useState<any>({});

    const fetchMissions = async () => {
        setLoading(true);
        setError(null);
        setDebugInfo({});

        try {
            console.log('🔍 Starting mission fetch...');

            const url = 'https://us-central1-ensei-6c8e0.cloudfunctions.net/api/v1/missions';
            console.log('📡 Fetching from:', url);

            const startTime = Date.now();
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const endTime = Date.now();

            console.log('📊 Response status:', response.status);
            console.log('📊 Response ok:', response.ok);
            console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
            console.log('⏱️ Request took:', endTime - startTime, 'ms');

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('📦 Raw data received:', data);
            console.log('📦 Data type:', typeof data);
            console.log('📦 Is array:', Array.isArray(data));
            console.log('📦 Data length:', data?.length || 0);

            const missionsArray = Array.isArray(data) ? data : [];
            setMissions(missionsArray);

            setDebugInfo({
                url,
                status: response.status,
                ok: response.ok,
                dataType: typeof data,
                isArray: Array.isArray(data),
                length: missionsArray.length,
                requestTime: endTime - startTime,
                timestamp: new Date().toISOString()
            });

            console.log('✅ Successfully set missions:', missionsArray.length);
        } catch (err) {
            console.error('❌ Error fetching missions:', err);
            setError(err instanceof Error ? err.message : 'Unknown error');
            setMissions([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMissions();
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-bold mb-8">🔍 Mission Loading Debug</h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Debug Info */}
                    <div className="bg-gray-800 rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">🐛 Debug Information</h2>

                        <div className="mb-4">
                            <button
                                onClick={fetchMissions}
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded mb-4"
                            >
                                {loading ? '🔄 Loading...' : '🔄 Refresh'}
                            </button>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
                                <h3 className="text-red-400 font-bold mb-2">❌ Error:</h3>
                                <p className="text-red-300">{error}</p>
                            </div>
                        )}

                        <div className="bg-gray-700 rounded p-4">
                            <h3 className="font-semibold mb-2">📊 Debug Data:</h3>
                            <pre className="text-sm text-gray-300 overflow-auto">
                                {JSON.stringify(debugInfo, null, 2)}
                            </pre>
                        </div>
                    </div>

                    {/* Missions Display */}
                    <div className="bg-gray-800 rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">
                            📋 Missions ({missions.length})
                        </h2>

                        {loading && (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                                <p className="mt-2">Loading missions...</p>
                            </div>
                        )}

                        {!loading && missions.length === 0 && !error && (
                            <div className="text-center py-8 text-gray-400">
                                <p>No missions found</p>
                            </div>
                        )}

                        {!loading && missions.length > 0 && (
                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                {missions.slice(0, 10).map((mission, index) => (
                                    <div key={mission.id || index} className="bg-gray-700 rounded p-4">
                                        <h3 className="font-semibold text-lg mb-2">
                                            {mission.title || mission.platform || `Mission ${index + 1}`}
                                        </h3>
                                        <p className="text-gray-300 mb-2 text-sm">
                                            {mission.description || mission.instructions || 'No description'}
                                        </p>
                                        <div className="text-xs text-gray-400 space-y-1">
                                            <p>ID: {mission.id}</p>
                                            <p>Status: {mission.status}</p>
                                            <p>Platform: {mission.platform || 'N/A'}</p>
                                            <p>Created: {new Date(mission.created_at).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                                {missions.length > 10 && (
                                    <p className="text-center text-gray-400 text-sm">
                                        ... and {missions.length - 10} more missions
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

