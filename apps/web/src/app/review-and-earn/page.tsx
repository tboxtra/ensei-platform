"use client";
import '@/lib/firebase'; // force-initialize the shared Firebase client on this route
import { useEffect, useMemo, useState, useRef } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useReviewQueue } from "@/hooks/useReviewQueue";
import { useSubmitReview } from "@/hooks/useSubmitReview";
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

function ReviewAndEarnContent({ uid }: { uid: string | null }) {
    const { data: item, isLoading, refetch, isRefetching } = useReviewQueue();
    const submitReview = useSubmitReview();
    const queryClient = useQueryClient();

    const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
    const [rating, setRating] = useState(0);
    const [link, setLink] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);
    const [linkValidation, setLinkValidation] = useState<{
        isValid: boolean;
        handle?: string;
        tweetId?: string;
        error?: string;
    }>({ isValid: false });

    // Centralized reset function
    const resetReviewUI = () => {
        setStep(0);
        setRating(0);
        setLink("");
        setLinkValidation({ isValid: false });
    };

    useEffect(() => {
        // reset UI on new item
        resetReviewUI();
        setShowSuccess(false);
    }, [item?.participationId]);

    // Validate link as user types
    useEffect(() => {
        if (!link.trim()) {
            setLinkValidation({ isValid: false });
            return;
        }

        const parsed = parseTweetUrl(link);
        if (!parsed) {
            setLinkValidation({
                isValid: false,
                error: "Please paste a full X/Twitter status link, e.g. https://x.com/<handle>/status/<id>"
            });
            return;
        }

        // For now, just show it's valid - we'll check handle match on submit
        setLinkValidation({
            isValid: true,
            handle: parsed.handle,
            tweetId: parsed.tweetId
        });
    }, [link]);

    const canComplete = step === 3 && rating > 0 && linkValidation.isValid;
    const header = useMemo(() => ({
        pending: 1, // hook up later if you want counters
        completed: 0,
        avg: 0
    }), []);

    const handleIntent = () => setStep(1);
    const handleLink = () => {
        if (!linkValidation.isValid) return;
        setStep(2);
    };
    const handleRate = (n: number) => { setRating(n); setStep(3); };
    const handleComplete = async () => {
        if (!item || !uid) return;
        try {
            // Optimistic update: clear the card instantly
            queryClient.setQueryData(["review-queue", uid], null);

            await submitReview.mutateAsync({
                missionId: item.missionId,
                participationId: item.participationId,
                submitterId: item.submitterId,
                taskId: item.taskId,
                rating,
                commentLink: link
            });

            // Reset UI state after successful submission
            resetReviewUI();
            setShowSuccess(true);
            toast.success(`Review completed! +${HONORS_PER_REVIEW} honors earned`);
        } catch (error: any) {
            console.error('Failed to submit review:', error);
            toast.error(error?.message || 'Failed to submit review. Please try again.');
        }
    };

    const handleSkip = async () => {
        if (!uid) return;
        try {
            // Optimistic update: clear the card instantly
            queryClient.setQueryData(["review-queue", uid], null);

            // Reset UI state and refetch
            resetReviewUI();
            await refetch();
            toast.success('Skipped to next review');
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
                <div className="mx-auto w-full max-w-screen-2xl px-4 lg:px-6">
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
                        <div
                            className="
                                mt-4 grid gap-6
                                lg:grid-cols-[minmax(0,1fr)_400px]   /* main + right rail */
                                xl:grid-cols-[minmax(0,1fr)_440px]
                            "
                        >
                            {/* LEFT: mission + submission embeds */}
                            <section className="space-y-6">
                                {/* Mission card */}
                                <div className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-[0_0_1px_rgba(255,255,255,.2),0_12px_40px_-20px_rgba(0,0,0,.6)]">
                                    <div className="mb-2 flex items-center gap-2">
                                        <span className="inline-flex h-2 w-2 rounded-full bg-amber-500" />
                                        <h3 className="text-base font-semibold text-white/90">Original Mission</h3>
                                    </div>

                                    {/* fixed height for desktop, auto for mobile */}
                                    <div className="rounded-lg bg-black/20">
                                        <div className="aspect-[4/3] w-full overflow-hidden rounded-lg lg:aspect-[16/12]">
                                            <EmbeddedContent
                                                url={item.missionUrl}
                                                platform="twitter"
                                                className="h-full w-full"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Submission card */}
                                <div className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-[0_0_1px_rgba(255,255,255,.2),0_12px_40px_-20px_rgba(0,0,0,.6)]">
                                    <div className="mb-2 flex items-center gap-2">
                                        <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                                        <h3 className="text-base font-semibold text-white/90">User Submission</h3>
                                    </div>
                                    <div className="rounded-lg bg-black/20">
                                        <div className="aspect-[4/3] w-full overflow-hidden rounded-lg lg:aspect-[16/12]">
                                            <EmbeddedContent
                                                url={item.submissionLink}
                                                platform="twitter"
                                                className="h-full w-full"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* RIGHT: sticky action panel */}
                            <aside
                                className="
                                    space-y-5 rounded-xl border border-white/10 bg-gradient-to-b from-white/5 to-white/[.03]
                                    p-4 shadow-[0_0_1px_rgba(255,255,255,.2),0_12px_40px_-20px_rgba(0,0,0,.6)]
                                    lg:sticky lg:top-20 lg:h-fit
                                "
                            >
                                {/* Comment CTA */}
                                <a
                                    href={item.submissionTweetId ? `https://x.com/intent/tweet?in_reply_to=${item.submissionTweetId}` : '#'}
                                    target="_blank" rel="noopener noreferrer"
                                    onClick={handleIntent}
                                    className="inline-flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg shadow-[inset_-1px_-1px_3px_rgba(0,0,0,0.3),inset_1px_1px_3px_rgba(255,255,255,0.1)] hover:shadow-[inset_-1px_-1px_2px_rgba(0,0,0,0.2),inset_1px_1px_2px_rgba(255,255,255,0.15)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-blue-500"
                                >
                                    <MessageCircle className="w-4 h-4 mr-2" /> Comment
                                </a>

                                {/* Link input + inline validation note */}
                                <div className="space-y-2">
                                    <ModernInput
                                        value={link}
                                        onChange={setLink}
                                        placeholder="https://x.com/yourhandle/status/1234567890"
                                        type="url"
                                        className={linkValidation.isValid
                                            ? 'border-emerald-500/50 focus:border-emerald-400'
                                            : link.length
                                            ? 'border-rose-500/50 focus:border-rose-400'
                                            : ''
                                        }
                                    />
                                    {link.length > 0 && (
                                        <p className={`text-xs ${linkValidation.isValid ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            {linkValidation.isValid 
                                                ? `✓ Valid link: @${linkValidation.handle} (Tweet ID: ${linkValidation.tweetId})`
                                                : linkValidation.error || 'Please paste a valid X/Twitter link to your comment.'
                                            }
                                        </p>
                                    )}
                                    <ModernButton
                                        onClick={handleLink}
                                        variant="secondary"
                                        size="sm"
                                        className="w-full"
                                        disabled={!linkValidation.isValid}
                                    >
                                        Submit Link
                                    </ModernButton>
                                </div>

                                {/* Star rating */}
                                <div className="space-y-2">
                                    <p className="text-xs text-white/70">Rate this submission</p>
                                    <div className="flex items-center gap-2">
                                        {[1,2,3,4,5].map((n) => (
                                            <button
                                                key={n}
                                                onClick={() => setRating(n)}
                                                className={`h-9 w-9 rounded-md transition-colors
                                                    ${rating >= n ? 'bg-amber-500/90' : 'bg-white/[.06] hover:bg-white/[.1]'}`}
                                                aria-label={`Rate ${n} star${n>1?'s':''}`}
                                            >
                                                <Star className="w-4 h-4 mx-auto" fill={rating >= n ? "currentColor" : "none"} />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Actions row */}
                                <div className="flex items-center gap-3 pt-1">
                                    <ModernButton
                                        onClick={handleSkip}
                                        variant="secondary"
                                        className="w-[110px]"
                                        disabled={isRefetching}
                                        loading={isRefetching}
                                    >
                                        <SkipForward className="w-3 h-3 mr-2" /> Skip
                                    </ModernButton>

                                    <ModernButton
                                        onClick={handleComplete}
                                        disabled={!canComplete || submitReview.isPending}
                                        className="flex-1"
                                        loading={submitReview.isPending}
                                    >
                                        <Check className="w-3 h-3 mr-2" /> Complete Review (+{HONORS_PER_REVIEW} Honors)
                                    </ModernButton>
                                </div>
                            </aside>
                        </div>
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