'use client';

import React from 'react';

interface UserGrowthData {
  date: string;
  users: number;
  newUsers: number;
}

interface UserGrowthChartProps {
  data: UserGrowthData[];
}

export const UserGrowthChart: React.FC<UserGrowthChartProps> = ({ data }) => {
  const maxUsers = Math.max(...data.map(d => d.users));
  const maxNewUsers = Math.max(...data.map(d => d.newUsers));
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const totalNewUsers = data.reduce((sum, item) => sum + item.newUsers, 0);
  const averageNewUsers = Math.round(totalNewUsers / data.length);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">User Growth</h3>
        <div className="text-sm text-gray-500">
          {formatNumber(data[data.length - 1]?.users || 0)} total users
        </div>
      </div>

      <div className="h-64 flex items-end space-x-1">
        {data.map((item, index) => {
          const userHeight = (item.users / maxUsers) * 100;
          const newUserHeight = (item.newUsers / maxNewUsers) * 100;
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="w-full bg-gray-200 rounded-t" style={{ height: '200px' }}>
                <div className="relative w-full h-full">
                  {/* Total users bar */}
                  <div
                    className="absolute bottom-0 w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all duration-300 hover:from-blue-600 hover:to-blue-500"
                    style={{ height: `${userHeight}%` }}
                    title={`${formatDate(item.date)}: ${formatNumber(item.users)} total users`}
                  ></div>
                  
                  {/* New users overlay */}
                  <div
                    className="absolute bottom-0 w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t transition-all duration-300 hover:from-green-600 hover:to-green-500"
                    style={{ height: `${newUserHeight}%` }}
                    title={`${formatDate(item.date)}: ${formatNumber(item.newUsers)} new users`}
                  ></div>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500 text-center">
                {formatDate(item.date)}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-sm text-gray-600">Total Users</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-600">New Users</span>
          </div>
        </div>
        
        <div className="text-sm text-gray-500">
          <div>+{formatNumber(totalNewUsers)} new users</div>
          <div>Avg: {formatNumber(averageNewUsers)}/day</div>
        </div>
      </div>
    </div>
  );
};
