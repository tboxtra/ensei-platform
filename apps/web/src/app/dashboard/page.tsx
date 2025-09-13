'use client';

import { useState, useEffect } from 'react';
import { ModernLayout } from '../../components/layout/ModernLayout';
import { ModernCard } from '../../components/ui/ModernCard';
import { ModernButton } from '../../components/ui/ModernButton';
import { useApi } from '../../hooks/useApi';

export default function DashboardPage() {
  const { getMyMissions, getWalletBalance, loading } = useApi();
  const [stats, setStats] = useState({
    missionsCreated: 0,
    totalHonors: 0,
    pendingReviews: 0,
    usdValue: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        setLoadingStats(true);

        // Load user's missions
        const myMissions = await getMyMissions();
        const missionsCreated = Array.isArray(myMissions) ? myMissions.length : 0;

        // Load wallet balance
        let walletBalance = { honors: 0, usd: 0 };
        try {
          walletBalance = await getWalletBalance();
        } catch (err) {
          console.log('Could not load wallet balance:', err);
        }

        setStats({
          missionsCreated,
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
  }, [getMyMissions, getWalletBalance]);
  return (
    <ModernLayout currentPage="/dashboard">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8 px-4 sm:px-0">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-400 mt-2 text-sm md:text-base">Welcome back! Here's your mission overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <ModernCard className="bg-gradient-to-br from-gray-800/50 to-gray-900/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs md:text-sm">Missions Created</p>
                <p className="text-xl md:text-2xl font-bold text-purple-400">
                  {loadingStats ? '...' : stats.missionsCreated}
                </p>
              </div>
              <div className="text-2xl md:text-3xl">📊</div>
            </div>
          </ModernCard>

          <ModernCard className="bg-gradient-to-br from-gray-800/50 to-gray-900/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs md:text-sm">Total Honors</p>
                <p className="text-xl md:text-2xl font-bold text-green-400">
                  {loadingStats ? '...' : stats.totalHonors.toLocaleString()}
                </p>
              </div>
              <div className="text-2xl md:text-3xl">🏆</div>
            </div>
          </ModernCard>

          <ModernCard className="bg-gradient-to-br from-gray-800/50 to-gray-900/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs md:text-sm">Pending Reviews</p>
                <p className="text-xl md:text-2xl font-bold text-orange-400">
                  {loadingStats ? '...' : stats.pendingReviews}
                </p>
              </div>
              <div className="text-2xl md:text-3xl">⏳</div>
            </div>
          </ModernCard>

          <ModernCard className="bg-gradient-to-br from-gray-800/50 to-gray-900/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs md:text-sm">USD Value</p>
                <p className="text-xl md:text-2xl font-bold text-blue-400">
                  {loadingStats ? '...' : `$${stats.usdValue.toFixed(2)}`}
                </p>
              </div>
              <div className="text-2xl md:text-3xl">💵</div>
            </div>
          </ModernCard>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <ModernCard className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 hover:from-green-600/30 hover:to-emerald-600/30 transition-all duration-300 transform hover:scale-105 cursor-pointer">
            <a href="/missions/create" className="block text-center">
              <div className="text-3xl md:text-4xl mb-2 md:mb-3">🚀</div>
              <h3 className="text-base md:text-lg font-semibold mb-2 text-green-400">Create Mission</h3>
              <p className="text-xs md:text-sm text-gray-400">Launch a new engagement campaign</p>
            </a>
          </ModernCard>

          <ModernCard className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 hover:from-blue-600/30 hover:to-purple-600/30 transition-all duration-300 transform hover:scale-105 cursor-pointer">
            <a href="/missions" className="block text-center">
              <div className="text-3xl md:text-4xl mb-2 md:mb-3">🔍</div>
              <h3 className="text-base md:text-lg font-semibold mb-2 text-blue-400">Discover Missions</h3>
              <p className="text-xs md:text-sm text-gray-400">Find missions to participate in</p>
            </a>
          </ModernCard>

          <ModernCard className="bg-gradient-to-br from-orange-600/20 to-red-600/20 hover:from-orange-600/30 hover:to-red-600/30 transition-all duration-300 transform hover:scale-105 cursor-pointer">
            <a href="/review" className="block text-center">
              <div className="text-3xl md:text-4xl mb-2 md:mb-3">⚖️</div>
              <h3 className="text-base md:text-lg font-semibold mb-2 text-orange-400">Judge & Earn</h3>
              <p className="text-xs md:text-sm text-gray-400">Review submissions and earn rewards</p>
            </a>
          </ModernCard>

          <ModernCard className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 transition-all duration-300 transform hover:scale-105 cursor-pointer">
            <a href="/wallet" className="block text-center">
              <div className="text-3xl md:text-4xl mb-2 md:mb-3">👛</div>
              <h3 className="text-base md:text-lg font-semibold mb-2 text-purple-400">Manage Wallet</h3>
              <p className="text-xs md:text-sm text-gray-400">View balance and withdraw funds</p>
            </a>
          </ModernCard>
        </div>
      </div>
    </ModernLayout>
  );
}
