'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ModernLayout } from '../../../components/layout/ModernLayout';
import { ModernCard } from '../../../components/ui/ModernCard';
import { ModernButton } from '../../../components/ui/ModernButton';
import { usePrefilledPack } from './usePrefilledPack';

export default function CreateMissionClient() {
    const prefilledPack = usePrefilledPack();
    const [missionType, setMissionType] = useState<'fixed' | 'dynamic'>('fixed');
    const [packId, setPackId] = useState('');

    // Auto-set mission type and pack ID from URL params
    useEffect(() => {
        if (prefilledPack?.pack) {
            setMissionType('fixed');
            setPackId(prefilledPack.pack.id);
        }
    }, [prefilledPack]);

    return (
        <ModernLayout currentPage="/missions/create">
            <div className="max-w-4xl mx-auto px-4 py-6">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent mb-4">
                        Create Mission
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Launch your engagement campaign across social media platforms
                    </p>
                </div>

                <ModernCard className="mb-8">
                    <h2 className="text-2xl font-bold mb-6 flex items-center">
                        <span className="mr-3 text-2xl">⚡</span>
                        Mission Type
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div
                            className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${missionType === 'fixed'
                                ? 'border-green-500 bg-green-500/10'
                                : 'border-gray-700 hover:border-gray-600'
                                }`}
                            onClick={() => setMissionType('fixed')}
                        >
                            <div className="text-center">
                                <div className="text-4xl mb-4">📦</div>
                                <h3 className="text-xl font-semibold mb-2">Fixed Mission</h3>
                                <p className="text-gray-400 mb-4">Use a pack for guaranteed engagement</p>
                                <div className="text-sm text-green-400">✓ Predictable results</div>
                                <div className="text-sm text-green-400">✓ Pack-based pricing</div>
                            </div>
                        </div>

                        <div
                            className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${missionType === 'dynamic'
                                ? 'border-blue-500 bg-blue-500/10'
                                : 'border-gray-700 hover:border-gray-600'
                                }`}
                            onClick={() => setMissionType('dynamic')}
                        >
                            <div className="text-center">
                                <div className="text-4xl mb-4">🎯</div>
                                <h3 className="text-xl font-semibold mb-2">Dynamic Mission</h3>
                                <p className="text-gray-400 mb-4">Pay per engagement achieved</p>
                                <div className="text-sm text-blue-400">✓ Pay only for results</div>
                                <div className="text-sm text-blue-400">✓ Flexible pricing</div>
                            </div>
                        </div>
                    </div>
                </ModernCard>

                {missionType === 'fixed' && (
                    <ModernCard className="mb-8">
                        <h2 className="text-2xl font-bold mb-6 flex items-center">
                            <span className="mr-3 text-2xl">📦</span>
                            Pack Selection
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Pack ID (optional)</label>
                                <input
                                    type="text"
                                    value={packId}
                                    onChange={(e) => setPackId(e.target.value)}
                                    placeholder="e.g., starter-pack, premium-pack"
                                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                    Leave empty to see all available packs
                                </p>
                            </div>

                            {packId && (
                                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                                    <p className="text-green-400 text-sm">
                                        ✓ Pack &quot;{packId}&quot; will be used for this mission
                                        {prefilledPack?.pack && (
                                            <span className="block text-xs text-green-300 mt-1">
                                                📦 {prefilledPack.pack.label} - ${prefilledPack.pack.priceUsd}
                                            </span>
                                        )}
                                    </p>
                                </div>
                            )}
                        </div>
                    </ModernCard>
                )}

                <ModernCard className="mb-8">
                    <h2 className="text-2xl font-bold mb-6 flex items-center">
                        <span className="mr-3 text-2xl">📝</span>
                        Mission Details
                    </h2>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Mission Title</label>
                            <input
                                type="text"
                                placeholder="Enter mission title"
                                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Description</label>
                            <textarea
                                placeholder="Describe what users need to do"
                                rows={4}
                                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Target URL</label>
                            <input
                                type="url"
                                placeholder="https://example.com/post"
                                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </ModernCard>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/missions">
                        <ModernButton variant="secondary" size="lg">
                            ← Back to Missions
                        </ModernButton>
                    </Link>
                    <ModernButton variant="success" size="lg">
                        🚀 Create Mission
                    </ModernButton>
                </div>
            </div>
        </ModernLayout>
    );
}

