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
    const [missionType, setMissionType] = useState<'fixed' | 'degen'>('fixed');
    const [packId, setPackId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Form state
    const [tweetLink, setTweetLink] = useState('');
    const [instructions, setInstructions] = useState('');
    const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
    const [participantCap, setParticipantCap] = useState<'starter' | 'boost' | 'explosive'>('starter');
    const [durationHours, setDurationHours] = useState<number>(24);
    const [currentStep, setCurrentStep] = useState<'mission-type' | 'tasks' | 'settings' | 'payment'>('mission-type');

    // Available tasks for selection
    const availableTasks = [
        'Like the post',
        'Retweet the post',
        'Comment on the post',
        'Follow the account',
        'Share to story'
    ];

    // Participant cap options
    const capOptions = {
        starter: { label: 'Starter', cap: 100, description: 'Perfect for testing the waters' },
        boost: { label: 'Boost', cap: 200, description: 'Great for growing engagement' },
        explosive: { label: 'Explosive', cap: 500, description: 'Maximum reach and impact' }
    };

    // Auto-set mission type and pack ID from URL params
    useEffect(() => {
        if (prefilledPack?.pack) {
            setMissionType('fixed');
            setPackId(prefilledPack.pack.id);
        }
    }, [prefilledPack]);

    // Validation function
    const validateCurrentStep = () => {
        setSubmitError(null);

        switch (currentStep) {
            case 'mission-type':
                return true; // Mission type is always selected

            case 'tasks':
                if (selectedTasks.length !== 3) {
                    setSubmitError('Please select exactly 3 tasks');
                    return false;
                }
                return true;

            case 'settings':
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

                if (durationHours < 1 || durationHours > 168) {
                    setSubmitError('Duration must be between 1 and 168 hours (1 week)');
                    return false;
                }

                return true;

            case 'payment':
                // Payment validation will be handled in the payment step
                return true;

            default:
                return false;
        }
    };

    const nextStep = () => {
        if (validateCurrentStep()) {
            const steps = ['mission-type', 'tasks', 'settings', 'payment'];
            const currentIndex = steps.indexOf(currentStep);
            if (currentIndex < steps.length - 1) {
                setCurrentStep(steps[currentIndex + 1] as any);
            }
        }
    };

    const prevStep = () => {
        const steps = ['mission-type', 'tasks', 'settings', 'payment'];
        const currentIndex = steps.indexOf(currentStep);
        if (currentIndex > 0) {
            setCurrentStep(steps[currentIndex - 1] as any);
        }
    };

    // Form submission handler
    const handleSubmit = async () => {
        setSubmitError(null);

        if (!validateCurrentStep()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const missionData: any = {
                platform: 'twitter', // Default to twitter for now
                type: 'engagement',
                model: missionType,
                tweetLink: tweetLink,
                instructions: instructions,
                tasks: selectedTasks,
                cap: capOptions[participantCap].cap,
                durationHours: durationHours,
                isPremium: missionType === 'fixed' // Only fixed missions are premium (pack-based)
            };

            // Only include packId for fixed missions
            if (missionType === 'fixed') {
                missionData.packId = packId;
            }

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

    // Debug logging
    console.log('Current step:', currentStep);
    console.log('Mission type:', missionType);
    console.log('Selected tasks:', selectedTasks);

    return (
        <ModernLayout currentPage="/missions/create">
            <div className="max-w-4xl mx-auto px-4 py-6">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent mb-4">
                        Create Mission (Updated)
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Launch your engagement campaign across social media platforms
                    </p>
                    <p className="text-xs text-yellow-400 mt-2">
                        Current Step: {currentStep} | Mission Type: {missionType}
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-center space-x-4">
                        {['mission-type', 'tasks', 'settings', 'payment'].map((step, index) => {
                            const stepNames = ['Mission Type', 'Tasks', 'Settings', 'Payment'];
                            const isActive = currentStep === step;
                            const isCompleted = ['mission-type', 'tasks', 'settings', 'payment'].indexOf(currentStep) > index;

                            return (
                                <div key={step} className="flex items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${isActive ? 'bg-green-500 text-white' :
                                        isCompleted ? 'bg-green-400 text-white' :
                                            'bg-gray-700 text-gray-400'
                                        }`}>
                                        {isCompleted ? '✓' : index + 1}
                                    </div>
                                    <span className={`ml-2 text-sm ${isActive ? 'text-green-400' :
                                        isCompleted ? 'text-green-300' :
                                            'text-gray-500'
                                        }`}>
                                        {stepNames[index]}
                                    </span>
                                    {index < 3 && (
                                        <div className={`w-8 h-0.5 mx-4 ${isCompleted ? 'bg-green-400' : 'bg-gray-700'
                                            }`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Step 1: Mission Type Selection */}
                {currentStep === 'mission-type' && (
                    <ModernCard className="mb-8">
                        <h2 className="text-2xl font-bold mb-6 flex items-center">
                            <span className="mr-3 text-2xl">🎯</span>
                            Choose Mission Type
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
                                    <p className="text-gray-400 mb-4">Pay upfront with engagement packs</p>
                                    <div className="text-sm text-green-400">✓ Predictable costs</div>
                                    <div className="text-sm text-green-400">✓ Pack-based pricing</div>
                                </div>
                            </div>

                            <div
                                className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${missionType === 'degen'
                                    ? 'border-blue-500 bg-blue-500/10'
                                    : 'border-gray-700 hover:border-gray-600'
                                    }`}
                                onClick={() => setMissionType('degen')}
                            >
                                <div className="text-center">
                                    <div className="text-4xl mb-4">🎯</div>
                                    <h3 className="text-xl font-semibold mb-2">Degen Mission</h3>
                                    <p className="text-gray-400 mb-4">Pay per engagement achieved</p>
                                    <div className="text-sm text-blue-400">✓ Pay only for results</div>
                                    <div className="text-sm text-blue-400">✓ Flexible pricing</div>
                                </div>
                            </div>
                        </div>
                    </ModernCard>
                )}

                {/* Step 2: Task Selection */}
                {currentStep === 'tasks' && (
                    <ModernCard className="mb-8">
                        <h2 className="text-2xl font-bold mb-6 flex items-center">
                            <span className="mr-3 text-2xl">📋</span>
                            Select Tasks (Choose 3 of 5)
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {availableTasks.map((task, index) => {
                                const isSelected = selectedTasks.includes(task);
                                return (
                                    <div
                                        key={index}
                                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${isSelected
                                            ? 'border-green-500 bg-green-500/10'
                                            : 'border-gray-700 hover:border-gray-600'
                                            }`}
                                        onClick={() => {
                                            if (isSelected) {
                                                setSelectedTasks(selectedTasks.filter(t => t !== task));
                                            } else if (selectedTasks.length < 3) {
                                                setSelectedTasks([...selectedTasks, task]);
                                            }
                                        }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-white">{task}</span>
                                            {isSelected && <span className="text-green-400">✓</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                            <p className="text-blue-400 text-sm">
                                Selected: {selectedTasks.length}/3 tasks
                            </p>
                        </div>
                    </ModernCard>
                )}

                {/* Step 3: Mission Settings */}
                {currentStep === 'settings' && (
                    <ModernCard className="mb-8">
                        <h2 className="text-2xl font-bold mb-6 flex items-center">
                            <span className="mr-3 text-2xl">⚙️</span>
                            Mission Settings
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Target URL</label>
                                <input
                                    type="url"
                                    value={tweetLink}
                                    onChange={(e) => setTweetLink(e.target.value)}
                                    placeholder="https://twitter.com/username/status/123456789"
                                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Instructions</label>
                                <textarea
                                    value={instructions}
                                    onChange={(e) => setInstructions(e.target.value)}
                                    placeholder="Describe what users need to do..."
                                    rows={4}
                                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Participant Cap</label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {Object.entries(capOptions).map(([key, option]) => (
                                        <div
                                            key={key}
                                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${participantCap === key
                                                ? 'border-green-500 bg-green-500/10'
                                                : 'border-gray-700 hover:border-gray-600'
                                                }`}
                                            onClick={() => setParticipantCap(key as any)}
                                        >
                                            <div className="text-center">
                                                <h3 className="text-lg font-semibold text-white">{option.label}</h3>
                                                <p className="text-2xl font-bold text-green-400 mb-2">{option.cap}</p>
                                                <p className="text-xs text-gray-400">{option.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
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
                    </ModernCard>
                )}

                {/* Step 4: Payment */}
                {currentStep === 'payment' && (
                    <ModernCard className="mb-8">
                        <h2 className="text-2xl font-bold mb-6 flex items-center">
                            <span className="mr-3 text-2xl">💳</span>
                            Payment Options
                        </h2>

                        <div className="space-y-6">
                            <div className="p-4 bg-gray-800/50 rounded-lg">
                                <h3 className="text-lg font-semibold mb-2">Mission Summary</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Type:</span>
                                        <span className="text-white">{missionType === 'fixed' ? 'Fixed Mission' : 'Degen Mission'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Tasks:</span>
                                        <span className="text-white">{selectedTasks.length} selected</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Participant Cap:</span>
                                        <span className="text-white">{capOptions[participantCap].label} ({capOptions[participantCap].cap} users)</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Duration:</span>
                                        <span className="text-white">{durationHours} hours</span>
                                    </div>
                                </div>
                            </div>

                            {missionType === 'fixed' ? (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Pack Options</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-4 border border-gray-700 rounded-lg">
                                            <h4 className="font-semibold text-white mb-2">Single Use Pack</h4>
                                            <p className="text-gray-400 text-sm mb-3">Perfect for this mission only</p>
                                            <div className="text-2xl font-bold text-green-400">$10</div>
                                        </div>
                                        <div className="p-4 border border-gray-700 rounded-lg">
                                            <h4 className="font-semibold text-white mb-2">Multi-Use Pack</h4>
                                            <p className="text-gray-400 text-sm mb-3">Save money for multiple missions</p>
                                            <div className="text-2xl font-bold text-green-400">$25</div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                    <h3 className="text-lg font-semibold text-blue-400 mb-2">Degen Mission Pricing</h3>
                                    <p className="text-blue-300 text-sm">
                                        You'll pay per engagement achieved. No upfront cost required.
                                    </p>
                                </div>
                            )}
                        </div>
                    </ModernCard>
                )}

                {submitError && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <p className="text-red-400 text-sm">
                            ❌ {submitError}
                        </p>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                    <div>
                        {currentStep !== 'mission-type' && (
                            <ModernButton variant="secondary" size="lg" onClick={prevStep}>
                                ← Previous
                            </ModernButton>
                        )}
                    </div>

                    <div className="flex gap-4">
                        <Link href="/missions">
                            <ModernButton variant="secondary" size="lg">
                                Cancel
                            </ModernButton>
                        </Link>

                        {currentStep === 'payment' ? (
                            <ModernButton
                                variant="success"
                                size="lg"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? '⏳ Creating...' : '🚀 Create Mission'}
                            </ModernButton>
                        ) : (
                            <ModernButton variant="success" size="lg" onClick={nextStep}>
                                Next →
                            </ModernButton>
                        )}
                    </div>
                </div>
            </div>
        </ModernLayout>
    );
}