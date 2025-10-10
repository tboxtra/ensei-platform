'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ModernLayout } from '../../../components/layout/ModernLayout';
import { ModernCard } from '../../../components/ui/ModernCard';
import { ModernButton } from '../../../components/ui/ModernButton';
import { usePrefilledPack } from './usePrefilledPack';
import { useApi } from '../../../hooks/useApi';
import { useRouter } from 'next/navigation';

export default function CreateMissionClient() {
    const prefilledPack = usePrefilledPack();
    const api = useApi();
    const router = useRouter();
    const [missionType, setMissionType] = useState<'fixed' | 'dynamic'>('fixed');
    const [packId, setPackId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    
    // Form state
    const [tweetLink, setTweetLink] = useState('');
    const [instructions, setInstructions] = useState('');
    const [tasks, setTasks] = useState<string[]>(['']);
    const [cap, setCap] = useState<number>(10);
    const [durationHours, setDurationHours] = useState<number>(24);

    // Auto-set mission type and pack ID from URL params
    useEffect(() => {
        if (prefilledPack?.pack) {
            setMissionType('fixed');
            setPackId(prefilledPack.pack.id);
        }
    }, [prefilledPack]);

    // Validation function
    const validateForm = () => {
        if (!packId) {
            setSubmitError('Please select a pack for this mission');
            return false;
        }
        
        if (!prefilledPack?.entitlement) {
            setSubmitError('No active entitlement found for the selected pack. Please purchase the pack first.');
            return false;
        }
        
        if (!prefilledPack.isActive) {
            setSubmitError('The selected pack entitlement is not active');
            return false;
        }
        
        if (prefilledPack.isExpired) {
            setSubmitError('The selected pack entitlement has expired');
            return false;
        }
        
        if (prefilledPack.remainingQuota <= 0) {
            setSubmitError(`Insufficient quota remaining in the selected pack. You have ${prefilledPack.remainingQuota} tweets remaining, but need at least 1.`);
            return false;
        }
        
        if (!tweetLink.trim()) {
            setSubmitError('Please provide a tweet link');
            return false;
        }
        
        // Validate URL format
        try {
            new URL(tweetLink);
        } catch {
            setSubmitError('Please provide a valid URL for the tweet link');
            return false;
        }
        
        if (!instructions.trim()) {
            setSubmitError('Please provide mission instructions');
            return false;
        }
        
        if (instructions.trim().length < 10) {
            setSubmitError('Mission instructions must be at least 10 characters long');
            return false;
        }
        
        const validTasks = tasks.filter(task => task.trim());
        if (validTasks.length === 0) {
            setSubmitError('Please provide at least one task');
            return false;
        }
        
        // Validate each task
        for (let i = 0; i < validTasks.length; i++) {
            if (validTasks[i].trim().length < 5) {
                setSubmitError(`Task ${i + 1} must be at least 5 characters long`);
                return false;
            }
        }
        
        if (cap < 1 || cap > 1000) {
            setSubmitError('Participant cap must be between 1 and 1000');
            return false;
        }
        
        if (durationHours < 1 || durationHours > 168) {
            setSubmitError('Duration must be between 1 and 168 hours (1 week)');
            return false;
        }
        
        return true;
    };

    // Form submission handler
    const handleSubmit = async () => {
        setSubmitError(null);
        
        if (!validateForm()) {
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            const validTasks = tasks.filter(task => task.trim());
            
            const missionData = {
                platform: 'twitter', // Default to twitter for now
                type: 'engagement',
                model: missionType,
                packId: packId,
                tweetLink: tweetLink,
                instructions: instructions,
                tasks: validTasks,
                cap: cap,
                durationHours: durationHours,
                isPremium: true // Pack-based missions are premium
            };
            
            console.log('Creating mission with pack validation:', missionData);
            
            const createdMission = await api.createMission(missionData);
            
            console.log('Mission created successfully:', createdMission);
            
            // Redirect to the created mission or missions list
            router.push(`/missions/${createdMission.id}`);
            
        } catch (error) {
            console.error('Mission creation failed:', error);
            setSubmitError(error instanceof Error ? error.message : 'Failed to create mission');
        } finally {
            setIsSubmitting(false);
        }
    };

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

                            {packId && prefilledPack?.pack && (
                                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-green-400 text-sm font-medium">
                                            ✓ Pack &quot;{packId}&quot; will be used for this mission
                                        </p>
                                        <span className="text-xs text-green-300">
                                            📦 {prefilledPack.pack.label} - ${prefilledPack.pack.priceUsd}
                                        </span>
                                    </div>
                                    
                                    {prefilledPack.entitlement && (
                                        <div className="mt-3 space-y-3">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-gray-300">Status:</span>
                                                <span className={`font-medium ${
                                                    prefilledPack.isActive ? 'text-green-400' : 'text-red-400'
                                                }`}>
                                                    {prefilledPack.isActive ? '✅ Active' : '❌ Inactive'}
                                                </span>
                                            </div>
                                            
                                            <div className="flex justify-between text-xs">
                                                <span className="text-gray-300">Remaining Quota:</span>
                                                <span className={`font-medium ${
                                                    prefilledPack.remainingQuota > 0 ? 'text-green-400' : 'text-red-400'
                                                }`}>
                                                    {prefilledPack.remainingQuota} / {prefilledPack.pack.tweets} tweets
                                                </span>
                                            </div>
                                            
                                            {/* Progress bar for quota usage */}
                                            <div className="w-full">
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-gray-300">Usage:</span>
                                                    <span className="text-gray-300">
                                                        {prefilledPack.entitlement.usage.tweetsUsed} / {prefilledPack.pack.tweets}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-700 rounded-full h-2">
                                                    <div 
                                                        className={`h-2 rounded-full transition-all duration-300 ${
                                                            prefilledPack.remainingQuota > 0 ? 'bg-green-500' : 'bg-red-500'
                                                        }`}
                                                        style={{ 
                                                            width: `${Math.min(100, (prefilledPack.entitlement.usage.tweetsUsed / prefilledPack.pack.tweets) * 100)}%` 
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                            
                                            {prefilledPack.entitlement.endsAt && (
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-gray-300">Expires:</span>
                                                    <span className="text-yellow-400">
                                                        {new Date(prefilledPack.entitlement.endsAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            )}
                                            
                                            {/* Additional quota breakdown */}
                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-300">Likes:</span>
                                                    <span className="text-blue-400">
                                                        {prefilledPack.entitlement.usage.likes} / {prefilledPack.pack.quotas.likes}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-300">Retweets:</span>
                                                    <span className="text-purple-400">
                                                        {prefilledPack.entitlement.usage.retweets} / {prefilledPack.pack.quotas.retweets}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {!prefilledPack.entitlement && (
                                        <div className="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded">
                                            <p className="text-yellow-400 text-xs">
                                                ⚠️ No active entitlement found for this pack. You may need to purchase it first.
                                            </p>
                                        </div>
                                    )}
                                    
                                    {prefilledPack.entitlement && prefilledPack.remainingQuota <= 1 && prefilledPack.remainingQuota > 0 && (
                                        <div className="mt-2 p-2 bg-orange-500/10 border border-orange-500/20 rounded">
                                            <p className="text-orange-400 text-xs">
                                                ⚠️ Low quota remaining! Only {prefilledPack.remainingQuota} tweet{prefilledPack.remainingQuota !== 1 ? 's' : ''} left.
                                            </p>
                                        </div>
                                    )}
                                    
                                    {prefilledPack.entitlement && prefilledPack.remainingQuota === 0 && (
                                        <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded">
                                            <p className="text-red-400 text-xs">
                                                ❌ No quota remaining! This pack cannot be used for new missions.
                                            </p>
                                        </div>
                                    )}
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
                            <label className="block text-sm font-medium mb-2">Target URL</label>
                            <input
                                type="url"
                                value={tweetLink}
                                onChange={(e) => setTweetLink(e.target.value)}
                                placeholder="https://example.com/post"
                                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Instructions</label>
                            <textarea
                                value={instructions}
                                onChange={(e) => setInstructions(e.target.value)}
                                placeholder="Describe what users need to do"
                                rows={4}
                                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Tasks</label>
                            <div className="space-y-2">
                                {tasks.map((task, index) => (
                                    <input
                                        key={index}
                                        type="text"
                                        value={task}
                                        onChange={(e) => {
                                            const newTasks = [...tasks];
                                            newTasks[index] = e.target.value;
                                            setTasks(newTasks);
                                        }}
                                        placeholder={`Task ${index + 1}`}
                                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                ))}
                                <button
                                    type="button"
                                    onClick={() => setTasks([...tasks, ''])}
                                    className="text-green-400 hover:text-green-300 text-sm"
                                >
                                    + Add Task
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Participant Cap</label>
                                <input
                                    type="number"
                                    value={cap}
                                    onChange={(e) => setCap(parseInt(e.target.value) || 10)}
                                    min="1"
                                    max="1000"
                                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Duration (hours)</label>
                                <input
                                    type="number"
                                    value={durationHours}
                                    onChange={(e) => setDurationHours(parseInt(e.target.value) || 24)}
                                    min="1"
                                    max="168"
                                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>
                </ModernCard>

                {submitError && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <p className="text-red-400 text-sm">
                            ❌ {submitError}
                        </p>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/missions">
                        <ModernButton variant="secondary" size="lg">
                            ← Back to Missions
                        </ModernButton>
                    </Link>
                    <ModernButton 
                        variant="success" 
                        size="lg"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? '⏳ Creating...' : '🚀 Create Mission'}
                    </ModernButton>
                </div>
            </div>
        </ModernLayout>
    );
}

