'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useApi } from '../../../hooks/useApi';
import { ModernLayout } from '../../../components/layout/ModernLayout';
import { ModernCard } from '../../../components/ui/ModernCard';
import { ModernButton } from '../../../components/ui/ModernButton';

export default function MissionDetailPage() {
  const params = useParams();
  const missionId = params?.id as string;
  const { getMission, participateInMission, loading, error } = useApi();

  const [mission, setMission] = useState<any>(null);
  const [participationLoading, setParticipationLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'submissions' | 'participate'>('overview');
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  // Participation form state
  const [submission, setSubmission] = useState('');
  const [proofLink, setProofLink] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  useEffect(() => {
    if (missionId) {
      loadMission();
      // Set up real-time updates every 30 seconds
      const interval = setInterval(() => {
        loadMission();
      }, 30000);
      setRefreshInterval(interval);

      return () => {
        if (interval) clearInterval(interval);
      };
    }
  }, [missionId]);

  const loadMission = async () => {
    try {
      const missionData = await getMission(missionId);
      setMission(missionData);
    } catch (err) {
      console.error('Error loading mission:', err);
      setMission(null);
    }
  };

  const handleParticipate = async () => {
    if (!submission.trim()) {
      alert('Please describe how you completed the mission');
      return;
    }

    if (!agreeToTerms) {
      alert('Please agree to the terms and conditions');
      return;
    }

    setParticipationLoading(true);
    try {
      await participateInMission(missionId, {
        submission,
        proofLink,
        proofFile
      });
      alert('Participation submitted successfully!');
      setSubmission('');
      setProofLink('');
      setProofFile(null);
      setAgreeToTerms(false);
      // Refresh mission data
      loadMission();
    } catch (err) {
      console.error('Error participating in mission:', err);
      alert('Failed to submit participation. Please try again.');
    } finally {
      setParticipationLoading(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    const icons: { [key: string]: string } = {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'completed':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'draft':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'paused':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <ModernLayout currentPage="/missions">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading mission details...</p>
          </div>
        </div>
      </ModernLayout>
    );
  }

  if (error || !mission) {
    return (
      <ModernLayout currentPage="/missions">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-8 text-center">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-red-400 mb-4">Mission Not Found</h2>
            <p className="text-gray-300 mb-6">
              The mission you're looking for doesn't exist or has been removed.
            </p>
            <ModernButton
              onClick={() => window.location.href = '/missions'}
              variant="primary"
            >
              Back to Missions
            </ModernButton>
          </div>
        </div>
      </ModernLayout>
    );
  }

  return (
    <ModernLayout currentPage="/missions">
      <div className="max-w-7xl mx-auto">
        {/* Mission Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">
                {getPlatformIcon(mission.platform)}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{mission.title}</h1>
                <div className="flex items-center space-x-4">
                  <span className="text-gray-400 capitalize">{mission.platform} • {mission.type}</span>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(mission.status)}`}>
                    {mission.status}
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-400 mb-1">
                {mission.total_cost_honors?.toLocaleString() || 0} Honors
              </div>
              <div className="text-gray-400 text-sm">
                ${mission.total_cost_usd || 0} USD
              </div>
            </div>
          </div>

          <p className="text-gray-300 text-lg leading-relaxed">
            {mission.description}
          </p>
        </div>

        {/* Mission Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-lg rounded-2xl p-6 border border-green-500/30">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {mission.participants || 0}
            </div>
            <div className="text-sm text-gray-400">Participants</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/30">
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {mission.submissions || 0}
            </div>
            <div className="text-sm text-gray-400">Submissions</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-lg rounded-2xl p-6 border border-orange-500/30">
            <div className="text-3xl font-bold text-orange-400 mb-2">
              {mission.approved_submissions || 0}
            </div>
            <div className="text-sm text-gray-400">Approved</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30">
            <div className="text-3xl font-bold text-purple-400 mb-2">
              {mission.completion_rate || 0}%
            </div>
            <div className="text-sm text-gray-400">Completion Rate</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-800/50 rounded-xl p-1">
            {[
              { id: 'overview', label: 'Overview', icon: '📋' },
              { id: 'analytics', label: 'Analytics', icon: '📊' },
              { id: 'submissions', label: 'Submissions', icon: '📝' },
              { id: 'participate', label: 'Participate', icon: '🎯' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all ${activeTab === tab.id
                  ? 'bg-green-500 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
              >
                <span>{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mb-8">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ModernCard className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Mission Details</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Duration</span>
                    <span className="text-white">{mission.duration_hours || 0} hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Capacity</span>
                    <span className="text-white">{mission.cap || 0} participants</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Model</span>
                    <span className="text-white capitalize">{mission.model || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Created</span>
                    <span className="text-white">
                      {mission.created_at ? new Date(mission.created_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Ends</span>
                    <span className="text-white">
                      {mission.ends_at ? new Date(mission.ends_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </ModernCard>

              <ModernCard className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Instructions</h3>
                <div className="text-gray-300 leading-relaxed">
                  {mission.instructions || 'No specific instructions provided.'}
                </div>
              </ModernCard>
            </div>
          )}

          {activeTab === 'analytics' && (
            <ModernCard className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Mission Analytics</h3>
              <div className="text-gray-400">
                Analytics data will be available once the mission has participants and submissions.
              </div>
            </ModernCard>
          )}

          {activeTab === 'submissions' && (
            <ModernCard className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Recent Submissions</h3>
              <div className="text-gray-400">
                {mission.submissions && mission.submissions.length > 0 ? (
                  <div className="space-y-4">
                    {mission.submissions.map((submission: any) => (
                      <div key={submission.id} className="border border-gray-700/50 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-white font-medium">User {submission.user}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${submission.status === 'approved'
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : submission.status === 'pending'
                              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}>
                            {submission.status}
                          </span>
                        </div>
                        <div className="text-gray-400 text-sm">
                          Submitted: {new Date(submission.submitted_at).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-4xl mb-4">📝</div>
                    <p>No submissions yet. Be the first to participate!</p>
                  </div>
                )}
              </div>
            </ModernCard>
          )}

          {activeTab === 'participate' && (
            <ModernCard className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Participate in Mission</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Describe how you completed the mission
                  </label>
                  <textarea
                    value={submission}
                    onChange={(e) => setSubmission(e.target.value)}
                    rows={4}
                    className="w-full p-4 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Explain how you completed the mission requirements..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Proof Link (Optional)
                  </label>
                  <input
                    type="url"
                    value={proofLink}
                    onChange={(e) => setProofLink(e.target.value)}
                    className="w-full p-4 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="https://example.com/proof"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Proof File (Optional)
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                    className="w-full p-4 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="agree-terms"
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    className="mt-1 h-4 w-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500 focus:ring-2"
                  />
                  <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-300">
                    I confirm that I have completed this mission according to the requirements and agree to the terms and conditions.
                  </label>
                </div>

                <ModernButton
                  onClick={handleParticipate}
                  variant="primary"
                  className="w-full"
                  loading={participationLoading}
                  disabled={!submission.trim() || !agreeToTerms}
                >
                  {participationLoading ? 'Submitting...' : 'Submit Participation'}
                </ModernButton>
              </div>
            </ModernCard>
          )}
        </div>
      </div>
    </ModernLayout>
  );
}