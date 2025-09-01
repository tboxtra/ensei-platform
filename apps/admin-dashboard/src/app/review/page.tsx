'use client';

import { useState, useEffect } from 'react';

interface Submission {
  id: string;
  missionId: string;
  missionTitle: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewerId?: string;
  reason?: string;
  proofs: Array<{
    type: string;
    content: string;
  }>;
  perWinnerHonors?: number;
}

interface Mission {
  id: string;
  title: string;
  model: 'fixed' | 'degen';
  platform: string;
  type: string;
  pricing: {
    perWinnerHonors?: number;
    perUserHonors?: number;
  };
}

export default function ReviewPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [missions, setMissions] = useState<Record<string, Mission>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for demo
    const mockSubmissions: Submission[] = [
      {
        id: 'sub_1',
        missionId: 'mission_1',
        missionTitle: 'Twitter Engagement',
        userId: 'user123',
        status: 'pending',
        submittedAt: '2024-01-15T10:30:00Z',
        proofs: [
          {
            type: 'screenshot',
            content: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
          }
        ]
      },
      {
        id: 'sub_2',
        missionId: 'mission_2',
        missionTitle: 'Instagram Content',
        userId: 'user456',
        status: 'pending',
        submittedAt: '2024-01-15T09:15:00Z',
        proofs: [
          {
            type: 'screenshot',
            content: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
          }
        ]
      }
    ];

    const mockMissions: Record<string, Mission> = {
      'mission_1': {
        id: 'mission_1',
        title: 'Twitter Engagement',
        model: 'fixed',
        platform: 'twitter',
        type: 'engage',
        pricing: {
          perUserHonors: 500
        }
      },
      'mission_2': {
        id: 'mission_2',
        title: 'Instagram Content',
        model: 'degen',
        platform: 'instagram',
        type: 'content',
        pricing: {
          perWinnerHonors: 11250
        }
      }
    };

    setSubmissions(mockSubmissions);
    setMissions(mockMissions);
    setLoading(false);
  }, []);

  const handleReview = async (submissionId: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      // TODO: Replace with actual API call when API is ready
      // const response = await apiClient.reviewSubmission(submissionId, {
      //   action,
      //   reviewerId: 'admin',
      //   reason: reason || (action === 'approve' ? 'Valid proof provided' : 'Invalid proof')
      // });

      // Update local state
      setSubmissions(prev =>
        prev.map(sub =>
          sub.id === submissionId
            ? {
              ...sub,
              status: action,
              reviewedAt: new Date().toISOString(),
              reviewerId: 'admin',
              reason: reason || (action === 'approve' ? 'Valid proof provided' : 'Invalid proof')
            }
            : sub
        )
      );

      // Show success message
      alert(`Submission ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
    } catch (error) {
      console.error('Review failed:', error);
      alert(`Review failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const getHonorsAmount = (submission: Submission): number => {
    const mission = missions[submission.missionId];
    if (!mission) return 0;

    if (mission.model === 'degen') {
      return mission.pricing.perWinnerHonors || 0;
    } else {
      return mission.pricing.perUserHonors || 0;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ensei-primary"></div>
      </div>
    );
  }

  const pendingSubmissions = submissions.filter(sub => sub.status === 'pending');

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Review Queue</h1>
        <p className="text-gray-600">
          {pendingSubmissions.length} submission{pendingSubmissions.length !== 1 ? 's' : ''} pending review
        </p>
      </div>

      <div className="space-y-4">
        {pendingSubmissions.map((submission) => {
          const mission = missions[submission.missionId];
          const honorsAmount = getHonorsAmount(submission);

          return (
            <div key={submission.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {submission.missionTitle}
                  </h3>
                  <p className="text-sm text-gray-500">
                    by {submission.userId} • {new Date(submission.submittedAt).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    Mission: {mission?.model} • Platform: {mission?.platform} • Type: {mission?.type}
                  </p>
                  {honorsAmount > 0 && (
                    <p className="text-sm font-medium text-ensei-primary">
                      {mission?.model === 'degen' ? 'Per Winner:' : 'Per User:'} {honorsAmount.toLocaleString()} Honors
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleReview(submission.id, 'approve')}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('Rejection reason:');
                      if (reason !== null) {
                        handleReview(submission.id, 'reject', reason);
                      }
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Proofs:</h4>
                <div className="space-y-2">
                  {submission.proofs.map((proof, index) => (
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
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        {pendingSubmissions.length === 0 && (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500">No submissions pending review</p>
          </div>
        )}
      </div>

      {/* Recent Reviews */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Reviews</h2>
        <div className="space-y-2">
          {submissions
            .filter(sub => sub.status !== 'pending')
            .slice(0, 5)
            .map((submission) => (
              <div key={submission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {submission.missionTitle} - {submission.userId}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(submission.reviewedAt || '').toLocaleString()}
                  </p>
                </div>
                <span className={`
                  px-2 py-1 rounded text-xs font-medium
                  ${submission.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                `}>
                  {submission.status.toUpperCase()}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
