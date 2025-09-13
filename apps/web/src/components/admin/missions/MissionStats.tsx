'use client';

import React from 'react';

interface Mission {
  id: string;
  title: string;
  platform: string;
  type: string;
  model: 'fixed' | 'degen';
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  creatorId: string;
  createdAt: string;
  submissionsCount: number;
  approvedCount: number;
  totalCostUsd: number;
  perUserHonors?: number;
  perWinnerHonors?: number;
  winnersCap?: number;
  cap?: number;
  durationHours?: number;
}

interface MissionStatsProps {
  missions: Mission[];
}

export const MissionStats: React.FC<MissionStatsProps> = ({ missions }) => {
  const stats = React.useMemo(() => {
    const totalMissions = missions.length;
    const activeMissions = missions.filter(m => m.status === 'active').length;
    const completedMissions = missions.filter(m => m.status === 'completed').length;
    const totalSubmissions = missions.reduce((sum, m) => sum + m.submissionsCount, 0);
    const totalApproved = missions.reduce((sum, m) => sum + m.approvedCount, 0);
    const totalRevenue = missions.reduce((sum, m) => sum + m.totalCostUsd, 0);
    
    const averageCompletionRate = totalSubmissions > 0 
      ? Math.round((totalApproved / totalSubmissions) * 100)
      : 0;

    const platformBreakdown = missions.reduce((acc, mission) => {
      acc[mission.platform] = (acc[mission.platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const typeBreakdown = missions.reduce((acc, mission) => {
      acc[mission.type] = (acc[mission.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalMissions,
      activeMissions,
      completedMissions,
      totalSubmissions,
      totalApproved,
      totalRevenue,
      averageCompletionRate,
      platformBreakdown,
      typeBreakdown
    };
  }, [missions]);

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    subtitle?: string;
    color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  }> = ({ title, value, subtitle, color = 'blue' }) => {
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
            <div className={`w-8 h-8 rounded-full ${colorClasses[color]} flex items-center justify-center`}>
              <span className="text-sm font-medium">{title.charAt(0)}</span>
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            {subtitle && (
              <p className="text-sm text-gray-500">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Missions"
          value={stats.totalMissions}
          color="blue"
        />
        <StatCard
          title="Active Missions"
          value={stats.activeMissions}
          subtitle={`${stats.completedMissions} completed`}
          color="green"
        />
        <StatCard
          title="Total Submissions"
          value={stats.totalSubmissions.toLocaleString()}
          subtitle={`${stats.totalApproved.toLocaleString()} approved`}
          color="yellow"
        />
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          subtitle={`${stats.averageCompletionRate}% completion rate`}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Distribution</h3>
          <div className="space-y-3">
            {Object.entries(stats.platformBreakdown).map(([platform, count]) => {
              const percentage = Math.round((count / stats.totalMissions) * 100);
              return (
                <div key={platform} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {platform}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500 w-12 text-right">
                      {count} ({percentage}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Mission Type Distribution</h3>
          <div className="space-y-3">
            {Object.entries(stats.typeBreakdown).map(([type, count]) => {
              const percentage = Math.round((count / stats.totalMissions) * 100);
              return (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {type}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500 w-12 text-right">
                      {count} ({percentage}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
