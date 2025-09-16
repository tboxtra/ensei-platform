'use client';

import { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { ModernLayout } from '../../components/layout/ModernLayout';
import { ModernCard } from '../../components/ui/ModernCard';
import { ModernButton } from '../../components/ui/ModernButton';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';

export default function ClaimPage() {
    const { getWalletBalance, getClaimableRewards, claimReward, loading, error: apiError } = useApi();
    const [walletBalance, setWalletBalance] = useState<any>(null);
    const [claimableRewards, setClaimableRewards] = useState<any[]>([]);
    const [claimingReward, setClaimingReward] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [balance, rewards] = await Promise.all([
                getWalletBalance(),
                getClaimableRewards()
            ]);
            setWalletBalance(balance);
            setClaimableRewards(rewards);
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    const handleClaimReward = async (rewardId: string) => {
        setClaimingReward(rewardId);
        try {
            await claimReward(rewardId);
            await loadData(); // Reload data after claiming
        } catch (error) {
            console.error('Error claiming reward:', error);
        } finally {
            setClaimingReward(null);
        }
    };

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

    const getStatusBadge = (status: string) => {
        const colors = {
            approved: 'bg-green-500/20 text-green-400 border-green-500/30',
            pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
            rejected: 'bg-red-500/20 text-red-400 border-red-500/30'
        };
        return colors[status as keyof typeof colors] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    };

    return (
        <ProtectedRoute>
            <ModernLayout currentPage="claim">
                <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4 sm:p-6 lg:p-8">
                    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
                        {/* Header */}
                        <div className="text-center">
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent mb-2 sm:mb-4">
                                💰 Claim Rewards
                            </h1>
                            <p className="text-gray-400 text-sm sm:text-base lg:text-lg">
                                Claim your earned rewards from completed missions
                            </p>
                        </div>

                        {/* Wallet Balance */}
                        {walletBalance && (
                            <ModernCard className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30">
                                <div className="text-center">
                                    <h2 className="text-xl sm:text-2xl font-bold text-green-400 mb-2 sm:mb-4">
                                        💳 Wallet Balance
                                    </h2>
                                    <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2">
                                        ${walletBalance.usd?.toFixed(2) || '0.00'}
                                    </div>
                                    <div className="text-sm sm:text-base text-gray-400">
                                        {walletBalance.tokens?.toFixed(4) || '0.0000'} ENSEI
                                    </div>
                                </div>
                            </ModernCard>
                        )}

                        {/* Claimable Rewards */}
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">
                                🎁 Claimable Rewards
                            </h2>
                            
                            {claimableRewards.length === 0 ? (
                                <ModernCard>
                                    <div className="text-center py-8 sm:py-12">
                                        <div className="text-4xl sm:text-6xl mb-4">📭</div>
                                        <h3 className="text-lg sm:text-xl font-semibold text-gray-300 mb-2">
                                            No Claimable Rewards
                                        </h3>
                                        <p className="text-gray-500 text-sm sm:text-base">
                                            Complete more missions to earn rewards!
                                        </p>
                                    </div>
                                </ModernCard>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                    {claimableRewards.map((reward) => (
                                        <ModernCard key={reward.id} className="hover:scale-105 transition-transform duration-300">
                                            <div className="p-4 sm:p-6">
                                                <div className="flex items-center justify-between mb-3 sm:mb-4">
                                                    <div className="flex items-center space-x-2 sm:space-x-3">
                                                        <div className="text-2xl sm:text-3xl">
                                                            {getPlatformIcon(reward.platform)}
                                                        </div>
                                                        <div>
                                                            <h3 className="font-semibold text-white text-sm sm:text-base capitalize">
                                                                {reward.platform} Mission
                                                            </h3>
                                                            <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(reward.status)}`}>
                                                                {reward.status}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="space-y-2 sm:space-y-3">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-400 text-sm">Reward:</span>
                                                        <span className="font-bold text-green-400 text-sm sm:text-base">
                                                            ${reward.amount?.toFixed(2) || '0.00'}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-400 text-sm">Mission:</span>
                                                        <span className="text-white text-sm font-medium truncate max-w-[120px]">
                                                            {reward.missionTitle || 'Unknown Mission'}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-400 text-sm">Completed:</span>
                                                        <span className="text-white text-sm">
                                                            {reward.completedAt ? new Date(reward.completedAt).toLocaleDateString() : 'Unknown'}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                <div className="mt-4 sm:mt-6">
                                                    <ModernButton
                                                        onClick={() => handleClaimReward(reward.id)}
                                                        disabled={claimingReward === reward.id || loading}
                                                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-2 sm:py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                                    >
                                                        {claimingReward === reward.id ? (
                                                            <div className="flex items-center justify-center space-x-2">
                                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                                <span>Claiming...</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center justify-center space-x-2">
                                                                <span>💰</span>
                                                                <span>Claim ${reward.amount?.toFixed(2) || '0.00'}</span>
                                                            </div>
                                                        )}
                                                    </ModernButton>
                                                </div>
                                            </div>
                                        </ModernCard>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Error Display */}
                        {apiError && (
                            <ModernCard className="bg-red-500/20 border-red-500/30">
                                <div className="text-center">
                                    <div className="text-4xl mb-4">❌</div>
                                    <h3 className="text-lg font-semibold text-red-400 mb-2">
                                        Error Loading Data
                                    </h3>
                                    <p className="text-red-300 text-sm">
                                        {apiError}
                                    </p>
                                </div>
                            </ModernCard>
                        )}
                    </div>
                </div>
            </ModernLayout>
        </ProtectedRoute>
    );
}
