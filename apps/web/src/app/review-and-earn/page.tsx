'use client';

import { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { EmbeddedContent } from '@/components/ui/EmbeddedContent';
import { useReviewQueue } from '@/hooks/useReviewQueue';
import { useSubmitReview } from '@/hooks/useSubmitReview';
import { parseTweetUrl } from '@/shared/constants/x';

// Link validation helpers (same logic client & server)
const X_RX = /^(?:https?:\/\/)?(?:www\.|mobile\.)?(?:x\.com|twitter\.com)\/([A-Za-z0-9_]{1,15})\/status\/(\d+)/i;
const normHandle = (h?: string) => (h ?? '').toLowerCase().replace(/^@/, '');
const parseX = (url: string) => {
    const m = (url ?? '').trim().match(X_RX);
    if (!m) return null;
    return { handle: m[1].toLowerCase(), tweetId: m[2] };
};
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
    const [linkError, setLinkError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const linkRef = useRef<HTMLInputElement | null>(null);

    const resetUI = () => { 
        setStep('comment'); 
        setLink(''); 
        setLinkValid(false); 
        setLinkError(null);
        setRating(0);
        setSubmitting(false);
    };

    useEffect(() => {
        // reset UI on new item
        resetUI();
    }, [item?.participationId]);

    // Focus the next control after each step
    useEffect(() => { 
        if (step === 'link') linkRef.current?.focus(); 
    }, [step]);

    // Get reviewer handle for validation
    const reviewerHandle = normHandle((window as any).__ensei?.profile?.twitterHandle ?? auth.currentUser?.displayName);

    const handleComment = () => {
        if (!item?.submissionTweetId) return;
        window.open(`https://x.com/intent/tweet?in_reply_to=${item.submissionTweetId}`,
            '_blank', 'noopener,noreferrer');
        setStep('link');
    };

    const handleSubmitLink = () => {
        const parsed = parseX(link);
        if (!parsed) {
            setLinkValid(false);
            setLinkError('Paste a valid X/Twitter link to your reply (…/status/ID).');
            return;
        }
        if (!reviewerHandle) {
            setLinkValid(false);
            setLinkError('We could not determine your X handle. Add it to your profile and try again.');
            return;
        }
        if (parsed.handle !== reviewerHandle) {
            setLinkValid(false);
            setLinkError(`Handle mismatch. Your profile: @${reviewerHandle}, link: @${parsed.handle}.`);
            return;
        }
        setLinkError(null);
        setLinkValid(true);
        setStep('rate');
    };

    const handleRate = (n: number) => {
        setRating(n);
        setStep('ready'); // final step visible, complete will work
    };

    const handleComplete = async () => {
        if (!item || !linkValid || rating < 1 || submitting) return;

        try {
            setSubmitting(true);
            await submitReview.mutateAsync({
                missionId: item.missionId,
                participationId: item.participationId,
                submitterId: item.submitterId,
                taskId: item.taskId,
                rating,
                commentLink: link
            });

            resetUI();
            await qc.invalidateQueries({ queryKey: ['review-queue', uid] });
            refetch();
            toast.success(`Review completed! +${HONORS_PER_REVIEW} honors`);
        } catch (e: any) {
            console.error(e);
            toast.error(e?.message || 'Failed to submit review.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSkip = async () => {
        try {
            resetUI();
            qc.setQueryData(['review-queue', uid], null);
            await qc.invalidateQueries({ queryKey: ['review-queue', uid] });
            refetch();
            toast('Skipped');
        } catch {
            toast.error('Could not load next review.');
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
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
                <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                    <div className="text-sm font-semibold text-gray-300 mb-2">Original Mission</div>
                    <div className="rounded-lg overflow-hidden aspect-[4/3]">
                        {item?.missionUrl ? (
                            <EmbeddedContent url={item.missionUrl} platform="twitter" className="h-full w-full" />
                        ) : (
                            <div className="h-full w-full bg-white/5 animate-pulse" />
                        )}
                    </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                    <div className="text-sm font-semibold text-gray-300 mb-2">User Submission</div>
                    <div className="rounded-lg overflow-hidden aspect-[4/3]">
                        {item?.submissionLink ? (
                            <EmbeddedContent url={item.submissionLink} platform="twitter" className="h-full w-full" />
                        ) : (
                            <div className="h-full w-full bg-white/5 animate-pulse" />
                        )}
                    </div>

                    {/* Actions live UNDER the submission card — linear, presentation-style */}
                    <div className="mt-4 space-y-3 max-w-[720px]">
                        {/* Step 1 — Comment */}
                        {step === 'comment' && (
                            <div className="flex gap-3">
                                <button type="button" onClick={handleComment}
                                    disabled={!item?.submissionTweetId}
                                    className="flex-1 rounded-md bg-gradient-to-r from-indigo-500 to-fuchsia-500
                                                   px-4 py-2 font-medium text-white hover:opacity-95
                                                   disabled:opacity-60 disabled:cursor-not-allowed">
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
                            <div className="space-y-2">
                                <div className="flex w-full gap-3">
                                    <input
                                        ref={linkRef}
                                        value={link}
                                        onChange={(e) => { setLink(e.target.value); setLinkValid(false); setLinkError(null); }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') { e.preventDefault(); handleSubmitLink(); }
                                        }}
                                        placeholder="https://x.com/yourhandle/status/1234567890"
                                        className={`flex-1 rounded-md border px-3 py-2 outline-none bg-black/40 text-gray-100 placeholder:text-gray-500
                                            ${linkError ? 'border-red-500/60' : linkValid ? 'border-emerald-500/60' : 'border-white/15'}`}
                                    />
                                    <button type="button" onClick={handleSubmitLink}
                                            className="rounded-md bg-white/10 px-3 py-2 text-gray-100 hover:bg-white/15">
                                        Submit Link
                                    </button>
                                </div>

                                {linkError && <p className="text-sm text-red-400">{linkError}</p>}
                                {linkValid && <p className="text-sm text-emerald-400">✅ Link verified for @{reviewerHandle}</p>}
                            </div>
                        )}

                        {/* Step 3 — Rate */}
                        {step === 'rate' && (
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((n) => (
                                        <button
                                            key={n}
                                            type="button"
                                            aria-label={`Rate ${n}`}
                                            onClick={() => handleRate(n)}
                                            className={`h-9 w-9 rounded-md border ${rating >= n ? 'bg-yellow-400 text-black border-yellow-300' : 'bg-white/5 text-gray-200 border-white/15'}`}
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
                                    disabled={submitting}
                                    className="rounded-md bg-emerald-500 px-4 py-2 font-medium text-black
                                                   hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed">
                                    {submitting ? 'Completing…' : 'Complete Review'}
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