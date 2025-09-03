'use client';

import { useState, useEffect } from 'react';
import { useMissions } from '../../hooks/useApi';
import { ModernLayout } from '../../components/layout/ModernLayout';
import { ModernCard } from '../../components/ui/ModernCard';
import { ModernButton } from '../../components/ui/ModernButton';

export default function MissionsPage() {
  const { missions, fetchMissions, loading, error } = useMissions();

  useEffect(() => {
    fetchMissions();
  }, [fetchMissions]);

  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedModel, setSelectedModel] = useState('all');
  const [sortBy, setSortBy] = useState('reward'); // reward, duration, participants

  // Fix the filter error by ensuring missions is an array
  const missionsArray = Array.isArray(missions) ? missions : [];

  const filteredMissions = missionsArray.filter(mission => {
    if (selectedPlatform !== 'all' && mission.platform !== selectedPlatform) return false;
    if (selectedType !== 'all' && mission.type !== selectedType) return false;
    if (selectedModel !== 'all' && mission.model !== selectedModel) return false;
    return true;
  });

  // Sort missions
  const sortedMissions = [...filteredMissions].sort((a, b) => {
    switch (sortBy) {
      case 'reward':
        return ((b as any).total_cost_honors || 0) - ((a as any).total_cost_honors || 0);
      case 'duration':
        return ((a as any).duration_hours || 0) - ((b as any).duration_hours || 0);
      case 'participants':
        return ((b as any).cap || 0) - ((a as any).cap || 0);
      default:
        return 0;
    }
  });

  const platforms = [
    { id: 'all', name: 'All Platforms', icon: '🌐', color: 'from-gray-500 to-gray-600' },
    { id: 'twitter', name: 'Twitter/X', icon: '𝕏', color: 'from-blue-500 to-blue-600' },
    { id: 'instagram', name: 'Instagram', icon: '📸', color: 'from-pink-500 to-purple-600' },
    { id: 'tiktok', name: 'TikTok', icon: '🎵', color: 'from-black to-gray-800' },
    { id: 'facebook', name: 'Facebook', icon: '📘', color: 'from-blue-600 to-blue-700' },
    { id: 'whatsapp', name: 'WhatsApp', icon: '💬', color: 'from-green-500 to-green-600' },
    { id: 'snapchat', name: 'Snapchat', icon: '👻', color: 'from-yellow-400 to-orange-500' },
    { id: 'telegram', name: 'Telegram', icon: '📱', color: 'from-blue-400 to-blue-500' },
    { id: 'custom', name: 'Custom', icon: '⚡', color: 'from-purple-500 to-indigo-600' }
  ];

  const missionTypes = [
    { id: 'all', name: 'All Types', icon: '🎯', color: 'from-gray-500 to-gray-600' },
    { id: 'engage', name: 'Engage', icon: '🎯', color: 'from-blue-500 to-purple-600' },
    { id: 'content', name: 'Content', icon: '✍️', color: 'from-green-500 to-emerald-600' },
    { id: 'ambassador', name: 'Ambassador', icon: '👑', color: 'from-yellow-500 to-orange-600' }
  ];

  const missionModels = [
    { id: 'all', name: 'All Models', icon: '📊', color: 'from-gray-500 to-gray-600' },
    { id: 'fixed', name: 'Fixed', icon: '📊', color: 'from-purple-500 to-indigo-600' },
    { id: 'degen', name: 'Degen', icon: '⚡', color: 'from-orange-500 to-red-600' }
  ];

  const apiAvailable = !loading && !error;

  if (loading) {
    return (
      <ModernLayout currentPage="/missions">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading missions...</p>
          </div>
        </div>
      </ModernLayout>
    );
  }

  if (error) {
    // For demo purposes, show sample missions when API is not available
    const demoMissions = [
      // Twitter Missions - Real Business Use Cases
      {
        id: '1',
        platform: 'twitter',
        type: 'engage',
        model: 'fixed',
        title: 'Boost Our Product Launch Tweet',
        description: 'Help us reach 10K+ impressions on our new AI tool launch. Like, retweet, and comment with your thoughts on how AI can improve productivity.',
        total_cost_honors: 2400,
        total_cost_usd: 5.33,
        cap: 200,
        duration_hours: 48,
        isPremium: false,
        tasks: ['like', 'retweet', 'comment'],
        reward_per_user: 12
      },
      {
        id: '2',
        platform: 'twitter',
        type: 'content',
        model: 'degen',
        title: 'Create Viral AI Thread',
        description: 'Write an engaging thread explaining how AI is transforming your industry. Best threads get featured on our company page.',
        total_cost_honors: 5000,
        total_cost_usd: 11.11,
        winners_cap: 10,
        duration_hours: 72,
        isPremium: true,
        tasks: ['thread'],
        reward_per_user: 500
      },
      {
        id: '3',
        platform: 'twitter',
        type: 'ambassador',
        model: 'fixed',
        title: 'Become Our AI Advocate',
        description: 'Update your bio with #AIProductivity and pin our latest AI tool tweet. Show your network you\'re ahead of the curve.',
        total_cost_honors: 1800,
        total_cost_usd: 4.00,
        cap: 100,
        duration_hours: 96,
        isPremium: false,
        tasks: ['name_bio_keywords', 'pinned_tweet'],
        reward_per_user: 18
      },

      // Instagram Missions - Brand Awareness & Sales
      {
        id: '4',
        platform: 'instagram',
        type: 'engage',
        model: 'fixed',
        title: 'Spread Our Success Story',
        description: 'Share our customer success story in your stories. Tag us and use #CustomerSuccess to help others discover our solutions.',
        total_cost_honors: 1200,
        total_cost_usd: 2.67,
        cap: 150,
        duration_hours: 36,
        isPremium: false,
        tasks: ['story_repost', 'like'],
        reward_per_user: 8
      },
      {
        id: '5',
        platform: 'instagram',
        type: 'content',
        model: 'degen',
        title: 'Create Product Showcase Reel',
        description: 'Make a 15-30 second reel showcasing how our AI tool solves real problems. Use trending audio and creative transitions.',
        total_cost_honors: 6000,
        total_cost_usd: 13.33,
        winners_cap: 12,
        duration_hours: 96,
        isPremium: true,
        tasks: ['reel'],
        reward_per_user: 500
      },
      {
        id: '6',
        platform: 'instagram',
        type: 'ambassador',
        model: 'fixed',
        title: 'Join Our Brand Family',
        description: 'Add our branded hashtag #AIProductivity to your bio and create a highlight story featuring our products.',
        total_cost_honors: 1500,
        total_cost_usd: 3.33,
        cap: 80,
        duration_hours: 72,
        isPremium: false,
        tasks: ['hashtag_in_bio', 'story_highlight'],
        reward_per_user: 18.75
      },

      // TikTok Missions - Viral Content & Trends
      {
        id: '7',
        platform: 'tiktok',
        type: 'engage',
        model: 'fixed',
        title: 'Duet Our AI Demo',
        description: 'Create a duet with our AI tool demonstration video. Show your reaction and explain why it\'s useful for your work.',
        total_cost_honors: 2000,
        total_cost_usd: 4.44,
        cap: 120,
        duration_hours: 48,
        isPremium: false,
        tasks: ['repost_duet', 'comment'],
        reward_per_user: 16.67
      },
      {
        id: '8',
        platform: 'tiktok',
        type: 'content',
        model: 'degen',
        title: 'TikTok Product Review Challenge',
        description: 'Create an honest, entertaining review of our AI tool. Show before/after scenarios and use popular TikTok trends.',
        total_cost_honors: 8000,
        total_cost_usd: 17.78,
        winners_cap: 15,
        duration_hours: 120,
        isPremium: true,
        tasks: ['product_review'],
        reward_per_user: 533.33
      },

      // Facebook Missions - Community Building
      {
        id: '9',
        platform: 'facebook',
        type: 'engage',
        model: 'fixed',
        title: 'Share in Tech Groups',
        description: 'Share our AI productivity guide in relevant Facebook groups. Start discussions about AI adoption in your industry.',
        total_cost_honors: 1600,
        total_cost_usd: 3.56,
        cap: 100,
        duration_hours: 48,
        isPremium: false,
        tasks: ['share_post', 'comment'],
        reward_per_user: 16
      },
      {
        id: '10',
        platform: 'facebook',
        type: 'content',
        model: 'degen',
        title: 'Create Educational Video',
        description: 'Make a 3-5 minute video explaining how AI tools can boost productivity. Share your personal experience and tips.',
        total_cost_honors: 4000,
        total_cost_usd: 8.89,
        winners_cap: 10,
        duration_hours: 96,
        isPremium: false,
        tasks: ['video'],
        reward_per_user: 400
      },

      // WhatsApp Missions - Direct Engagement
      {
        id: '11',
        platform: 'whatsapp',
        type: 'engage',
        model: 'fixed',
        title: 'WhatsApp Status Challenge',
        description: 'Share our AI tool announcement in your WhatsApp status. Get 50+ views to show your network is engaged.',
        total_cost_honors: 800,
        total_cost_usd: 1.78,
        cap: 200,
        duration_hours: 72,
        isPremium: false,
        tasks: ['status_50_views'],
        reward_per_user: 4
      },

      // Snapchat Missions - Creative Content
      {
        id: '12',
        platform: 'snapchat',
        type: 'content',
        model: 'degen',
        title: 'Snapchat AI Lens Challenge',
        description: 'Use our custom AI-themed lens in your snaps. Create fun, creative content that showcases AI possibilities.',
        total_cost_honors: 3000,
        total_cost_usd: 6.67,
        winners_cap: 20,
        duration_hours: 48,
        isPremium: false,
        tasks: ['branded_lens'],
        reward_per_user: 150
      },

      // Telegram Missions - Community & Education
      {
        id: '13',
        platform: 'telegram',
        type: 'engage',
        model: 'fixed',
        title: 'Join Our AI Community',
        description: 'Join our Telegram channel and actively participate. React to posts and share your AI insights with the community.',
        total_cost_honors: 600,
        total_cost_usd: 1.33,
        cap: 300,
        duration_hours: 48,
        isPremium: false,
        tasks: ['join_channel', 'react_to_post'],
        reward_per_user: 2
      },
      {
        id: '14',
        platform: 'telegram',
        type: 'content',
        model: 'degen',
        title: 'Create AI Learning Guide',
        description: 'Write a comprehensive guide thread about AI productivity tools. Help others understand how to implement AI in their workflow.',
        total_cost_honors: 4000,
        total_cost_usd: 8.89,
        winners_cap: 12,
        duration_hours: 96,
        isPremium: false,
        tasks: ['guide_thread'],
        reward_per_user: 333.33
      },

      // Custom Platform Missions - Real Business Applications
      {
        id: '15',
        platform: 'custom',
        type: 'content',
        model: 'fixed',
        title: 'Website UX Testing',
        description: 'Test our new AI tool website and provide detailed feedback on user experience, navigation, and feature discovery.',
        total_cost_honors: 2400,
        total_cost_usd: 5.33,
        cap: 100,
        duration_hours: 72,
        isPremium: false,
        tasks: ['custom_task'],
        reward_per_user: 24,
        customSpec: {
          customTitle: 'Website UX Testing',
          avgTimeMinutes: 45,
          proofMode: 'api',
          apiVerifierKey: 'website_visit'
        }
      },
      {
        id: '16',
        platform: 'custom',
        type: 'content',
        model: 'degen',
        title: 'Mobile App Beta Testing',
        description: 'Test our AI productivity app on your device. Complete key user journeys and report any bugs or improvement suggestions.',
        total_cost_honors: 6000,
        total_cost_usd: 13.33,
        winners_cap: 15,
        duration_hours: 168,
        isPremium: true,
        tasks: ['custom_task'],
        reward_per_user: 400,
        customSpec: {
          customTitle: 'Mobile App Beta Testing',
          avgTimeMinutes: 90,
          proofMode: 'api',
          apiVerifierKey: 'http_ping'
        }
      }
    ];

    return (
      <ModernLayout currentPage="/missions">
        <div className="max-w-7xl mx-auto">
          {/* Hero Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-green-400 via-emerald-500 to-blue-500 bg-clip-text text-transparent mb-4">
              Discover & Earn
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Find missions that match your skills, complete tasks, and earn rewards across all major social media platforms
            </p>
            <div className="flex items-center justify-center space-x-4 mt-6">
              <div className="flex items-center space-x-2 text-green-400">
                <span className="text-2xl">💰</span>
                <span className="font-semibold">Earn Honors</span>
              </div>
              <div className="w-px h-6 bg-gray-600"></div>
              <div className="flex items-center space-x-2 text-blue-400">
                <span className="text-2xl">🌐</span>
                <span className="font-semibold">8 Platforms</span>
              </div>
              <div className="w-px h-6 bg-gray-600"></div>
              <div className="flex items-center space-x-2 text-purple-400">
                <span className="text-2xl">⚡</span>
                <span className="font-semibold">Instant Rewards</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-lg rounded-2xl p-6 border border-green-500/30">
              <div className="text-3xl font-bold text-green-400 mb-2">
                {demoMissions.length}
              </div>
              <div className="text-sm text-gray-400">Active Missions</div>
            </div>
            <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/30">
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {demoMissions.filter(m => m.model === 'fixed').length}
              </div>
              <div className="text-sm text-gray-400">Fixed Missions</div>
            </div>
            <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-lg rounded-2xl p-6 border border-orange-500/30">
              <div className="text-3xl font-bold text-orange-400 mb-2">
                {demoMissions.filter(m => m.model === 'degen').length}
              </div>
              <div className="text-sm text-gray-400">Degen Missions</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30">
              <div className="text-3xl font-bold text-purple-400 mb-2">
                {demoMissions.reduce((total, m) => total + (m.total_cost_honors || 0), 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Total Rewards</div>
            </div>
          </div>

          {/* Demo Notice */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-8">
            <div className="flex items-center space-x-2 text-yellow-400">
              <span className="text-xl">⚠️</span>
              <span className="font-semibold">Demo Mode</span>
            </div>
            <p className="text-sm text-yellow-300 mt-2">
              This is a demo showing sample missions. In production, real missions will be loaded from the API.
            </p>
          </div>

          {/* Continue with the rest of the page using demoMissions instead of sortedMissions */}
          {/* ... rest of the component logic ... */}
        </div>
      </ModernLayout>
    );
  }

  return (
    <ModernLayout currentPage="/missions">
      <div className="max-w-7xl mx-auto">
        {/* Hero Header */}
        <div className="text-center mb-6 md:mb-8 lg:mb-12 px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-green-400 via-emerald-500 to-blue-500 bg-clip-text text-transparent mb-3 md:mb-4">
            Discover & Earn
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Find missions that match your skills, complete tasks, and earn rewards across all major social media platforms
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 mt-4 md:mt-6">
            <div className="flex items-center space-x-2 text-green-400">
              <span className="text-lg sm:text-xl md:text-2xl">💰</span>
              <span className="font-semibold text-xs sm:text-sm md:text-base">Earn Honors</span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-gray-600"></div>
            <div className="flex items-center space-x-2 text-blue-400">
              <span className="text-lg sm:text-xl md:text-2xl">🌐</span>
              <span className="font-semibold text-xs sm:text-sm md:text-base">8 Platforms</span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-gray-600"></div>
            <div className="flex items-center space-x-2 text-purple-400">
              <span className="text-lg sm:text-xl md:text-2xl">⚡</span>
              <span className="font-semibold text-xs sm:text-sm md:text-base">Instant Rewards</span>
            </div>
          </div>
        </div>

        {/* API Status Indicator */}
        {!apiAvailable && (
          <div className="mb-6 px-4">
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-2xl p-4">
              <div className="flex items-center space-x-3">
                <span className="text-xl">⚠️</span>
                <div>
                  <h3 className="text-base font-semibold text-yellow-400 mb-1">Demo Mode</h3>
                  <p className="text-yellow-200 text-sm">
                    Backend service is not available. Showing sample missions for demonstration.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-lg rounded-2xl p-4 md:p-6 border border-green-500/30">
            <div className="text-2xl md:text-3xl font-bold text-green-400 mb-2">
              {missionsArray.length}
            </div>
            <div className="text-xs md:text-sm text-gray-400">Active Missions</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-lg rounded-2xl p-4 md:p-6 border border-blue-500/30">
            <div className="text-2xl md:text-3xl font-bold text-blue-400 mb-2">
              {missionsArray.filter(m => m.model === 'fixed').length}
            </div>
            <div className="text-xs md:text-sm text-gray-400">Fixed Missions</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-lg rounded-2xl p-4 md:p-6 border border-orange-500/30">
            <div className="text-2xl md:text-3xl font-bold text-orange-400 mb-2">
              {missionsArray.filter(m => m.model === 'degen').length}
            </div>
            <div className="text-xs md:text-sm text-gray-400">Degen Missions</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 backdrop-blur-lg rounded-2xl p-4 md:p-6 border border-purple-500/30">
            <div className="text-2xl md:text-3xl font-bold text-purple-400 mb-2">
              {missionsArray.reduce((total, m) => total + ((m as any).total_cost_honors || 0), 0).toLocaleString()}
            </div>
            <div className="text-xs md:text-sm text-gray-400">Total Rewards</div>
          </div>
        </div>

        {/* Filters */}
        <ModernCard title="Smart Filters" icon="🔍" className="mb-8">
          <div className="space-y-6">
            {/* Platform Filter */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <span className="mr-2">🌐</span>
                Platform
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {platforms.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => setSelectedPlatform(platform.id)}
                    className={`p-3 md:p-4 rounded-xl text-center transition-all duration-300 transform hover:scale-105 ${selectedPlatform === platform.id
                      ? `bg-gradient-to-br ${platform.color} text-white shadow-lg`
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700/50'
                      }`}
                  >
                    <div className="text-xl md:text-2xl mb-2">{platform.icon}</div>
                    <div className="text-xs md:text-sm font-medium">{platform.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Mission Type Filter */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <span className="mr-2">🎯</span>
                Mission Type
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {missionTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`p-3 md:p-4 rounded-xl text-center transition-all duration-300 transform hover:scale-105 ${selectedType === type.id
                      ? `bg-gradient-to-br ${type.color} text-white shadow-lg`
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700/50'
                      }`}
                  >
                    <div className="text-xl md:text-2xl mb-2">{type.icon}</div>
                    <div className="text-xs md:text-sm font-medium">{type.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Mission Model Filter */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <span className="mr-2">⚙️</span>
                Mission Model
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {missionModels.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    className={`p-3 md:p-4 rounded-xl text-center transition-all duration-300 transform hover:scale-105 ${selectedModel === model.id
                      ? `bg-gradient-to-br ${model.color} text-white shadow-lg`
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700/50'
                      }`}
                  >
                    <div className="text-xl md:text-2xl mb-2">{model.icon}</div>
                    <div className="text-xs md:text-sm font-medium">{model.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <span className="mr-2">📊</span>
                Sort By
              </h3>
              <div className="flex flex-wrap gap-3">
                {[
                  { id: 'reward', name: 'Highest Reward', icon: '💰' },
                  { id: 'duration', name: 'Quickest', icon: '⚡' },
                  { id: 'participants', name: 'Most Popular', icon: '👥' }
                ].map((sort) => (
                  <button
                    key={sort.id}
                    onClick={() => setSortBy(sort.id)}
                    className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm transition-all duration-300 ${sortBy === sort.id
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700/50'
                      }`}
                  >
                    <span className="mr-2">{sort.icon}</span>
                    {sort.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </ModernCard>

        {/* Missions Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              Available Missions ({sortedMissions.length})
            </h2>
            <div className="text-sm text-gray-400">
              Showing {sortedMissions.length} of {missionsArray.length} missions
            </div>
          </div>

          {sortedMissions.length === 0 ? (
            <ModernCard className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">No missions found</h3>
              <p className="text-gray-400 mb-6">
                Try adjusting your filters or create a new mission
              </p>
              <ModernButton
                onClick={() => window.location.href = '/missions/create'}
                variant="primary"
              >
                Create First Mission
              </ModernButton>
            </ModernCard>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {sortedMissions.map((mission) => (
                <div
                  key={mission.id}
                  className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-2xl p-3 sm:p-4 md:p-6 border border-gray-700/50 hover:border-green-500/30 transition-all duration-300 transform hover:scale-105 group cursor-pointer"
                  onClick={() => window.location.href = `/missions/${mission.id}`}
                >
                  {/* Mission Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-2 sm:space-x-3 flex-1 min-w-0">
                      <div className="text-xl sm:text-2xl flex-shrink-0">
                        {mission.platform === 'twitter' && '𝕏'}
                        {mission.platform === 'instagram' && '📸'}
                        {mission.platform === 'tiktok' && '🎵'}
                        {mission.platform === 'facebook' && '📘'}
                        {mission.platform === 'whatsapp' && '💬'}
                        {mission.platform === 'snapchat' && '👻'}
                        {mission.platform === 'telegram' && '📱'}
                        {mission.platform === 'custom' && '⚡'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm sm:text-base md:text-lg group-hover:text-green-400 transition-colors leading-tight">
                          {mission.title || `${mission.platform} ${mission.type} mission`}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-400 capitalize">
                          {mission.platform} • {mission.type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                      <div className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${mission.model === 'fixed'
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                        }`}>
                        {mission.model}
                      </div>
                      {(mission as any).isPremium && (
                        <div className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full border border-yellow-500/30">
                          👑
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mission Description */}
                  {(mission as any).description && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {(mission as any).description}
                      </p>
                    </div>
                  )}

                  {/* Mission Tasks */}
                  {(mission as any).tasks && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {(mission as any).tasks.map((task: string, index: number) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full border border-blue-500/30"
                          >
                            {task.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mission Details */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Reward:</span>
                      <span className="font-semibold text-green-400">
                        {(mission as any).total_cost_honors?.toLocaleString() || '0'} Honors
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">USD Value:</span>
                      <span className="font-semibold">
                        ${(mission as any).total_cost_usd?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                    {(mission as any).reward_per_user && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Per User:</span>
                        <span className="font-semibold text-blue-400">
                          {(mission as any).reward_per_user?.toFixed(1) || '0'} Honors
                        </span>
                      </div>
                    )}
                    {mission.model === 'fixed' && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Participants:</span>
                        <span className="font-semibold">{(mission as any).cap || 0}</span>
                      </div>
                    )}
                    {mission.model === 'degen' && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Duration:</span>
                          <span className="font-semibold">{(mission as any).duration_hours || 0}h</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Winners:</span>
                          <span className="font-semibold text-orange-400">{(mission as any).winners_cap || 0}</span>
                        </div>
                      </>
                    )}
                    {mission.platform === 'custom' && (mission as any).customSpec && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Time:</span>
                        <span className="font-semibold text-purple-400">
                          {(mission as any).customSpec.avgTimeMinutes || 0} min
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Mission Actions */}
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3" onClick={(e) => e.stopPropagation()}>
                    <ModernButton
                      onClick={() => window.location.href = `/missions/${mission.id}`}
                      variant="primary"
                      size="sm"
                      className="flex-1"
                    >
                      <span className="hidden sm:inline">View Details</span>
                      <span className="sm:hidden">Details</span>
                    </ModernButton>
                    <ModernButton
                      onClick={() => window.location.href = `/missions/${mission.id}/participate`}
                      variant="success"
                      size="sm"
                      className="flex-1"
                    >
                      <span className="hidden sm:inline">Participate</span>
                      <span className="sm:hidden">Join</span>
                    </ModernButton>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Task Submission Examples */}
        <div className="mt-12">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">How Task Submissions Work</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Twitter Example */}
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/30">
              <div className="text-3xl mb-4">𝕏</div>
              <h3 className="text-xl font-semibold text-white mb-3">Twitter Engagement</h3>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  <span>Like the target post</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  <span>Retweet with comment</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  <span>Submit proof links</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-black/30 rounded-lg">
                <div className="text-xs text-gray-400 mb-1">Example Proof:</div>
                <div className="text-blue-400 text-sm">https://twitter.com/user/status/123...</div>
              </div>
            </div>

            {/* Instagram Example */}
            <div className="bg-gradient-to-br from-pink-500/20 to-purple-600/20 backdrop-blur-lg rounded-2xl p-6 border border-pink-500/30">
              <div className="text-3xl mb-4">📸</div>
              <h3 className="text-xl font-semibold text-white mb-3">Instagram Content</h3>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-pink-400 rounded-full"></span>
                  <span>Create engaging reel</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-pink-400 rounded-full"></span>
                  <span>Use required hashtags</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-pink-400 rounded-full"></span>
                  <span>Submit post URL</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-black/30 rounded-lg">
                <div className="text-xs text-gray-400 mb-1">Example Proof:</div>
                <div className="text-pink-400 text-sm">https://instagram.com/p/ABC123...</div>
              </div>
            </div>

            {/* Custom Platform Example */}
            <div className="bg-gradient-to-br from-purple-500/20 to-indigo-600/20 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30">
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold text-white mb-3">Custom Platform</h3>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                  <span>Complete custom task</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                  <span>Provide required proof</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                  <span>Submit for review</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-black/30 rounded-lg">
                <div className="text-xs text-gray-400 mb-1">Example Proof:</div>
                <div className="text-purple-400 text-sm">Website visit, API verification, etc.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Features Overview */}
        <div className="mt-12">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Platform Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-lg rounded-2xl p-6 border border-green-500/30 text-center">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-lg font-semibold text-white mb-2">Instant Rewards</h3>
              <p className="text-sm text-gray-300">Get paid immediately after task approval</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/30 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-white mb-2">Easy Verification</h3>
              <p className="text-sm text-gray-300">Simple proof submission process</p>
            </div>
            <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-lg rounded-2xl p-6 border border-orange-500/30 text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-lg font-semibold text-white mb-2">Fast Processing</h3>
              <p className="text-sm text-gray-300">Quick review and approval system</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30 text-center">
              <div className="text-4xl mb-4">🌐</div>
              <h3 className="text-lg font-semibold text-white mb-2">Multi-Platform</h3>
              <p className="text-sm text-gray-300">Work across all major social networks</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center py-12">
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-lg rounded-2xl p-8 border border-green-500/30">
            <h3 className="text-2xl font-bold mb-4">Ready to Start Earning?</h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Join thousands of users who are already earning rewards by completing social media missions.
              Start with simple tasks and work your way up to bigger rewards!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <ModernButton
                onClick={() => window.location.href = '/missions/create'}
                variant="success"
                size="lg"
              >
                🚀 Create Mission
              </ModernButton>
              <ModernButton
                onClick={() => window.location.href = '/dashboard'}
                variant="primary"
                size="lg"
              >
                📊 View Dashboard
              </ModernButton>
            </div>
          </div>
        </div>
      </div>
    </ModernLayout>
  );
}
