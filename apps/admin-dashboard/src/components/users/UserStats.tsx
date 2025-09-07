'use client';

import React from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'premium' | 'moderator' | 'admin';
  status: 'active' | 'suspended' | 'banned';
  createdAt: string;
  lastLogin?: string;
  totalSubmissions: number;
  approvedSubmissions: number;
  totalEarned: number;
  reputation: number;
  missionsCreated: number;
  missionsCompleted: number;
}

interface UserStatsProps {
  users: User[];
}

export const UserStats: React.FC<UserStatsProps> = ({ users }) => {
  const stats = React.useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === 'active').length;
    const suspendedUsers = users.filter(u => u.status === 'suspended').length;
    const bannedUsers = users.filter(u => u.status === 'banned').length;
    const premiumUsers = users.filter(u => u.role === 'premium').length;
    const totalEarned = users.reduce((sum, u) => sum + u.totalEarned, 0);
    const totalSubmissions = users.reduce((sum, u) => sum + u.totalSubmissions, 0);
    const totalApproved = users.reduce((sum, u) => sum + u.approvedSubmissions, 0);
    
    const averageReputation = users.length > 0 
      ? users.reduce((sum, u) => sum + u.reputation, 0) / users.length
      : 0;

    const averageEarned = users.length > 0 
      ? totalEarned / users.length
      : 0;

    const approvalRate = totalSubmissions > 0 
      ? Math.round((totalApproved / totalSubmissions) * 100)
      : 0;

    const roleBreakdown = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusBreakdown = users.reduce((acc, user) => {
      acc[user.status] = (acc[user.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalUsers,
      activeUsers,
      suspendedUsers,
      bannedUsers,
      premiumUsers,
      totalEarned,
      totalSubmissions,
      totalApproved,
      averageReputation,
      averageEarned,
      approvalRate,
      roleBreakdown,
      statusBreakdown
    };
  }, [users]);

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
          title="Total Users"
          value={stats.totalUsers}
          color="blue"
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers}
          subtitle={`${stats.suspendedUsers} suspended, ${stats.bannedUsers} banned`}
          color="green"
        />
        <StatCard
          title="Premium Users"
          value={stats.premiumUsers}
          subtitle={`${Math.round((stats.premiumUsers / stats.totalUsers) * 100)}% of total`}
          color="purple"
        />
        <StatCard
          title="Total Earned"
          value={`${stats.totalEarned.toLocaleString()} Honors`}
          subtitle={`${stats.averageEarned.toLocaleString()} avg per user`}
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">Total Submissions</span>
              <span className="text-sm text-gray-500">{stats.totalSubmissions.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">Approved Submissions</span>
              <span className="text-sm text-gray-500">{stats.totalApproved.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">Approval Rate</span>
              <span className="text-sm text-gray-500">{stats.approvalRate}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">Average Reputation</span>
              <span className="text-sm text-gray-500">{stats.averageReputation.toFixed(1)}/5.0</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Role Distribution</h3>
          <div className="space-y-3">
            {Object.entries(stats.roleBreakdown).map(([role, count]) => {
              const percentage = Math.round((count / stats.totalUsers) * 100);
              return (
                <div key={role} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {role}
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h3>
          <div className="space-y-3">
            {Object.entries(stats.statusBreakdown).map(([status, count]) => {
              const percentage = Math.round((count / stats.totalUsers) * 100);
              const colorClass = status === 'active' ? 'bg-green-600' : 
                               status === 'suspended' ? 'bg-yellow-600' : 'bg-red-600';
              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${colorClass}`}
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
