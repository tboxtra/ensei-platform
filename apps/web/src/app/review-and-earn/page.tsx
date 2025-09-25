"use client";
import '@/lib/firebase'; // force-initialize the shared Firebase client on this route
import { useEffect, useMemo, useState, useRef } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useReviewQueue } from "@/hooks/useReviewQueue";
import { useSubmitReview } from "@/hooks/useSubmitReview";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useQueryClient } from "@tanstack/react-query";
import { Star, MessageCircle, ExternalLink, Check, SkipForward, Target, Link, User as UserIcon } from "lucide-react";
import { ModernCard } from "@/components/ui/ModernCard";
import { ModernButton } from "@/components/ui/ModernButton";
import { ModernLayout } from "@/components/layout/ModernLayout";
import { ModernInput } from "@/components/ui/ModernInput";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { EmbeddedContent } from "@/components/ui/EmbeddedContent";
import { TwitterIntents } from "@/lib/twitter-intents";
import { parseTweetUrl } from "@/shared/constants/x";
import { Suspense } from "react";
import toast from "react-hot-toast";

const HONORS_PER_REVIEW = 20;

type Step = 'comment' | 'link' | 'rate' | 'complete';

function ReviewAndEarnContent({ uid }: { uid: string | null }) {
    const { data: item, isLoading, refetch, isRefetching } = useReviewQueue();
    const submitReview = useSubmitReview();
    const queryClient = useQueryClient();
    const { user } = useAuthUser();

    const [step, setStep] = useState<Step>('comment');
    const [rating, setRating] = useState(0);
    const [link, setLink] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);
    const [linkOk, setLinkOk] = useState(false);

    // Reset UI state when loading new item or skipping
    const resetReviewUI = () => {
        setStep('comment');
        setLink('');
        setRating(0);
        setLinkOk(false);
    };


    useEffect(() => {
        // reset UI on new item
        resetReviewUI();
        setShowSuccess(false);
    }, [item?.participationId]);

    // Validate link as user types
    const onLinkChange = (value: string) => {
        setLink(value);
        const parsed = parseTweetUrl(value);
        const profile = (user?.twitter_handle || '').replace(/^@/, '').toLowerCase();
        const ok = !!parsed && parsed.handle.toLowerCase() === profile;
        setLinkOk(ok);
    };

    const canComplete = step === 'complete' && rating > 0 && linkOk;
    const header = useMemo(() => ({
        pending: 1, // hook up later if you want counters
        completed: 0,
        avg: 0
    }), []);

    const handleIntent = () => setTimeout(() => setStep('link'), 120);
    const handleLink = () => {
        if (!linkOk) return;
        setStep('rate');
    };
    const onPickRating = (n: number) => {
        setRating(n);
        setStep('complete');
    };
    const handleComplete = async () => {
        if (!(step === 'complete' && linkOk && rating > 0)) return;
        if (!item || !uid) return;
        
        try {
            await submitReview.mutateAsync({
                missionId: item.missionId,
                participationId: item.participationId,
                submitterId: item.submitterId,
                taskId: item.taskId,
                rating,
                commentLink: link
            });

            // Queue advance - optimistic clear then refetch
            queryClient.setQueryData(['review-queue', uid], null);
            await queryClient.invalidateQueries({ queryKey: ['review-queue', uid] });
            refetch();
            resetReviewUI();
            toast.success(`Review completed! +${HONORS_PER_REVIEW} honors earned`);
        } catch (error: any) {
            console.error('Failed to submit review:', error);
            toast.error(error?.message || 'Failed to submit review. Please try again.');
        }
    };

    const handleSkip = async () => {
        if (!uid) return;
        try {
            resetReviewUI();
            // Clear & refetch next
            queryClient.setQueryData(['review-queue', uid], null);
            await queryClient.invalidateQueries({ queryKey: ['review-queue', uid] });
            refetch();
            toast.success('Skipped to next review (no rewards earned)');
        } catch (error: any) {
            console.error('Failed to skip review:', error);
            toast.error('Failed to load next review. Please try again.');
        }
    };

    const next = () => {
        setShowSuccess(false);
        refetch();
    };

    if (isLoading) return (
        <ProtectedRoute>
            <ModernLayout currentPage="/review-and-earn">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                        <p className="text-gray-400">Loading review queue…</p>
                    </div>
                </div>
            </ModernLayout>
        </ProtectedRoute>
    );

    if (!item) return (
        <ProtectedRoute>
            <ModernLayout currentPage="/review-and-earn">
                <div className="container mx-auto px-2 py-2">
                    {/* Header */}
                    <div className="text-left mb-2">
                        <h1 className="text-lg font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent mb-1">
                            Review & Earn
                        </h1>
                        <p className="text-gray-400 text-xs">Review mission submissions and earn {HONORS_PER_REVIEW} honors per review</p>
                    </div>

                    {/* Empty State */}
                    <ModernCard className="text-center">
                        <div className="text-gray-400 text-6xl mb-4">📝</div>
                        <h2 className="text-2xl font-bold text-white mb-4">No Reviews Available</h2>
                        <p className="text-gray-400 mb-6">There are currently no submissions available for review. Check back later for new opportunities to earn honors!</p>
                        <div className="flex gap-4 justify-center">
                            <ModernButton onClick={() => refetch()} variant="secondary">🔄 Refresh</ModernButton>
                            <ModernButton onClick={() => window.location.href = '/missions'} variant="primary">🔍 Discover Missions</ModernButton>
                        </div>
                    </ModernCard>
                </div>
            </ModernLayout>
        </ProtectedRoute>
    );

    return (
        <ProtectedRoute>
            <ModernLayout currentPage="/review-and-earn">
                <div className="mx-auto max-w-[1200px] px-4 md:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-left mb-2">
                        <h1 className="text-base font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent mb-1">
                            Review & Earn
                        </h1>
                        <p className="text-gray-400 text-xs">Review mission submissions and earn {HONORS_PER_REVIEW} honors per review</p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="bg-gray-800/30 rounded-lg p-2 text-center shadow-[inset_-1px_-1px_3px_rgba(0,0,0,0.3),inset_1px_1px_3px_rgba(255,255,255,0.05)]">
                            <div className="text-sm font-bold text-white">1</div>
                            <div className="text-xs text-gray-400">Review Available</div>
                        </div>
                        <div className="bg-gray-800/30 rounded-lg p-2 text-center shadow-[inset_-1px_-1px_3px_rgba(0,0,0,0.3),inset_1px_1px_3px_rgba(255,255,255,0.05)]">
                            <div className="text-sm font-bold text-white">{HONORS_PER_REVIEW}</div>
                            <div className="text-xs text-gray-400">Honors per Review</div>
                        </div>
                    </div>

                    {item ? (
                        <section
                            className="
                                mt-4 grid auto-rows-min gap-4
                                lg:grid-cols-2
                            "
                            style={{ gridAutoFlow: 'row' }}
                        >
                            {/* Original Mission */}
                            <div className="rounded-xl border border-white/5 bg-black/30 p-3 backdrop-blur">
                                <h3 className="mb-2 text-sm font-semibold text-white/80">Original Mission</h3>
                                <div className="relative overflow-hidden rounded-lg border border-white/10">
                                    {/* Fixed, compact height so both tweets fit above the fold */}
                                    <div className="h-[260px] xl:h-[300px]">
                                        <EmbeddedContent
                                            url={item.missionUrl}
                                            platform="twitter"
                                            className="h-full w-full"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* User Submission */}
                            <div className="rounded-xl border border-white/5 bg-black/30 p-3 backdrop-blur">
                                <h3 className="mb-2 text-sm font-semibold text-white/80">User Submission</h3>
                                <div className="relative overflow-hidden rounded-lg border border-white/10">
                                    <div className="h-[260px] xl:h-[300px]">
                                        <EmbeddedContent
                                            url={item.submissionLink}
                                            platform="twitter"
                                            className="h-full w-full"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* === ACTIONS CONTAINER === */}
                            <div className="col-span-full rounded-xl border border-white/5 bg-black/30 p-3 backdrop-blur">
                                <div
                                    className="
                                        mt-4
                                        flex flex-col gap-3
                                        lg:grid lg:grid-cols-[auto_1fr_auto_auto] lg:items-center lg:gap-3
                                    "
                                >
                                    {/* 1) Comment */}
                                    <a
                                        href={item.submissionTweetId ? `https://x.com/intent/tweet?in_reply_to=${item.submissionTweetId}` : '#'}
                                        target="_blank" rel="noopener noreferrer"
                                        onClick={handleIntent}
                                        className="inline-flex h-11 items-center justify-center rounded-lg
                                                   bg-gradient-to-r from-[#4b6bff] to-[#a855f7]
                                                   px-4 text-sm font-medium text-white
                                                   ring-1 ring-white/10 transition-[background,box-shadow]
                                                   hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-white/20"
                                    >
                                        <MessageCircle className="w-4 h-4 mr-2" /> Comment
                                    </a>

                                    {/* 2) Link input + Submit Link (hidden until step >= 'link') */}
                                    <div
                                        className={`${step === 'comment' ? 'hidden' : 'flex'} 
                                                    lg:flex items-center gap-2 w-full`}
                                    >
                                        <input
                                            value={link}
                                            onChange={(e) => onLinkChange(e.target.value)}
                                            placeholder="https://x.com/yourhandle/status/1234567890"
                                            className="h-11 w-full rounded-lg bg-white/5 border border-white/10 px-3
                                                       text-sm text-white/90 placeholder-white/40 outline-none
                                                       focus:border-white/20 focus:ring-2 focus:ring-white/20"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleLink}
                                            disabled={!linkOk}
                                            className="h-11 px-3 rounded-lg border border-white/10 bg-white/10
                                                       text-sm font-medium text-white/90
                                                       disabled:opacity-40 disabled:cursor-not-allowed
                                                       hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/20"
                                        >
                                            Submit Link
                                        </button>
                                    </div>

                                    {/* 3) Rating (hidden until step >= 'rate') */}
                                    <div className={`${(step === 'rate' || step === 'complete') ? 'flex' : 'hidden'} lg:flex items-center gap-1`}>
                                        {[1,2,3,4,5].map(n => (
                                            <button
                                                key={n}
                                                type="button"
                                                onClick={() => onPickRating(n)}
                                                className={`
                                                    h-9 w-9 rounded-md border border-white/10 text-sm
                                                    ${rating >= n ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/5 text-white/50'}
                                                    focus:outline-none focus:ring-2 focus:ring-white/20
                                                `}
                                                aria-pressed={rating >= n}
                                                aria-label={`Rate ${n} star${n>1?'s':''}`}
                                            >
                                                ★
                                            </button>
                                        ))}
                                    </div>

                                    {/* 4) Skip + Complete */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={handleSkip}
                                            disabled={isRefetching}
                                            className="inline-flex h-11 items-center justify-center rounded-lg border border-white/10
                                                       bg-white/5 px-4 text-sm font-medium text-white/80 hover:bg-white/10
                                                       focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                            title="Skip this review (forfeits honor rewards)"
                                        >
                                            {isRefetching ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white/60 mr-2"></div>
                                            ) : (
                                                <SkipForward className="w-3 h-3 mr-2" />
                                            )}
                                            Skip (No Rewards)
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleComplete}
                                            disabled={!(step === 'complete' && linkOk && rating > 0) || submitReview.isPending}
                                            className={`inline-flex h-11 min-w-[240px] items-center justify-center rounded-lg px-5 text-sm font-semibold
                                                       ${(step === 'complete' && linkOk && rating > 0) 
                                                           ? 'bg-gradient-to-r from-[#14b8a6] to-[#22c55e] text-black' 
                                                           : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                                       }
                                                       focus:outline-none focus:ring-2 focus:ring-white/20`}
                                        >
                                            {submitReview.isPending ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black/60 mr-2"></div>
                                            ) : (
                                                <Check className="w-3 h-3 mr-2" />
                                            )}
                                            {step === 'complete' && linkOk && rating > 0 
                                                ? `Complete Review (+${HONORS_PER_REVIEW} Honors)`
                                                : 'Complete Review (Complete all steps)'
                                            }
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>
                    ) : (
                        /* existing empty state */
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-sm">No reviews available</div>
                        </div>
                    )}

                    {/* Success Modal */}
                    {showSuccess && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                            <div className="bg-gray-800/90 backdrop-blur-lg rounded-2xl p-8 max-w-md mx-4 text-center border border-gray-700/50 shadow-[inset_-2px_-2px_6px_rgba(0,0,0,0.4),inset_2px_2px_6px_rgba(255,255,255,0.05)]">
                                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[inset_-1px_-1px_3px_rgba(0,0,0,0.3),inset_1px_1px_3px_rgba(255,255,255,0.1)]">
                                    <Check className="w-8 h-8 text-green-400" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2 text-white">Review Completed!</h3>
                                <p className="text-gray-400 mb-6">You earned {HONORS_PER_REVIEW} honors for this review</p>
                                <ModernButton onClick={next} variant="success" className="w-full">
                                    Next Review
                                </ModernButton>
                            </div>
                        </div>
                    )}
                </div>
            </ModernLayout>
        </ProtectedRoute>
    );
}

export default function ReviewAndEarnPage() {
    const [ready, setReady] = useState(false);
    const uidRef = useRef<string | null>(null);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            uidRef.current = u?.uid ?? null;
            setReady(true);                 // always resolve (user or null)
            // optional: if you require auth here, redirect on null
            // if (!u) router.replace('/auth/login');
        });
        return unsub;
    }, []);

    if (!ready) return null;            // no spinner overlay, avoid "stuck" feel
    return <ReviewAndEarnContent uid={uidRef.current} />;
}