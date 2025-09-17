'use client';

import React, { useState, useEffect } from 'react';
import { XAccount, VerificationSubmission, Review, UserExpertise } from '@/types/verification';
import { XAccountLinker } from '@/components/verification/XAccountLinker';
import { VerificationDropdown } from '@/components/verification/VerificationDropdown';
import { ReviewCard } from '@/components/verification/ReviewCard';
import { ModernButton } from '@/components/ui/ModernButton';

export default function VerificationDemoPage() {
    const [userXAccount, setUserXAccount] = useState<XAccount | null>(null);
    const [submissions, setSubmissions] = useState<VerificationSubmission[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [showVerificationDropdown, setShowVerificationDropdown] = useState(false);
    const [selectedTask, setSelectedTask] = useState<{ taskId: string, missionId: string, missionTitle: string } | null>(null);
    const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
    const [userExpertise, setUserExpertise] = useState<UserExpertise[]>([
        {
            userId: 'current_user',
            platform: 'twitter',
            level: 'intermediate',
            verifiedAt: new Date(),
            reviewCount: 15,
            averageRating: 4.2
        }
    ]);

    // Mock data for demo
    useEffect(() => {
        // Mock submissions for review
        const mockSubmissions: VerificationSubmission[] = [
            {
                id: 'sub_1',
                userId: 'user_1',
                missionId: 'mission_1',
                taskId: 'comment',
                submissionLink: 'https://x.com/johndoe/status/1234567890',
                username: 'johndoe',
                status: 'pending',
                reviews: [],
                createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
                expiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000), // 22 hours remaining
                missionTitle: 'Promote our new product launch',
                taskType: 'Comment'
            },
            {
                id: 'sub_2',
                userId: 'user_2',
                missionId: 'mission_2',
                taskId: 'quote',
                submissionLink: 'https://x.com/janesmith/status/0987654321',
                username: 'janesmith',
                status: 'pending',
                reviews: [],
                createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
                expiresAt: new Date(Date.now() + 23 * 60 * 60 * 1000), // 23 hours remaining
                missionTitle: 'Share our sustainability initiative',
                taskType: 'Quote'
            }
        ];

        setSubmissions(mockSubmissions);
    }, []);

    const handleAccountLinked = (account: XAccount) => {
        setUserXAccount(account);
        console.log('X Account linked:', account);
    };

    const handleVerificationSubmission = (submission: Partial<VerificationSubmission>) => {
        const newSubmission: VerificationSubmission = {
            id: `sub_${Date.now()}`,
            userId: 'current_user',
            missionId: submission.missionId!,
            taskId: submission.taskId!,
            submissionLink: submission.submissionLink!,
            username: submission.username!,
            status: 'pending',
            reviews: [],
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            missionTitle: submission.missionTitle!,
            taskType: submission.taskType!
        };

        setSubmissions(prev => [newSubmission, ...prev]);
        console.log('Verification submitted:', newSubmission);
    };

    const handleReviewSubmission = (review: Partial<Review>) => {
        const newReview: Review = {
            id: `review_${Date.now()}`,
            reviewerId: review.reviewerId!,
            reviewerUsername: review.reviewerUsername!,
            rating: review.rating!,
            reviewerCommentLink: review.reviewerCommentLink!,
            expertise: review.expertise!,
            createdAt: new Date(),
            submissionId: review.submissionId!
        };

        setReviews(prev => [...prev, newReview]);

        // Update submission with new review
        setSubmissions(prev => prev.map(sub =>
            sub.id === review.submissionId
                ? { ...sub, reviews: [...sub.reviews, newReview] }
                : sub
        ));

        // Move to next review
        setCurrentReviewIndex(prev => prev + 1);

        console.log('Review submitted:', newReview);
    };

    const openVerificationDropdown = (taskId: string, missionId: string, missionTitle: string) => {
        setSelectedTask({ taskId, missionId, missionTitle });
        setShowVerificationDropdown(true);
    };

    const closeVerificationDropdown = () => {
        setShowVerificationDropdown(false);
        setSelectedTask(null);
    };

    const getCurrentSubmission = () => {
        return submissions[currentReviewIndex] || null;
    };

    return (
        <div className="min-h-screen bg-gray-900 p-6">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Verification System Demo
                    </h1>
                    <p className="text-gray-400">
                        Test the X account linking, verification submission, and review system
                    </p>
                </div>

                {/* X Account Linking Section */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-white">1. X Account Linking</h2>
                    <XAccountLinker
                        onAccountLinked={handleAccountLinked}
                        existingAccount={userXAccount || undefined}
                        isImmutable={!!userXAccount}
                    />
                </div>

                {/* Verification Submission Section */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-white">2. Verification Submission</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/50">
                            <h3 className="text-white font-medium mb-2">Sample Mission: Product Launch</h3>
                            <p className="text-gray-400 text-sm mb-4">
                                Comment on our product launch announcement
                            </p>
                            <ModernButton
                                onClick={() => openVerificationDropdown('comment', 'mission_1', 'Product Launch Campaign')}
                                disabled={!userXAccount}
                                className="w-full"
                            >
                                Submit Comment Verification
                            </ModernButton>
                        </div>

                        <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/50">
                            <h3 className="text-white font-medium mb-2">Sample Mission: Sustainability</h3>
                            <p className="text-gray-400 text-sm mb-4">
                                Quote tweet our sustainability initiative
                            </p>
                            <ModernButton
                                onClick={() => openVerificationDropdown('quote', 'mission_2', 'Sustainability Initiative')}
                                disabled={!userXAccount}
                                className="w-full"
                            >
                                Submit Quote Verification
                            </ModernButton>
                        </div>
                    </div>
                </div>

                {/* Review System Section */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-white">3. Review & Earn System</h2>
          {getCurrentSubmission() ? (
            <ReviewCard
              submission={getCurrentSubmission()!}
              onReview={handleReviewSubmission}
              reviewerId="current_user"
              reviewerExpertise={userExpertise}
              reviewerXUsername={userXAccount?.username}
            />
          ) : (
                        <div className="bg-gray-800/40 rounded-lg p-8 border border-gray-700/50 text-center">
                            <p className="text-gray-400">
                                No more submissions to review. Great job! 🎉
                            </p>
                        </div>
                    )}
                </div>

                {/* Submissions List */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-white">4. Your Submissions</h2>
                    <div className="space-y-3">
                        {submissions.filter(sub => sub.userId === 'current_user').map((submission) => (
                            <div key={submission.id} className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-white font-medium">{submission.missionTitle}</h3>
                                        <p className="text-gray-400 text-sm">
                                            {submission.taskType} • {submission.reviews.length}/5 reviews
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${submission.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                                submission.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                                                    'bg-red-500/20 text-red-400'
                                            }`}>
                                            {submission.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Verification Dropdown Modal */}
                {showVerificationDropdown && selectedTask && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="w-full max-w-md">
                            <VerificationDropdown
                                taskId={selectedTask.taskId}
                                missionId={selectedTask.missionId}
                                missionTitle={selectedTask.missionTitle}
                                onSubmission={handleVerificationSubmission}
                                onClose={closeVerificationDropdown}
                                userXAccount={userXAccount || undefined}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
