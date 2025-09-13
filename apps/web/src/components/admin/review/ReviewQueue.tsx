'use client';

import React, { useState } from 'react';

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

interface ReviewQueueProps {
  assignments: ReviewAssignment[];
  onReviewVote: (assignmentId: string, rating: number, commentLink?: string) => void;
}

export const ReviewQueue: React.FC<ReviewQueueProps> = ({ assignments, onReviewVote }) => {
  const [selectedAssignment, setSelectedAssignment] = useState<ReviewAssignment | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [commentLink, setCommentLink] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

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

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      engage: '🎯',
      content: '✍️',
      ambassador: '👑'
    };
    return icons[type] || '📋';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSubmitReview = async () => {
    if (!selectedAssignment || rating === 0) return;

    try {
      setSubmitting(true);
      await onReviewVote(selectedAssignment.id, rating, commentLink || undefined);
      
      // Reset form
      setSelectedAssignment(null);
      setRating(0);
      setCommentLink('');
    } catch (error) {
      console.error('Failed to submit review:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getRatingDescription = (rating: number) => {
    const descriptions = {
      1: 'Irrelevant - Does not meet mission requirements',
      2: 'Weak - Partially meets requirements',
      3: 'Fair - Meets basic requirements',
      4: 'Good - Exceeds requirements',
      5: 'Excellent - Outstanding quality'
    };
    return descriptions[rating as keyof typeof descriptions] || '';
  };

  if (assignments.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No pending reviews</h3>
        <p className="text-gray-500">All submissions have been reviewed!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Assignment List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {assignments.map((assignment) => (
          <div
            key={assignment.id}
            className={`bg-white rounded-lg shadow p-6 cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedAssignment?.id === assignment.id
                ? 'ring-2 ring-indigo-500 border-indigo-500'
                : 'border border-gray-200'
            }`}
            onClick={() => setSelectedAssignment(assignment)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-3">
                <div className="text-2xl">{getPlatformIcon(assignment.mission.platform)}</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {assignment.mission.title}
                  </h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span className="flex items-center">
                      {getTypeIcon(assignment.mission.type)} {assignment.mission.type}
                    </span>
                    <span>•</span>
                    <span className="capitalize">{assignment.mission.platform}</span>
                    <span>•</span>
                    <span className="capitalize">{assignment.mission.model}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-500">Submitted</div>
                <div className="text-sm font-medium text-gray-900">
                  {formatDate(assignment.submission.submittedAt)}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-sm font-medium text-gray-700 mb-2">Proofs:</div>
              <div className="space-y-2">
                {assignment.submission.proofs.map((proof, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Type:</span> {proof.type}
                    </p>
                    {proof.type === 'screenshot' && (
                      <img
                        src={proof.content}
                        alt="Proof"
                        className="mt-2 max-w-xs rounded border"
                      />
                    )}
                    {proof.type === 'url' && (
                      <a
                        href={proof.content}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 text-blue-600 hover:text-blue-800 text-sm break-all"
                      >
                        {proof.content}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="text-gray-500">Reward:</span>
                <span className="ml-1 font-medium text-gray-900">
                  {assignment.mission.model === 'fixed' 
                    ? `${assignment.mission.perUserHonors?.toLocaleString()} Honors`
                    : `${assignment.mission.perWinnerHonors?.toLocaleString()} Honors`
                  }
                </span>
              </div>
              <div className="text-gray-500">
                User: {assignment.submission.userId}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Review Form Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Review Submission</h3>
                <button
                  onClick={() => setSelectedAssignment(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <h4 className="text-md font-semibold text-gray-900 mb-2">
                  {selectedAssignment.mission.title}
                </h4>
                <p className="text-sm text-gray-600">
                  {selectedAssignment.mission.platform} • {selectedAssignment.mission.type} • {selectedAssignment.mission.model}
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Rate this submission (1-5 stars):
                </label>
                <div className="flex space-x-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`text-2xl transition-colors ${
                        star <= rating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-sm text-gray-600">
                    {getRatingDescription(rating)}
                  </p>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comment Link (Optional)
                </label>
                <input
                  type="url"
                  value={commentLink}
                  onChange={(e) => setCommentLink(e.target.value)}
                  placeholder="https://twitter.com/your-comment"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Link to your comment on the user's social post
                </p>
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setSelectedAssignment(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReview}
                  disabled={rating === 0 || submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
