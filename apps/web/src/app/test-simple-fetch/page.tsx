'use client';

import { useState, useEffect } from 'react';

export default function TestSimpleFetchPage() {
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const testFetch = async () => {
            try {
                console.log('🧪 Starting simple fetch test...');

                const response = await fetch('https://us-central1-ensei-6c8e0.cloudfunctions.net/api/v1/missions');

                console.log('📊 Response:', {
                    status: response.status,
                    ok: response.ok,
                    statusText: response.statusText
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
                    data: data
                });

            } catch (err) {
                console.error('❌ Fetch Error:', err);
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        };

        testFetch();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white p-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-bold mb-8">🧪 Simple Fetch Test</h1>
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                        <p className="text-gray-400">Testing API call...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-8">🧪 Simple Fetch Test</h1>

                {error ? (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
                        <h2 className="text-red-400 font-bold text-xl mb-2">❌ Error:</h2>
                        <p className="text-red-300">{error}</p>
                    </div>
                ) : result ? (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6">
                        <h2 className="text-green-400 font-bold text-xl mb-4">✅ Success!</h2>
                        <div className="space-y-2 text-sm">
                            <p><strong>Status:</strong> {result.status}</p>
                            <p><strong>Data Length:</strong> {result.dataLength}</p>
                        </div>

                        {result.data && result.data.length > 0 && (
                            <div className="mt-4">
                                <h3 className="font-semibold mb-2">First Mission:</h3>
                                <div className="bg-gray-800 rounded p-4">
                                    <pre className="text-xs overflow-auto">
                                        {JSON.stringify(result.data[0], null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )}
                    </div>
                ) : null}

                <div className="mt-8 bg-gray-800 rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">📋 Instructions</h2>
                    <div className="space-y-2 text-gray-300">
                        <p>1. This page automatically tests the API on load</p>
                        <p>2. Check the browser console for detailed logs</p>
                        <p>3. If this works but /missions doesn't, the issue is in the hook</p>
                        <p>4. If this fails, the issue is with the API or network</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

