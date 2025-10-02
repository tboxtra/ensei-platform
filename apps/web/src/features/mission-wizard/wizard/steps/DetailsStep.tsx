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
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-xl font-semibold mb-1">Mission Details</h2>
                <p className="text-gray-400 text-sm">Provide the content link and short instructions</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium mb-2">Content Link</label>
                    <input
                        type="url"
                        value={state.contentLink}
                        onChange={handleContentLinkChange}
                        onBlur={handleContentLinkBlur}
                        className="w-full p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder={getPlaceholder()}
                    />
                    <p className="hint mt-1">X links auto-normalize to twitter.com</p>
                </div>

                <div>
                    <label className="block text-xs font-medium mb-2">Instructions</label>
                    <textarea
                        rows={4}
                        value={state.instructions}
                        onChange={handleInstructionsChange}
                        className="w-full p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                        placeholder="Example: Like + Retweet the tweet."
                    />
                </div>
            </div>

        </div>
    );
};
