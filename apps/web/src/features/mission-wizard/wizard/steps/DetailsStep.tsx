'use client';

import React from 'react';
import { WizardState, canContinueToReview, validateStep } from '../types/wizard.types';

interface DetailsStepProps {
    state: WizardState;
    updateState: (updates: Partial<WizardState>) => void;
    onNext: () => void;
}

// URL normalization helper to match backend
const normalizeUrl = (url: string) =>
    (url || '')
        .replace(/x\.com/gi, 'twitter.com')
        .split(/[?#]/)[0]
        .trim();

export const DetailsStep: React.FC<DetailsStepProps> = ({
    state,
    updateState,
    onNext,
}) => {
    // ✅ FIX: Use the same validation as the step validator for consistency
    const { isValid: stepValid } = validateStep(6, state); // Details is step 6

    // Debug logging to help troubleshoot validation issues
    React.useEffect(() => {
        console.log('=== DETAILS STEP DEBUG ===');
        console.log('canContinueToReview:', canContinueToReview(state));
        console.log('stepValid (step 6):', stepValid);
        console.log('Mission state:', state);
        console.log('==========================');
    }, [state, stepValid]);
    const handleContentLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateState({ contentLink: e.target.value });
    };

    const handleContentLinkBlur = () => {
        // Normalize URL on blur to match backend expectations
        updateState({ contentLink: normalizeUrl(state.contentLink) });
    };

    const handleInstructionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        updateState({ instructions: e.target.value });
    };

    const getPlaceholder = () => {
        switch (state.platform) {
            case 'twitter':
                return 'https://x.com/username/status/1234567890';
            case 'instagram':
                return 'https://instagram.com/p/ABC123/';
            case 'tiktok':
                return 'https://tiktok.com/@username/video/1234567890';
            case 'facebook':
                return 'https://facebook.com/username/posts/1234567890';
            default:
                return 'https://example.com/content';
        }
    };

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    Mission Details
                </h2>
                <p className="text-gray-400 text-lg">Provide the content and instructions for your mission</p>
            </div>

            <div className="space-y-8">
                {/* Content Link */}
                <div className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700/50">
                    <label className="block text-lg font-semibold mb-4 text-white">Content Link</label>
                    <div className="space-y-3">
                        <input
                            type="url"
                            value={state.contentLink}
                            onChange={handleContentLinkChange}
                            onBlur={handleContentLinkBlur}
                            className="w-full p-4 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-medium"
                            placeholder={getPlaceholder()}
                        />
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <span className="text-blue-400">💡</span>
                            <span>Paste the Twitter/X post URL that participants will engage with</span>
                        </div>
                    </div>
                </div>

                {/* Instructions */}
                <div className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700/50">
                    <label className="block text-lg font-semibold mb-4 text-white">Instructions</label>
                    <div className="space-y-3">
                        <textarea
                            rows={6}
                            value={state.instructions}
                            onChange={handleInstructionsChange}
                            className="w-full p-4 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-lg font-medium"
                            placeholder="Enter detailed mission instructions for participants..."
                        />
                        <div className="flex items-center justify-between text-sm text-gray-400">
                            <div className="flex items-center gap-2">
                                <span className="text-green-400">📝</span>
                                <span>Be specific about what participants should do</span>
                            </div>
                            <div className="text-xs">
                                {state.instructions.length}/2000 characters
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-center">
                {!stepValid && (
                    <p className="text-gray-500 text-sm mt-3">
                        Please complete all required fields to continue
                    </p>
                )}
            </div>
        </div>
    );
};
