'use client';

import { useState, useEffect } from 'react';
import { useMissions } from '../../hooks/useApi';
import { ModernLayout } from '../../components/layout/ModernLayout';
import { ModernCard } from '../../components/ui/ModernCard';
import { ModernButton } from '../../components/ui/ModernButton';

export default function MissionsPage() {
    const { missions, fetchMissions, loading, error } = useMissions();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);
    const [directMissions, setDirectMissions] = useState<any[]>([]);
    const [directLoading, setDirectLoading] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('firebaseToken');
      const user = localStorage.getItem('user');
      const authenticated = !!(token && user);
      setIsAuthenticated(authenticated);
      setAuthLoading(false);

      console.log('MissionsPage: Auth check:', {
        hasToken: !!token,
        hasUser: !!user,
        authenticated
      });
    };

    checkAuth();
  }, []);

    useEffect(() => {
        // Always try to fetch missions regardless of authentication status
        console.log('MissionsPage: Starting to fetch missions...');
        console.log('MissionsPage: useMissions hook state:', { missions, loading, error });
        fetchMissions();

        // Also try direct API call as a test
        const testDirectAPI = async () => {
            try {
                setDirectLoading(true);
                console.log('MissionsPage: Testing direct API call...');
                const response = await fetch('https://us-central1-ensei-6c8e0.cloudfunctions.net/api/v1/missions');
                const data = await response.json();
                console.log('MissionsPage: Direct API response:', {
                    status: response.status,
                    ok: response.ok,
                    dataLength: data?.length || 0,
                    data: data
                });
                setDirectMissions(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('MissionsPage: Direct API test failed:', err);
                setDirectMissions([]);
            } finally {
                setDirectLoading(false);
            }
        };

        testDirectAPI();
    }, [fetchMissions, missions, loading, error]);

  useEffect(() => {
    console.log('MissionsPage: Missions data updated:', {
      missionsCount: missions?.length || 0,
      loading,
      error,
      missions: missions
    });
  }, [missions, loading, error]);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [sortBy, setSortBy] = useState('reward'); // reward, duration, participants

  // Fix the filter error by ensuring missions is an array
  const missionsArray = Array.isArray(missions) ? missions : [];

  const filteredMissions = missionsArray.filter(mission => {
    if (selectedCategory !== 'all' && mission.category !== selectedCategory) return false;
    if (selectedDifficulty !== 'all' && mission.difficulty !== selectedDifficulty) return false;
    return true;
  });

  // Sort missions
  const sortedMissions = [...filteredMissions].sort((a, b) => {
    switch (sortBy) {
      case 'reward':
        return ((b as any).total_cost_honors || (b as any).rewards?.honors || 0) - ((a as any).total_cost_honors || (a as any).rewards?.honors || 0);
      case 'duration':
        return ((a as any).duration_hours || 0) - ((b as any).duration_hours || 0);
      case 'participants':
        return ((b as any).cap || (b as any).max_participants || 0) - ((a as any).cap || (a as any).max_participants || 0);
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

  const difficulties = [
    { id: 'all', name: 'All Levels', icon: '🎯', color: 'from-gray-500 to-gray-600' },
    { id: 'beginner', name: 'Beginner', icon: '🌱', color: 'from-green-500 to-green-600' },
    { id: 'intermediate', name: 'Intermediate', icon: '⚡', color: 'from-yellow-500 to-yellow-600' },
    { id: 'advanced', name: 'Advanced', icon: '🔥', color: 'from-orange-500 to-orange-600' },
    { id: 'expert', name: 'Expert', icon: '💎', color: 'from-purple-500 to-purple-600' }
  ];

    // Show loading state while checking authentication
    if (authLoading) {
        return (
            <ModernLayout currentPage="/missions">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                        <p className="text-gray-400">Checking authentication...</p>
                    </div>
                </div>
            </ModernLayout>
        );
    }

    // Debug section - show both hook data and direct API data
    const debugInfo = (
        <div className="mb-6 p-4 bg-gray-800 rounded-lg">
            <h3 className="text-lg font-bold text-yellow-400 mb-2">🐛 Debug Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                    <h4 className="font-semibold text-blue-400">useMissions Hook:</h4>
                    <p>Loading: {loading ? 'true' : 'false'}</p>
                    <p>Error: {error || 'none'}</p>
                    <p>Missions Count: {missions?.length || 0}</p>
                </div>
                <div>
                    <h4 className="font-semibold text-green-400">Direct API Call:</h4>
                    <p>Loading: {directLoading ? 'true' : 'false'}</p>
                    <p>Missions Count: {directMissions?.length || 0}</p>
                </div>
            </div>
        </div>
    );

  // Show authentication warning but don't block access
  if (!isAuthenticated) {
    console.log('MissionsPage: User not authenticated, but allowing access anyway');
  }

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
                onClick={() => fetchMissions()}
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

        {/* Debug Info */}
        {debugInfo}

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
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full p-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {difficulties.map(difficulty => (
                    <option key={difficulty.id} value={difficulty.id}>
                      {difficulty.icon} {difficulty.name}
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
                        {categories.find(c => c.id === mission.category)?.icon || '🌐'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-lg">{mission.title}</h3>
                        <p className="text-gray-400 text-sm capitalize">{mission.category} • {mission.difficulty}</p>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${mission.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                      mission.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                        mission.difficulty === 'advanced' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                          'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      }`}>
                      {mission.difficulty}
                    </div>
                  </div>

                  <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                    {mission.description}
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Reward</span>
                      <span className="text-green-400 font-semibold">
                        {(mission as any).total_cost_honors?.toLocaleString() || (mission as any).rewards?.honors?.toLocaleString() || 0} Honors
                        {(mission as any).rewards?.usd && ` ($${(mission as any).rewards.usd})`}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Duration</span>
                      <span className="text-blue-400 font-semibold">
                        {(mission as any).duration_hours || 0}h
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Participants</span>
                      <span className="text-purple-400 font-semibold">
                        {mission.participants_count || 0}/{mission.max_participants || mission.cap || 0}
                      </span>
                    </div>
                    {mission.deadline && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Deadline</span>
                        <span className="text-orange-400 font-semibold text-xs">
                          {new Date(mission.deadline).toLocaleDateString()}
                        </span>
                      </div>
                    )}
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