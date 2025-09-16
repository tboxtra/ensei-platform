'use client';

import { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { ModernLayout } from '../../components/layout/ModernLayout';
import { ModernCard } from '../../components/ui/ModernCard';
import { ModernButton } from '../../components/ui/ModernButton';
import { CompactMissionCard } from '../../components/ui/CompactMissionCard';
import { FilterBar } from '../../components/ui/FilterBar';
import { StatsCard } from '../../components/ui/StatsCard';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';

export default function MissionsPage() {
  const { getMissions, participateInMission, completeTask, loading, error } = useApi();
  const [missions, setMissions] = useState<any[]>([]);

  useEffect(() => {
    const loadMissions = async () => {
      try {
        console.log('MissionsPage: Starting to fetch missions...');
        const missionsData = await getMissions();
        console.log('MissionsPage: Fetched missions:', missionsData?.length || 0);
        console.log('Sample mission data:', missionsData?.[0]);
        setMissions(Array.isArray(missionsData) ? missionsData : []);
      } catch (err) {
        console.error('MissionsPage: Failed to fetch missions:', err);
        // Use mock data for testing
        const mockMissions = [
          {
            id: 'mock-1',
            platform: 'twitter',
            mission_type: 'engage',
            type: 'engage',
            model: 'fixed',
            title: 'Twitter Engage Mission',
            description: 'Engage with our Twitter content',
            tasks: ['like', 'retweet', 'comment'],
            tweetLink: 'https://twitter.com/example/status/1234567890',
            participants_count: 5,
            max_participants: 10,
            total_cost_honors: 500,
            status: 'active',
            created_at: new Date().toISOString()
          },
          {
            id: 'mock-2',
            platform: 'instagram',
            mission_type: 'content',
            type: 'content',
            model: 'degen',
            title: 'Instagram Content Mission',
            description: 'Create amazing Instagram content',
            tasks: ['meme', 'reel'],
            contentLink: 'https://instagram.com/p/example',
            participants_count: 3,
            max_participants: 5,
            total_cost_honors: 800,
            status: 'active',
            deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date().toISOString()
          }
        ];
        console.log('Using mock missions for testing');
        setMissions(mockMissions);
      }
    };

    loadMissions();
  }, [getMissions]);

  // Filter state
  const [filters, setFilters] = useState({
    type: 'all',
    model: 'all',
    platform: 'all',
    status: 'all',
    sortBy: 'reward'
  });

  const handleFilterChange = (filter: string, value: string) => {
    setFilters(prev => ({ ...prev, [filter]: value }));
  };

  // Fix the filter error by ensuring missions is an array
  const missionsArray = Array.isArray(missions) ? missions : [];

  const filteredMissions = missionsArray.filter(mission => {
    // Apply regular filters
    if (filters.type !== 'all' && mission.type !== filters.type) return false;
    if (filters.model !== 'all' && mission.model !== filters.model) return false;
    if (filters.platform !== 'all' && mission.platform !== filters.platform) return false;
    if (filters.status !== 'all' && mission.status !== filters.status) return false;

    // Mission expiration logic
    if (mission.model?.toLowerCase() === 'degen') {
      // For degen missions: hide if deadline has passed
      if (mission.deadline) {
        const deadline = new Date(mission.deadline);
        const now = new Date();
        if (deadline.getTime() <= now.getTime()) {
          return false; // Hide expired degen missions
        }
      }
    } else if (mission.model?.toLowerCase() === 'fixed') {
      // For fixed missions: hide if participant cap is reached
      const currentParticipants = mission.participants_count || mission.participants || 0;
      const maxParticipants = mission.max_participants || mission.cap || 0;
      if (maxParticipants > 0 && currentParticipants >= maxParticipants) {
        return false; // Hide fixed missions that have reached their cap
      }
    }

    return true;
  });

  // Sort missions
  const sortedMissions = [...filteredMissions].sort((a, b) => {
    switch (filters.sortBy) {
      case 'reward':
        return (b.total_cost_honors || 0) - (a.total_cost_honors || 0);
      case 'deadline':
        return new Date(a.deadline || 0).getTime() - new Date(b.deadline || 0).getTime();
      case 'participants':
        return (b.participants_count || 0) - (a.participants_count || 0);
      case 'created':
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      default:
        return 0;
    }
  });

  const categories = [
    { id: 'all', name: 'All Categories', icon: '🌐', color: 'from-gray-500 to-gray-600' },
    { id: 'AI/ML', name: 'AI/ML', icon: '🤖', color: 'from-blue-500 to-blue-600' },
    { id: 'Blockchain', name: 'Blockchain', icon: '⛓️', color: 'from-purple-500 to-purple-600' },
    { id: 'Design', name: 'Design', icon: '🎨', color: 'from-pink-500 to-pink-600' },
    { id: 'Writing', name: 'Writing', icon: '✍️', color: 'from-green-500 to-green-600' },
    { id: 'Analytics', name: 'Analytics', icon: '📊', color: 'from-orange-500 to-orange-600' },
    { id: 'marketing', name: 'Marketing', icon: '📈', color: 'from-red-500 to-red-600' },
    { id: 'content', name: 'Content', icon: '📝', color: 'from-indigo-500 to-indigo-600' },
    { id: 'testing', name: 'Testing', icon: '🧪', color: 'from-yellow-500 to-yellow-600' },
    { id: 'analytics', name: 'Analytics', icon: '📈', color: 'from-teal-500 to-teal-600' }
  ];


  const handleViewDetails = (missionId: string) => {
    console.log('Viewing details for mission:', missionId);
    // TODO: Navigate to mission details page
  };


  // Calculate stats
  const totalRewards = missionsArray.reduce((sum, mission) => sum + (mission.total_cost_honors || 0), 0);
  const activeMissions = missionsArray.filter(m => m.status === 'active').length;
  const totalParticipants = missionsArray.reduce((sum, mission) => sum + (mission.participants_count || 0), 0);



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
              onClick={() => window.location.reload()}
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

  // Show empty state when no missions are available (but no error)
  if (!loading && !error && missionsArray.length === 0) {
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

          {/* Empty State */}
          <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700/50 rounded-2xl p-12 text-center">
            <div className="text-gray-400 text-8xl mb-6">🎯</div>
            <h2 className="text-3xl font-bold text-gray-300 mb-4">No Missions Available</h2>
            <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
              There are currently no missions available. Check back later for new opportunities to earn rewards!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <ModernButton
                onClick={() => window.location.reload()}
                variant="primary"
                loading={loading}
              >
                🔄 Refresh
              </ModernButton>
              <ModernButton
                onClick={() => window.location.href = '/dashboard'}
                variant="secondary"
              >
                📊 Go to Dashboard
              </ModernButton>
            </div>
          </div>
        </div>
      </ModernLayout>
    );
  }

  return (
    <ProtectedRoute>
      <ModernLayout currentPage="/missions">
        <div className="container mx-auto px-2 py-2">
          {/* Header */}
          <div className="text-left mb-2">
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-1">
              Discover & Earn
            </h1>
            <p className="text-gray-400 text-xs">Engage with content and earn rewards</p>
          </div>

          {/* Stats Cards */}
          {missionsArray.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="bg-gray-800/30 rounded-lg p-2 text-center shadow-[inset_-1px_-1px_3px_rgba(0,0,0,0.3),inset_1px_1px_3px_rgba(255,255,255,0.05)]">
                <div className="text-sm font-bold text-white">{missionsArray.length}</div>
                <div className="text-xs text-gray-400">Missions</div>
              </div>
              <div className="bg-gray-800/30 rounded-lg p-2 text-center shadow-[inset_-1px_-1px_3px_rgba(0,0,0,0.3),inset_1px_1px_3px_rgba(255,255,255,0.05)]">
                <div className="text-sm font-bold text-white">${(totalRewards / 450).toFixed(0)}</div>
                <div className="text-xs text-gray-400">Rewards</div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="mb-4">
            <FilterBar
              filters={filters}
              onFilterChange={handleFilterChange}
              showPlatform={true}
              showStatus={false}
              showType={true}
              showModel={true}
              showSort={true}
            />
          </div>

          {/* Missions Grid */}
          {sortedMissions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedMissions.map((mission) => (
                <CompactMissionCard
                  key={mission.id}
                  mission={mission}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          ) : missionsArray.length === 0 ? (
            /* Empty state when no missions exist */
            <div className="max-w-2xl mx-auto">
              <ModernCard className="text-center">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h2 className="text-2xl font-bold text-white mb-4">No Missions Available</h2>
                <p className="text-gray-400 mb-6">There are currently no missions available. Check back later or create your own mission!</p>
                <div className="flex gap-4 justify-center">
                  <ModernButton onClick={() => window.location.reload()} variant="secondary">Refresh</ModernButton>
                  <ModernButton onClick={() => window.location.href = '/missions/create'} variant="primary">Create Mission</ModernButton>
                </div>
              </ModernCard>
            </div>
          ) : (
            /* No missions match filters */
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-white mb-2">No missions match your filters</h3>
              <p className="text-gray-400 mb-4">Try adjusting your filter criteria</p>
              <ModernButton
                onClick={() => {
                  setFilters({
                    type: 'all',
                    model: 'all',
                    platform: 'all',
                    status: 'all',
                    sortBy: 'reward'
                  });
                }}
                variant="secondary"
              >
                Clear Filters
              </ModernButton>
            </div>
          )}
        </div>
      </ModernLayout>
    </ProtectedRoute>
  );
}