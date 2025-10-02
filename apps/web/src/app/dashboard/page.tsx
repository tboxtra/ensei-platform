'use client';

import { useState, useEffect } from 'react';
import { ModernLayout } from '../../components/layout/ModernLayout';
import { ModernCard } from '../../components/ui/ModernCard';
import { ModernButton } from '../../components/ui/ModernButton';
import { useApi } from '../../hooks/useApi';
import { useDashboardSummary } from '../../hooks/useDashboardSummary';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';

export default function DashboardPage() {
  const { getMissions, getWalletBalance, loading } = useApi();
  const { summary, isLoading: summaryLoading } = useDashboardSummary();

  // Stats are now handled by useUserStats hook
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
                    {summaryLoading ? '...' : (summary?.missionsCreated ?? 0)}
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
                    {summaryLoading ? '...' : (summary?.honorsEarned ?? 0).toLocaleString()}
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
                    {summaryLoading ? '...' : (summary?.tasksDone ?? 0)}
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
                    {summaryLoading ? '...' : `$${(summary?.usdSpent ?? 0).toFixed(2)}`}
                  </p>
                  <p className="text-xs text-gray-500">
                    {summaryLoading ? '...' : `Balance: $${(summary?.usdBalance ?? 0).toFixed(2)}`}
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
              <a href="/review-and-earn" className="block text-center">
                <div className="text-2xl mb-2">⚖️</div>
                <h3 className="text-sm font-semibold mb-1 text-orange-400">Review & Earn</h3>
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
