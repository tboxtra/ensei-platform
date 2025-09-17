'use client';

import React, { useState } from 'react';
import { VerificationDropdown } from './VerificationDropdown';
import { XAccount } from '@/types/verification';

interface VerificationIntegrationProps {
    taskId: string;
    missionId: string;
    missionTitle: string;
    userXAccount?: XAccount;
    onVerificationSubmitted: (submission: any) => void;
    onClose: () => void;
}

export const VerificationIntegration: React.FC<VerificationIntegrationProps> = ({
    taskId,
    missionId,
    missionTitle,
    userXAccount,
    onVerificationSubmitted,
    onClose
}) => {
    const [showVerificationDropdown, setShowVerificationDropdown] = useState(false);

    const handleVerificationSubmission = (submission: any) => {
        onVerificationSubmitted(submission);
        setShowVerificationDropdown(false);
        onClose();
    };

    const handleCloseVerification = () => {
        setShowVerificationDropdown(false);
        onClose();
    };

    // Only show verification for comment and quote tasks
    if (taskId !== 'comment' && taskId !== 'quote') {
        return null;
    }

    return (
        <>
            {!showVerificationDropdown ? (
                <div className="bg-gray-800/40 rounded-lg p-3 border border-gray-700/50">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                                <span className="text-green-400 font-bold text-xs">✓</span>
                            </div>
                            <span className="text-white text-sm font-medium">
                                Verify {taskId === 'comment' ? 'Comment' : 'Quote'}
                            </span>
                        </div>

                        {!userXAccount ? (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                <p className="text-red-400 text-xs">
                                    ⚠️ Please link your X account in profile settings first
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <p className="text-gray-400 text-xs">
                                    Submit the link to your {taskId} for verification
                                </p>
                                <button
                                    onClick={() => setShowVerificationDropdown(true)}
                                    className="w-full px-3 py-2 bg-green-500/20 text-green-400 rounded-lg text-xs font-medium hover:bg-green-500/30 transition-colors"
                                >
                                    Submit Verification Link
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <VerificationDropdown
                    taskId={taskId}
                    missionId={missionId}
                    missionTitle={missionTitle}
                    onSubmission={handleVerificationSubmission}
                    onClose={handleCloseVerification}
                    userXAccount={userXAccount}
                />
            )}
        </>
    );
};
