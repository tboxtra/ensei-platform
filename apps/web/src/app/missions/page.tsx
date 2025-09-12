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
    return (
      <ModernLayout currentPage="/missions">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 via-emerald-500 to-blue-500 bg-clip-text text-transparent mb-4">
              Available Missions
            </h1>
            <p className="text-gray-400 text-lg">
              Complete missions to earn rewards and grow your influence
            </p>
          </div>

          {/* Error State */}
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-8 text-center">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-red-400 mb-4">Unable to Load Missions</h2>
            <p className="text-gray-300 mb-6">
              There was an error loading missions from the server. Please try again later.
            </p>
            <ModernButton
              onClick={() => fetchMissions()}
              variant="primary"
              loading={loading}
            >
              Try Again
            </ModernButton>
          </div>
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
              {missionsArray.filter(m => (m as any).model === 'fixed').length}
            </div>
            <div className="text-xs md:text-sm text-gray-400">Fixed Missions</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-lg rounded-2xl p-4 md:p-6 border border-orange-500/30">
            <div className="text-2xl md:text-3xl font-bold text-orange-400 mb-2">
              {missionsArray.filter(m => (m as any).model === 'degen').length}
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
        <div className="mb-8 px-4">
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Platform Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Platform</label>
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  className="w-full p-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {platforms.map(platform => (
                    <option key={platform.id} value={platform.id}>
                      {platform.icon} {platform.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full p-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {missionTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.icon} {type.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Model Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Model</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full p-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {missionModels.map(model => (
                    <option key={model.id} value={model.id}>
                      {model.icon} {model.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="reward">💰 Reward</option>
                  <option value="duration">⏱️ Duration</option>
                  <option value="participants">👥 Participants</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Missions Grid */}
        <div className="px-4">
          {sortedMissions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No Missions Found</h3>
              <p className="text-gray-400">
                Try adjusting your filters to see more missions.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedMissions.map((mission) => (
                <ModernCard key={mission.id} className="p-6 hover:scale-105 transition-transform duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">
                        {platforms.find(p => p.id === mission.platform)?.icon || '🌐'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-lg">{mission.title}</h3>
                        <p className="text-gray-400 text-sm capitalize">{mission.platform} • {mission.type}</p>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${(mission as any).model === 'fixed'
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                      }`}>
                      {(mission as any).model}
                    </div>
                  </div>

                  <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                    {mission.description}
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Reward</span>
                      <span className="text-green-400 font-semibold">
                        {(mission as any).total_cost_honors?.toLocaleString() || 0} Honors
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Duration</span>
                      <span className="text-white">
                        {(mission as any).duration_hours || 0}h
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Participants</span>
                      <span className="text-white">
                        {(mission as any).participants || 0}/{(mission as any).cap || 0}
                      </span>
                    </div>
                  </div>

                  <ModernButton
                    variant="primary"
                    className="w-full"
                    onClick={() => window.location.href = `/missions/${mission.id}`}
                  >
                    View Mission
                  </ModernButton>
                </ModernCard>
              ))}
            </div>
          )}
        </div>
      </div>
    </ModernLayout>
  );
}