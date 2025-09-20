'use client';

import React, { useState } from 'react';
import { XAccount } from '@/types/verification';
import { useAuth } from '../../contexts/UserAuthContext';
import { useCreateTaskCompletion } from '../../hooks/useTaskCompletions';
import { validateTaskSubmissionLink } from '../../lib/validation';

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
    const { user, isAuthenticated } = useAuth();
    const createTaskCompletionMutation = useCreateTaskCompletion();
    const [showInput, setShowInput] = useState(false);
    const [submissionLink, setSubmissionLink] = useState('');
    const [validationStatus, setValidationStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
    const [error, setError] = useState('');

    const taskType = taskId === 'comment' ? 'Comment' : 'Quote';

    const validateSubmissionLink = async (link: string): Promise<boolean> => {
        const validationResult = validateTaskSubmissionLink(link, taskId, userXAccount);

        if (!validationResult.isValid) {
            setError(validationResult.error || 'Invalid submission link');
            return false;
        }

        setError('');
        return true;
    };


    const handleVerify = async () => {
        if (!submissionLink.trim()) {
            setError('Please enter your submission link');
            return;
        }

        if (!isAuthenticated || !user) {
            setError('Please log in to submit verifications');
            return;
        }

        if (!userXAccount) {
            setError('Please link your X account first to submit verifications');
            return;
        }

        setValidationStatus('validating');
        setError('');

        try {
            const isValid = await validateSubmissionLink(submissionLink);

            if (!isValid) {
                setValidationStatus('invalid');
                // Show invalid status for 2 seconds
                setTimeout(() => {
                    setValidationStatus('idle');
                }, 2000);
                return;
            }

            setValidationStatus('valid');

            // Create task completion using real API
            const taskCompletion = await createTaskCompletionMutation.mutateAsync({
                missionId,
                taskId,
                userId: user.id,
                userName: user.name,
                userEmail: user.email,
                userSocialHandle: userXAccount.username,
                metadata: {
                    taskType: taskId,
                    platform: 'twitter',
                    twitterHandle: userXAccount.username,
                    tweetUrl: submissionLink.trim()
                }
            });

            // Submit immediately after validation
            onVerificationSubmitted(taskCompletion);
            setShowInput(false);
            setSubmissionLink('');
            setValidationStatus('idle');
        } catch (err) {
            setError('Failed to submit verification. Please try again.');
            setValidationStatus('invalid');
            setTimeout(() => {
                setValidationStatus('idle');
            }, 2000);
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
                disabled={!isAuthenticated || !user || !userXAccount}
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {error && (
                    <p className="text-red-400 text-xs mt-1">{error}</p>
                )}
            </div>
            <button
                onClick={handleVerify}
                disabled={validationStatus === 'validating' || !submissionLink.trim() || !userXAccount || createTaskCompletionMutation.isPending}
                className={`${getButtonStyle()} min-w-[100px] disabled:opacity-50 disabled:cursor-not-allowed`}
            >
                {createTaskCompletionMutation.isPending ? 'Submitting...' : getButtonText()}
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
