'use client';

import { useState } from 'react';

export default function TestDiscoverPage() {
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const testDiscoverMissions = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            console.log('🧪 Testing Discover Missions API...');

            const response = await fetch('https://us-central1-ensei-6c8e0.cloudfunctions.net/api/v1/missions');

            console.log('📊 Response:', {
                status: response.status,
                ok: response.ok,
                headers: Object.fromEntries(response.headers.entries())
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('📦 Data received:', data);

            setResult({
                success: true,
                status: response.status,
                dataLength: Array.isArray(data) ? data.length : 0,
                firstMission: Array.isArray(data) && data.length > 0 ? data[0] : null,
                timestamp: new Date().toISOString()
            });

        } catch (err) {
            console.error('❌ API Test Error:', err);
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    const testUseMissionsSimple = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            console.log('🧪 Testing useMissionsSimple hook...');

            // Simulate the hook behavior
            const response = await fetch('https://us-central1-ensei-6c8e0.cloudfunctions.net/api/v1/missions');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('useMissionsSimple: Received data:', data);

            const missionsArray = Array.isArray(data) ? data : [];
            console.log('useMissionsSimple: Set missions:', missionsArray.length);

            setResult({
                success: true,
                status: response.status,
                missionsCount: missionsArray.length,
                missions: missionsArray,
                timestamp: new Date().toISOString(),
                method: 'useMissionsSimple-simulation'
            });

        } catch (err) {
            console.error('❌ useMissionsSimple Test Error:', err);
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-8">🧪 Test Discover Missions</h1>

                <div className="space-y-6">
                    {/* Test Buttons */}
                    <div className="flex gap-4">
                        <button
                            onClick={testDiscoverMissions}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 py-3 rounded-lg font-semibold"
                        >
                            {loading ? '🔄 Testing...' : '🧪 Test Direct API'}
                        </button>

                        <button
                            onClick={testUseMissionsSimple}
                            disabled={loading}
                            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-6 py-3 rounded-lg font-semibold"
                        >
                            {loading ? '🔄 Testing...' : '🧪 Test useMissionsSimple'}
                        </button>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
                            <h2 className="text-red-400 font-bold text-xl mb-2">❌ Error:</h2>
                            <p className="text-red-300">{error}</p>
                        </div>
                    )}

                    {/* Success Display */}
                    {result && (
                        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6">
                            <h2 className="text-green-400 font-bold text-xl mb-4">✅ Success!</h2>
                            <div className="space-y-2 text-sm">
                                <p><strong>Status:</strong> {result.status}</p>
                                <p><strong>Data Length:</strong> {result.dataLength || result.missionsCount}</p>
                                <p><strong>Timestamp:</strong> {result.timestamp}</p>
                                {result.method && <p><strong>Method:</strong> {result.method}</p>}
                            </div>

                            {result.firstMission && (
                                <div className="mt-4">
                                    <h3 className="font-semibold mb-2">First Mission:</h3>
                                    <div className="bg-gray-800 rounded p-4">
                                        <pre className="text-xs overflow-auto">
                                            {JSON.stringify(result.firstMission, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            )}

                            {result.missions && result.missions.length > 0 && (
                                <div className="mt-4">
                                    <h3 className="font-semibold mb-2">All Missions ({result.missions.length}):</h3>
                                    <div className="bg-gray-800 rounded p-4 max-h-96 overflow-auto">
                                        <pre className="text-xs">
                                            {JSON.stringify(result.missions, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Instructions */}
                    <div className="bg-gray-800 rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">📋 Instructions</h2>
                        <div className="space-y-2 text-gray-300">
                            <p>1. Click "Test Direct API" to test the raw API call</p>
                            <p>2. Click "Test useMissionsSimple" to simulate the hook behavior</p>
                            <p>3. Check browser console for detailed logs</p>
                            <p>4. Compare results to see if there's a difference</p>
                        </div>
                    </div>

                    {/* Current Page Status */}
                    <div className="bg-gray-800 rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">🔍 Current Status</h2>
                        <div className="space-y-2 text-sm text-gray-300">
                            <p><strong>My Missions Page:</strong> ✅ Working (uses /v1/missions/my)</p>
                            <p><strong>Discover & Earn Page:</strong> ❌ Not loading (uses /v1/missions)</p>
                            <p><strong>API Endpoint:</strong> ✅ Working (returns data)</p>
                            <p><strong>Issue:</strong> Likely in frontend hook or component</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

