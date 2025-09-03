'use client';

import { useState } from 'react';
import { ModernLayout } from '../../components/layout/ModernLayout';
import { ModernCard } from '../../components/ui/ModernCard';
import { ModernButton } from '../../components/ui/ModernButton';
import CustomMissionForm from '../../components/missions/CustomMissionForm';
import ReviewQueue from '../../components/reviews/ReviewQueue';
import ProofUrlInput from '../../components/missions/ProofUrlInput';

export default function DemoPage() {
    const [activeTab, setActiveTab] = useState<'custom' | 'review' | 'proof'>('custom');

    const handleCustomMissionSubmit = (data: any) => {
        console.log('Custom mission data:', data);
        alert('Custom mission created! Check console for details.');
    };

    return (
        <ModernLayout currentPage="/demo">
            <div className="max-w-7xl mx-auto p-4 md:p-6">
                <div className="mb-6 md:mb-8 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                        Ensei Platform Demo
                    </h1>
                    <p className="text-lg md:text-xl text-gray-400">
                        Experience the new Custom Platform and Decentralized Review System
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className="flex justify-center mb-8">
                    <div className="bg-gray-800/50 rounded-xl p-2 border border-gray-700/50">
                        {[
                            { id: 'custom', label: 'Custom Platform', icon: '⚡' },
                            { id: 'review', label: 'Review System', icon: '📋' },
                            { id: 'proof', label: 'Proof Validation', icon: '🔗' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`px-3 md:px-6 py-2 md:py-3 rounded-lg text-xs md:text-sm font-medium transition-all duration-300 ${activeTab === tab.id
                                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                                    }`}
                            >
                                <span className="mr-1 md:mr-2">{tab.icon}</span>
                                <span className="hidden sm:inline">{tab.label}</span>
                                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'custom' && (
                    <div className="space-y-8">
                        <ModernCard className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border-purple-500/30">
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-bold mb-2">Custom Platform Mission Creation</h2>
                                <p className="text-gray-400">
                                    Create custom missions with time-based pricing and flexible proof requirements
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
                                <div className="text-center p-3 md:p-4 bg-gray-800/50 rounded-lg">
                                    <div className="text-2xl md:text-3xl mb-2">⏱️</div>
                                    <h3 className="font-semibold mb-2 text-sm md:text-base">Time-Based Pricing</h3>
                                    <p className="text-xs md:text-sm text-gray-400">$8/hour rate with 100% platform fee</p>
                                </div>
                                <div className="text-center p-3 md:p-4 bg-gray-800/50 rounded-lg">
                                    <div className="text-2xl md:text-3xl mb-2">🔐</div>
                                    <h3 className="font-semibold mb-2 text-sm md:text-base">Flexible Proof</h3>
                                    <p className="text-xs md:text-sm text-gray-400">Social post URLs or API verification</p>
                                </div>
                                <div className="text-center p-3 md:p-4 bg-gray-800/50 rounded-lg">
                                    <div className="text-2xl md:text-3xl mb-2">👑</div>
                                    <h3 className="font-semibold mb-2 text-sm md:text-base">Premium Support</h3>
                                    <p className="text-xs md:text-sm text-gray-400">5x multiplier for premium features</p>
                                </div>
                            </div>

                            <CustomMissionForm onSubmit={handleCustomMissionSubmit} />
                        </ModernCard>
                    </div>
                )}

                {activeTab === 'review' && (
                    <div className="space-y-8">
                        <ModernCard className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30">
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-bold mb-2">Decentralized Review System</h2>
                                <p className="text-gray-400">
                                    Peer-to-peer review system with 5-star ratings and decentralized verification
                                </p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
                                <div className="text-center p-3 md:p-4 bg-gray-800/50 rounded-lg">
                                    <div className="text-xl md:text-2xl mb-2">👥</div>
                                    <h3 className="font-semibold text-xs md:text-sm">5 Peer Reviews</h3>
                                </div>
                                <div className="text-center p-3 md:p-4 bg-gray-800/50 rounded-lg">
                                    <div className="text-xl md:text-2xl mb-2">⭐</div>
                                    <h3 className="font-semibold text-xs md:text-sm">1-5 Star Rating</h3>
                                </div>
                                <div className="text-center p-3 md:p-4 bg-gray-800/50 rounded-lg">
                                    <div className="text-xl md:text-2xl mb-2">💰</div>
                                    <h3 className="font-semibold text-xs md:text-sm">Reviewer Rewards</h3>
                                </div>
                                <div className="text-center p-3 md:p-4 bg-gray-800/50 rounded-lg">
                                    <div className="text-xl md:text-2xl mb-2">⚡</div>
                                    <h3 className="font-semibold text-xs md:text-sm">Fast Processing</h3>
                                </div>
                            </div>

                            <ReviewQueue />
                        </ModernCard>
                    </div>
                )}

                {activeTab === 'proof' && (
                    <div className="space-y-8">
                        <ModernCard className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/30">
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-bold mb-2">Proof URL Validation</h2>
                                <p className="text-gray-400">
                                    Advanced URL validation with platform detection and real-time verification
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
                                <div className="text-center p-3 md:p-4 bg-gray-800/50 rounded-lg">
                                    <div className="text-2xl md:text-3xl mb-2">🔍</div>
                                    <h3 className="font-semibold mb-2 text-sm md:text-base">Platform Detection</h3>
                                    <p className="text-xs md:text-sm text-gray-400">Auto-detects Twitter, Instagram, TikTok, etc.</p>
                                </div>
                                <div className="text-center p-3 md:p-4 bg-gray-800/50 rounded-lg">
                                    <div className="text-2xl md:text-3xl mb-2">✅</div>
                                    <h3 className="font-semibold mb-2 text-sm md:text-base">Real-time Validation</h3>
                                    <p className="text-xs md:text-sm text-gray-400">Instant feedback on URL validity</p>
                                </div>
                                <div className="text-center p-3 md:p-4 bg-gray-800/50 rounded-lg">
                                    <div className="text-2xl md:text-3xl mb-2">🔗</div>
                                    <h3 className="font-semibold mb-2 text-sm md:text-base">Multiple URLs</h3>
                                    <p className="text-xs md:text-sm text-gray-400">Support for multiple proof links</p>
                                </div>
                            </div>

                            <div className="max-w-2xl mx-auto">
                                <ProofUrlInput
                                    value={['']}
                                    onChange={(urls) => console.log('Proof URLs:', urls)}
                                    proofRequirement={{
                                        mode: 'social-post',
                                        networks: ['twitter', 'instagram', 'tiktok']
                                    }}
                                />
                            </div>
                        </ModernCard>
                    </div>
                )}

                {/* Feature Overview */}
                <ModernCard className="mt-8 bg-gradient-to-r from-gray-800/50 to-gray-900/50">
                    <h2 className="text-2xl font-bold mb-6 text-center">Platform Features Overview</h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                        <div>
                            <h3 className="text-lg font-semibold mb-4 text-purple-400">Custom Platform</h3>
                            <ul className="space-y-2 text-sm text-gray-300">
                                <li>• Time-based pricing ($8/hour)</li>
                                <li>• 100% platform fee integration</li>
                                <li>• Premium multiplier (5x)</li>
                                <li>• Flexible proof requirements</li>
                                <li>• API verification support</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-4 text-green-400">Review System</h3>
                            <ul className="space-y-2 text-sm text-gray-300">
                                <li>• 5-peer decentralized review</li>
                                <li>• 1-5 star rating system</li>
                                <li>• Reviewer reward distribution</li>
                                <li>• Quality assurance workflow</li>
                                <li>• Transparent review process</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-4 text-blue-400">Proof Validation</h3>
                            <ul className="space-y-2 text-sm text-gray-300">
                                <li>• Multi-platform URL detection</li>
                                <li>• Real-time validation feedback</li>
                                <li>• Platform restriction enforcement</li>
                                <li>• Multiple proof link support</li>
                                <li>• Visual validation indicators</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-4 text-yellow-400">Mission Management</h3>
                            <ul className="space-y-2 text-sm text-gray-300">
                                <li>• Fixed and Degen models</li>
                                <li>• Participant cap management</li>
                                <li>• Premium user targeting</li>
                                <li>• Task-based pricing</li>
                                <li>• Automated calculations</li>
                            </ul>
                        </div>
                    </div>
                </ModernCard>
            </div>
        </ModernLayout>
    );
}
