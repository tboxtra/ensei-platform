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
                <h2 className="text-2xl font-bold mb-2">Mission Details</h2>
                <p className="text-gray-400">Provide the content and instructions for your mission</p>
            </div>

            <div className="space-y-8">
                <div>
                    <label className="block text-sm font-medium mb-3">Content Link</label>
                    <input
                        type="url"
                        value={state.contentLink}
                        onChange={handleContentLinkChange}
                        onBlur={handleContentLinkBlur}
                        className="w-full p-4 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                        placeholder={getPlaceholder()}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-3">Instructions</label>
                    <textarea
                        rows={6}
                        value={state.instructions}
                        onChange={handleInstructionsChange}
                        className="w-full p-4 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-lg"
                        placeholder="Enter detailed mission instructions for participants..."
                    />
                </div>
            </div>

            <div className="text-center">
                <button
                    disabled={!stepValid}
                    onClick={onNext}
                    className={`font-bold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg ${stepValid
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        }`}
                >
                    Review Mission →
                </button>
                {!stepValid && (
                    <p className="text-sm text-gray-400 mt-2">
                        Please complete all required fields to continue
                    </p>
                )}
            </div>
        </div>
    );
};
