'use client';

import React, { useState } from 'react';
import { XAccount } from '@/types/verification';
import { ModernButton } from '@/components/ui/ModernButton';
import { ModernInput } from '@/components/ui/ModernInput';

interface InlineVerificationProps {
    taskId: string;
    missionId: string;
    missionTitle: string;
    userXAccount?: XAccount;
    onVerificationSubmitted: (submission: any) => void;
}

export const InlineVerification: React.FC<InlineVerificationProps> = ({
    taskId,
    missionId,
    missionTitle,
    userXAccount,
    onVerificationSubmitted
}) => {
    const [showInput, setShowInput] = useState(false);
    const [submissionLink, setSubmissionLink] = useState('');
    const [validationStatus, setValidationStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
    const [error, setError] = useState('');

    const taskType = taskId === 'comment' ? 'Comment' : 'Quote';

    const validateSubmissionLink = async (link: string): Promise<boolean> => {
        if (!link.trim()) {
            setError('Please enter your submission link');
            return false;
        }

        // Basic URL validation
        try {
            new URL(link);
        } catch {
            setError('Please enter a valid URL');
            return false;
        }

        // Check if it's an X (Twitter) link
        if (!link.includes('twitter.com') && !link.includes('x.com')) {
            setError('Please enter a valid X (Twitter) link');
            return false;
        }

        // Check if username matches (if X account is linked)
        if (userXAccount) {
            const linkUsername = extractUsernameFromXLink(link);
            if (linkUsername && linkUsername.toLowerCase() !== userXAccount.username.toLowerCase()) {
                setError(`This link doesn't match your linked X account (@${userXAccount.username})`);
                return false;
            }
        }

        setError('');
        return true;
    };

    const extractUsernameFromXLink = (link: string): string | null => {
        try {
            const url = new URL(link);
            const pathParts = url.pathname.split('/').filter(part => part);

            // X link format: https://x.com/username/status/1234567890
            if (pathParts.length >= 1) {
                return pathParts[0];
            }

            return null;
        } catch {
            return null;
        }
    };

    const handleVerify = async () => {
        if (!submissionLink.trim()) {
            setError('Please enter your submission link');
            return;
        }

        if (!userXAccount) {
            setError('Please link your X account first to submit verifications');
            return;
        }

        setValidationStatus('validating');
        setError('');

        try {
            // Simulate 5-second validation
            await new Promise(resolve => setTimeout(resolve, 5000));

            const isValid = await validateSubmissionLink(submissionLink);

            if (!isValid) {
                setValidationStatus('invalid');
                // Show invalid status for 5 seconds
                setTimeout(() => {
                    setValidationStatus('idle');
                }, 5000);
                return;
            }

            setValidationStatus('valid');

            // Create verification submission
            const submission = {
                userId: 'current_user',
                missionId,
                taskId,
                submissionLink: submissionLink.trim(),
                username: userXAccount.username,
                status: 'pending',
                reviews: [],
                createdAt: new Date(),
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
                missionTitle,
                taskType
            };

            // Wait a moment to show the valid status, then submit
            setTimeout(() => {
                onVerificationSubmitted(submission);
                setShowInput(false);
                setSubmissionLink('');
                setValidationStatus('idle');
            }, 1000);
        } catch (err) {
            setError('Failed to submit verification. Please try again.');
            setValidationStatus('invalid');
            setTimeout(() => {
                setValidationStatus('idle');
            }, 5000);
        }
    };

    const handleLinkChange = (value: string) => {
        setSubmissionLink(value);
        setError('');
    };

    const getButtonStyle = () => {
        const baseStyle = 'px-2 py-1 rounded-lg text-xs font-medium transition-all duration-200 flex-shrink-0 shadow-[inset_-1px_-1px_2px_rgba(0,0,0,0.3),inset_1px_1px_2px_rgba(255,255,255,0.1)] hover:shadow-[inset_-1px_-1px_1px_rgba(0,0,0,0.2),inset_1px_1px_1px_rgba(255,255,255,0.15)]';

        switch (validationStatus) {
            case 'valid':
                return `${baseStyle} bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30`;
            case 'invalid':
                return `${baseStyle} bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30`;
            case 'validating':
                return `${baseStyle} bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border border-yellow-500/30`;
            default:
                return `${baseStyle} bg-gray-500/20 text-gray-400 hover:bg-gray-500/30`;
        }
    };

    const getButtonText = () => {
        const taskPrefix = taskId === 'quote' ? 'Quote' : taskId === 'comment' ? 'Comment' : '';
        switch (validationStatus) {
            case 'validating':
                return 'Validating...';
            case 'valid':
                return '✓ Verified';
            case 'invalid':
                return '✗ Invalid';
            default:
                return taskPrefix ? `Verify ${taskPrefix}` : 'Verify';
        }
    };

    if (!showInput) {
        const taskPrefix = taskId === 'quote' ? 'Quote' : taskId === 'comment' ? 'Comment' : '';
        return (
            <button
                onClick={() => setShowInput(true)}
                disabled={!userXAccount}
                className="px-2 py-1 rounded-lg text-xs font-medium transition-all duration-200 flex-shrink-0 shadow-[inset_-1px_-1px_2px_rgba(0,0,0,0.3),inset_1px_1px_2px_rgba(255,255,255,0.1)] hover:shadow-[inset_-1px_-1px_1px_rgba(0,0,0,0.2),inset_1px_1px_1px_rgba(255,255,255,0.15)] bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {taskPrefix ? `Verify ${taskPrefix}` : 'Verify'}
            </button>
        );
    }

    return (
        <div className="flex gap-2 items-center">
            <div className="flex-1">
                <input
                    type="text"
                    placeholder="https://x.com/yourusername/status/1234567890"
                    value={submissionLink}
                    onChange={(e) => handleLinkChange(e.target.value)}
                    disabled={validationStatus === 'validating'}
                    className="w-full px-2 py-1 rounded-lg text-xs font-medium bg-gray-800/40 text-white placeholder-gray-400 border border-gray-700/50 focus:border-blue-500/50 focus:outline-none transition-all duration-200 shadow-[inset_-1px_-1px_2px_rgba(0,0,0,0.3),inset_1px_1px_2px_rgba(255,255,255,0.1)] disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {error && (
                    <p className="text-red-400 text-xs mt-1">{error}</p>
                )}
            </div>
            <button
                onClick={handleVerify}
                disabled={validationStatus === 'validating' || !submissionLink.trim() || !userXAccount}
                className={`${getButtonStyle()} min-w-[100px] disabled:opacity-50 disabled:cursor-not-allowed`}
            >
                {getButtonText()}
            </button>
            <button
                onClick={() => {
                    setShowInput(false);
                    setSubmissionLink('');
                    setValidationStatus('idle');
                    setError('');
                }}
                disabled={validationStatus === 'validating'}
                className="px-2 py-1 rounded-lg text-xs font-medium transition-all duration-200 flex-shrink-0 shadow-[inset_-1px_-1px_2px_rgba(0,0,0,0.3),inset_1px_1px_2px_rgba(255,255,255,0.1)] hover:shadow-[inset_-1px_-1px_1px_rgba(0,0,0,0.2),inset_1px_1px_1px_rgba(255,255,255,0.15)] bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                ✕
            </button>
        </div>
    );
};
