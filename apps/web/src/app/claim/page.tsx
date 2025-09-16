'use client';

import { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { ModernLayout } from '../../components/layout/ModernLayout';
import { ModernCard } from '../../components/ui/ModernCard';
import { ModernButton } from '../../components/ui/ModernButton';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { PlatformIcon } from '../../components/ui/Icon';

export default function ClaimPage() {
    const { getWalletBalance, getClaimableRewards, claimReward, loading, error: apiError } = useApi();
    const [walletBalance, setWalletBalance] = useState<any>(null);
    const [claimableRewards, setClaimableRewards] = useState<any[]>([]);
    const [claimingReward, setClaimingReward] = useState<string | null>(null);
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadWalletData();
    }, []);

    const loadWalletData = async () => {
        setError(null);
        try {
            // Load wallet balance
            const balance = await getWalletBalance();
            setWalletBalance(balance);
        } catch (err) {
            console.error('Error loading wallet balance:', err);
            setError('Failed to load wallet balance. Please try again.');
            return;
        }

        try {
            // Load claimable rewards
            const rewards = await getClaimableRewards();
            setClaimableRewards(Array.isArray(rewards) ? rewards : []);
        } catch (err) {
            console.error('Error loading claimable rewards:', err);
            setError('Failed to load claimable rewards. Please try again.');
        }
    };

    const handleClaimReward = async (rewardId: string) => {
        setClaimingReward(rewardId);
        try {
            await claimReward(rewardId);
            alert('Reward claimed successfully!');
            // Refresh data
            loadWalletData();
        } catch (err) {
            alert('Error claiming reward. Please try again.');
        } finally {
            setClaimingReward(null);
        }
    };

    const getPlatformIcon = (platform: string) => {
        return <PlatformIcon platform={platform} size={20} />;
    };

    const getStatusBadge = (status: string) => {
        const colors = {
            approved: 'bg-green-500/20 text-green-400 border-green-500/30',
            pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
            rejected: 'bg-red-500/20 text-red-400 border-red-500/30'
        };
        return colors[status as keyof typeof colors] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    };

    const filteredRewards = claimableRewards.filter(reward => {
        if (selectedFilter === 'all') return true;
        return reward.status === selectedFilter;
    });

    if (loading) {
        return (
            <ModernLayout currentPage="/claim">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                        <p className="text-gray-400">Loading your rewards...</p>
                    </div>
                </div>
            </ModernLayout>
        );
    }

    return (
        <ProtectedRoute>
            <ModernLayout currentPage="/claim">
                <div className="max-w-7xl mx-auto px-2 py-2">
                    {/* Hero Header */}
                    <div className="text-left mb-2">
                        <h1 className="text-lg font-bold bg-gradient-to-r from-green-400 via-emerald-500 to-blue-500 bg-clip-text text-transparent mb-1">
                            Claim Rewards
                        </h1>
                        <p className="text-gray-400 text-xs">
                            Claim your earned rewards from completed missions and track your earnings
                        </p>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="mb-8 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                            <p className="text-red-400 text-sm">{error}</p>
                            <button
                                onClick={loadWalletData}
                                className="mt-2 text-red-400 hover:text-red-300 text-sm underline"
                            >
                                Try again
                            </button>
                        </div>
                    )}

                    {/* Wallet Balance */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-lg rounded-2xl p-6 border border-green-500/30">
                            <div className="text-3xl font-bold text-green-400 mb-2">
                                {walletBalance?.available_honors?.toLocaleString() || '0'}
                            </div>
                            <div className="text-sm text-gray-400">Available Honors</div>
                        </div>
                        <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/30">
                            <div className="text-3xl font-bold text-blue-400 mb-2">
                                ${walletBalance?.available_usd?.toFixed(2) || '0.00'}
                            </div>
                            <div className="text-sm text-gray-400">Available USD</div>
                        </div>
                        <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-lg rounded-2xl p-6 border border-yellow-500/30">
                            <div className="text-3xl font-bold text-yellow-400 mb-2">
                                {walletBalance?.pending_honors?.toLocaleString() || '0'}
                            </div>
                            <div className="text-sm text-gray-400">Pending Honors</div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30">
                            <div className="text-3xl font-bold text-purple-400 mb-2">
                                ${walletBalance?.pending_usd?.toFixed(2) || '0.00'}
                            </div>
                            <div className="text-sm text-gray-400">Pending USD</div>
                        </div>
                    </div>

                    {/* Total Earnings Summary */}
                    <ModernCard title="Earnings Summary" icon="💰" className="mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="text-center p-6 bg-gray-800/30 rounded-xl">
                                <div className="text-3xl font-bold text-emerald-400 mb-2">
                                    {walletBalance?.total_earned_honors?.toLocaleString() || '0'}
                                </div>
                                <div className="text-sm text-gray-400">Total Honors Earned</div>
                            </div>
                            <div className="text-center p-6 bg-gray-800/30 rounded-xl">
                                <div className="text-3xl font-bold text-blue-400 mb-2">
                                    ${walletBalance?.total_earned_usd?.toFixed(2) || '0.00'}
                                </div>
                                <div className="text-sm text-gray-400">Total USD Earned</div>
                            </div>
                        </div>
                    </ModernCard>

                    {/* Claimable Rewards */}
                    <div className="mb-8">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">Claimable Rewards</h2>
                                <p className="text-gray-400">
                                    {filteredRewards.length} reward{filteredRewards.length !== 1 ? 's' : ''} available to claim
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <select
                                    value={selectedFilter}
                                    onChange={(e) => setSelectedFilter(e.target.value)}
                                    className="p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                    <option value="all">All Rewards</option>
                                    <option value="approved">Approved</option>
                                    <option value="pending">Pending</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                                <ModernButton
                                    onClick={loadWalletData}
                                    variant="secondary"
                                    size="sm"
                                >
                                    🔄 Refresh
                                </ModernButton>
                            </div>
                        </div>

                        {filteredRewards.length === 0 ? (
                            <ModernCard className="text-center py-16">
                                <div className="text-6xl mb-4">🎁</div>
                                <h3 className="text-xl font-semibold mb-2">No rewards to claim</h3>
                                <p className="text-gray-400 mb-6">
                                    {claimableRewards.length === 0
                                        ? "You haven't earned any rewards yet. Complete missions to start earning!"
                                        : "No rewards match your current filter."
                                    }
                                </p>
                                <ModernButton
                                    onClick={() => window.location.href = '/missions'}
                                    variant="primary"
                                >
                                    Browse Missions
                                </ModernButton>
                            </ModernCard>
                        ) : (
                            <div className="space-y-4">
                                {filteredRewards.map((reward) => (
                                    <ModernCard key={reward.id} className="p-6">
                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                            <div className="flex items-start gap-4">
                                                <div className="text-3xl">
                                                    {getPlatformIcon(reward.platform)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="text-xl font-bold text-white">{reward.mission_title}</h3>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(reward.status)}`}>
                                                            {reward.status}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                                                        <span className="capitalize">{reward.platform}</span>
                                                        <span>•</span>
                                                        <span className="capitalize">{reward.type}</span>
                                                        <span>•</span>
                                                        <span>Submitted {new Date(reward.submitted_at).toLocaleDateString()}</span>
                                                        {reward.approved_at && (
                                                            <>
                                                                <span>•</span>
                                                                <span>Approved {new Date(reward.approved_at).toLocaleDateString()}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-4">
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold text-green-400 mb-1">
                                                        {reward.reward_honors?.toLocaleString()} Honors
                                                    </div>
                                                    <div className="text-gray-400 text-sm">
                                                        ${reward.reward_usd?.toFixed(2)} USD
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    {reward.status === 'approved' ? (
                                                        <ModernButton
                                                            onClick={() => handleClaimReward(reward.id)}
                                                            variant="success"
                                                            size="sm"
                                                            loading={claimingReward === reward.id}
                                                        >
                                                            {claimingReward === reward.id ? 'Claiming...' : 'Claim'}
                                                        </ModernButton>
                                                    ) : (
                                                        <ModernButton
                                                            variant="secondary"
                                                            size="sm"
                                                            disabled
                                                        >
                                                            {reward.status === 'pending' ? 'Pending Review' : 'Rejected'}
                                                        </ModernButton>
                                                    )}
                                                    <ModernButton
                                                        onClick={() => window.location.href = `/missions/${reward.mission_id}`}
                                                        variant="secondary"
                                                        size="sm"
                                                    >
                                                        View Mission
                                                    </ModernButton>
                                                </div>
                                            </div>
                                        </div>
                                    </ModernCard>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* How Claiming Works */}
                    <ModernCard title="How Claiming Works" icon="ℹ️">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                            <div>
                                <div className="text-3xl mb-3">📝</div>
                                <h4 className="font-semibold text-white mb-2">1. Complete Mission</h4>
                                <p className="text-gray-400 text-sm">Submit your work and wait for approval</p>
                            </div>
                            <div>
                                <div className="text-3xl mb-3">✅</div>
                                <h4 className="font-semibold text-white mb-2">2. Get Approved</h4>
                                <p className="text-gray-400 text-sm">Your submission is reviewed and approved</p>
                            </div>
                            <div>
                                <div className="text-3xl mb-3">💰</div>
                                <h4 className="font-semibold text-white mb-2">3. Claim Reward</h4>
                                <p className="text-gray-400 text-sm">Claim your rewards instantly to your wallet</p>
                            </div>
                        </div>
                    </ModernCard>

                    {/* Additional Information */}
                    <ModernCard title="Important Information" icon="📋" className="mt-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-semibold text-green-400 mb-3">✅ What You Can Do</h4>
                                <ul className="space-y-2 text-sm text-gray-300">
                                    <li>• Claim approved rewards instantly</li>
                                    <li>• Track your earnings history</li>
                                    <li>• View pending submissions</li>
                                    <li>• Monitor your wallet balance</li>
                                    <li>• Withdraw funds to your account</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-yellow-400 mb-3">⚠️ Important Notes</h4>
                                <ul className="space-y-2 text-sm text-gray-300">
                                    <li>• Rewards are paid in Honors (1 USD = 450 Honors)</li>
                                    <li>• Pending rewards require approval first</li>
                                    <li>• Rejected submissions are not eligible</li>
                                    <li>• Minimum withdrawal amount applies</li>
                                    <li>• Processing time: 1-3 business days</li>
                                </ul>
                            </div>
                        </div>
                    </ModernCard>
                </div>
            </ModernLayout>
        </ProtectedRoute>
    );
}
