'use client';

import React from 'react';

interface MissionPerformanceData {
  missionId: string;
  title: string;
  platform: string;
  submissions: number;
  approved: number;
  revenue: number;
  completionRate: number;
}

interface MissionPerformanceChartProps {
  data: MissionPerformanceData[];
}

export const MissionPerformanceChart: React.FC<MissionPerformanceChartProps> = ({ data }) => {
  const getPlatformIcon = (platform: string) => {
    const icons: Record<string, string> = {
      twitter: '𝕏',
      instagram: '📸',
      tiktok: '🎵',
      facebook: '📘',
      whatsapp: '💬',
      snapchat: '👻',
      telegram: '📱',
      custom: '⚡'
    };
    return icons[platform] || '🌐';
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

  const maxRevenue = Math.max(...data.map(d => d.revenue));
  const maxSubmissions = Math.max(...data.map(d => d.submissions));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Performing Missions</h3>
      
      <div className="space-y-4">
        {data.map((mission, index) => {
          const revenuePercentage = Math.round((mission.revenue / maxRevenue) * 100);
          const submissionsPercentage = Math.round((mission.submissions / maxSubmissions) * 100);

          return (
            <div key={mission.missionId} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{getPlatformIcon(mission.platform)}</div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {mission.title}
                    </h4>
                    <p className="text-sm text-gray-500 capitalize">
                      {mission.platform} • {formatNumber(mission.submissions)} submissions
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">
                    {formatCurrency(mission.revenue)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {mission.completionRate}% completion
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Revenue</span>
                    <span className="text-sm text-gray-500">{revenuePercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${revenuePercentage}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Submissions</span>
                    <span className="text-sm text-gray-500">{submissionsPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${submissionsPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <div>
                    <span className="text-gray-500">Approved:</span>
                    <span className="ml-1 font-medium text-gray-900">
                      {formatNumber(mission.approved)}/{formatNumber(mission.submissions)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Avg per Submission:</span>
                    <span className="ml-1 font-medium text-gray-900">
                      {formatCurrency(mission.revenue / mission.submissions)}
                    </span>
                  </div>
                </div>
                <div className="text-gray-500">
                  Rank #{index + 1}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(data.reduce((sum, mission) => sum + mission.revenue, 0))}
            </div>
            <div className="text-sm text-gray-500">Total Revenue</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(data.reduce((sum, mission) => sum + mission.submissions, 0))}
            </div>
            <div className="text-sm text-gray-500">Total Submissions</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {Math.round(data.reduce((sum, mission) => sum + mission.completionRate, 0) / data.length)}%
            </div>
            <div className="text-sm text-gray-500">Average Completion Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
};
