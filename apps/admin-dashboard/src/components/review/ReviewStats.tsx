'use client';

import React from 'react';

interface ReviewAssignment {
  id: string;
  missionId: string;
  submissionId: string;
  reviewerUserId: string;
  status: 'pending' | 'completed' | 'expired';
  createdAt: string;
  submission: {
    id: string;
    missionId: string;
    userId: string;
    proofs: Array<{
      type: string;
      content: string;
    }>;
    status: 'pending' | 'accepted' | 'rejected';
    submittedAt: string;
    ratingAvg?: number;
    ratingCount?: number;
  };
  mission: {
    id: string;
    title: string;
    platform: string;
    type: string;
    model: 'fixed' | 'degen';
    perUserHonors?: number;
    perWinnerHonors?: number;
  };
}

interface ReviewStatsProps {
  assignments: ReviewAssignment[];
}

export const ReviewStats: React.FC<ReviewStatsProps> = ({ assignments }) => {
  const stats = React.useMemo(() => {
    const totalAssignments = assignments.length;
    const completedAssignments = assignments.filter(a => a.status === 'completed').length;
    const pendingAssignments = assignments.filter(a => a.status === 'pending').length;
    const expiredAssignments = assignments.filter(a => a.status === 'expired').length;
    
    const completedSubmissions = assignments.filter(a => a.status === 'completed' && a.submission.status !== 'pending').length;
    const acceptedSubmissions = assignments.filter(a => a.submission.status === 'accepted').length;
    const rejectedSubmissions = assignments.filter(a => a.submission.status === 'rejected').length;
    
    const averageRating = assignments
      .filter(a => a.submission.ratingAvg)
      .reduce((sum, a) => sum + (a.submission.ratingAvg || 0), 0) / 
      assignments.filter(a => a.submission.ratingAvg).length || 0;

    const platformBreakdown = assignments.reduce((acc, assignment) => {
      acc[assignment.mission.platform] = (acc[assignment.mission.platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const typeBreakdown = assignments.reduce((acc, assignment) => {
      acc[assignment.mission.type] = (acc[assignment.mission.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const reviewerBreakdown = assignments.reduce((acc, assignment) => {
      acc[assignment.reviewerUserId] = (acc[assignment.reviewerUserId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalAssignments,
      completedAssignments,
      pendingAssignments,
      expiredAssignments,
      completedSubmissions,
      acceptedSubmissions,
      rejectedSubmissions,
      averageRating,
      platformBreakdown,
      typeBreakdown,
      reviewerBreakdown
    };
  }, [assignments]);

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

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getApprovalRate = () => {
    return stats.completedSubmissions > 0 
      ? Math.round((stats.acceptedSubmissions / stats.completedSubmissions) * 100)
      : 0;
  };

  const getCompletionRate = () => {
    return stats.totalAssignments > 0 
      ? Math.round((stats.completedAssignments / stats.totalAssignments) * 100)
      : 0;
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Assignments"
          value={formatNumber(stats.totalAssignments)}
          subtitle={`${stats.pendingAssignments} pending`}
          color="blue"
          icon="📋"
        />
        
        <StatCard
          title="Completed Reviews"
          value={formatNumber(stats.completedAssignments)}
          subtitle={`${getCompletionRate()}% completion rate`}
          color="green"
          icon="✅"
        />
        
        <StatCard
          title="Accepted Submissions"
          value={formatNumber(stats.acceptedSubmissions)}
          subtitle={`${getApprovalRate()}% approval rate`}
          color="green"
          icon="👍"
        />
        
        <StatCard
          title="Average Rating"
          value={stats.averageRating > 0 ? `${stats.averageRating.toFixed(1)}/5.0` : 'N/A'}
          subtitle="Review quality score"
          color="yellow"
          icon="⭐"
        />
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignment Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Completed</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${(stats.completedAssignments / stats.totalAssignments) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-500 w-12 text-right">
                  {stats.completedAssignments} ({getCompletionRate()}%)
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Pending</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-600 h-2 rounded-full"
                    style={{ width: `${(stats.pendingAssignments / stats.totalAssignments) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-500 w-12 text-right">
                  {stats.pendingAssignments} ({Math.round((stats.pendingAssignments / stats.totalAssignments) * 100)}%)
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Expired</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-600 h-2 rounded-full"
                    style={{ width: `${(stats.expiredAssignments / stats.totalAssignments) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-500 w-12 text-right">
                  {stats.expiredAssignments} ({Math.round((stats.expiredAssignments / stats.totalAssignments) * 100)}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Submission Outcomes</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Accepted</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${(stats.acceptedSubmissions / stats.completedSubmissions) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-500 w-12 text-right">
                  {stats.acceptedSubmissions} ({getApprovalRate()}%)
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Rejected</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-600 h-2 rounded-full"
                    style={{ width: `${(stats.rejectedSubmissions / stats.completedSubmissions) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-500 w-12 text-right">
                  {stats.rejectedSubmissions} ({Math.round((stats.rejectedSubmissions / stats.completedSubmissions) * 100)}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Platform and Type Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Distribution</h3>
          <div className="space-y-3">
            {Object.entries(stats.platformBreakdown).map(([platform, count]) => {
              const percentage = Math.round((count / stats.totalAssignments) * 100);
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
              const percentage = Math.round((count / stats.totalAssignments) * 100);
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

      {/* Reviewer Performance */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Reviewer Performance</h3>
        <div className="space-y-3">
          {Object.entries(stats.reviewerBreakdown).map(([reviewerId, count]) => {
            const percentage = Math.round((count / stats.totalAssignments) * 100);
            return (
              <div key={reviewerId} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-900">
                    {reviewerId}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
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
  );
};
