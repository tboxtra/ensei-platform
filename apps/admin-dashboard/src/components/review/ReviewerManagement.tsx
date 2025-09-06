'use client';

import React, { useState, useEffect } from 'react';

interface Reviewer {
  id: string;
  name: string;
  email: string;
  role: 'reviewer' | 'senior_reviewer' | 'lead_reviewer';
  status: 'active' | 'inactive' | 'suspended';
  totalReviews: number;
  averageRating: number;
  lastReviewDate?: string;
  joinedDate: string;
  permissions: string[];
  performance: {
    accuracy: number;
    speed: number;
    consistency: number;
  };
}

export const ReviewerManagement: React.FC = () => {
  const [reviewers, setReviewers] = useState<Reviewer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReviewer, setSelectedReviewer] = useState<Reviewer | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Mock data for development
  const mockReviewers: Reviewer[] = [
    {
      id: 'reviewer_1',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      role: 'lead_reviewer',
      status: 'active',
      totalReviews: 245,
      averageRating: 4.2,
      lastReviewDate: '2024-01-15T14:30:00Z',
      joinedDate: '2023-10-15T10:00:00Z',
      permissions: ['review:read', 'review:write', 'review:manage'],
      performance: {
        accuracy: 92,
        speed: 88,
        consistency: 95
      }
    },
    {
      id: 'reviewer_2',
      name: 'Bob Smith',
      email: 'bob@example.com',
      role: 'senior_reviewer',
      status: 'active',
      totalReviews: 156,
      averageRating: 3.8,
      lastReviewDate: '2024-01-14T16:45:00Z',
      joinedDate: '2023-11-20T09:30:00Z',
      permissions: ['review:read', 'review:write'],
      performance: {
        accuracy: 87,
        speed: 92,
        consistency: 89
      }
    },
    {
      id: 'reviewer_3',
      name: 'Carol Davis',
      email: 'carol@example.com',
      role: 'reviewer',
      status: 'active',
      totalReviews: 89,
      averageRating: 4.0,
      lastReviewDate: '2024-01-13T11:20:00Z',
      joinedDate: '2023-12-01T14:15:00Z',
      permissions: ['review:read', 'review:write'],
      performance: {
        accuracy: 90,
        speed: 85,
        consistency: 87
      }
    },
    {
      id: 'reviewer_4',
      name: 'David Wilson',
      email: 'david@example.com',
      role: 'reviewer',
      status: 'suspended',
      totalReviews: 67,
      averageRating: 2.1,
      lastReviewDate: '2024-01-10T08:30:00Z',
      joinedDate: '2023-11-05T16:45:00Z',
      permissions: ['review:read'],
      performance: {
        accuracy: 65,
        speed: 78,
        consistency: 70
      }
    }
  ];

  useEffect(() => {
    loadReviewers();
  }, []);

  const loadReviewers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setReviewers(mockReviewers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reviewers');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (reviewerId: string, status: 'active' | 'inactive' | 'suspended') => {
    try {
      // await apiClient.updateReviewerStatus(reviewerId, status);
      
      setReviewers(prev =>
        prev.map(reviewer =>
          reviewer.id === reviewerId
            ? { ...reviewer, status }
            : reviewer
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update reviewer status');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'lead_reviewer':
        return 'bg-purple-100 text-purple-800';
      case 'senior_reviewer':
        return 'bg-blue-100 text-blue-800';
      case 'reviewer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Reviewer Management</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Add Reviewer
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {reviewers.map((reviewer) => (
          <div key={reviewer.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {reviewer.name}
                </h3>
                <p className="text-sm text-gray-500 mb-2">{reviewer.email}</p>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(reviewer.role)}`}>
                    {reviewer.role.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reviewer.status)}`}>
                    {reviewer.status.toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div className="flex space-x-1">
                {reviewer.status === 'active' && (
                  <button
                    onClick={() => handleStatusChange(reviewer.id, 'suspended')}
                    className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
                  >
                    Suspend
                  </button>
                )}
                {reviewer.status === 'suspended' && (
                  <button
                    onClick={() => handleStatusChange(reviewer.id, 'active')}
                    className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors"
                  >
                    Reactivate
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Total Reviews</span>
                <span className="text-sm font-medium text-gray-900">
                  {reviewer.totalReviews.toLocaleString()}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Average Rating</span>
                <span className="text-sm font-medium text-gray-900">
                  {reviewer.averageRating.toFixed(1)}/5.0
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Last Review</span>
                <span className="text-sm font-medium text-gray-900">
                  {reviewer.lastReviewDate ? formatDate(reviewer.lastReviewDate) : 'Never'}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Performance</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Accuracy</span>
                  <span className={`text-xs font-medium ${getPerformanceColor(reviewer.performance.accuracy)}`}>
                    {reviewer.performance.accuracy}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Speed</span>
                  <span className={`text-xs font-medium ${getPerformanceColor(reviewer.performance.speed)}`}>
                    {reviewer.performance.speed}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Consistency</span>
                  <span className={`text-xs font-medium ${getPerformanceColor(reviewer.performance.consistency)}`}>
                    {reviewer.performance.consistency}%
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Joined {formatDate(reviewer.joinedDate)}</span>
                <button
                  onClick={() => setSelectedReviewer(reviewer)}
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reviewer Details Modal */}
      {selectedReviewer && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Reviewer Details</h3>
                <button
                  onClick={() => setSelectedReviewer(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-md font-semibold text-gray-900">{selectedReviewer.name}</h4>
                  <p className="text-sm text-gray-600">{selectedReviewer.email}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Role</span>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedReviewer.role.replace('_', ' ').toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Status</span>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedReviewer.status.toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Total Reviews</span>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedReviewer.totalReviews.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Average Rating</span>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedReviewer.averageRating.toFixed(1)}/5.0
                    </p>
                  </div>
                </div>

                <div>
                  <span className="text-sm text-gray-500">Permissions</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {selectedReviewer.permissions.map((permission) => (
                      <span
                        key={permission}
                        className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded"
                      >
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end space-x-3">
                <button
                  onClick={() => setSelectedReviewer(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
