'use client';

import React, { useState, useEffect } from 'react';
import { useApi } from '../../../hooks/useApi';
import { useAuth } from '../../../contexts/AdminAuthContext';
import { useRouter } from 'next/navigation';

interface PackHealthData {
    status: string;
    timestamp: string;
    checks: {
        packCatalog: { status: string; count: number };
        firestore: { status: string; responseTime: string };
        entitlements: { status: string; accessible: boolean };
    };
    responseTime: string;
}

interface PackMetricsData {
    timestamp: string;
    metrics: {
        purchases: {
            total: number;
            totalRevenue: number;
        };
        entitlements: {
            active: number;
            totalQuotaUsed: number;
            totalQuotaAvailable: number;
            utilizationRate: string;
        };
        system: {
            totalTransactions: number;
            totalEntitlements: number;
        };
    };
}

export default function MonitoringPage() {
    const api = useApi();
    const { user, isLoading: authLoading, isAuthenticated } = useAuth();
    const router = useRouter();
    const [packHealth, setPackHealth] = useState<PackHealthData | null>(null);
    const [packMetrics, setPackMetrics] = useState<PackMetricsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Authentication check
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/admin');
            return;
        }
    }, [isAuthenticated, authLoading, router]);

    const fetchMonitoringData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch pack health data
            const healthResponse = await fetch(`${api.baseUrl}/health/packs`);
            if (healthResponse.ok) {
                const healthData = await healthResponse.json();
                setPackHealth(healthData);
            }

            // Fetch pack metrics data
            const metricsResponse = await fetch(`${api.baseUrl}/metrics/packs`);
            if (metricsResponse.ok) {
                const metricsData = await metricsResponse.json();
                setPackMetrics(metricsData);
            }
        } catch (err) {
            console.error('Failed to fetch monitoring data:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch monitoring data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMonitoringData();

        // Refresh data every 30 seconds
        const interval = setInterval(fetchMonitoringData, 30000);
        return () => clearInterval(interval);
    }, []);

    // Show loading while checking authentication
    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                    </div>
                </div>
            </div>
        );
    }

    // Don't render if not authenticated
    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Pack System Monitoring</h1>
                    <p className="text-gray-400">Real-time monitoring of the pack system health and performance</p>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                        <p className="text-red-400">{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Pack Health Status */}
                    <div className="bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-10 border border-white/10 rounded-2xl p-6">
                        <h2 className="text-xl font-semibold text-white mb-4">System Health</h2>

                        {packHealth ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-300">Overall Status</span>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${packHealth.status === 'healthy'
                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                        : 'bg-red-500/20 text-red-300 border border-red-500/30'
                                        }`}>
                                        {packHealth.status.toUpperCase()}
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-300">Pack Catalog</span>
                                        <span className="text-emerald-400">{packHealth.checks.packCatalog.count} packs</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-300">Firestore</span>
                                        <span className="text-emerald-400">{packHealth.checks.firestore.responseTime}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-300">Entitlements</span>
                                        <span className="text-emerald-400">Accessible</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-300">Response Time</span>
                                        <span className="text-emerald-400">{packHealth.responseTime}</span>
                                    </div>
                                </div>

                                <div className="text-xs text-gray-500 mt-4">
                                    Last updated: {new Date(packHealth.timestamp).toLocaleString()}
                                </div>
                            </div>
                        ) : (
                            <div className="text-gray-400">No health data available</div>
                        )}
                    </div>

                    {/* Pack Metrics */}
                    <div className="bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-10 border border-white/10 rounded-2xl p-6">
                        <h2 className="text-xl font-semibold text-white mb-4">System Metrics</h2>

                        {packMetrics ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-800/30 rounded-lg p-3">
                                        <div className="text-sm text-gray-400">Total Purchases</div>
                                        <div className="text-2xl font-bold text-emerald-400">{packMetrics.metrics.purchases.total}</div>
                                    </div>

                                    <div className="bg-gray-800/30 rounded-lg p-3">
                                        <div className="text-sm text-gray-400">Total Revenue</div>
                                        <div className="text-2xl font-bold text-emerald-400">{packMetrics.metrics.purchases.totalRevenue}</div>
                                    </div>

                                    <div className="bg-gray-800/30 rounded-lg p-3">
                                        <div className="text-sm text-gray-400">Active Entitlements</div>
                                        <div className="text-2xl font-bold text-blue-400">{packMetrics.metrics.entitlements.active}</div>
                                    </div>

                                    <div className="bg-gray-800/30 rounded-lg p-3">
                                        <div className="text-sm text-gray-400">Utilization Rate</div>
                                        <div className="text-2xl font-bold text-purple-400">{packMetrics.metrics.entitlements.utilizationRate}</div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-300">Quota Used</span>
                                        <span className="text-blue-400">{packMetrics.metrics.entitlements.totalQuotaUsed}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-300">Quota Available</span>
                                        <span className="text-blue-400">{packMetrics.metrics.entitlements.totalQuotaAvailable}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-300">Total Transactions</span>
                                        <span className="text-gray-400">{packMetrics.metrics.system.totalTransactions}</span>
                                    </div>
                                </div>

                                <div className="text-xs text-gray-500 mt-4">
                                    Last updated: {new Date(packMetrics.timestamp).toLocaleString()}
                                </div>
                            </div>
                        ) : (
                            <div className="text-gray-400">No metrics data available</div>
                        )}
                    </div>
                </div>

                {/* Refresh Button */}
                <div className="mt-6 flex justify-center">
                    <button
                        onClick={fetchMonitoringData}
                        className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-lg transition-all duration-200"
                    >
                        Refresh Data
                    </button>
                </div>
            </div>
        </div>
    );
}
