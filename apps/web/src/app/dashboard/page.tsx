'use client';

import { ModernLayout } from '../../components/layout/ModernLayout';
import { ModernCard } from '../../components/ui/ModernCard';
import { ModernButton } from '../../components/ui/ModernButton';

export default function DashboardPage() {
  return (
    <ModernLayout currentPage="/dashboard">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-400 mt-2">Welcome back! Here's your mission overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <ModernCard className="bg-gradient-to-br from-gray-800/50 to-gray-900/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Honors</p>
                <p className="text-2xl font-bold text-green-400">0</p>
              </div>
              <div className="text-3xl">🏆</div>
            </div>
          </ModernCard>

          <ModernCard className="bg-gradient-to-br from-gray-800/50 to-gray-900/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">USD Value</p>
                <p className="text-2xl font-bold text-blue-400">$0.00</p>
              </div>
              <div className="text-3xl">💵</div>
            </div>
          </ModernCard>

          <ModernCard className="bg-gradient-to-br from-gray-800/50 to-gray-900/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Missions Created</p>
                <p className="text-2xl font-bold text-purple-400">0</p>
              </div>
              <div className="text-3xl">📊</div>
            </div>
          </ModernCard>

          <ModernCard className="bg-gradient-to-br from-gray-800/50 to-gray-900/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending Reviews</p>
                <p className="text-2xl font-bold text-orange-400">0</p>
              </div>
              <div className="text-3xl">⏳</div>
            </div>
          </ModernCard>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <ModernCard className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 hover:from-green-600/30 hover:to-emerald-600/30 transition-all duration-300 transform hover:scale-105 cursor-pointer">
            <a href="/missions/create" className="block text-center">
              <div className="text-4xl mb-3">🚀</div>
              <h3 className="text-lg font-semibold mb-2 text-green-400">Create Mission</h3>
              <p className="text-sm text-gray-400">Launch a new engagement campaign</p>
            </a>
          </ModernCard>

          <ModernCard className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 hover:from-blue-600/30 hover:to-purple-600/30 transition-all duration-300 transform hover:scale-105 cursor-pointer">
            <a href="/missions" className="block text-center">
              <div className="text-4xl mb-3">🔍</div>
              <h3 className="text-lg font-semibold mb-2 text-blue-400">Discover Missions</h3>
              <p className="text-sm text-gray-400">Find missions to participate in</p>
            </a>
          </ModernCard>

          <ModernCard className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 transition-all duration-300 transform hover:scale-105 cursor-pointer">
            <a href="/wallet" className="block text-center">
              <div className="text-4xl mb-3">👛</div>
              <h3 className="text-lg font-semibold mb-2 text-purple-400">Manage Wallet</h3>
              <p className="text-sm text-gray-400">View balance and withdraw funds</p>
            </a>
          </ModernCard>
        </div>
      </div>
    </ModernLayout>
  );
}
