'use client';

import { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { EmbeddedContent } from '@/components/ui/EmbeddedContent';
import { useReviewQueue } from '@/hooks/useReviewQueue';
import { useSubmitReview } from '@/hooks/useSubmitReview';
import { parseTweetUrl } from '@/shared/constants/x';
import { useAuthUser } from '@/hooks/useAuthUser';
import { UserRatingDisplay } from '@/features/reviews/components/UserRatingDisplay';
import { httpsCallable } from "firebase/functions";
import { fns } from "@/lib/firebase";

// Link validation helpers
const normHandle = (h?: string) => (h ?? '').toLowerCase().replace(/^@/, '');
import { ModernLayout } from '@/components/layout/ModernLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import toast from 'react-hot-toast';

const HONORS_PER_REVIEW = 20;

type Step = 'comment' | 'link' | 'rate' | 'ready';

function ReviewAndEarnContent({ uid }: { uid: string | null }) {
    const qc = useQueryClient();
    const [refreshKey, setRefreshKey] = useState(0);
    const [excluded, setExcluded] = useState<string[]>([]);
    const { data: item, isFetching } = useReviewQueue(refreshKey, excluded);
    const submitReview = useSubmitReview();
    const { user } = useAuthUser();
    const lastKeyRef = useRef<string | null>(null);

    // linear state
    const [step, setStep] = useState<Step>('comment');
    const [link, setLink] = useState('');
    const [rating, setRating] = useState<number>(0);
    const [linkValid, setLinkValid] = useState(false);
    const [linkError, setLinkError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [advancing, setAdvancing] = useState(false);

    const linkRef = useRef<HTMLInputElement | null>(null);

    // helper: same mapping used in the hook
    function mapQueueItem(raw: any) {
        if (!raw) return null;
        const sUrl = raw.submissionUrl ?? raw.submissionLink ?? null;
        return {
            participationId: raw.participationId,
            missionId: raw.missionId,
            submitterId: raw.submitterUid,
            taskId: raw.taskId,
            missionUrl: raw.missionUrl ?? null,
            missionTweetId: raw.missionTweetId ?? null,
            missionHandle: raw.missionHandle ?? null,
            submissionUrl: sUrl,
            submissionLink: sUrl,
            submissionTweetId: raw.submissionTweetId ?? null,
            submissionHandle: raw.submissionHandle ?? null,
            submissionKey: `${raw.participationId}:${raw.taskId}:${raw.submitterUid}`,
        };
    }

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

    // If the API ever returns the same item again, force a second refresh once
    useEffect(() => {
        if (!item?.submissionKey) return;
        if (lastKeyRef.current === item.submissionKey) {
            // same item came back — force another fetch
            setRefreshKey(k => k + 1);
        } else {
            lastKeyRef.current = item.submissionKey;
        }
    }, [item?.submissionKey]);

    // when the fetch settles (new item OR empty), drop advancing
    useEffect(() => {
        if (!isFetching) setAdvancing(false);
    }, [isFetching]);

    // Get reviewer handle for validation - use Twitter username from profile
    const reviewerHandle = normHandle(
        user?.twitter_handle
        ?? user?.twitter
    );

    const handleComment = () => {
        if (!item?.submissionTweetId) return;
        window.open(`https://x.com/intent/tweet?in_reply_to=${item.submissionTweetId}`,
            '_blank', 'noopener,noreferrer');
        setStep('link');
    };

    const handleSubmitLink = () => {
        const parsed = parseTweetUrl(link);
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

    const advanceQueue = (overrideExcluded?: string[], preloaded?: any) => {
        setAdvancing(true);
        const ex = overrideExcluded ?? excluded;

        // place preloaded result (if we have it) under the NEXT key so the UI swaps with data
        if (preloaded !== undefined) {
            qc.setQueryData(
                ["review-queue", uid, refreshKey + 1, ex.join("|")],
                preloaded
            );
        }

        // clear current key
        qc.removeQueries({
            queryKey: ["review-queue", uid, refreshKey, ex.join("|")],
            exact: true,
        });

        // switch to the next key (will use preloaded cache or fetch)
        setRefreshKey(k => k + 1);
    };

    const handleComplete = async () => {
        if (!item || !linkValid || rating < 1 || submitting || advancing) return;

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

            // PRELOAD next item after a successful submit too (same idea)
            let preloaded: any = null;
            try {
                const callable = httpsCallable(fns, "getReviewQueue");
                const res = await callable({ excludeKeys: excluded });
                const raw = (res.data as any)?.item ?? null;
                preloaded = mapQueueItem(raw);
            } catch { }

            resetUI();
            advanceQueue(excluded, preloaded);
            toast.success(`Review completed! +${HONORS_PER_REVIEW} honors`);
        } catch (e: any) {
            console.error(e);
            toast.error(e?.message || 'Failed to submit review.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSkip = async () => {
        if (!item || advancing || submitting) return;

        // build the freshest exclude list
        const nextExcluded = excluded.includes(item.submissionKey)
            ? excluded
            : [...excluded, item.submissionKey];

        setExcluded(nextExcluded); // update state

        // best-effort server record (non-blocking)
        try {
            await httpsCallable(fns, "skipSubmission")({
                participationId: item.participationId,
                taskId: item.taskId,
                submitterId: item.submitterId,
            });
        } catch (e) {
            console.warn("skipSubmission failed; continuing with local exclude", e);
        }

        // PRELOAD next item so there's no blank state
        let preloaded: any = null;
        try {
            const callable = httpsCallable(fns, "getReviewQueue");
            const res = await callable({ excludeKeys: nextExcluded });
            const raw = (res.data as any)?.item ?? null;
            preloaded = mapQueueItem(raw); // can be null (empty state), that's OK
        } catch (e) {
            // on error, leave preloaded = null → will show empty state then refetch on key bump
            console.warn("preload next item failed", e);
        }

        resetUI();
        advanceQueue(nextExcluded, preloaded);
        toast("Skipped");
    };

    if (!item && !isFetching) {
        return (
            <div className="mx-auto max-w-6xl p-8 text-center">
                <div className="inline-flex items-center rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                    <span className="text-gray-200">No more submissions to review right now.</span>
                </div>
                <p className="mt-2 text-sm text-gray-400">Please check back later.</p>
            </div>
        );
    }

    if (isFetching) {
        return (
            <div className="container mx-auto px-2 py-2">
                <div className="text-left mb-2">
                    <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-1">
                        Review & Earn
                    </h1>
                    <p className="text-gray-400 text-xs">Loading next review...</p>
                </div>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="bg-gray-800/30 rounded-lg p-3 shadow-[inset_-1px_-1px_3px_rgba(0,0,0,0.3),inset_1px_1px_3px_rgba(255,255,255,0.05)]">
                        <div className="h-4 bg-gray-700/50 rounded mb-2 animate-pulse"></div>
                        <div className="aspect-[4/3] max-h-[360px] bg-gray-700/30 rounded-lg animate-pulse"></div>
                    </div>
                    <div className="bg-gray-800/30 rounded-lg p-3 shadow-[inset_-1px_-1px_3px_rgba(0,0,0,0.3),inset_1px_1px_3px_rgba(255,255,255,0.05)]">
                        <div className="h-4 bg-gray-700/50 rounded mb-2 animate-pulse"></div>
                        <div className="aspect-[4/3] max-h-[360px] bg-gray-700/30 rounded-lg animate-pulse"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-2 py-2">
            {/* Page Header */}
            <div className="text-left mb-2">
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-1">
                    Review & Earn
                </h1>
                <p className="text-gray-400 text-xs">Review mission submissions and earn {HONORS_PER_REVIEW} honors per review</p>
            </div>

            {/* Top: two tweets, side-by-side */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start">
                <div className="bg-gray-800/30 rounded-lg p-3 shadow-[inset_-1px_-1px_3px_rgba(0,0,0,0.3),inset_1px_1px_3px_rgba(255,255,255,0.05)]">
                    <div className="text-sm font-semibold text-white/90 mb-2">Original Mission</div>
                    <div className="aspect-[4/3] max-h-[360px] overflow-hidden rounded-lg shadow-[inset_-1px_-1px_3px_rgba(0,0,0,0.3),inset_1px_1px_3px_rgba(255,255,255,0.05)]">
                        {item?.missionUrl ? (
                            <EmbeddedContent url={item.missionUrl} platform="twitter" className="h-full w-full" />
                        ) : (
                            <div className="h-full w-full bg-gray-800/30 animate-pulse" />
                        )}
                    </div>
                </div>

                <div className="bg-gray-800/30 rounded-lg p-3 shadow-[inset_-1px_-1px_3px_rgba(0,0,0,0.3),inset_1px_1px_3px_rgba(255,255,255,0.05)]">
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-semibold text-white/90">User Submission</div>
                        {item?.submitterId && (
                            <UserRatingDisplay
                                userId={item.submitterId}
                                className="text-xs"
                                showCount={true}
                            />
                        )}
                    </div>
                    <div className="aspect-[4/3] max-h-[360px] overflow-hidden rounded-lg shadow-[inset_-1px_-1px_3px_rgba(0,0,0,0.3),inset_1px_1px_3px_rgba(255,255,255,0.05)]">
                        {item?.submissionLink ? (
                            <EmbeddedContent url={item.submissionLink} platform="twitter" className="h-full w-full" />
                        ) : (
                            <div className="h-full w-full bg-gray-800/30 animate-pulse" />
                        )}
                    </div>

                    {/* Actions live UNDER the submission card — linear, presentation-style */}
                    <div className="mt-4 space-y-3 max-w-[720px]">
                        {/* Step 1 — Comment */}
                        {step === 'comment' && (
                            <div className="flex gap-3">
                                <button type="button" onClick={handleComment}
                                    disabled={!item?.submissionTweetId}
                                    className="flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600
                                                   px-4 py-2.5 font-medium text-white hover:from-blue-500 hover:to-purple-500
                                                   disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
                                    Comment
                                </button>
                                <button type="button" onClick={handleSkip} disabled={advancing || submitting}
                                    className="rounded-lg border border-white/20 px-4 py-2.5 text-white/80 
                                                   hover:bg-white/10 hover:border-white/30 transition-all duration-200
                                                   disabled:opacity-50 disabled:cursor-not-allowed">
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
                                        onChange={(e) => {
                                            setLink(e.target.value);
                                            setLinkValid(false);
                                            setLinkError(null);
                                        }}
                                        onPaste={(e) => {
                                            setTimeout(() => {
                                                const pasted = (e.target as HTMLInputElement).value;
                                                if (pasted && !linkValid) { /* opportunistic check */
                                                    const p = parseTweetUrl(pasted);
                                                    if (p && reviewerHandle && p.handle === reviewerHandle) {
                                                        setLinkError(null); setLinkValid(true);
                                                    }
                                                }
                                            }, 0);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') { e.preventDefault(); handleSubmitLink(); }
                                        }}
                                        placeholder="https://x.com/yourhandle/status/1234567890"
                                        className={`flex-1 rounded-lg border px-3 py-2.5 outline-none bg-gray-800/40 text-white placeholder:text-gray-400
                                            ${linkError ? 'border-red-500/70 bg-red-500/5' : linkValid ? 'border-green-500/70 bg-green-500/5' : 'border-white/20'}`}
                                    />
                                    <button type="button" onClick={handleSubmitLink} disabled={!link}
                                        className="rounded-lg bg-gray-700/50 px-4 py-2.5 text-white hover:bg-gray-600/50 
                                                       border border-white/20 hover:border-white/30 transition-all duration-200 
                                                       disabled:opacity-50 disabled:cursor-not-allowed">
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
                                            className={`h-9 w-9 rounded-lg border transition-all duration-200 ${rating >= n ? 'bg-yellow-400 text-black border-yellow-300 shadow-md' : 'bg-gray-700/50 text-gray-300 border-white/20 hover:bg-gray-600/50'}`}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>
                                <div className="flex gap-3">
                                    <button type="button" onClick={handleSkip} disabled={advancing || submitting}
                                        className="rounded-md border border-white/15 px-4 py-2 text-gray-200 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed">
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
                                <button type="button" onClick={handleSkip} disabled={advancing || submitting}
                                    className="rounded-md border border-white/15 px-4 py-2 text-gray-200 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed">
                                    Skip
                                </button>
                                <button type="button" onClick={handleComplete}
                                    disabled={advancing || submitting || !(linkValid && rating > 0)}
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