'use client';

import { useState } from 'react';

export default function ClaimPage() {
    const [claimableRewards] = useState([
        {
            id: '1',
            missionId: '1',
            missionTitle: 'Engage with our latest tweet about Web3',
            platform: 'twitter',
            type: 'engage',
            reward: 320,
            submittedAt: '2024-01-12T10:30:00Z',
            approvedAt: '2024-01-12T11:30:00Z',
            status: 'claimable'
        },
        {
            id: '2',
            missionId: '2',
            missionTitle: 'Create content for our brand campaign',
            platform: 'instagram',
            type: 'content',
            reward: 1800,
            submittedAt: '2024-01-12T09:15:00Z',
            approvedAt: '2024-01-12T10:15:00Z',
            status: 'claimed'
        },
        {
            id: '3',
            missionId: '3',
            missionTitle: 'Become a brand ambassador',
            platform: 'tiktok',
            type: 'ambassador',
            reward: 600,
            submittedAt: '2024-01-12T08:45:00Z',
            approvedAt: '2024-01-12T09:45:00Z',
            status: 'claimable'
        }
    ]);

    const [selectedStatus, setSelectedStatus] = useState('claimable');

    const filteredRewards = claimableRewards.filter(reward => {
        if (selectedStatus !== 'all' && reward.status !== selectedStatus) return false;
        return true;
    });

    const totalClaimable = claimableRewards
        .filter(r => r.status === 'claimable')
        .reduce((sum, r) => sum + r.reward, 0);

    const totalClaimed = claimableRewards
        .filter(r => r.status === 'claimed')
        .reduce((sum, r) => sum + r.reward, 0);

    const handleClaimAll = () => {
        // Handle claim all logic here
        console.log('Claiming all rewards:', totalClaimable);
    };

    const handleClaimSingle = (rewardId: string) => {
        // Handle single claim logic here
        console.log('Claiming reward:', rewardId);
    };

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Top Bar */}
            <div className="bg-gray-900 border-b border-gray-800 px-6 py-3">
                <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-400">ENSEI UGT</div>
                    <div className="text-center">
                        <div className="text-lg font-semibold">Honors: 0 ≈ $0.00</div>
                    </div>
                    <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                        Demo Login
                    </button>
                </div>
            </div>

            <div className="flex">
                {/* Left Sidebar */}
                <div className="w-64 bg-gray-900 min-h-screen p-4">
                    <div className="text-xl font-bold text-green-500 mb-8">Ensei</div>
                    <nav className="space-y-2">
                        <a href="/dashboard" className="flex items-center text-gray-400 hover:text-white p-2 rounded">
                            <span className="mr-3">🏠</span> Dashboard
                        </a>
                        <a href="/missions" className="flex items-center text-gray-400 hover:text-white p-2 rounded">
                            <span className="mr-3">🔍</span> Discover & Earn
                        </a>
                        <a href="/missions/create" className="flex items-center text-gray-400 hover:text-white p-2 rounded">
                            <span className="mr-3">💼</span> Create Mission
                        </a>
                        <a href="/missions/my" className="flex items-center text-gray-400 hover:text-white p-2 rounded">
                            <span className="mr-3">📊</span> My Missions
                        </a>
                        <a href="/review" className="flex items-center text-gray-400 hover:text-white p-2 rounded">
                            <span className="mr-3">📄</span> Review
                        </a>
                        <a href="/claim" className="flex items-center text-green-500 bg-green-900/20 p-2 rounded">
                            <span className="mr-3">💰</span> Claim
                        </a>
                        <a href="/wallet" className="flex items-center text-gray-400 hover:text-white p-2 rounded">
                            <span className="mr-3">👛</span> Wallet
                        </a>
                    </nav>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-6">
                    <div className="max-w-6xl mx-auto">
                        <h1 className="text-3xl font-bold mb-8">Claim Rewards</h1>

                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-gray-800 rounded-lg p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-sm">Claimable Rewards</p>
                                        <p className="text-2xl font-bold">{totalClaimable.toLocaleString()} honors</p>
                                        <p className="text-sm text-gray-400">≈ ${(totalClaimable / 450).toFixed(2)} USD</p>
                                    </div>
                                    <div className="text-3xl">💰</div>
                                </div>
                            </div>

                            <div className="bg-gray-800 rounded-lg p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-sm">Total Claimed</p>
                                        <p className="text-2xl font-bold">{totalClaimed.toLocaleString()} honors</p>
                                        <p className="text-sm text-gray-400">≈ ${(totalClaimed / 450).toFixed(2)} USD</p>
                                    </div>
                                    <div className="text-3xl">✅</div>
                                </div>
                            </div>

                            <div className="bg-gray-800 rounded-lg p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-sm">Pending Approvals</p>
                                        <p className="text-2xl font-bold">{claimableRewards.filter(r => r.status === 'pending').length}</p>
                                        <p className="text-sm text-gray-400">submissions</p>
                                    </div>
                                    <div className="text-3xl">⏳</div>
                                </div>
                            </div>
                        </div>

                        {/* Claim All Button */}
                        {totalClaimable > 0 && (
                            <div className="bg-green-900/20 border border-green-600 rounded-lg p-6 mb-8">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-semibold mb-2">Claim All Rewards</h2>
                                        <p className="text-gray-400">Claim all your approved rewards at once</p>
                                    </div>
                                    <button
                                        onClick={handleClaimAll}
                                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        Claim {totalClaimable.toLocaleString()} Honors
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Status Filter */}
                        <div className="bg-gray-800 rounded-lg p-6 mb-8">
                            <h2 className="text-lg font-semibold mb-4">Filter by Status</h2>
                            <div className="flex space-x-4">
                                <button
                                    onClick={() => setSelectedStatus('all')}
                                    className={`px-4 py-2 rounded-lg text-sm ${selectedStatus === 'all'
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        }`}
                                >
                                    All ({claimableRewards.length})
                                </button>
                                <button
                                    onClick={() => setSelectedStatus('claimable')}
                                    className={`px-4 py-2 rounded-lg text-sm ${selectedStatus === 'claimable'
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        }`}
                                >
                                    Claimable ({claimableRewards.filter(r => r.status === 'claimable').length})
                                </button>
                                <button
                                    onClick={() => setSelectedStatus('claimed')}
                                    className={`px-4 py-2 rounded-lg text-sm ${selectedStatus === 'claimed'
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        }`}
                                >
                                    Claimed ({claimableRewards.filter(r => r.status === 'claimed').length})
                                </button>
                            </div>
                        </div>

                        {/* Rewards List */}
                        <div className="space-y-6">
                            {filteredRewards.map((reward) => (
                                <div key={reward.id} className="bg-gray-800 rounded-lg p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-2xl">
                                                    {reward.platform === 'twitter' && '𝕏'}
                                                    {reward.platform === 'instagram' && '📸'}
                                                    {reward.platform === 'tiktok' && '🎵'}
                                                    {reward.platform === 'facebook' && '📘'}
                                                    {reward.platform === 'whatsapp' && '💬'}
                                                    {reward.platform === 'snapchat' && '👻'}
                                                    {reward.platform === 'telegram' && '📱'}
                                                </span>
                                                <span className={`px-2 py-1 rounded text-xs ${reward.type === 'engage' ? 'bg-blue-600 text-white' :
                                                        reward.type === 'content' ? 'bg-purple-600 text-white' :
                                                            'bg-yellow-600 text-white'
                                                    }`}>
                                                    {reward.type.charAt(0).toUpperCase() + reward.type.slice(1)}
                                                </span>
                                                <span className={`px-2 py-1 rounded text-xs ${reward.status === 'claimable' ? 'bg-green-600 text-white' :
                                                        reward.status === 'claimed' ? 'bg-gray-600 text-gray-300' :
                                                            'bg-yellow-600 text-white'
                                                    }`}>
                                                    {reward.status.charAt(0).toUpperCase() + reward.status.slice(1)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-400">Reward</p>
                                            <p className="text-lg font-semibold">{reward.reward.toLocaleString()} honors</p>
                                            <p className="text-sm text-gray-400">≈ ${(reward.reward / 450).toFixed(2)} USD</p>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-semibold mb-2">{reward.missionTitle}</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        <div>
                                            <p className="text-sm text-gray-400">Submitted</p>
                                            <p className="font-semibold">{new Date(reward.submittedAt).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-400">Approved</p>
                                            <p className="font-semibold">{new Date(reward.approvedAt).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-400">Mission ID</p>
                                            <p className="font-semibold">{reward.missionId}</p>
                                        </div>
                                    </div>

                                    {reward.status === 'claimable' && (
                                        <div className="flex justify-end">
                                            <button
                                                onClick={() => handleClaimSingle(reward.id)}
                                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                            >
                                                Claim {reward.reward.toLocaleString()} Honors
                                            </button>
                                        </div>
                                    )}

                                    {reward.status === 'claimed' && (
                                        <div className="flex justify-end">
                                            <span className="text-green-400 text-sm">✓ Claimed</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {filteredRewards.length === 0 && (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">💰</div>
                                <h3 className="text-xl font-semibold mb-2">No rewards found</h3>
                                <p className="text-gray-400">Complete missions to earn rewards</p>
                                <a href="/missions" className="inline-block mt-4 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
                                    Discover Missions
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
