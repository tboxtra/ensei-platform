'use client';

import React, { useState } from 'react';
import { ReviewCardProps, Review } from '@/types/verification';
import { ModernButton } from '@/components/ui/ModernButton';
import { ModernInput } from '@/components/ui/ModernInput';
import { EmbeddedContent } from '@/components/ui/EmbeddedContent';
import { TwitterIntents } from '@/lib/twitter-intents';

export const ReviewCard: React.FC<ReviewCardProps> = ({
  submission,
  onReview,
  reviewerId,
  reviewerExpertise,
  reviewerXUsername
}) => {
    const [rating, setRating] = useState(0);
    const [reviewerCommentLink, setReviewerCommentLink] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRatingChange = (newRating: number) => {
        setRating(newRating);
        setError('');
    };

    const validateReviewerCommentLink = (link: string): boolean => {
        if (!link.trim()) {
            setError('Please enter your comment link');
            return false;
        }

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

    // Extract username from reviewer comment link
    const linkUsername = extractUsernameFromXLink(link);
    if (linkUsername && reviewerXUsername) {
      if (linkUsername.toLowerCase() !== reviewerXUsername.toLowerCase()) {
        setError(`This link doesn't match your X account (@${reviewerXUsername})`);
        return false;
      }
    } else if (linkUsername && !reviewerXUsername) {
      setError('Please link your X account to submit review comments');
      return false;
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

    const handleSubmitReview = async () => {
        if (rating === 0) {
            setError('Please select a rating');
            return;
        }

        if (!validateReviewerCommentLink(reviewerCommentLink)) {
            return;
        }

        setIsLoading(true);

        try {
            // Create review object
            const review: Partial<Review> = {
                reviewerId,
                reviewerUsername: 'reviewer_username', // Will be replaced with actual username
                rating,
                reviewerCommentLink: reviewerCommentLink.trim(),
                expertise: reviewerExpertise[0]?.platform || 'twitter', // Use first expertise
                createdAt: new Date(),
                submissionId: submission.id
            };

            onReview(review);
        } catch (err) {
            setError('Failed to submit review. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const getRatingDescription = (rating: number): string => {
        switch (rating) {
            case 1: return 'Poor - Low quality, irrelevant, or inappropriate';
            case 2: return 'Fair - Below average quality or relevance';
            case 3: return 'Good - Average quality and relevance';
            case 4: return 'Very Good - High quality and relevant';
            case 5: return 'Excellent - Outstanding quality and relevance';
            default: return 'Select a rating';
        }
    };

    const getTimeRemaining = (): string => {
        const now = new Date();
        const expiresAt = new Date(submission.expiresAt);
        const timeLeft = expiresAt.getTime() - now.getTime();

        if (timeLeft <= 0) {
            return 'Expired';
        }

        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

        return `${hours}h ${minutes}m remaining`;
    };

    return (
        <div className="bg-gray-800/40 rounded-lg p-6 border border-gray-700/50 max-w-2xl mx-auto">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                            <span className="text-purple-400 font-bold text-lg">👁</span>
                        </div>
                        <div>
                            <h3 className="text-white font-medium">Review Submission</h3>
                            <p className="text-gray-400 text-sm">
                                {submission.reviews.length}/5 reviews completed
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-gray-400 text-sm">{getTimeRemaining()}</p>
                        <p className="text-gray-500 text-xs">Expires in 24h</p>
                    </div>
                </div>

                {/* Submission Details */}
                <div className="bg-gray-700/30 rounded-lg p-4">
                    <div className="space-y-3">
                        <div>
                            <h4 className="text-white font-medium">{submission.missionTitle}</h4>
                            <p className="text-gray-400 text-sm">
                                {submission.taskType} by @{submission.username}
                            </p>
                        </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">Submission Link:</span>
                <a 
                  href={submission.submissionLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-sm underline"
                >
                  View {submission.taskType}
                </a>
              </div>
              <ModernButton
                onClick={() => {
                  // Open Twitter intent to comment on the submission
                  const commentUrl = TwitterIntents.generateCommentUrl(submission.submissionLink);
                  TwitterIntents.openIntent(commentUrl, 'comment');
                }}
                className="bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30 text-xs px-3 py-1"
              >
                Comment on Twitter
              </ModernButton>
            </div>

                        {/* Embedded Content Preview */}
                        <div className="mt-4">
                            <h5 className="text-white text-sm font-medium mb-2">Content Preview:</h5>
                            <div className="bg-gray-800/40 rounded-lg p-3 border border-gray-700/50">
                                <EmbeddedContent
                                    url={submission.submissionLink}
                                    className="aspect-[4/3] rounded-lg"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rating Section */}
                <div className="space-y-3">
                    <label className="text-white font-medium">Rate this submission (1-5 stars)</label>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={() => handleRatingChange(star)}
                                className={`w-10 h-10 rounded-lg transition-all duration-200 ${star <= rating
                                    ? 'bg-yellow-500/20 text-yellow-400 shadow-[inset_-1px_-1px_2px_rgba(0,0,0,0.3),inset_1px_1px_2px_rgba(255,255,255,0.1)]'
                                    : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'
                                    }`}
                            >
                                ⭐
                            </button>
                        ))}
                    </div>
                    <p className="text-gray-400 text-sm">{getRatingDescription(rating)}</p>
                </div>

                {/* Reviewer Comment Link */}
                <div className="space-y-3">
                    <ModernInput
                        label="Your Comment Link"
                        placeholder="https://x.com/yourusername/status/1234567890"
                        value={reviewerCommentLink}
                        onChange={setReviewerCommentLink}
                        disabled={isLoading}
                    />
                    {error && (
                        <p className="text-red-400 text-xs mt-1">{error}</p>
                    )}
                    <p className="text-gray-400 text-sm">
                        Share the link to your comment on the submission. This helps verify your review quality.
                    </p>
                </div>

                {/* Review Guidelines */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <h4 className="text-blue-400 font-medium text-sm mb-2">Review Guidelines</h4>
                    <ul className="text-blue-300 text-sm space-y-1">
                        <li>• Check if the {submission.taskType.toLowerCase()} is relevant to the mission</li>
                        <li>• Evaluate the quality and engagement of the content</li>
                        <li>• Ensure the submission follows platform guidelines</li>
                        <li>• Rate fairly based on content quality, not personal preferences</li>
                    </ul>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3">
                    <ModernButton
                        onClick={handleSubmitReview}
                        disabled={isLoading || rating === 0 || !reviewerCommentLink.trim()}
                        className="flex-1"
                    >
                        {isLoading ? 'Submitting Review...' : 'Submit Review'}
                    </ModernButton>
                </div>
            </div>
        </div>
    );
};
