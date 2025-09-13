'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { AnalyticsOverview } from '../../components/analytics/AnalyticsOverview';
import { RevenueChart } from '../../components/analytics/RevenueChart';
import { PlatformAnalytics } from '../../components/analytics/PlatformAnalytics';
import { UserGrowthChart } from '../../components/analytics/UserGrowthChart';
import { MissionPerformanceChart } from '../../components/analytics/MissionPerformanceChart';
import { apiClient } from '../../lib/api';

interface AnalyticsData {
  overview: {
    totalRevenue: number;
    totalMissions: number;
    totalUsers: number;
    totalSubmissions: number;
    averageCompletionRate: number;
    platformFee: number;
  };
  revenue: {
    daily: Array<{ date: string; revenue: number }>;
    monthly: Array<{ month: string; revenue: number }>;
  };
  platforms: Array<{
    platform: string;
    missions: number;
    submissions: number;
    revenue: number;
    completionRate: number;
  }>;
  userGrowth: Array<{ date: string; users: number; newUsers: number }>;
  missionPerformance: Array<{
    missionId: string;
    title: string;
    platform: string;
    submissions: number;
    approved: number;
    revenue: number;
    completionRate: number;
  }>;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('30d');

  // No mock data - using real API

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load all analytics data in parallel
      const [overviewRes, revenueRes, userGrowthRes, platformRes, missionRes] = await Promise.all([
        apiClient.getAnalyticsOverview(),
        apiClient.getRevenueData(timeRange),
        apiClient.getUserGrowthData(timeRange),
        apiClient.getPlatformPerformance(),
        apiClient.getMissionPerformance(timeRange)
      ]);

      if (overviewRes.success && revenueRes.success && userGrowthRes.success && platformRes.success && missionRes.success) {
        setData({
          overview: overviewRes.data,
          revenue: revenueRes.data,
          platforms: platformRes.data,
          userGrowth: userGrowthRes.data,
          missionPerformance: missionRes.data
        });
      } else {
        setData(null);
        setError('Failed to load analytics data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const timeRangeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' }
  ];

  if (loading) {
    return (
      <ProtectedRoute requiredPermission="analytics:read">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute requiredPermission="analytics:read">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </ProtectedRoute>
    );
  }

  if (!data) {
    return (
      <ProtectedRoute requiredPermission="analytics:read">
        <div className="text-center py-12">
          <p className="text-gray-500">No analytics data available</p>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredPermission="analytics:read">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Time Range:</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {timeRangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <AnalyticsOverview data={data.overview} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart data={data.revenue} />
          <UserGrowthChart data={data.userGrowth} />
        </div>

        <PlatformAnalytics data={data.platforms} />

        <MissionPerformanceChart data={data.missionPerformance} />
      </div>
    </ProtectedRoute>
  );
}
