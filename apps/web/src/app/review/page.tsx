'use client';

import { useState } from 'react';
import { ModernLayout } from '../../components/layout/ModernLayout';
import { ModernCard } from '../../components/ui/ModernCard';
import { ModernButton } from '../../components/ui/ModernButton';

export default function ReviewPage() {
  const [submissions] = useState([
    {
      id: '1',
      missionId: '1',
      missionTitle: 'Engage with our latest tweet about Web3',
      platform: 'twitter',
      type: 'engage',
      user: 'user123',
      tasks: ['like', 'retweet', 'comment'],
      proof: {
        type: 'screenshot',
        url: 'https://example.com/proof1.jpg',
        description: 'Screenshot showing like, retweet, and comment on the tweet'
      },
      submittedAt: '2024-01-12T10:30:00Z',
      status: 'pending',
      reward: 320
    },
    {
      id: '2',
      missionId: '2',
      missionTitle: 'Create content for our brand campaign',
      platform: 'instagram',
      type: 'content',
      user: 'user456',
      tasks: ['feed_post'],
      proof: {
        type: 'url',
        url: 'https://instagram.com/p/example123',
        description: 'Instagram post showcasing the brand product'
      },
      submittedAt: '2024-01-12T09:15:00Z',
      status: 'approved',
      reward: 1800
    },
    {
      id: '3',
      missionId: '3',
      missionTitle: 'Become a brand ambassador',
      platform: 'tiktok',
      type: 'ambassador',
      user: 'user789',
      tasks: ['pfp', 'hashtag_in_bio'],
      proof: {
        type: 'screenshot',
        url: 'https://example.com/proof3.jpg',
        description: 'Screenshot showing profile picture and bio with brand hashtag'
      },
      submittedAt: '2024-01-12T08:45:00Z',
      status: 'rejected',
      reward: 600,
      rejectionReason: 'Profile picture does not match brand guidelines'
    }
  ]);

  const [selectedStatus, setSelectedStatus] = useState('pending');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const filteredSubmissions = submissions.filter(submission => {
    if (selectedStatus !== 'all' && submission.status !== selectedStatus) return false;
    return true;
  });

  const handleReview = (submissionId: string, action: 'approve' | 'reject', reason = '') => {
    // Handle review logic here
    console.log(`Reviewing submission ${submissionId} with action: ${action}, reason: ${reason}`);
    setShowRejectModal(false);
    setRejectReason('');
  };

  const getPlatformIcon = (platform: string) => {
    const icons = {
      twitter: '𝕏',
      instagram: '📸',
      tiktok: '🎵',
      facebook: '📘',
      whatsapp: '💬',
      snapchat: '👻',
      telegram: '📱'
    };
    return icons[platform as keyof typeof icons] || '🌐';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'from-yellow-500 to-orange-500';
      case 'approved': return 'from-green-500 to-emerald-500';
      case 'rejected': return 'from-red-500 to-pink-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'engage': return 'from-blue-500 to-purple-500';
      case 'content': return 'from-purple-500 to-indigo-500';
      case 'ambassador': return 'from-yellow-500 to-orange-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <ModernLayout currentPage="/review">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Review Submissions</h1>
          <p className="text-gray-400">Review and approve mission submissions from users</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <ModernCard className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-400 text-sm font-medium">Pending Reviews</p>
                <p className="text-3xl font-bold text-white">{submissions.filter(s => s.status === 'pending').length}</p>
              </div>
              <div className="text-4xl">⏳</div>
            </div>
          </ModernCard>

          <ModernCard className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-400 text-sm font-medium">Approved Today</p>
                <p className="text-3xl font-bold text-white">{submissions.filter(s => s.status === 'approved').length}</p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </ModernCard>

          <ModernCard className="bg-gradient-to-r from-red-500/20 to-pink-500/20 border-red-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-400 text-sm font-medium">Rejected Today</p>
                <p className="text-3xl font-bold text-white">{submissions.filter(s => s.status === 'rejected').length}</p>
              </div>
              <div className="text-4xl">❌</div>
            </div>
          </ModernCard>

          <ModernCard className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-400 text-sm font-medium">Total Submissions</p>
                <p className="text-3xl font-bold text-white">{submissions.length}</p>
              </div>
              <div className="text-4xl">📝</div>
            </div>
          </ModernCard>
        </div>

        {/* Status Filter */}
        <ModernCard className="mb-8">
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <span className="mr-3 text-2xl">🔍</span>
            Filter Submissions
          </h2>
          <div className="flex flex-wrap gap-3">
            {[
              { id: 'all', label: 'All', count: submissions.length },
              { id: 'pending', label: 'Pending', count: submissions.filter(s => s.status === 'pending').length },
              { id: 'approved', label: 'Approved', count: submissions.filter(s => s.status === 'approved').length },
              { id: 'rejected', label: 'Rejected', count: submissions.filter(s => s.status === 'rejected').length }
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedStatus(filter.id)}
                className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 ${selectedStatus === filter.id
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700/50'
                  }`}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>
        </ModernCard>

        {/* Submissions List */}
        <div className="space-y-6">
          {filteredSubmissions.map((submission) => (
            <ModernCard key={submission.id} className="hover:shadow-xl transition-all duration-300">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">{getPlatformIcon(submission.platform)}</div>
                    <div className="flex space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getTypeColor(submission.type)} text-white`}>
                        {submission.type.charAt(0).toUpperCase() + submission.type.slice(1)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getStatusColor(submission.status)} text-white`}>
                        {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Reward</p>
                  <p className="text-2xl font-bold text-green-400">{submission.reward} Honors</p>
                  <p className="text-xs text-gray-500">≈ ${(submission.reward / 450).toFixed(2)} USD</p>
                </div>
              </div>

              <h3 className="text-2xl font-bold mb-3">{submission.missionTitle}</h3>
              <p className="text-gray-400 mb-6">Submitted by: <span className="text-white font-medium">{submission.user}</span></p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-1">Submitted</p>
                  <p className="font-semibold text-white">{new Date(submission.submittedAt).toLocaleDateString()}</p>
                  <p className="text-xs text-gray-500">{new Date(submission.submittedAt).toLocaleTimeString()}</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-1">Proof Type</p>
                  <p className="font-semibold text-white capitalize">{submission.proof.type}</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-1">Tasks Completed</p>
                  <p className="font-semibold text-white">{submission.tasks.join(', ')}</p>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-3 flex items-center">
                  <span className="mr-2">📋</span>
                  Proof Description
                </h4>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <p className="text-gray-300">{submission.proof.description}</p>
                  {submission.proof.url && (
                    <a
                      href={submission.proof.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center mt-3 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                    >
                      <span className="mr-2">🔗</span>
                      View Proof
                      <span className="ml-1">→</span>
                    </a>
                  )}
                </div>
              </div>

              {submission.status === 'rejected' && submission.rejectionReason && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <h4 className="text-red-400 font-semibold mb-2 flex items-center">
                    <span className="mr-2">❌</span>
                    Rejection Reason
                  </h4>
                  <p className="text-red-300">{submission.rejectionReason}</p>
                </div>
              )}

              {submission.status === 'pending' && (
                <div className="flex flex-wrap gap-4">
                  <ModernButton
                    onClick={() => handleReview(submission.id, 'approve')}
                    variant="success"
                    size="md"
                    className="flex items-center"
                  >
                    <span className="mr-2">✅</span>
                    Approve
                  </ModernButton>
                  <ModernButton
                    onClick={() => setShowRejectModal(true)}
                    variant="danger"
                    size="md"
                    className="flex items-center"
                  >
                    <span className="mr-2">❌</span>
                    Reject
                  </ModernButton>
                  <ModernButton
                    variant="secondary"
                    size="md"
                    className="flex items-center"
                  >
                    <span className="mr-2">❓</span>
                    Request More Info
                  </ModernButton>
                </div>
              )}
            </ModernCard>
          ))}
        </div>

        {filteredSubmissions.length === 0 && (
          <ModernCard className="text-center py-16">
            <div className="text-8xl mb-6">📄</div>
            <h3 className="text-2xl font-bold mb-3">No submissions found</h3>
            <p className="text-gray-400 text-lg">No submissions match the current filter criteria</p>
          </ModernCard>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full mx-4 border border-gray-700">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <span className="mr-2">❌</span>
              Reject Submission
            </h3>
            <p className="text-gray-400 mb-4">Please provide a reason for rejecting this submission:</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              className="w-full p-4 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 resize-none"
              placeholder="Enter rejection reason..."
            />
            <div className="flex space-x-4 mt-6">
              <ModernButton
                onClick={() => setShowRejectModal(false)}
                variant="secondary"
                size="md"
                className="flex-1"
              >
                Cancel
              </ModernButton>
              <ModernButton
                onClick={() => handleReview('1', 'reject', rejectReason)}
                variant="danger"
                size="md"
                className="flex-1"
                disabled={!rejectReason.trim()}
              >
                Reject
              </ModernButton>
            </div>
          </div>
        </div>
      )}
    </ModernLayout>
  );
}
