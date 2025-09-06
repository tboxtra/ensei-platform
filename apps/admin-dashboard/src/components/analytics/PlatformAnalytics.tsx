'use client';

import React from 'react';

interface PlatformData {
  platform: string;
  missions: number;
  submissions: number;
  revenue: number;
  completionRate: number;
}

interface PlatformAnalyticsProps {
  data: PlatformData[];
}

export const PlatformAnalytics: React.FC<PlatformAnalyticsProps> = ({ data }) => {
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

  const totalRevenue = data.reduce((sum, platform) => sum + platform.revenue, 0);
  const totalMissions = data.reduce((sum, platform) => sum + platform.missions, 0);
  const totalSubmissions = data.reduce((sum, platform) => sum + platform.submissions, 0);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Platform Performance</h3>
      
      <div className="space-y-4">
        {data.map((platform, index) => {
          const revenuePercentage = Math.round((platform.revenue / totalRevenue) * 100);
          const missionsPercentage = Math.round((platform.missions / totalMissions) * 100);
          const submissionsPercentage = Math.round((platform.submissions / totalSubmissions) * 100);

          return (
            <div key={platform.platform} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{getPlatformIcon(platform.platform)}</div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 capitalize">
                      {platform.platform}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {platform.missions} missions • {platform.submissions} submissions
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">
                    {formatCurrency(platform.revenue)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {revenuePercentage}% of total revenue
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <span className="text-sm font-medium text-gray-700">Missions</span>
                    <span className="text-sm text-gray-500">{missionsPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${missionsPercentage}%` }}
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
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${submissionsPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <div>
                    <span className="text-gray-500">Completion Rate:</span>
                    <span className="ml-1 font-medium text-gray-900">
                      {platform.completionRate}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Avg per Mission:</span>
                    <span className="ml-1 font-medium text-gray-900">
                      {formatCurrency(platform.revenue / platform.missions)}
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
              {formatCurrency(totalRevenue)}
            </div>
            <div className="text-sm text-gray-500">Total Revenue</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(totalMissions)}
            </div>
            <div className="text-sm text-gray-500">Total Missions</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(totalSubmissions)}
            </div>
            <div className="text-sm text-gray-500">Total Submissions</div>
          </div>
        </div>
      </div>
    </div>
  );
};
