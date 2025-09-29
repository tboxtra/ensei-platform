'use client';

import React from 'react';
import { useWizardState } from '../state/useWizardState';

interface DetailsStepProps {
    onNext: () => void;
    onPrevious: () => void;
    canGoNext: boolean;
    canGoPrevious: boolean;
}

export function DetailsStep({ onNext, canGoNext }: DetailsStepProps) {
    const { platform, details, setDetails } = useWizardState();

    const handleTweetLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDetails({ tweetLink: e.target.value });
    };

    const handleInstructionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setDetails({ instructions: e.target.value });
    };

    const handleContinue = () => {
        if (details.instructions.length >= 10) {
            onNext();
        }
    };

    // Get platform-specific placeholder
    const getPlaceholder = () => {
        switch (platform) {
            case 'twitter':
                return 'https://x.com/username/status/1234567890';
            case 'instagram':
                return 'https://instagram.com/p/ABC123/';
            case 'tiktok':
                return 'https://tiktok.com/@username/video/1234567890';
            case 'facebook':
                return 'https://facebook.com/username/posts/1234567890';
            case 'telegram':
                return 'https://t.me/channel_name/123';
            case 'whatsapp':
                return 'https://wa.me/1234567890';
            case 'snapchat':
                return 'https://snapchat.com/add/username';
            default:
                return 'https://example.com/content-link';
        }
    };

    const getInstructionsPlaceholder = () => {
        switch (platform) {
            case 'twitter':
                return 'Please like, retweet, and comment on the post. Make sure your comment is meaningful and adds value to the conversation. Use relevant hashtags if appropriate.';
            case 'instagram':
                return 'Like the post, leave a thoughtful comment, and share it to your story if you feel it resonates with your audience. Tag relevant friends who might be interested.';
            case 'tiktok':
                return 'Watch the video, like it, and leave a creative comment. Consider creating a duet or stitch if the content inspires you. Share with friends who would enjoy it.';
            case 'facebook':
                return 'Like the post, share it with your network, and leave a constructive comment. Consider sharing in relevant groups where it would be valuable.';
            case 'telegram':
                return 'Join the channel, react to the message, and share it with your contacts. Leave a helpful comment in the discussion.';
            case 'whatsapp':
                return 'Share the status with your contacts, react to it, and forward to relevant groups. Make sure the content is appropriate for your audience.';
            case 'snapchat':
                return 'View the snap, take a screenshot if allowed, and share it with your friends. Add your own creative twist to the content.';
            default:
                return 'Follow the instructions carefully and complete all required tasks. Make sure to provide proof of completion as requested.';
        }
    };

    return (
        <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Mission Details</h2>
            <p className="text-gray-400 mb-8">Provide the content and instructions for your mission</p>

            <div className="space-y-8 max-w-2xl mx-auto">
                {/* Content Link */}
                <div className="text-left">
                    <label className="block text-sm font-medium mb-3 text-gray-300">
                        Content Link
                    </label>
                    <input
                        type="url"
                        value={details.tweetLink || ''}
                        onChange={handleTweetLinkChange}
                        className="w-full p-4 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                        placeholder={getPlaceholder()}
                    />
                    <p className="text-xs text-gray-400 mt-2">
                        Link to the content participants should engage with
                    </p>
                </div>

                {/* Instructions */}
                <div className="text-left">
                    <label className="block text-sm font-medium mb-3 text-gray-300">
                        Instructions *
                    </label>
                    <textarea
                        rows={6}
                        value={details.instructions}
                        onChange={handleInstructionsChange}
                        className="w-full p-4 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-lg"
                        placeholder={getInstructionsPlaceholder()}
                    />
                    <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-gray-400">
                            Detailed instructions for participants (minimum 10 characters)
                        </p>
                        <p className={clsx(
                            'text-xs',
                            details.instructions.length >= 10 ? 'text-green-400' : 'text-red-400'
                        )}>
                            {details.instructions.length}/10
                        </p>
                    </div>
                </div>

                {/* Validation feedback */}
                {details.instructions.length > 0 && details.instructions.length < 10 && (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <p className="text-red-400 text-sm">
                            Instructions must be at least 10 characters long. Please provide more detailed guidance for participants.
                        </p>
                    </div>
                )}

                {details.instructions.length >= 10 && (
                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <p className="text-green-400 text-sm">
                            ✓ Instructions look good! Clear and detailed guidance for participants.
                        </p>
                    </div>
                )}

                {/* Platform-specific tips */}
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg text-left">
                    <h4 className="text-sm font-bold text-blue-400 mb-2">
                        💡 Tips for {platform?.charAt(0).toUpperCase()}{platform?.slice(1)} Missions
                    </h4>
                    <ul className="text-xs text-gray-300 space-y-1">
                        {platform === 'twitter' && (
                            <>
                                <li>• Include relevant hashtags in your content link</li>
                                <li>• Encourage meaningful comments, not just emojis</li>
                                <li>• Consider asking for quote tweets with personal thoughts</li>
                            </>
                        )}
                        {platform === 'instagram' && (
                            <>
                                <li>• High-quality visuals work best for engagement</li>
                                <li>• Encourage story shares and saves</li>
                                <li>• Ask participants to tag friends who might be interested</li>
                            </>
                        )}
                        {platform === 'tiktok' && (
                            <>
                                <li>• Encourage creative duets and stitches</li>
                                <li>• Ask for comments that add to the conversation</li>
                                <li>• Consider trending sounds and hashtags</li>
                            </>
                        )}
                        {platform === 'facebook' && (
                            <>
                                <li>• Encourage sharing in relevant groups</li>
                                <li>• Ask for thoughtful comments and reactions</li>
                                <li>• Consider Facebook events for larger campaigns</li>
                            </>
                        )}
                        {platform === 'telegram' && (
                            <>
                                <li>• Encourage joining channels and groups</li>
                                <li>• Ask for message reactions and forwards</li>
                                <li>• Consider bot interactions for verification</li>
                            </>
                        )}
                        {platform === 'whatsapp' && (
                            <>
                                <li>• Encourage status shares and forwards</li>
                                <li>• Ask for group message sharing</li>
                                <li>• Consider broadcast lists for wider reach</li>
                            </>
                        )}
                        {platform === 'snapchat' && (
                            <>
                                <li>• Encourage story views and screenshots</li>
                                <li>• Ask for creative snaps and filters</li>
                                <li>• Consider Snap Map features for location-based missions</li>
                            </>
                        )}
                        {platform === 'custom' && (
                            <>
                                <li>• Provide clear verification requirements</li>
                                <li>• Include specific proof-of-completion criteria</li>
                                <li>• Consider API integration for automated verification</li>
                            </>
                        )}
                    </ul>
                </div>
            </div>

            {/* Continue button */}
            <div className="mt-8">
                <button
                    onClick={handleContinue}
                    disabled={details.instructions.length < 10}
                    className={clsx(
                        'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg',
                        details.instructions.length < 10 && 'opacity-50 cursor-not-allowed'
                    )}
                >
                    Review Mission →
                </button>
            </div>
        </div>
    );
}

// Helper function for conditional classes
function clsx(...classes: (string | boolean | undefined)[]): string {
    return classes.filter(Boolean).join(' ');
}
