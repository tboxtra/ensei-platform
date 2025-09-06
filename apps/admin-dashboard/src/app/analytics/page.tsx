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

  // Mock data for development
  const mockData: AnalyticsData = {
    overview: {
      totalRevenue: 125000,
      totalMissions: 156,
      totalUsers: 2340,
      totalSubmissions: 8920,
      averageCompletionRate: 78,
      platformFee: 62500
    },
    revenue: {
      daily: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        revenue: Math.floor(Math.random() * 5000) + 1000
      })),
      monthly: [
        { month: 'Oct 2023', revenue: 25000 },
        { month: 'Nov 2023', revenue: 32000 },
        { month: 'Dec 2023', revenue: 28000 },
        { month: 'Jan 2024', revenue: 40000 }
      ]
    },
    platforms: [
      { platform: 'twitter', missions: 45, submissions: 2340, revenue: 35000, completionRate: 82 },
      { platform: 'instagram', missions: 38, submissions: 1890, revenue: 28000, completionRate: 75 },
      { platform: 'tiktok', missions: 32, submissions: 1650, revenue: 24000, completionRate: 78 },
      { platform: 'telegram', missions: 25, submissions: 1200, revenue: 18000, completionRate: 85 },
      { platform: 'facebook', missions: 16, submissions: 840, revenue: 12000, completionRate: 72 }
    ],
    userGrowth: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      users: 2000 + Math.floor(Math.random() * 400),
      newUsers: Math.floor(Math.random() * 50) + 10
    })),
    missionPerformance: [
      { missionId: 'm1', title: 'Twitter Engagement', platform: 'twitter', submissions: 120, approved: 98, revenue: 5000, completionRate: 82 },
      { missionId: 'm2', title: 'Instagram Content', platform: 'instagram', submissions: 85, approved: 68, revenue: 4200, completionRate: 80 },
      { missionId: 'm3', title: 'TikTok Challenge', platform: 'tiktok', submissions: 95, approved: 72, revenue: 3800, completionRate: 76 },
      { missionId: 'm4', title: 'Telegram Community', platform: 'telegram', submissions: 65, approved: 58, revenue: 3200, completionRate: 89 },
      { missionId: 'm5', title: 'Facebook Group', platform: 'facebook', submissions: 45, approved: 32, revenue: 2100, completionRate: 71 }
    ]
  };

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For now, use mock data
      // const response = await apiClient.getAnalytics({ period: timeRange });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setData(mockData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
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
