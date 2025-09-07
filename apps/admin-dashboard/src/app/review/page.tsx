'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { ReviewQueue } from '../../components/review/ReviewQueue';
import { ReviewStats } from '../../components/review/ReviewStats';
import { ReviewerManagement } from '../../components/review/ReviewerManagement';
import { apiClient } from '../../lib/api';

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

export default function ReviewPage() {
  const [assignments, setAssignments] = useState<ReviewAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'queue' | 'stats' | 'reviewers'>('queue');

  // Mock data for development
  const mockAssignments: ReviewAssignment[] = [
    {
      id: 'assignment_1',
      missionId: 'mission_1',
      submissionId: 'submission_1',
      reviewerUserId: 'reviewer_1',
      status: 'pending',
      createdAt: '2024-01-15T10:30:00Z',
      submission: {
        id: 'submission_1',
        missionId: 'mission_1',
        userId: 'user_123',
        proofs: [
          {
            type: 'screenshot',
            content: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
          }
        ],
        status: 'pending',
        submittedAt: '2024-01-15T09:15:00Z'
      },
      mission: {
        id: 'mission_1',
        title: 'Twitter Engagement Campaign',
        platform: 'twitter',
        type: 'engage',
        model: 'fixed',
        perUserHonors: 250
      }
    },
    {
      id: 'assignment_2',
      missionId: 'mission_2',
      submissionId: 'submission_2',
      reviewerUserId: 'reviewer_2',
      status: 'pending',
      createdAt: '2024-01-15T11:20:00Z',
      submission: {
        id: 'submission_2',
        missionId: 'mission_2',
        userId: 'user_456',
        proofs: [
          {
            type: 'url',
            content: 'https://twitter.com/user/status/1234567890'
          }
        ],
        status: 'pending',
        submittedAt: '2024-01-15T10:45:00Z'
      },
      mission: {
        id: 'mission_2',
        title: 'Instagram Content Creation',
        platform: 'instagram',
        type: 'content',
        model: 'degen',
        perWinnerHonors: 11250
      }
    }
  ];

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For now, use mock data
      // const response = await apiClient.getReviewQueue();
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAssignments(mockAssignments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load review assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewVote = async (assignmentId: string, rating: number, commentLink?: string) => {
    try {
      // await apiClient.submitReviewVote(assignmentId, rating, commentLink);
      
      // Update local state
      setAssignments(prev =>
        prev.map(assignment =>
          assignment.id === assignmentId
            ? { ...assignment, status: 'completed' }
            : assignment
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review vote');
    }
  };

  const tabs = [
    { id: 'queue', label: 'Review Queue', count: assignments.filter(a => a.status === 'pending').length },
    { id: 'stats', label: 'Review Stats', count: null },
    { id: 'reviewers', label: 'Reviewers', count: null }
  ];

  return (
    <ProtectedRoute requiredPermission="review:read">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Review Management</h1>
          <div className="text-sm text-gray-500">
            {assignments.filter(a => a.status === 'pending').length} pending reviews
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count !== null && (
                  <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                    activeTab === tab.id
                      ? 'bg-indigo-100 text-indigo-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <>
            {activeTab === 'queue' && (
              <ReviewQueue
                assignments={assignments.filter(a => a.status === 'pending')}
                onReviewVote={handleReviewVote}
              />
            )}
            
            {activeTab === 'stats' && (
              <ReviewStats assignments={assignments} />
            )}
            
            {activeTab === 'reviewers' && (
              <ReviewerManagement />
            )}
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}