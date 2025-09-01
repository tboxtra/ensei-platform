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

  // Fix the filter error by ensuring missions is an array
  const missionsArray = Array.isArray(missions) ? missions : [];

  const filteredMissions = missionsArray.filter(mission => {
    if (selectedPlatform !== 'all' && mission.platform !== selectedPlatform) return false;
    if (selectedType !== 'all' && mission.type !== selectedType) return false;
    return true;
  });

  const platforms = [
    { id: 'all', name: 'All Platforms', icon: '🌐' },
    { id: 'twitter', name: 'Twitter/X', icon: '𝕏' },
    { id: 'instagram', name: 'Instagram', icon: '📸' },
    { id: 'tiktok', name: 'TikTok', icon: '🎵' },
    { id: 'facebook', name: 'Facebook', icon: '📘' },
    { id: 'whatsapp', name: 'WhatsApp', icon: '💬' },
    { id: 'snapchat', name: 'Snapchat', icon: '👻' },
    { id: 'telegram', name: 'Telegram', icon: '📱' }
  ];

  const missionTypes = [
    { id: 'all', name: 'All Types', icon: '🎯' },
    { id: 'engage', name: 'Engage', icon: '🎯' },
    { id: 'content', name: 'Content', icon: '✍️' },
    { id: 'ambassador', name: 'Ambassador', icon: '👑' }
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
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <p className="text-red-400 mb-2">Error loading missions</p>
            <p className="text-gray-400 text-sm">{error}</p>
          </div>
        </div>
      </ModernLayout>
    );
  }

  return (
    <ModernLayout currentPage="/missions">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
              Discover & Earn
            </h1>
            <p className="text-gray-400 mt-2">Find missions that match your skills and earn rewards</p>
          </div>
          <ModernButton
            onClick={() => window.location.href = '/missions/create'}
            variant="success"
            size="lg"
          >
            🚀 Create Mission
          </ModernButton>
        </div>

        {/* Filters */}
        <ModernCard title="Filters" icon="🔍" className="mb-8">
          <div className="space-y-6">
            {/* Platform Filter */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Platform</h3>
              <div className="grid grid-cols-4 gap-3">
                {platforms.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => setSelectedPlatform(platform.id)}
                    className={`p-4 rounded-xl text-center transition-all duration-300 transform hover:scale-105 ${selectedPlatform === platform.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700/50'
                      }`}
                  >
                    <div className="text-2xl mb-2">{platform.icon}</div>
                    <div className="text-sm font-medium">{platform.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Mission Type Filter */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Mission Type</h3>
              <div className="grid grid-cols-4 gap-3">
                {missionTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`p-4 rounded-xl text-center transition-all duration-300 transform hover:scale-105 ${selectedType === type.id
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700/50'
                      }`}
                  >
                    <div className="text-2xl mb-2">{type.icon}</div>
                    <div className="text-sm font-medium">{type.name}</div>
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
              Available Missions ({filteredMissions.length})
            </h2>
            <div className="text-sm text-gray-400">
              Showing {filteredMissions.length} of {missionsArray.length} missions
            </div>
          </div>

          {filteredMissions.length === 0 ? (
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMissions.map((mission) => (
                <div
                  key={mission.id}
                  className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 hover:border-green-500/30 transition-all duration-300 transform hover:scale-105 group"
                >
                  {/* Mission Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">
                        {mission.platform === 'twitter' && '𝕏'}
                        {mission.platform === 'instagram' && '📸'}
                        {mission.platform === 'tiktok' && '🎵'}
                        {mission.platform === 'facebook' && '📘'}
                        {mission.platform === 'whatsapp' && '💬'}
                        {mission.platform === 'snapchat' && '👻'}
                        {mission.platform === 'telegram' && '📱'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg group-hover:text-green-400 transition-colors">
                          {mission.title || `${mission.platform} ${mission.type} mission`}
                        </h3>
                        <p className="text-sm text-gray-400 capitalize">
                          {mission.platform} • {mission.type}
                        </p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${mission.model === 'fixed'
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'bg-orange-500/20 text-orange-400'
                      }`}>
                      {mission.model}
                    </div>
                  </div>

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
                    {mission.model === 'fixed' && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Participants:</span>
                        <span className="font-semibold">{(mission as any).cap || 0}</span>
                      </div>
                    )}
                    {mission.model === 'degen' && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Duration:</span>
                        <span className="font-semibold">{(mission as any).duration_hours || 0}h</span>
                      </div>
                    )}
                  </div>

                  {/* Mission Actions */}
                  <div className="flex space-x-3">
                    <ModernButton
                      onClick={() => window.location.href = `/missions/${mission.id}`}
                      variant="primary"
                      size="sm"
                      className="flex-1"
                    >
                      View Details
                    </ModernButton>
                    <ModernButton
                      onClick={() => window.location.href = `/missions/${mission.id}/participate`}
                      variant="success"
                      size="sm"
                      className="flex-1"
                    >
                      Participate
                    </ModernButton>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ModernLayout>
  );
}
