'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function WalletClient() {
    const [activeTab, setActiveTab] = useState<'wallet' | 'packs' | 'my-packs'>('wallet');

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <nav className="bg-gray-800 border-b border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Link href="/" className="text-xl font-bold">Ensei Platform</Link>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link href="/missions" className="text-gray-300 hover:text-white">Discover</Link>
                            <Link href="/wallet" className="bg-gray-700 text-white px-3 py-2 rounded-md">Wallet</Link>
                            <Link href="/dashboard" className="text-gray-300 hover:text-white">Dashboard</Link>
                            <Link href="/admin" className="text-gray-300 hover:text-white">Admin</Link>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {/* Demo Mode Banner */}
                <div className="mb-6 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <div className="flex items-center">
                        <div className="text-blue-400 text-2xl mr-3">🎭</div>
                        <div>
                            <h3 className="text-blue-400 font-semibold">Demo Mode Active</h3>
                            <p className="text-gray-400 text-sm">
                                You&apos;re viewing demo data. Configure API endpoints to see live data.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="text-left mb-6">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-2">Wallet</h1>
                    <p className="text-gray-400">Manage your Honors balance and transaction history</p>
                </div>

                {/* Tab Navigation */}
                <div className="flex space-x-1 mb-6 bg-gray-800/50 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('wallet')}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === 'wallet'
                            ? 'bg-gray-700 text-white'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        💰 Wallet
                    </button>
                    <button
                        onClick={() => setActiveTab('packs')}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === 'packs'
                            ? 'bg-gray-700 text-white'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        📦 Packs
                    </button>
                    <button
                        onClick={() => setActiveTab('my-packs')}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === 'my-packs'
                            ? 'bg-gray-700 text-white'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        🎒 My Packs
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'wallet' && (
                    <div className="space-y-6">
                        {/* Balance Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-green-400 text-sm font-medium">Available Balance</p>
                                        <p className="text-3xl font-bold text-white">1,250 Honors</p>
                                        <p className="text-sm text-green-300">≈ $2.78 USD</p>
                                    </div>
                                    <div className="text-4xl">🏆</div>
                                </div>
                            </div>

                            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-yellow-400 text-sm font-medium">Pending Balance</p>
                                        <p className="text-3xl font-bold text-white">0 Honors</p>
                                        <p className="text-sm text-yellow-300">≈ $0.00 USD</p>
                                    </div>
                                    <div className="text-4xl">⏳</div>
                                </div>
                            </div>

                            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-blue-400 text-sm font-medium">Total Earned</p>
                                        <p className="text-3xl font-bold text-white">1,250 Honors</p>
                                        <p className="text-sm text-blue-300">≈ $2.78 USD</p>
                                    </div>
                                    <div className="text-4xl">📈</div>
                                </div>
                            </div>

                            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-purple-400 text-sm font-medium">Total Withdrawn</p>
                                        <p className="text-3xl font-bold text-white">0 Honors</p>
                                        <p className="text-sm text-purple-300">≈ $0.00 USD</p>
                                    </div>
                                    <div className="text-4xl">💸</div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                            <h2 className="text-xl font-bold mb-6 flex items-center">
                                <span className="mr-3 text-2xl">⚡</span>
                                Quick Actions
                            </h2>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center">
                                    <span className="mr-2">💸</span>
                                    Withdraw Funds
                                </button>
                                <button className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center">
                                    <span className="mr-2">📊</span>
                                    View Analytics
                                </button>
                                <button className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center">
                                    <span className="mr-2">📄</span>
                                    Export History
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'packs' && (
                    <div className="space-y-10">
                        <section>
                            <h2 className="text-lg font-semibold mb-3 text-white">Single-use Packs</h2>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <div className="font-medium text-white">Starter Pack</div>
                                        <div className="text-base font-semibold text-green-400">$9.99</div>
                                    </div>
                                    <ul className="text-sm text-gray-400 space-y-1">
                                        <li>Likes: 50</li>
                                        <li>Retweets: 25</li>
                                        <li>Comments: 10</li>
                                    </ul>
                                    <button className="mt-2 inline-flex items-center justify-center rounded-md bg-green-600 text-white py-2 px-4 hover:bg-green-700 transition-colors">
                                        Buy Pack →
                                    </button>
                                </div>

                                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <div className="font-medium text-white">Premium Pack</div>
                                        <div className="text-base font-semibold text-green-400">$29.99</div>
                                    </div>
                                    <ul className="text-sm text-gray-400 space-y-1">
                                        <li>Likes: 150</li>
                                        <li>Retweets: 75</li>
                                        <li>Comments: 30</li>
                                    </ul>
                                    <button className="mt-2 inline-flex items-center justify-center rounded-md bg-green-600 text-white py-2 px-4 hover:bg-green-700 transition-colors">
                                        Buy Pack →
                                    </button>
                                </div>

                                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <div className="font-medium text-white">Enterprise Pack</div>
                                        <div className="text-base font-semibold text-green-400">$99.99</div>
                                    </div>
                                    <ul className="text-sm text-gray-400 space-y-1">
                                        <li>Likes: 500</li>
                                        <li>Retweets: 250</li>
                                        <li>Comments: 100</li>
                                    </ul>
                                    <button className="mt-2 inline-flex items-center justify-center rounded-md bg-green-600 text-white py-2 px-4 hover:bg-green-700 transition-colors">
                                        Buy Pack →
                                    </button>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold mb-3 text-white">Subscription Packs</h2>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <div className="font-medium text-white">Monthly Pro</div>
                                        <div className="text-base font-semibold text-green-400">$19.99/mo</div>
                                    </div>
                                    <ul className="text-sm text-gray-400 space-y-1">
                                        <li>Likes: 100/hour</li>
                                        <li>Retweets: 50/hour</li>
                                        <li>Comments: 20/hour</li>
                                        <li>Max 1 tweet/hour</li>
                                        <li>Duration: 30 days</li>
                                    </ul>
                                    <button className="mt-2 inline-flex items-center justify-center rounded-md bg-green-600 text-white py-2 px-4 hover:bg-green-700 transition-colors">
                                        Buy Pack →
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === 'my-packs' && (
                    <div className="space-y-6">
                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                            <h2 className="text-xl font-bold mb-6 flex items-center">
                                <span className="mr-3 text-2xl">🎒</span>
                                My Active Packs
                            </h2>

                            <div className="space-y-4">
                                <div className="p-4 bg-gray-800/50 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="font-semibold">Starter Pack</div>
                                        <div className="text-sm text-green-400">Active</div>
                                    </div>
                                    <div className="text-sm text-gray-400 mb-2">
                                        Likes: 45/50 | Retweets: 20/25 | Comments: 8/10
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-2">
                                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '73%' }}></div>
                                    </div>
                                </div>

                                <div className="p-4 bg-gray-800/50 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="font-semibold">Premium Pack</div>
                                        <div className="text-sm text-green-400">Active</div>
                                    </div>
                                    <div className="text-sm text-gray-400 mb-2">
                                        Likes: 120/150 | Retweets: 60/75 | Comments: 25/30
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-2">
                                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '68%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}