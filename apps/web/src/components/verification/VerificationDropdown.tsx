'use client';

import React, { useState, useEffect } from 'react';
import { VerificationDropdownProps, VerificationSubmission } from '@/types/verification';
import { ModernButton } from '@/components/ui/ModernButton';
import { ModernInput } from '@/components/ui/ModernInput';

export const VerificationDropdown: React.FC<VerificationDropdownProps> = ({
    taskId,
    missionId,
    missionTitle,
    onSubmission,
    onClose,
    userXAccount
}) => {
  const [submissionLink, setSubmissionLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');

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

        setIsValidating(true);

        try {
            // Simulate link validation
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Mock validation - in production, check if link is accessible
            const isValid = link.length > 20; // Simple mock validation

            if (!isValid) {
                setError('Unable to access this link. Please check if it\'s correct and public.');
                return false;
            }

            setError('');
            return true;
        } catch (err) {
            setError('Failed to validate link. Please try again.');
            return false;
        } finally {
            setIsValidating(false);
        }
    };

    const extractUsernameFromXLink = (link: string): string | null => {
        try {
            const url = new URL(link);
            const pathParts = url.pathname.split('/');

            // X link format: https://x.com/username/status/1234567890
            if (pathParts.length >= 2 && pathParts[1]) {
                return pathParts[1];
            }

            return null;
        } catch {
            return null;
        }
    };

  const handleSubmission = async () => {
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
      const submission: Partial<VerificationSubmission> = {
        userId: 'current_user', // Will be replaced with actual user ID
        missionId,
        taskId,
        submissionLink: submissionLink.trim(),
        username: userXAccount.username,
        status: 'pending',
        reviews: [],
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        missionTitle,
        taskType
      };

      // Wait a moment to show the valid status, then submit
      setTimeout(() => {
        onSubmission(submission);
        onClose();
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

    return (
        <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/50">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                            <span className="text-green-400 font-bold text-sm">✓</span>
                        </div>
                        <div>
                            <h3 className="text-white font-medium">Verify {taskType}</h3>
                            <p className="text-gray-400 text-sm">{missionTitle}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {!userXAccount ? (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                        <p className="text-red-400 text-sm">
                            ⚠️ Please link your X account in your profile settings before submitting verifications.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                            <p className="text-blue-400 text-sm">
                                📝 Submit the link to your {taskType.toLowerCase()} on the mission content.
                                Make sure the link includes your X username (@{userXAccount.username}).
                            </p>
                        </div>

                        <ModernInput
                            label={`${taskType} Link`}
                            placeholder="https://x.com/yourusername/status/1234567890"
                            value={submissionLink}
                            onChange={handleLinkChange}
                            disabled={isLoading || isValidating}
                        />

                        {isValidating && (
                            <div className="flex items-center gap-2 text-blue-400 text-sm">
                                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                                Validating link...
                            </div>
                        )}

                        <div className="bg-gray-700/30 rounded-lg p-3">
                            <p className="text-gray-300 text-sm">
                                <strong>Verification Process:</strong>
                            </p>
                            <ul className="text-gray-400 text-sm mt-1 space-y-1">
                                <li>• Your submission will be reviewed by 5 experts</li>
                                <li>• Review process takes up to 24 hours</li>
                                <li>• You'll receive a rating based on review quality</li>
                                <li>• Make sure your {taskType.toLowerCase()} is relevant and high-quality</li>
                            </ul>
                        </div>
                    </div>
                )}

        <div className="flex gap-3">
          <ModernButton
            onClick={handleSubmission}
            disabled={validationStatus === 'validating' || !submissionLink.trim() || !userXAccount}
            className={`flex-1 ${
              validationStatus === 'valid' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
              validationStatus === 'invalid' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
              validationStatus === 'validating' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
              'bg-blue-500/20 text-blue-400 border-blue-500/30'
            }`}
          >
            {validationStatus === 'validating' ? 'Validating...' :
             validationStatus === 'valid' ? '✓ Verified' :
             validationStatus === 'invalid' ? '✗ Invalid' :
             `Submit ${taskType} Verification`}
          </ModernButton>
          <ModernButton
            onClick={onClose}
            variant="secondary"
            disabled={validationStatus === 'validating'}
          >
            Cancel
          </ModernButton>
        </div>
            </div>
        </div>
    );
};
