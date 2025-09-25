"use client";
import '@/lib/firebase'; // force-initialize the shared Firebase client on this route
import { useEffect, useMemo, useState, useRef } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useReviewQueue } from "@/hooks/useReviewQueue";
import { useSubmitReview } from "@/hooks/useSubmitReview";
import { Star, MessageCircle, ExternalLink, Check, SkipForward, Target, Link, User as UserIcon } from "lucide-react";
import { ModernCard } from "@/components/ui/ModernCard";
import { ModernButton } from "@/components/ui/ModernButton";
import { ModernLayout } from "@/components/layout/ModernLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { EmbeddedContent } from "@/components/ui/EmbeddedContent";
import { TwitterIntents } from "@/lib/twitter-intents";
import { parseTweetUrl } from "@/shared/constants/x";
import { Suspense } from "react";

const HONORS_PER_REVIEW = 20;

function ReviewAndEarnContent({ uid }: { uid: string | null }) {
    const { data: item, isLoading, refetch } = useReviewQueue();
    const submitReview = useSubmitReview();

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

    useEffect(() => {
        // reset UI on new item
        setStep(0); setRating(0); setLink(""); setShowSuccess(false);
        setLinkValidation({ isValid: false });
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
        if (!item) return;
        await submitReview.mutateAsync({
            missionId: item.missionId,
            participationId: item.participationId,
            submitterId: item.submitterId,
            taskId: item.taskId,
            rating,
            commentLink: link
        });
        setShowSuccess(true);
    };
    const next = () => { setShowSuccess(false); refetch(); };

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
                <div className="container mx-auto px-2 py-2">
                    {/* Header */}
                    <div className="text-left mb-2">
                        <h1 className="text-lg font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent mb-1">
                            Review & Earn
                        </h1>
                        <p className="text-gray-400 text-xs">Review mission submissions and earn {HONORS_PER_REVIEW} honors per review</p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="bg-gray-800/30 rounded-lg p-2 text-center shadow-[inset_-1px_-1px_3px_rgba(0,0,0,0.3),inset_1px_1px_3px_rgba(255,255,255,0.05)]">
                            <div className="text-sm font-bold text-white">1</div>
                            <div className="text-xs text-gray-400">Review Available</div>
                        </div>
                        <div className="bg-gray-800/30 rounded-lg p-2 text-center shadow-[inset_-1px_-1px_3px_rgba(0,0,0,0.3),inset_1px_1px_3px_rgba(255,255,255,0.05)]">
                            <div className="text-sm font-bold text-white">{HONORS_PER_REVIEW}</div>
                            <div className="text-xs text-gray-400">Honors per Review</div>
                        </div>
                    </div>

                    <ModernCard className="glass-effect rounded-xl border border-white/10 hover:border-white/20 transition">
                        <div className="mb-4">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-6 h-6 bg-orange-500/20 rounded-lg flex items-center justify-center">
                                    <Target className="w-3 h-3 text-orange-400" />
                                </div>
                                <h2 className="text-lg font-semibold">Mission to Review</h2>
                            </div>
                        </div>

                        {/* Original Mission */}
                        <div className="mb-3">
                            <h3 className="text-sm font-medium mb-2 text-gray-300">Original Mission</h3>
                            {item.missionUrl ? (
                                <Suspense fallback={
                                    <div className="h-28 rounded-lg bg-gray-800/30 animate-pulse flex items-center justify-center">
                                        <div className="text-gray-400 text-sm">Loading mission...</div>
                                    </div>
                                }>
                                    <EmbeddedContent
                                        url={item.missionUrl}
                                        platform="twitter"
                                        className="rounded-lg"
                                    />
                                </Suspense>
                            ) : (
                                <div className="bg-gray-800/40 backdrop-blur-lg rounded-lg p-4 border border-gray-700/50 shadow-[inset_-1px_-1px_3px_rgba(0,0,0,0.3),inset_1px_1px_3px_rgba(255,255,255,0.05)]">
                                    <div className="text-sm text-gray-400">
                                        Original mission link not available.
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Submission */}
                        <div className="mb-3">
                            <h3 className="text-sm font-medium mb-2 text-gray-300">User Submission</h3>
                            <Suspense fallback={
                                <div className="h-28 rounded-lg bg-gray-800/30 animate-pulse flex items-center justify-center">
                                    <div className="text-gray-400 text-sm">Loading submission...</div>
                                </div>
                            }>
                                <EmbeddedContent
                                    url={item.submissionLink}
                                    platform="twitter"
                                    className="rounded-lg"
                                />
                            </Suspense>
                        </div>

                        {/* Actions */}
                        <div className="space-y-3">
                            {/* Comment */}
                            {step === 0 && (
                                <a
                                    href={item.submissionTweetId ? `https://x.com/intent/tweet?in_reply_to=${item.submissionTweetId}` : '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={handleIntent}
                                    className="inline-flex items-center justify-center w-full px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg shadow-[inset_-1px_-1px_3px_rgba(0,0,0,0.3),inset_1px_1px_3px_rgba(255,255,255,0.1)] hover:shadow-[inset_-1px_-1px_2px_rgba(0,0,0,0.2),inset_1px_1px_2px_rgba(255,255,255,0.15)] transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-blue-500"
                                    title="Comment under this submission on X"
                                >
                                    <MessageCircle className="w-3 h-3 mr-2" /> Comment
                                </a>
                            )}

                            {/* Link */}
                            {(step >= 1) && (
                                <div>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            type="url"
                                            placeholder="https://x.com/yourusername/status/..."
                                            value={link}
                                            onChange={(e) => setLink(e.target.value)}
                                            className={`flex-1 px-3 py-2 bg-gray-800/50 border rounded-lg focus:outline-none focus:ring-2 text-white placeholder-gray-400 text-sm shadow-[inset_-1px_-1px_3px_rgba(0,0,0,0.3),inset_1px_1px_3px_rgba(255,255,255,0.05)] transition-colors ${linkValidation.isValid
                                                ? 'border-green-500/50 focus:ring-green-500/50'
                                                : linkValidation.error
                                                    ? 'border-red-500/50 focus:ring-red-500/50'
                                                    : 'border-gray-700/50 focus:ring-orange-500/50'
                                                }`}
                                        />
                                        <ModernButton
                                            onClick={handleLink}
                                            variant="primary"
                                            size="sm"
                                            disabled={!linkValidation.isValid}
                                        >
                                            Submit Link
                                        </ModernButton>
                                    </div>

                                    {/* Validation feedback */}
                                    {linkValidation.isValid && (
                                        <div className="mb-2 p-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                                            <p className="text-xs text-green-400">
                                                ✓ Valid link: @{linkValidation.handle} (Tweet ID: {linkValidation.tweetId})
                                            </p>
                                        </div>
                                    )}

                                    {linkValidation.error && (
                                        <div className="mb-2 p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                                            <p className="text-xs text-red-400">
                                                {linkValidation.error}
                                            </p>
                                        </div>
                                    )}

                                    {!linkValidation.isValid && !linkValidation.error && (
                                        <p className="text-xs text-gray-400">
                                            Please paste the link to your comment from your Twitter account. The link must match your profile username.
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Rating */}
                            {(step >= 2) && (
                                <div>
                                    <label className="block text-xs font-medium mb-2 text-gray-300">Rate this submission</label>
                                    <div className="flex gap-1 justify-center mb-4">
                                        {[1, 2, 3, 4, 5].map(n => (
                                            <button key={n} onClick={() => handleRate(n)} aria-label={`rate ${n}`}
                                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110 ${n <= rating
                                                    ? "text-yellow-400 shadow-[inset_-1px_-1px_3px_rgba(0,0,0,0.3),inset_1px_1px_3px_rgba(255,255,255,0.1)] bg-yellow-500/20"
                                                    : "text-gray-500 hover:text-gray-400 shadow-[inset_-1px_-1px_3px_rgba(0,0,0,0.3),inset_1px_1px_3px_rgba(255,255,255,0.05)] bg-gray-800/30"
                                                    }`}>
                                                <Star className="w-4 h-4" fill={n <= rating ? "currentColor" : "none"} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-2 pt-2">
                                <ModernButton
                                    onClick={() => refetch()}
                                    variant="secondary"
                                    size="sm"
                                    className="flex-shrink-0"
                                >
                                    <SkipForward className="w-3 h-3 mr-2" /> Skip
                                </ModernButton>
                                <ModernButton
                                    disabled={!canComplete || submitReview.isPending}
                                    onClick={handleComplete}
                                    variant={canComplete ? "success" : "secondary"}
                                    className="flex-1"
                                    size="sm"
                                    loading={submitReview.isPending}
                                >
                                    <Check className="w-3 h-3 mr-2" /> Complete Review (+{HONORS_PER_REVIEW} Honors)
                                </ModernButton>
                            </div>
                        </div>
                    </ModernCard>

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