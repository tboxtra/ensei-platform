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

  // Load demo mission data if API fails
  const loadDemoMission = () => {
    const demoMission = {
      id: missionId,
      platform: 'twitter',
      type: 'engage',
      model: 'fixed',
      title: 'Twitter Engagement Campaign',
      total_cost_honors: 1000,
      total_cost_usd: 2.22,
      cap: 100,
      participants: 45,
      submissions: 23,
      approved_submissions: 18,
      pending_submissions: 5,
      rejected_submissions: 0,
      completion_rate: 75,
      avg_completion_time: '2.5h',
      tasks: ['like', 'retweet', 'comment'],
      instructions: 'Engage with our latest tweet by liking, retweeting, and leaving a thoughtful comment. Be authentic and constructive in your engagement.',
      tweetLink: 'https://x.com/username/status/123456789',
      isPremium: false,
      status: 'active',
      created_at: '2024-01-15T10:00:00Z',
      ends_at: '2024-12-31T23:59:59Z',
      recent_submissions: [
        { id: '1', user: 'user1', status: 'approved', submitted_at: '2024-01-16T14:30:00Z' },
        { id: '2', user: 'user2', status: 'pending', submitted_at: '2024-01-16T15:45:00Z' },
        { id: '3', user: 'user3', status: 'approved', submitted_at: '2024-01-16T16:20:00Z' }
      ]
    };
    setMission(demoMission);
  };

  const loadMission = async () => {
    try {
      const missionData = await getMission(missionId);
      setMission(missionData);
    } catch (err) {
      console.error('Error loading mission:', err);
      // Load demo data if API fails
      loadDemoMission();
    }
  };

  const handleParticipate = async () => {
    if (!submission.trim()) {
      alert('Please describe how you completed the mission');
      return;
    }
    if (!proofLink.trim() && !proofFile) {
      alert('Please provide either a proof link or upload a file');
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
        proofFile: proofFile ? proofFile.name : undefined
      });

      alert('Participation submitted successfully! Your submission is being reviewed.');
      setActiveTab('overview');
      setSubmission('');
      setProofLink('');
      setProofFile(null);
      setAgreeToTerms(false);

      // Refresh mission data to show updated stats
      loadMission();
    } catch (err) {
      alert('Error submitting participation. Please try again.');
    } finally {
      setParticipationLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert('File size must be less than 10MB');
        return;
      }
      setProofFile(file);
    }
  };

  if (loading) {
    return (
      <ModernLayout currentPage="/missions">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading mission...</p>
          </div>
        </div>
      </ModernLayout>
    );
  }

  if (error || !mission) {
    return (
      <ModernLayout currentPage="/missions">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <p className="text-red-400 mb-2">Error loading mission</p>
            <p className="text-gray-400 text-sm">{error || 'Mission not found'}</p>
          </div>
        </div>
      </ModernLayout>
    );
  }

  const getPlatformIcon = (platform: string) => {
    const icons: { [key: string]: string } = {
      twitter: '𝕏',
      instagram: '📸',
      tiktok: '🎵',
      facebook: '📘',
      whatsapp: '💬',
      snapchat: '👻',
      telegram: '📱'
    };
    return icons[platform] || '🌐';
  };

  const getMissionTypeIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      engage: '🎯',
      content: '✍️',
      ambassador: '👑'
    };
    return icons[type] || '🎯';
  };

  return (
    <ModernLayout currentPage="/missions">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <ModernButton
            onClick={() => window.history.back()}
            variant="secondary"
            size="sm"
          >
            ← Back to Missions
          </ModernButton>
        </div>

        {/* Mission Header */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">
                {getPlatformIcon(mission.platform)}
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {mission.title}
                </h1>
                <div className="flex items-center space-x-4 text-gray-400">
                  <span className="flex items-center space-x-1">
                    <span>{getMissionTypeIcon(mission.type)}</span>
                    <span className="capitalize">{mission.type}</span>
                  </span>
                  <span>•</span>
                  <span className="capitalize">{mission.platform}</span>
                  <span>•</span>
                  <span className="capitalize">{mission.model}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-400 mb-1">
                {mission.total_cost_honors?.toLocaleString()} Honors
              </div>
              <div className="text-gray-400">
                ${mission.total_cost_usd?.toFixed(2)} USD
              </div>
            </div>
          </div>

          {/* Mission Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400 mb-1">
                {mission.participants || 0}
              </div>
              <div className="text-sm text-gray-400">Participants</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">
                {mission.submissions || 0}
              </div>
              <div className="text-sm text-gray-400">Submissions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400 mb-1">
                {mission.tasks?.length || 0}
              </div>
              <div className="text-sm text-gray-400">Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400 mb-1">
                {mission.isPremium ? 'Premium' : 'Standard'}
              </div>
              <div className="text-sm text-gray-400">Tier</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-800/50 rounded-xl p-1">
            {[
              { id: 'overview', name: 'Overview', icon: '📊' },
              { id: 'analytics', name: 'Analytics', icon: '📈' },
              { id: 'submissions', name: 'Submissions', icon: '📝' },
              { id: 'participate', name: 'Participate', icon: '🚀' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'overview' | 'analytics' | 'submissions' | 'participate')}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === tab.id
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Mission Progress */}
              <ModernCard title="Mission Progress" icon="📊">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-2">
                      {mission.participants || 0}/{mission.cap || 0}
                    </div>
                    <div className="text-sm text-gray-400">Participants</div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((mission.participants || 0) / (mission.cap || 1) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400 mb-2">
                      {mission.approved_submissions || 0}
                    </div>
                    <div className="text-sm text-gray-400">Approved</div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((mission.approved_submissions || 0) / (mission.cap || 1) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-400 mb-2">
                      {mission.completion_rate || 0}%
                    </div>
                    <div className="text-sm text-gray-400">Completion Rate</div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${mission.completion_rate || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </ModernCard>

              {/* Tasks */}
              <ModernCard title="Required Tasks" icon="📋">
                <div className="space-y-3">
                  {mission.tasks?.map((task: string, index: number) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-800/30 rounded-lg">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-gray-300 capitalize">{task.replace(/_/g, ' ')}</span>
                    </div>
                  )) || (
                      <p className="text-gray-400">No specific tasks defined</p>
                    )}
                </div>
              </ModernCard>

              {/* Instructions */}
              <ModernCard title="Mission Instructions" icon="📝">
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 leading-relaxed">
                    {mission.instructions || 'Follow the platform-specific guidelines and complete the required tasks to earn your reward.'}
                  </p>
                </div>
              </ModernCard>

              {/* Custom Mission Information */}
              {mission.platform === 'custom' && mission.customSpec && (
                <ModernCard title="Custom Mission Details" icon="⚡">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-400">Custom Title:</span>
                        <p className="text-white">{mission.customSpec.customTitle}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-400">Completion Time:</span>
                        <p className="text-white">{mission.customSpec.avgTimeMinutes} minutes</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-400">Proof Mode:</span>
                        <p className="text-white capitalize">{mission.customSpec.proofMode}</p>
                      </div>
                      {mission.customSpec.apiVerifierKey && (
                        <div>
                          <span className="text-sm font-medium text-gray-400">API Verifier:</span>
                          <p className="text-white">{mission.customSpec.apiVerifierKey}</p>
                        </div>
                      )}
                    </div>
                    {mission.customSpec.customDescription && (
                      <div>
                        <span className="text-sm font-medium text-gray-400">Description:</span>
                        <p className="text-white">{mission.customSpec.customDescription}</p>
                      </div>
                    )}
                  </div>
                </ModernCard>
              )}

              {/* Content Link */}
              {(mission.tweetLink || mission.contentLink) && (
                <ModernCard title="Content Link" icon="🔗">
                  <div className="space-y-3">
                    <a
                      href={mission.tweetLink || mission.contentLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 break-all"
                    >
                      {mission.tweetLink || mission.contentLink}
                    </a>
                    <p className="text-sm text-gray-400">
                      {mission.platform === 'custom'
                        ? 'Click the link above to access the custom content you need to engage with.'
                        : 'Click the link above to view the content you need to engage with.'
                      }
                    </p>
                  </div>
                </ModernCard>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ModernCard className="p-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-2">
                      {mission.participants || 0}
                    </div>
                    <div className="text-sm text-gray-400">Total Participants</div>
                  </div>
                </ModernCard>
                <ModernCard className="p-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400 mb-2">
                      {mission.approved_submissions || 0}
                    </div>
                    <div className="text-sm text-gray-400">Approved Submissions</div>
                  </div>
                </ModernCard>
                <ModernCard className="p-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-400 mb-2">
                      {mission.pending_submissions || 0}
                    </div>
                    <div className="text-sm text-gray-400">Pending Review</div>
                  </div>
                </ModernCard>
                <ModernCard className="p-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-400 mb-2">
                      {mission.rejected_submissions || 0}
                    </div>
                    <div className="text-sm text-gray-400">Rejected</div>
                  </div>
                </ModernCard>
              </div>

              {/* Detailed Analytics */}
              <ModernCard title="Mission Analytics" icon="📈">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                      <div className="text-2xl font-bold text-emerald-400 mb-2">
                        {mission.completion_rate || 0}%
                      </div>
                      <div className="text-sm text-gray-400">Completion Rate</div>
                    </div>
                    <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                      <div className="text-2xl font-bold text-blue-400 mb-2">
                        {mission.avg_completion_time || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-400">Avg. Completion Time</div>
                    </div>
                    <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                      <div className="text-2xl font-bold text-purple-400 mb-2">
                        ${mission.total_cost_usd?.toFixed(2) || '0.00'}
                      </div>
                      <div className="text-sm text-gray-400">Total Spent</div>
                    </div>
                  </div>

                  {/* Submission Timeline */}
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-4">Recent Activity</h4>
                    <div className="space-y-3">
                      {mission.recent_submissions?.slice(0, 5).map((sub: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${sub.status === 'approved' ? 'bg-green-400' :
                              sub.status === 'pending' ? 'bg-yellow-400' :
                                'bg-red-400'
                              }`}></div>
                            <span className="text-gray-300">{sub.user}</span>
                          </div>
                          <div className="text-sm text-gray-400">
                            {new Date(sub.submitted_at).toLocaleDateString()}
                          </div>
                        </div>
                      )) || (
                          <p className="text-gray-400 text-center py-4">No recent activity</p>
                        )}
                    </div>
                  </div>
                </div>
              </ModernCard>
            </div>
          )}

          {activeTab === 'submissions' && (
            <div className="space-y-6">
              <ModernCard title="All Submissions" icon="📝">
                <div className="space-y-4">
                  {mission.recent_submissions?.map((sub: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-4 h-4 rounded-full ${sub.status === 'approved' ? 'bg-green-400' :
                          sub.status === 'pending' ? 'bg-yellow-400' :
                            'bg-red-400'
                          }`}></div>
                        <div>
                          <div className="font-semibold text-white">{sub.user}</div>
                          <div className="text-sm text-gray-400">
                            Submitted {new Date(sub.submitted_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${sub.status === 'approved' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                          sub.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                            'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}>
                          {sub.status}
                        </span>
                        <ModernButton variant="secondary" size="sm">
                          View
                        </ModernButton>
                      </div>
                    </div>
                  )) || (
                      <p className="text-gray-400 text-center py-8">No submissions yet</p>
                    )}
                </div>
              </ModernCard>
            </div>
          )}

          {activeTab === 'participate' && (
            <div className="space-y-6">
              {/* Participation Form */}
              <ModernCard title="Submit Your Participation" icon="📤">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white">Your Submission *</label>
                    <textarea
                      value={submission}
                      onChange={(e) => setSubmission(e.target.value)}
                      rows={6}
                      className="w-full p-4 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                      placeholder="Describe in detail how you completed the required tasks. Be specific about what you did, when you did it, and how it meets the mission requirements..."
                    />
                    <p className="text-xs text-gray-400 mt-2">
                      Provide a clear, detailed description of how you completed the mission tasks.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-white">Proof Link</label>
                    <input
                      type="url"
                      value={proofLink}
                      onChange={(e) => setProofLink(e.target.value)}
                      className="w-full p-4 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="https://example.com/proof-of-completion"
                    />
                    <p className="text-xs text-gray-400 mt-2">
                      Provide a direct link to your completed work (e.g., tweet, post, profile, etc.)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-white">Upload Proof File</label>
                    <div className="border-2 border-dashed border-gray-600 rounded-xl p-6 text-center hover:border-green-500 transition-colors">
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept="image/*,.pdf,.doc,.docx"
                        className="hidden"
                        id="proof-file"
                      />
                      <label htmlFor="proof-file" className="cursor-pointer">
                        <div className="text-4xl mb-4">📎</div>
                        <div className="text-white font-medium mb-2">
                          {proofFile ? proofFile.name : 'Click to upload or drag and drop'}
                        </div>
                        <div className="text-gray-400 text-sm">
                          PNG, JPG, PDF, DOC up to 10MB
                        </div>
                      </label>
                    </div>
                    {proofFile && (
                      <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-green-400 text-sm">{proofFile.name}</span>
                          <button
                            onClick={() => setProofFile(null)}
                            className="text-red-400 hover:text-red-300"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="agree-terms"
                        checked={agreeToTerms}
                        onChange={(e) => setAgreeToTerms(e.target.checked)}
                        className="mt-1 w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500 focus:ring-2"
                      />
                      <label htmlFor="agree-terms" className="text-sm text-yellow-300">
                        I confirm that I have completed this mission according to the requirements and agree to the terms and conditions.
                        I understand that false submissions may result in account suspension.
                      </label>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <ModernButton
                      onClick={handleParticipate}
                      variant="success"
                      size="lg"
                      loading={participationLoading}
                      className="flex-1"
                    >
                      {participationLoading ? 'Submitting...' : 'Submit Participation'}
                    </ModernButton>
                  </div>
                </div>
              </ModernCard>

              {/* Submission Guidelines */}
              <ModernCard title="Submission Guidelines" icon="📖">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-green-400 mb-3">✅ Do's</h4>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li>• Complete all required tasks thoroughly</li>
                      <li>• Provide clear, accessible proof links</li>
                      <li>• Be honest about your completion</li>
                      <li>• Follow platform guidelines</li>
                      <li>• Submit within the mission timeframe</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-400 mb-3">❌ Don'ts</h4>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li>• Submit incomplete or fake work</li>
                      <li>• Use private or inaccessible links</li>
                      <li>• Violate platform terms of service</li>
                      <li>• Submit after the deadline</li>
                      <li>• Provide misleading information</li>
                    </ul>
                  </div>
                </div>
              </ModernCard>
            </div>
          )}
        </div>
      </div>
    </ModernLayout>
  );
}
