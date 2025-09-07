'use client';

import React from 'react';

interface OverviewData {
  totalRevenue: number;
  totalMissions: number;
  totalUsers: number;
  totalSubmissions: number;
  averageCompletionRate: number;
  platformFee: number;
}

interface AnalyticsOverviewProps {
  data: OverviewData;
}

export const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = ({ data }) => {
  const StatCard: React.FC<{
    title: string;
    value: string | number;
    subtitle?: string;
    color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
    icon?: string;
  }> = ({ title, value, subtitle, color = 'blue', icon }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600',
      green: 'bg-green-50 text-green-600',
      yellow: 'bg-yellow-50 text-yellow-600',
      red: 'bg-red-50 text-red-600',
      purple: 'bg-purple-50 text-purple-600'
    };

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`w-12 h-12 rounded-full ${colorClasses[color]} flex items-center justify-center`}>
              {icon ? (
                <span className="text-xl">{icon}</span>
              ) : (
                <span className="text-lg font-medium">{title.charAt(0)}</span>
              )}
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {subtitle && (
              <p className="text-sm text-gray-500">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      <StatCard
        title="Total Revenue"
        value={formatCurrency(data.totalRevenue)}
        subtitle={`${formatCurrency(data.platformFee)} platform fee`}
        color="green"
        icon="💰"
      />
      
      <StatCard
        title="Total Missions"
        value={formatNumber(data.totalMissions)}
        subtitle="Active campaigns"
        color="blue"
        icon="🎯"
      />
      
      <StatCard
        title="Total Users"
        value={formatNumber(data.totalUsers)}
        subtitle="Registered users"
        color="purple"
        icon="👥"
      />
      
      <StatCard
        title="Total Submissions"
        value={formatNumber(data.totalSubmissions)}
        subtitle="User submissions"
        color="yellow"
        icon="📝"
      />
      
      <StatCard
        title="Completion Rate"
        value={`${data.averageCompletionRate}%`}
        subtitle="Average success rate"
        color="green"
        icon="✅"
      />
      
      <StatCard
        title="Platform Fee"
        value={formatCurrency(data.platformFee)}
        subtitle={`${Math.round((data.platformFee / data.totalRevenue) * 100)}% of revenue`}
        color="red"
        icon="🏦"
      />
    </div>
  );
};
