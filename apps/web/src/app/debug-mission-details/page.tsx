'use client';

import { useState, useEffect } from 'react';

export default function DebugMissionDetailsPage() {
    const [missions, setMissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchMissions = async () => {
        setLoading(true);
        setError(null);

        try {
            const url = 'https://us-central1-ensei-6c8e0.cloudfunctions.net/api/v1/missions';
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            const missionsArray = Array.isArray(data) ? data : [];
            setMissions(missionsArray);
        } catch (err) {
            console.error('Error fetching missions:', err);
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
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold mb-8">🔍 Mission Data Structure Debug</h1>

                <div className="mb-6">
                    <button
                        onClick={fetchMissions}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded"
                    >
                        {loading ? '🔄 Loading...' : '🔄 Refresh'}
                    </button>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                        <h3 className="text-red-400 font-bold mb-2">❌ Error:</h3>
                        <p className="text-red-300">{error}</p>
                    </div>
                )}

                {!loading && missions.length > 0 && (
                    <div className="space-y-6">
                        {missions.slice(0, 3).map((mission, index) => (
                            <div key={mission.id || index} className="bg-gray-800 rounded-lg p-6">
                                <h2 className="text-xl font-bold mb-4">
                                    Mission {index + 1}: {mission.title || 'No Title'}
                                </h2>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Cost Fields */}
                                    <div className="bg-gray-700 rounded p-4">
                                        <h3 className="font-semibold mb-3 text-green-400">💰 Cost Fields:</h3>
                                        <div className="space-y-2 text-sm">
                                            <p><span className="text-gray-400">rewards:</span> {JSON.stringify(mission.rewards)}</p>
                                            <p><span className="text-gray-400">total_cost_honors:</span> {mission.total_cost_honors}</p>
                                            <p><span className="text-gray-400">total_cost_usd:</span> {mission.total_cost_usd}</p>
                                            <p><span className="text-gray-400">total_cost:</span> {mission.total_cost}</p>
                                            <p><span className="text-gray-400">cost_usd:</span> {mission.cost_usd}</p>
                                            <p><span className="text-gray-400">cost:</span> {mission.cost}</p>
                                        </div>
                                    </div>

                                    {/* Deadline Fields */}
                                    <div className="bg-gray-700 rounded p-4">
                                        <h3 className="font-semibold mb-3 text-yellow-400">⏰ Deadline Fields:</h3>
                                        <div className="space-y-2 text-sm">
                                            <p><span className="text-gray-400">deadline:</span> {mission.deadline}</p>
                                            <p><span className="text-gray-400">endsAt:</span> {mission.endsAt}</p>
                                            <p><span className="text-gray-400">duration_hours:</span> {mission.duration_hours}</p>
                                        </div>
                                    </div>

                                    {/* Participant Fields */}
                                    <div className="bg-gray-700 rounded p-4">
                                        <h3 className="font-semibold mb-3 text-blue-400">👥 Participant Fields:</h3>
                                        <div className="space-y-2 text-sm">
                                            <p><span className="text-gray-400">cap:</span> {mission.cap}</p>
                                            <p><span className="text-gray-400">max_participants:</span> {mission.max_participants}</p>
                                            <p><span className="text-gray-400">winnersCap:</span> {mission.winnersCap}</p>
                                            <p><span className="text-gray-400">participants_count:</span> {mission.participants_count}</p>
                                            <p><span className="text-gray-400">participants:</span> {mission.participants}</p>
                                        </div>
                                    </div>

                                    {/* Task Fields */}
                                    <div className="bg-gray-700 rounded p-4">
                                        <h3 className="font-semibold mb-3 text-purple-400">📋 Task Fields:</h3>
                                        <div className="space-y-2 text-sm">
                                            <p><span className="text-gray-400">tasks:</span> {JSON.stringify(mission.tasks)}</p>
                                            <p><span className="text-gray-400">model:</span> {mission.model}</p>
                                            <p><span className="text-gray-400">platform:</span> {mission.platform}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Full Mission Object */}
                                <div className="mt-6 bg-gray-700 rounded p-4">
                                    <h3 className="font-semibold mb-3 text-gray-300">📄 Full Mission Object:</h3>
                                    <pre className="text-xs text-gray-300 overflow-auto max-h-96">
                                        {JSON.stringify(mission, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && missions.length === 0 && !error && (
                    <div className="text-center py-8 text-gray-400">
                        <p>No missions found</p>
                    </div>
                )}
            </div>
        </div>
    );
}

