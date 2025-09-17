'use client';

import React, { useState, useEffect } from 'react';
import { CompactMissionCard } from '@/components/ui/CompactMissionCard';
import { XAccount, VerificationSubmission } from '@/types/verification';
import { XAccountLinker } from '@/components/verification/XAccountLinker';

export default function VerificationIntegrationDemoPage() {
    const [userXAccount, setUserXAccount] = useState<XAccount | null>(null);
    const [submissions, setSubmissions] = useState<VerificationSubmission[]>([]);

    // Mock mission data for demo
    const mockMissions = [
        {
            id: 'mission_1',
            title: 'Promote our new product launch',
            description: 'Help us spread the word about our latest innovation',
            platform: 'twitter',
            type: 'engage',
            mission_type: 'engage',
            contentLink: 'https://twitter.com/company/status/1234567890',
            tweetLink: 'https://twitter.com/company/status/1234567890',
            instructions: 'Comment on our product launch tweet with your thoughts about the innovation. Make sure your comment adds value and engages with the content.',
            username: 'company',
            createdAt: new Date(),
            status: 'active',
            reward: 50,
            tasks: ['like', 'retweet', 'comment', 'quote', 'follow']
        },
        {
            id: 'mission_2',
            title: 'Share our sustainability initiative',
            description: 'Help us promote our environmental efforts',
            platform: 'twitter',
            type: 'engage',
            mission_type: 'engage',
            contentLink: 'https://twitter.com/company/status/0987654321',
            tweetLink: 'https://twitter.com/company/status/0987654321',
            instructions: 'Quote tweet our sustainability post with your own thoughts about environmental responsibility. Share how you contribute to sustainability in your daily life.',
            username: 'company',
            createdAt: new Date(),
            status: 'active',
            reward: 75,
            tasks: ['like', 'retweet', 'comment', 'quote', 'follow']
        }
    ];

    const handleAccountLinked = (account: XAccount) => {
        setUserXAccount(account);
        console.log('X Account linked:', account);
    };

    const handleVerificationSubmitted = (submission: any) => {
        const newSubmission: VerificationSubmission = {
            id: `sub_${Date.now()}`,
            userId: 'current_user',
            missionId: submission.missionId,
            taskId: submission.taskId,
            submissionLink: submission.submissionLink,
            username: submission.username,
            status: 'pending',
            reviews: [],
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            missionTitle: submission.missionTitle,
            taskType: submission.taskType
        };

        setSubmissions(prev => [newSubmission, ...prev]);
        console.log('Verification submitted:', newSubmission);
    };

    return (
        <div className="min-h-screen bg-gray-900 p-6">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Verification System Integration Demo
                    </h1>
                    <p className="text-gray-400">
                        See how the verification system integrates with existing mission cards
                    </p>
                </div>

                {/* X Account Linking Section */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-white">Step 1: Link Your X Account</h2>
                    <XAccountLinker
                        onAccountLinked={handleAccountLinked}
                        existingAccount={userXAccount || undefined}
                        isImmutable={!!userXAccount}
                    />
                </div>

                {/* Mission Cards with Verification Integration */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-white">Step 2: Try Verification on Mission Tasks</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {mockMissions.map((mission) => (
                            <div key={mission.id} className="space-y-4">
                                <h3 className="text-lg font-medium text-white">{mission.title}</h3>
                                <CompactMissionCard
                                    mission={mission}
                                    onParticipate={(missionId, taskType) => {
                                        console.log('Participate clicked:', missionId, taskType);
                                    }}
                                    onViewDetails={(missionId) => {
                                        console.log('View details clicked:', missionId);
                                    }}
                                />

                                {/* Show verification integration for comment/quote tasks */}
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium text-gray-300">Verification Integration:</h4>
                                    <div className="space-y-2">
                                        <div className="bg-gray-800/40 rounded-lg p-3 border border-gray-700/50">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-5 h-5 bg-blue-500/20 rounded-full flex items-center justify-center">
                                                    <span className="text-blue-400 font-bold text-xs">💬</span>
                                                </div>
                                                <span className="text-white text-sm font-medium">Comment Task</span>
                                            </div>
                                            <p className="text-gray-400 text-xs mb-2">
                                                Click "Comment" button above, then click "Verify" to submit your comment link
                                            </p>
                                            {userXAccount ? (
                                                <div className="text-green-400 text-xs">✅ X Account linked (@{userXAccount.username})</div>
                                            ) : (
                                                <div className="text-red-400 text-xs">❌ X Account not linked</div>
                                            )}
                                        </div>

                                        <div className="bg-gray-800/40 rounded-lg p-3 border border-gray-700/50">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-5 h-5 bg-purple-500/20 rounded-full flex items-center justify-center">
                                                    <span className="text-purple-400 font-bold text-xs">💭</span>
                                                </div>
                                                <span className="text-white text-sm font-medium">Quote Task</span>
                                            </div>
                                            <p className="text-gray-400 text-xs mb-2">
                                                Click "Quote" button above, then click "Verify" to submit your quote link
                                            </p>
                                            {userXAccount ? (
                                                <div className="text-green-400 text-xs">✅ X Account linked (@{userXAccount.username})</div>
                                            ) : (
                                                <div className="text-red-400 text-xs">❌ X Account not linked</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Submissions List */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-white">Step 3: Your Verification Submissions</h2>
                    {submissions.length > 0 ? (
                        <div className="space-y-3">
                            {submissions.map((submission) => (
                                <div key={submission.id} className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/50">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-white font-medium">{submission.missionTitle}</h3>
                                            <p className="text-gray-400 text-sm">
                                                {submission.taskType} • {submission.reviews.length}/5 reviews •
                                                <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${submission.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                                        submission.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                                                            'bg-red-500/20 text-red-400'
                                                    }`}>
                                                    {submission.status}
                                                </span>
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-gray-400 text-sm">
                                                Submitted {submission.createdAt.toLocaleTimeString()}
                                            </p>
                                            <p className="text-gray-500 text-xs">
                                                Expires {submission.expiresAt.toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-gray-800/40 rounded-lg p-8 border border-gray-700/50 text-center">
                            <p className="text-gray-400">
                                No verification submissions yet. Try submitting a comment or quote verification above!
                            </p>
                        </div>
                    )}
                </div>

                {/* Instructions */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
                    <h3 className="text-blue-400 font-medium text-lg mb-3">How to Test the Verification System:</h3>
                    <ol className="text-blue-300 text-sm space-y-2 list-decimal list-inside">
                        <li>Link your X account using the form above</li>
                        <li>Click on "Comment" or "Quote" buttons in the mission cards</li>
                        <li>Click "Verify" in the dropdown that appears</li>
                        <li>Submit a valid X (Twitter) link to your comment/quote</li>
                        <li>Your submission will appear in the submissions list below</li>
                        <li>In production, your submission would be reviewed by 5 experts</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}
