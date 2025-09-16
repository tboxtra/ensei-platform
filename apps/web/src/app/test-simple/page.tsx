'use client';

import { useMissionsSimple } from '../../hooks/useMissionsSimple';

export default function TestSimplePage() {
    const { missions, loading, error, refetch } = useMissionsSimple();

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Simple Mission Hook Test</h1>

                <div className="mb-6">
                    <button
                        onClick={refetch}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-4 py-2 rounded"
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
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
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

