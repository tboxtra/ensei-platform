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
    switch (validationStatus) {
      case 'valid':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'invalid':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'validating':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  const getButtonText = () => {
    switch (validationStatus) {
      case 'validating':
        return 'Validating...';
      case 'valid':
        return '✓ Verified';
      case 'invalid':
        return '✗ Invalid';
      default:
        return 'Verify';
    }
  };

  if (!showInput) {
    return (
      <ModernButton
        onClick={() => setShowInput(true)}
        disabled={!userXAccount}
        className="bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30"
      >
        Verify
      </ModernButton>
    );
  }

  return (
    <div className="flex gap-2 items-center">
      <div className="flex-1">
        <ModernInput
          placeholder="https://x.com/yourusername/status/1234567890"
          value={submissionLink}
          onChange={handleLinkChange}
          error={error}
          disabled={validationStatus === 'validating'}
          className="text-sm"
        />
      </div>
      <ModernButton
        onClick={handleVerify}
        disabled={validationStatus === 'validating' || !submissionLink.trim() || !userXAccount}
        className={`${getButtonStyle()} min-w-[100px]`}
      >
        {getButtonText()}
      </ModernButton>
      <ModernButton
        onClick={() => {
          setShowInput(false);
          setSubmissionLink('');
          setValidationStatus('idle');
          setError('');
        }}
        variant="secondary"
        disabled={validationStatus === 'validating'}
        className="text-xs px-2 py-1"
      >
        ✕
      </ModernButton>
    </div>
  );
};
