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
        <div className="space-y-4">
            <div className="text-left mb-2">
                <h2 className="text-lg font-bold text-white mb-1">Mission Details</h2>
            </div>

            <div className="space-y-4">
                {/* Content Link */}
                <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                    <label className="block text-sm font-semibold mb-2 text-white">Content Link</label>
                    <input
                        type="url"
                        value={state.contentLink}
                        onChange={handleContentLinkChange}
                        onBlur={handleContentLinkBlur}
                        className="w-full p-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder={getPlaceholder()}
                    />
                </div>

                {/* Instructions */}
                <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                    <label className="block text-sm font-semibold mb-2 text-white">Instructions</label>
                    <textarea
                        rows={3}
                        value={state.instructions}
                        onChange={handleInstructionsChange}
                        className="w-full p-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                        placeholder="Enter mission instructions for participants..."
                    />
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
