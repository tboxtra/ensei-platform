'use client';

import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { EmbeddedContent } from '@/components/ui/EmbeddedContent';
import { useReviewQueue } from '@/hooks/useReviewQueue';
import { useSubmitReview } from '@/hooks/useSubmitReview';
import { parseTweetUrl } from '@/shared/constants/x';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import toast from 'react-hot-toast';

const HONORS_PER_REVIEW = 20;

type Step = 'comment' | 'link' | 'rate' | 'ready';

function ReviewAndEarnContent({ uid }: { uid: string | null }) {
    const qc = useQueryClient();
    const { data: item, isFetching, refetch } = useReviewQueue();
    const submitReview = useSubmitReview();

    // linear state
    const [step, setStep] = useState<Step>('comment');
    const [link, setLink] = useState('');
    const [rating, setRating] = useState<number>(0);
    const [linkValid, setLinkValid] = useState(false);
    
    const resetUI = () => { 
        setStep('comment'); 
        setLink(''); 
        setLinkValid(false); 
        setRating(0); 
    };

    useEffect(() => {
        // reset UI on new item
        resetUI();
    }, [item?.participationId]);

    const handleComment = () => {
        // open native X reply composer
        if (item?.submissionTweetId) {
            window.open(`https://x.com/intent/tweet?in_reply_to=${item.submissionTweetId}`, '_blank', 'noopener,noreferrer');
        }
        // reveal next step
        setStep('link');
    };

    const handleSubmitLink = () => {
        const parsed = parseTweetUrl(link);
        if (!parsed) { 
            setLinkValid(false); 
            return; 
        }
        setLinkValid(true);
        setStep('rate');
    };

    const handleRate = (n: number) => {
        setRating(n);
        setStep('ready'); // final step visible, complete will work
    };

    const handleComplete = async () => {
        if (!item || !linkValid || rating < 1) return;
        
        try {
            await submitReview.mutateAsync({
                missionId: item.missionId,
                participationId: item.participationId,
                submitterId: item.submitterId,
                taskId: item.taskId,
                rating,
                commentLink: link
            });
            
            // advance queue
            resetUI();
            await qc.invalidateQueries({ queryKey: ['review-queue', uid] });
            refetch();
            toast.success(`Review completed! +${HONORS_PER_REVIEW} honors earned`);
        } catch (error: any) {
            console.error('Failed to submit review:', error);
            toast.error(error?.message || 'Failed to submit review. Please try again.');
        }
    };

    const handleSkip = async () => {
        try {
            resetUI();
            // optimistic clear + refetch
            qc.setQueryData(['review-queue', uid], null);
            await qc.invalidateQueries({ queryKey: ['review-queue', uid] });
            refetch();
            toast.success('Skipped to next review (no rewards earned)');
        } catch (error: any) {
            console.error('Failed to skip review:', error);
            toast.error('Failed to load next review. Please try again.');
        }
    };

    if (!item && !isFetching) {
        return (
            <div className="mx-auto max-w-6xl p-6 text-center text-gray-300">
                No reviews available right now.
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-6xl p-6 space-y-6">
            {/* Top: two tweets, side-by-side */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                    <div className="text-sm font-semibold text-gray-300 mb-2">Original Mission</div>
                    <div className="rounded-lg overflow-hidden">
                        {item?.missionUrl ? (
                            <EmbeddedContent url={item.missionUrl} platform="twitter" className="w-full h-full" />
                        ) : (
                            <div className="h-64 bg-white/5 rounded-lg" />
                        )}
                    </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                    <div className="text-sm font-semibold text-gray-300 mb-2">User Submission</div>
                    <div className="rounded-lg overflow-hidden">
                        {item?.submissionLink ? (
                            <EmbeddedContent url={item.submissionLink} platform="twitter" className="w-full h-full" />
                        ) : (
                            <div className="h-64 bg-white/5 rounded-lg" />
                        )}
                    </div>

                    {/* Actions live UNDER the submission card — linear, presentation-style */}
                    <div className="mt-4 space-y-3">
                        {/* Step 1 — Comment */}
                        {step === 'comment' && (
                            <div className="flex gap-3">
                                <button type="button" onClick={handleComment}
                                        className="flex-1 rounded-md bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-2 font-medium text-white hover:opacity-95">
                                    Comment
                                </button>
                                <button type="button" onClick={handleSkip}
                                        className="rounded-md border border-white/15 px-4 py-2 text-gray-200 hover:bg-white/5">
                                    Skip
                                </button>
                            </div>
                        )}

                        {/* Step 2 — Link */}
                        {step === 'link' && (
                            <div className="flex w-full gap-3">
                                <input
                                    value={link}
                                    onChange={(e) => setLink(e.target.value)}
                                    placeholder="https://x.com/yourhandle/status/1234567890"
                                    className="flex-1 rounded-md border border-white/15 bg-black/40 px-3 py-2 text-gray-100 outline-none placeholder:text-gray-500"
                                />
                                <button type="button" onClick={handleSubmitLink}
                                        className="rounded-md bg-white/10 px-3 py-2 text-gray-100 hover:bg-white/15">
                                    Submit Link
                                </button>
                            </div>
                        )}

                        {/* Step 3 — Rate */}
                        {step === 'rate' && (
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex gap-2">
                                    {[1,2,3,4,5].map((n) => (
                                        <button
                                            key={n}
                                            type="button"
                                            aria-label={`Rate ${n}`}
                                            onClick={() => handleRate(n)}
                                            className={`h-9 w-9 rounded-md border border-white/15 ${rating >= n ? 'bg-yellow-400/90 text-black' : 'bg-white/5 text-gray-200'} hover:bg-white/10`}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>
                                <div className="flex gap-3">
                                    <button type="button" onClick={handleSkip}
                                            className="rounded-md border border-white/15 px-4 py-2 text-gray-200 hover:bg-white/5">
                                        Skip
                                    </button>
                                    <button type="button" disabled
                                            className="cursor-not-allowed rounded-md bg-white/10 px-4 py-2 text-gray-400">
                                        Complete Review
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Final Step — Ready */}
                        {step === 'ready' && (
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={handleSkip}
                                        className="rounded-md border border-white/15 px-4 py-2 text-gray-200 hover:bg-white/5">
                                    Skip
                                </button>
                                <button type="button" onClick={handleComplete}
                                        className="rounded-md bg-emerald-500 px-4 py-2 font-medium text-black hover:bg-emerald-400">
                                    Complete Review
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ReviewAndEarnPage() {
    const [authReady, setAuthReady] = useState(false);
    const [uid, setUid] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUid(user?.uid || null);
            setAuthReady(true);
        });

        return unsubscribe;
    }, []);

    if (!authReady) {
        return (
            <ProtectedRoute>
                <ModernLayout currentPage="/review-and-earn">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                            <p className="text-gray-400">Loading...</p>
                        </div>
                    </div>
                </ModernLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <ModernLayout currentPage="/review-and-earn">
                <ReviewAndEarnContent uid={uid} />
            </ModernLayout>
        </ProtectedRoute>
    );
}