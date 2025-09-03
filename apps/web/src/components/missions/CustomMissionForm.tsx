'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Custom mission creation schema
const customMissionSchema = z.object({
    customTitle: z.string().min(3, 'Title must be at least 3 characters').max(120, 'Title must be less than 120 characters'),
    customDescription: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
    avgTimeMinutes: z.number().min(1, 'Time must be at least 1 minute').max(1440, 'Time must be less than 24 hours'),
    proofMode: z.enum(['social-post', 'api']),
    apiVerifierKey: z.string().optional(),
    platform: z.literal('custom'),
    type: z.enum(['engage', 'content', 'ambassador']),
    model: z.enum(['fixed', 'degen']),
    title: z.string().min(3, 'Mission title must be at least 3 characters'),
    tasks: z.array(z.string()).min(1, 'At least one task is required'),
    premium: z.boolean(),
    cap: z.number().min(60, 'Minimum participant cap is 60'),
    rewards_per_user: z.number().positive('Rewards must be positive'),
    duration_hours: z.number().positive('Duration must be positive'),
    tweet_url: z.string().url('Must be a valid URL').optional(),
    tg_invite: z.string().optional(),
    brief: z.string().max(1000, 'Brief must be less than 1000 characters').optional(),
    instructions: z.string().max(2000, 'Instructions must be less than 2000 characters').optional(),
});

type CustomMissionFormData = z.infer<typeof customMissionSchema>;

interface CustomMissionFormProps {
    onSubmit: (data: CustomMissionFormData) => void;
    isLoading?: boolean;
}

export default function CustomMissionForm({ onSubmit, isLoading = false }: CustomMissionFormProps) {
    const [proofMode, setProofMode] = useState<'social-post' | 'api'>('social-post');
    const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
    } = useForm<CustomMissionFormData>({
        resolver: zodResolver(customMissionSchema),
        defaultValues: {
            platform: 'custom',
            proofMode: 'social-post',
            premium: false,
            cap: 60,
            model: 'fixed',
            type: 'engage',
        },
    });

    const watchedAvgTime = watch('avgTimeMinutes') || 0;
    const watchedCap = watch('cap') || 60;
    const watchedPremium = watch('premium') || false;

    // Calculate pricing based on time and settings
    const calculatePricing = () => {
        if (!watchedAvgTime || !watchedCap) return null;

        const baseUsd = (watchedAvgTime / 60) * 8; // $8/hour rate
        const platformFee = baseUsd * 1.0; // 100% platform fee
        const totalUsd = baseUsd + platformFee;
        const totalCost = watchedPremium ? totalUsd * 5 : totalUsd;
        const totalHonors = Math.round(totalCost * 450);
        const perUserHonors = Math.round(totalHonors / watchedCap);

        return {
            baseUsd: Math.round(baseUsd * 100) / 100,
            platformFee: Math.round(platformFee * 100) / 100,
            totalUsd: Math.round(totalCost * 100) / 100,
            totalHonors,
            perUserHonors,
        };
    };

    const pricing = calculatePricing();

    const handleTaskToggle = (task: string) => {
        setSelectedTasks(prev =>
            prev.includes(task)
                ? prev.filter(t => t !== task)
                : [...prev, task]
        );
        setValue('tasks', selectedTasks);
    };

    const handleFormSubmit = (data: CustomMissionFormData) => {
        const formData = {
            ...data,
            tasks: selectedTasks,
        };
        onSubmit(formData);
    };

    return (
        <div className="w-full">
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                {/* Custom Platform Configuration */}
                <div className="bg-black/30 p-4 sm:p-6 rounded-xl border border-gray-700/50">
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Custom Platform Settings</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Custom Mission Title *
                            </label>
                            <input
                                type="text"
                                {...register('customTitle')}
                                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                                placeholder="e.g., Brand Awareness Campaign"
                            />
                            {errors.customTitle && (
                                <p className="text-red-400 text-xs sm:text-sm mt-1">{errors.customTitle.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Average Completion Time (minutes) *
                            </label>
                            <input
                                type="number"
                                {...register('avgTimeMinutes', { valueAsNumber: true })}
                                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                                placeholder="30"
                                min="1"
                                max="1440"
                            />
                            {errors.avgTimeMinutes && (
                                <p className="text-red-400 text-xs sm:text-sm mt-1">{errors.avgTimeMinutes.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Custom Description
                            </label>
                            <textarea
                                {...register('customDescription')}
                                rows={3}
                                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base resize-none"
                                placeholder="Describe your custom mission requirements..."
                            />
                            {errors.customDescription && (
                                <p className="text-red-400 text-xs sm:text-sm mt-1">{errors.customDescription.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Proof Verification Mode *
                            </label>
                            <select
                                {...register('proofMode')}
                                onChange={(e) => setProofMode(e.target.value as 'social-post' | 'api')}
                                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                            >
                                <option value="social-post">Social Post URL</option>
                                <option value="api">API Verification</option>
                            </select>
                            {errors.proofMode && (
                                <p className="text-red-400 text-xs sm:text-sm mt-1">{errors.proofMode.message}</p>
                            )}
                        </div>

                        {proofMode === 'api' && (
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    API Verifier Key *
                                </label>
                                <select
                                    {...register('apiVerifierKey')}
                                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                                >
                                    <option value="">Select a verifier</option>
                                    <option value="http_ping">HTTP Ping</option>
                                    <option value="website_visit">Website Visit</option>
                                    <option value="steam_playtime">Steam Playtime</option>
                                    <option value="spotify_listen">Spotify Listen</option>
                                </select>
                                {errors.apiVerifierKey && (
                                    <p className="text-red-400 text-xs sm:text-sm mt-1">{errors.apiVerifierKey.message}</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Mission Configuration */}
                <div className="bg-black/30 p-4 sm:p-6 rounded-xl border border-gray-700/50">
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Mission Configuration</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Mission Title *
                            </label>
                            <input
                                type="text"
                                {...register('title')}
                                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                                placeholder="Enter mission title"
                            />
                            {errors.title && (
                                <p className="text-red-400 text-xs sm:text-sm mt-1">{errors.title.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Mission Type *
                            </label>
                            <select
                                {...register('type')}
                                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                            >
                                <option value="engage">Engage</option>
                                <option value="content">Content</option>
                                <option value="ambassador">Ambassador</option>
                            </select>
                            {errors.type && (
                                <p className="text-red-400 text-xs sm:text-sm mt-1">{errors.type.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Mission Model *
                            </label>
                            <select
                                {...register('model')}
                                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                            >
                                <option value="fixed">Fixed</option>
                                <option value="degen">Degen</option>
                            </select>
                            {errors.model && (
                                <p className="text-red-400 text-xs sm:text-sm mt-1">{errors.model.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Participant Cap *
                            </label>
                            <input
                                type="number"
                                {...register('cap', { valueAsNumber: true })}
                                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                                placeholder="60"
                                min="60"
                            />
                            {errors.cap && (
                                <p className="text-red-400 text-xs sm:text-sm mt-1">{errors.cap.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Rewards per User (Honors) *
                            </label>
                            <input
                                type="number"
                                {...register('rewards_per_user', { valueAsNumber: true })}
                                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                                placeholder="100"
                                min="1"
                            />
                            {errors.rewards_per_user && (
                                <p className="text-red-400 text-xs sm:text-sm mt-1">{errors.rewards_per_user.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Duration (hours) *
                            </label>
                            <input
                                type="number"
                                {...register('duration_hours', { valueAsNumber: true })}
                                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                                placeholder="24"
                                min="1"
                            />
                            {errors.duration_hours && (
                                <p className="text-red-400 text-xs sm:text-sm mt-1">{errors.duration_hours.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="mt-4 sm:mt-6">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                {...register('premium')}
                                className="h-4 w-4 text-green-600 focus:ring-green-500 bg-gray-800/50 border-gray-700/50 rounded"
                            />
                            <span className="ml-2 text-sm sm:text-base text-gray-300">
                                Enable premium features (5x cost multiplier)
                            </span>
                        </label>
                    </div>
                </div>

                {/* Custom Tasks */}
                <div className="bg-green-500/10 p-4 sm:p-6 rounded-xl border border-green-500/30">
                    <h3 className="text-lg sm:text-xl font-semibold text-green-400 mb-4">Custom Tasks</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        {['social_engagement', 'content_creation', 'brand_promotion', 'community_building'].map((task) => (
                            <div key={task} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={task}
                                    checked={selectedTasks.includes(task)}
                                    onChange={() => handleTaskToggle(task)}
                                    className="h-4 w-4 text-green-600 focus:ring-green-500 bg-gray-800/50 border-gray-700/50 rounded"
                                />
                                <label htmlFor={task} className="ml-2 text-sm sm:text-base text-gray-300 capitalize">
                                    {task.replace('_', ' ')}
                                </label>
                            </div>
                        ))}
                    </div>

                    {errors.tasks && (
                        <p className="text-red-400 text-xs sm:text-sm mt-2">{errors.tasks.message}</p>
                    )}
                </div>

                {/* Pricing Preview */}
                {pricing && (
                    <div className="bg-yellow-500/10 p-4 sm:p-6 rounded-xl border border-yellow-500/30">
                        <h3 className="text-lg sm:text-xl font-semibold text-yellow-400 mb-4">Pricing Preview</h3>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                            <div>
                                <span className="text-gray-400">Base Cost:</span>
                                <p className="font-semibold text-white">${pricing.baseUsd}</p>
                            </div>
                            <div>
                                <span className="text-gray-400">Platform Fee:</span>
                                <p className="font-semibold text-white">${pricing.platformFee}</p>
                            </div>
                            <div>
                                <span className="text-gray-400">Total Cost:</span>
                                <p className="font-semibold text-lg text-white">${pricing.totalUsd}</p>
                            </div>
                            <div>
                                <span className="text-gray-400">Per User:</span>
                                <p className="font-semibold text-white">{pricing.perUserHonors} Honors</p>
                            </div>
                        </div>

                        {watchedPremium && (
                            <div className="mt-4 p-3 bg-blue-500/20 rounded-lg border border-blue-500/30">
                                <p className="text-blue-300 text-xs sm:text-sm">
                                    <strong>Premium Mission:</strong> 5x cost multiplier applied
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Additional Fields */}
                <div className="bg-black/30 p-4 sm:p-6 rounded-xl border border-gray-700/50">
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Additional Information</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Tweet/Post URL
                            </label>
                            <input
                                type="url"
                                {...register('tweet_url')}
                                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                                placeholder="https://twitter.com/..."
                            />
                            {errors.tweet_url && (
                                <p className="text-red-400 text-xs sm:text-sm mt-1">{errors.tweet_url.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Telegram Invite Link
                            </label>
                            <input
                                type="text"
                                {...register('tg_invite')}
                                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                                placeholder="https://t.me/..."
                            />
                            {errors.tg_invite && (
                                <p className="text-red-400 text-xs sm:text-sm mt-1">{errors.tg_invite.message}</p>
                            )}
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Mission Brief
                            </label>
                            <textarea
                                {...register('brief')}
                                rows={3}
                                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base resize-none"
                                placeholder="Provide a brief overview of the mission..."
                            />
                            {errors.brief && (
                                <p className="text-red-400 text-xs sm:text-sm mt-1">{errors.brief.message}</p>
                            )}
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Instructions
                            </label>
                            <textarea
                                {...register('instructions')}
                                rows={4}
                                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base resize-none"
                                placeholder="Provide detailed instructions for participants..."
                            />
                            {errors.instructions && (
                                <p className="text-red-400 text-xs sm:text-sm mt-1">{errors.instructions.message}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isLoading || selectedTasks.length === 0}
                        className="px-6 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base transition-all duration-200"
                    >
                        {isLoading ? 'Creating Mission...' : 'Create Custom Mission'}
                    </button>
                </div>
            </form>
        </div>
    );
}

