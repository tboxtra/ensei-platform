'use client';

import { useState } from 'react';

export default function MyMissionsPage() {
    const [myMissions] = useState([
        {
            id: '1',
            platform: 'twitter',
            type: 'engage',
            title: 'Engage with our latest tweet about Web3',
            description: 'Like, retweet, and comment on our latest post about blockchain technology',
            status: 'active',
            participants: 45,
            maxParticipants: 100,
            reward: 320,
            totalCost: 32000,
            endsAt: '2024-01-15T10:00:00Z',
            tasks: ['like', 'retweet', 'comment'],
            submissions: 23
        },
        {
            id: '2',
            platform: 'instagram',
            type: 'content',
            title: 'Create content for our brand campaign',
            description: 'Create engaging content showcasing our new product line',
            status: 'completed',
            participants: 20,
            maxParticipants: 20,
            reward: 1800,
            totalCost: 36000,
            endsAt: '2024-01-10T10:00:00Z',
            tasks: ['feed_post', 'reel'],
            submissions: 20
        },
        {
            id: '3',
            platform: 'tiktok',
            type: 'ambassador',
            title: 'Become a brand ambassador',
            description: 'Change your profile picture and bio to represent our brand',
            status: 'active',
            participants: 12,
            maxParticipants: 50,
            reward: 600,
            totalCost: 30000,
            endsAt: '2024-01-18T10:00:00Z',
            tasks: ['pfp', 'hashtag_in_bio'],
            submissions: 12
        }
    ]);

    const [selectedStatus, setSelectedStatus] = useState('all');

    const filteredMissions = myMissions.filter(mission => {
        if (selectedStatus !== 'all' && mission.status !== selectedStatus) return false;
        return true;
    });

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
                        <a href="/missions/my" className="flex items-center text-green-500 bg-green-900/20 p-2 rounded">
                            <span className="mr-3">📊</span> My Missions
                        </a>
                        <a href="/review" className="flex items-center text-gray-400 hover:text-white p-2 rounded">
                            <span className="mr-3">📄</span> Review
                        </a>
                        <a href="/claim" className="flex items-center text-gray-400 hover:text-white p-2 rounded">
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
                        <div className="flex items-center justify-between mb-8">
                            <h1 className="text-3xl font-bold">My Missions</h1>
                            <a href="/missions/create" className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
                                Create New Mission
                            </a>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="bg-gray-800 rounded-lg p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-sm">Total Missions</p>
                                        <p className="text-2xl font-bold">{myMissions.length}</p>
                                    </div>
                                    <div className="text-3xl">📊</div>
                                </div>
                            </div>

                            <div className="bg-gray-800 rounded-lg p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-sm">Active Missions</p>
                                        <p className="text-2xl font-bold">{myMissions.filter(m => m.status === 'active').length}</p>
                                    </div>
                                    <div className="text-3xl">🚀</div>
                                </div>
                            </div>

                            <div className="bg-gray-800 rounded-lg p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-sm">Total Spent</p>
                                        <p className="text-2xl font-bold">${(myMissions.reduce((sum, m) => sum + m.totalCost, 0) / 450).toFixed(2)}</p>
                                    </div>
                                    <div className="text-3xl">💸</div>
                                </div>
                            </div>

                            <div className="bg-gray-800 rounded-lg p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-sm">Total Submissions</p>
                                        <p className="text-2xl font-bold">{myMissions.reduce((sum, m) => sum + m.submissions, 0)}</p>
                                    </div>
                                    <div className="text-3xl">📝</div>
                                </div>
                            </div>
                        </div>

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
                                    All ({myMissions.length})
                                </button>
                                <button
                                    onClick={() => setSelectedStatus('active')}
                                    className={`px-4 py-2 rounded-lg text-sm ${selectedStatus === 'active'
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        }`}
                                >
                                    Active ({myMissions.filter(m => m.status === 'active').length})
                                </button>
                                <button
                                    onClick={() => setSelectedStatus('completed')}
                                    className={`px-4 py-2 rounded-lg text-sm ${selectedStatus === 'completed'
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        }`}
                                >
                                    Completed ({myMissions.filter(m => m.status === 'completed').length})
                                </button>
                            </div>
                        </div>

                        {/* Missions List */}
                        <div className="space-y-6">
                            {filteredMissions.map((mission) => (
                                <div key={mission.id} className="bg-gray-800 rounded-lg p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-2xl">
                                                    {mission.platform === 'twitter' && '𝕏'}
                                                    {mission.platform === 'instagram' && '📸'}
                                                    {mission.platform === 'tiktok' && '🎵'}
                                                    {mission.platform === 'facebook' && '📘'}
                                                    {mission.platform === 'whatsapp' && '💬'}
                                                    {mission.platform === 'snapchat' && '👻'}
                                                    {mission.platform === 'telegram' && '📱'}
                                                </span>
                                                <span className={`px-2 py-1 rounded text-xs ${mission.type === 'engage' ? 'bg-blue-600 text-white' :
                                                        mission.type === 'content' ? 'bg-purple-600 text-white' :
                                                            'bg-yellow-600 text-white'
                                                    }`}>
                                                    {mission.type.charAt(0).toUpperCase() + mission.type.slice(1)}
                                                </span>
                                                <span className={`px-2 py-1 rounded text-xs ${mission.status === 'active' ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
                                                    }`}>
                                                    {mission.status.charAt(0).toUpperCase() + mission.status.slice(1)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-400">Total Cost</p>
                                            <p className="text-lg font-semibold">${(mission.totalCost / 450).toFixed(2)}</p>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-semibold mb-2">{mission.title}</h3>
                                    <p className="text-gray-400 mb-4">{mission.description}</p>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                        <div>
                                            <p className="text-sm text-gray-400">Reward per User</p>
                                            <p className="font-semibold">{mission.reward} honors</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-400">Participants</p>
                                            <p className="font-semibold">{mission.participants}/{mission.maxParticipants}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-400">Submissions</p>
                                            <p className="font-semibold">{mission.submissions}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-400">Ends</p>
                                            <p className="font-semibold">{new Date(mission.endsAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <p className="text-sm text-gray-400 mb-2">Tasks:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {mission.tasks.map((task) => (
                                                <span key={task} className="px-3 py-1 bg-gray-700 rounded text-sm">
                                                    {task.replace(/_/g, ' ').toUpperCase()}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex space-x-4">
                                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                            View Submissions
                                        </button>
                                        <button className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors">
                                            Edit Mission
                                        </button>
                                        {mission.status === 'active' && (
                                            <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                                                End Mission
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {filteredMissions.length === 0 && (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">📊</div>
                                <h3 className="text-xl font-semibold mb-2">No missions found</h3>
                                <p className="text-gray-400">Create your first mission to get started</p>
                                <a href="/missions/create" className="inline-block mt-4 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
                                    Create Mission
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
