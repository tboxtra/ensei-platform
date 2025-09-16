'use client';

import { useState, useEffect } from 'react';
import { ModernLayout } from '../../components/layout/ModernLayout';
import { ModernCard } from '../../components/ui/ModernCard';
import { ModernButton } from '../../components/ui/ModernButton';
import { useApi } from '../../hooks/useApi';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';

export default function DashboardPage() {
  const { getMissions, getWalletBalance, loading } = useApi();
  const [stats, setStats] = useState({
    missionsCreated: 0,
    usdSpent: 0,
    honorsEarned: 0,
    reviewsDone: 0,
    totalHonors: 0,
    pendingReviews: 0,
    usdValue: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        setLoadingStats(true);

        // Load all missions and filter for user's missions
        const allMissions = await getMissions();
        const userData = localStorage.getItem('user');
        const userId = userData ? JSON.parse(userData).id : null;

        const userMissions = Array.isArray(allMissions)
          ? allMissions.filter(mission => mission.created_by === userId)
          : [];
        const missionsCreated = userMissions.length; // This includes both active and inactive missions

        // Calculate USD spent on created missions
        const usdSpent = userMissions.reduce((total, mission: any) => {
          if (mission.rewards?.usd) return total + mission.rewards.usd;
          if (mission.total_cost_usd) return total + mission.total_cost_usd;
          if (mission.total_cost_honors) return total + (mission.total_cost_honors / 450);
          return total;
        }, 0);

        // Calculate honors earned from participated missions (missions where user is a participant)
        const participatedMissions = Array.isArray(allMissions)
          ? allMissions.filter(mission =>
            mission.participants &&
            Array.isArray(mission.participants) &&
            mission.participants.some((p: any) => p.user_id === userId)
          )
          : [];

        const honorsEarned = participatedMissions.reduce((total, mission: any) => {
          const participant = mission.participants?.find((p: any) => p.user_id === userId);
          return total + (participant?.honors_earned || 0);
        }, 0);

        // TODO: Calculate reviews done (this would need a separate API call)
        const reviewsDone = 0; // Placeholder

        console.log('Dashboard: User missions found:', {
          userId,
          totalMissions: allMissions?.length || 0,
          userMissions: missionsCreated,
          usdSpent,
          honorsEarned,
          participatedMissions: participatedMissions.length
        });

        // Load wallet balance
        let walletBalance = { honors: 0, usd: 0 };
        try {
          walletBalance = await getWalletBalance();
        } catch (err) {
          console.log('Could not load wallet balance:', err);
        }

        setStats({
          missionsCreated,
          usdSpent,
          honorsEarned,
          reviewsDone,
          totalHonors: walletBalance.honors || 0,
          pendingReviews: 0, // TODO: Implement pending reviews count
          usdValue: walletBalance.usd || 0
        });

        console.log('Dashboard stats loaded:', {
          missionsCreated,
          totalHonors: walletBalance.honors,
          usdValue: walletBalance.usd
        });
      } catch (err) {
        console.error('Error loading dashboard stats:', err);
      } finally {
        setLoadingStats(false);
      }
    };

    loadDashboardStats();
  }, [getMissions, getWalletBalance]);
  return (
    <ProtectedRoute>
      <ModernLayout currentPage="/dashboard">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-2 px-4 sm:px-0">
            <h1 className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-gray-400 mt-1 text-xs">Welcome back! Here's your mission overview</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <ModernCard className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 shadow-[inset_-2px_-2px_6px_rgba(0,0,0,0.3),inset_2px_2px_6px_rgba(255,255,255,0.05)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs">Missions Created</p>
                  <p className="text-lg font-bold text-green-400">
                    {loadingStats ? '...' : stats.missionsCreated}
                  </p>
                </div>
                <div className="text-xl">📊</div>
              </div>
            </ModernCard>

            <ModernCard className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 shadow-[inset_-2px_-2px_6px_rgba(0,0,0,0.3),inset_2px_2px_6px_rgba(255,255,255,0.05)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs">Honors Earned</p>
                  <p className="text-lg font-bold text-blue-400">
                    {loadingStats ? '...' : stats.honorsEarned.toLocaleString()}
                  </p>
                </div>
                <div className="text-xl">🏆</div>
              </div>
            </ModernCard>

            <ModernCard className="bg-gradient-to-br from-orange-600/20 to-red-600/20 shadow-[inset_-2px_-2px_6px_rgba(0,0,0,0.3),inset_2px_2px_6px_rgba(255,255,255,0.05)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs">Reviews Done</p>
                  <p className="text-lg font-bold text-orange-400">
                    {loadingStats ? '...' : stats.reviewsDone}
                  </p>
                </div>
                <div className="text-xl">⚖️</div>
              </div>
            </ModernCard>

            <ModernCard className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 shadow-[inset_-2px_-2px_6px_rgba(0,0,0,0.3),inset_2px_2px_6px_rgba(255,255,255,0.05)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs">USD Spent & Balance</p>
                  <p className="text-lg font-bold text-purple-400">
                    {loadingStats ? '...' : `$${stats.usdSpent.toFixed(2)}`}
                  </p>
                  <p className="text-xs text-gray-500">
                    {loadingStats ? '...' : `Balance: $${stats.usdValue.toFixed(2)}`}
                  </p>
                </div>
                <div className="text-xl">👛</div>
              </div>
            </ModernCard>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <ModernCard className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 hover:from-green-600/30 hover:to-emerald-600/30 transition-all duration-300 transform hover:scale-105 cursor-pointer shadow-[inset_-2px_-2px_6px_rgba(0,0,0,0.3),inset_2px_2px_6px_rgba(255,255,255,0.05)] hover:shadow-[inset_-1px_-1px_3px_rgba(0,0,0,0.2),inset_1px_1px_3px_rgba(255,255,255,0.08)]">
              <a href="/missions/create" className="block text-center">
                <div className="text-2xl mb-2">🚀</div>
                <h3 className="text-sm font-semibold mb-1 text-green-400">Create Mission</h3>
                <p className="text-xs text-gray-400">Launch a new engagement campaign</p>
              </a>
            </ModernCard>

            <ModernCard className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 hover:from-blue-600/30 hover:to-purple-600/30 transition-all duration-300 transform hover:scale-105 cursor-pointer shadow-[inset_-2px_-2px_6px_rgba(0,0,0,0.3),inset_2px_2px_6px_rgba(255,255,255,0.05)] hover:shadow-[inset_-1px_-1px_3px_rgba(0,0,0,0.2),inset_1px_1px_3px_rgba(255,255,255,0.08)]">
              <a href="/missions" className="block text-center">
                <div className="text-2xl mb-2">🔍</div>
                <h3 className="text-sm font-semibold mb-1 text-blue-400">Discover Missions</h3>
                <p className="text-xs text-gray-400">Find missions to participate in</p>
              </a>
            </ModernCard>

            <ModernCard className="bg-gradient-to-br from-orange-600/20 to-red-600/20 hover:from-orange-600/30 hover:to-red-600/30 transition-all duration-300 transform hover:scale-105 cursor-pointer shadow-[inset_-2px_-2px_6px_rgba(0,0,0,0.3),inset_2px_2px_6px_rgba(255,255,255,0.05)] hover:shadow-[inset_-1px_-1px_3px_rgba(0,0,0,0.2),inset_1px_1px_3px_rgba(255,255,255,0.08)]">
              <a href="/review" className="block text-center">
                <div className="text-2xl mb-2">⚖️</div>
                <h3 className="text-sm font-semibold mb-1 text-orange-400">Judge & Earn</h3>
                <p className="text-xs text-gray-400">Review submissions and earn rewards</p>
              </a>
            </ModernCard>

            <ModernCard className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 transition-all duration-300 transform hover:scale-105 cursor-pointer shadow-[inset_-2px_-2px_6px_rgba(0,0,0,0.3),inset_2px_2px_6px_rgba(255,255,255,0.05)] hover:shadow-[inset_-1px_-1px_3px_rgba(0,0,0,0.2),inset_1px_1px_3px_rgba(255,255,255,0.08)]">
              <a href="/wallet" className="block text-center">
                <div className="text-2xl mb-2">👛</div>
                <h3 className="text-sm font-semibold mb-1 text-purple-400">Manage Wallet</h3>
                <p className="text-xs text-gray-400">View balance and withdraw funds</p>
              </a>
            </ModernCard>
          </div>
        </div>
      </ModernLayout>
    </ProtectedRoute>
  );
}
