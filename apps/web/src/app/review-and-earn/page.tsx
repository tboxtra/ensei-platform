"use client";
import { useEffect, useMemo, useState } from "react";
import { useReviewQueue } from "@/hooks/useReviewQueue";
import { useSubmitReview } from "@/hooks/useSubmitReview";
import { Star, MessageCircle, ExternalLink, Check, SkipForward, Target, Link, User as UserIcon } from "lucide-react";
import { ModernCard } from "@/components/ui/ModernCard";
import { ModernButton } from "@/components/ui/ModernButton";
import { ModernLayout } from "@/components/layout/ModernLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

const HONORS_PER_REVIEW = 20;

export default function ReviewAndEarnPage() {
    const { data: item, isLoading, refetch } = useReviewQueue();
    const submitReview = useSubmitReview();

    const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
    const [rating, setRating] = useState(0);
    const [link, setLink] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        // reset UI on new item
        setStep(0); setRating(0); setLink(""); setShowSuccess(false);
    }, [item?.participationId]);

    const canComplete = step === 3 && rating > 0 && link.includes("twitter.com");
    const header = useMemo(() => ({
        pending: 1, // hook up later if you want counters
        completed: 0,
        avg: 0
    }), []);

    const handleIntent = () => setStep(1);
    const handleLink = () => {
        if (!link || !link.includes("twitter.com")) return alert("Enter a valid Twitter link");
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

                    <ModernCard>
                        <div className="mb-4">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-6 h-6 bg-orange-500/20 rounded-lg flex items-center justify-center">
                                    <Target className="w-3 h-3 text-orange-400" />
                                </div>
                                <h2 className="text-lg font-semibold">Mission to Review</h2>
                            </div>
                        </div>

                        {/* Original Mission */}
                        <div className="mb-4">
                            <h3 className="text-sm font-medium mb-2 text-gray-300">Original Mission</h3>
                            <div className="bg-gray-800/40 backdrop-blur-lg rounded-lg p-3 border border-gray-700/50 shadow-[inset_-1px_-1px_3px_rgba(0,0,0,0.3),inset_1px_1px_3px_rgba(255,255,255,0.05)]">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0 shadow-[inset_-1px_-1px_2px_rgba(0,0,0,0.3),inset_1px_1px_2px_rgba(255,255,255,0.1)]">
                                        <Link className="w-4 h-4 text-orange-400" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold mb-1 text-white text-sm">Twitter Engagement Campaign</h4>
                                        <p className="text-gray-400 text-xs mb-2">Like, retweet, comment, quote, follow</p>
                                        {item.missionLink && (
                                            <a href={item.missionLink} target="_blank" className="text-orange-400 hover:text-orange-300 text-xs inline-flex items-center gap-1 transition-colors">
                                                <ExternalLink className="w-3 h-3" /> {item.missionLink}
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Submission */}
                        <div className="mb-4">
                            <h3 className="text-sm font-medium mb-2 text-gray-300">User Submission</h3>
                            <div className="bg-gray-800/40 backdrop-blur-lg rounded-lg p-3 border border-gray-700/50 shadow-[inset_-1px_-1px_3px_rgba(0,0,0,0.3),inset_1px_1px_3px_rgba(255,255,255,0.05)]">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 shadow-[inset_-1px_-1px_2px_rgba(0,0,0,0.3),inset_1px_1px_2px_rgba(255,255,255,0.1)]">
                                        <UserIcon className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold text-white text-sm">@{item.submitterHandle || "user"}</span>
                                            <span className="text-gray-500 text-xs">•</span>
                                            <span className="text-gray-500 text-xs">{item.createdAgo ? `${Math.floor((Date.now() - item.createdAgo.getTime()) / 1000 / 60)}m ago` : "Unknown"}</span>
                                        </div>
                                        {item.submissionLink && (
                                            <a href={item.submissionLink} target="_blank" className="text-blue-400 hover:text-blue-300 text-xs inline-flex items-center gap-1 transition-colors">
                                                <ExternalLink className="w-3 h-3" /> {item.submissionLink}
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-4">
                            {/* Intent */}
                            {step === 0 && (
                                <ModernButton onClick={handleIntent} variant="primary" className="w-full" size="sm">
                                    <MessageCircle className="w-3 h-3 mr-2" /> Intent to Comment
                                </ModernButton>
                            )}

                            {/* Link */}
                            {(step >= 1) && (
                                <div>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            type="url"
                                            placeholder="https://twitter.com/yourusername/status/..."
                                            value={link}
                                            onChange={(e) => setLink(e.target.value)}
                                            className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-white placeholder-gray-400 text-sm shadow-[inset_-1px_-1px_3px_rgba(0,0,0,0.3),inset_1px_1px_3px_rgba(255,255,255,0.05)]"
                                        />
                                        <ModernButton onClick={handleLink} variant="success" size="sm">
                                            Submit Link
                                        </ModernButton>
                                    </div>
                                    <p className="text-xs text-gray-400">
                                        Please paste the link to your comment from your Twitter account. The link must match your profile username.
                                    </p>
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
                                    disabled={!canComplete || submitReview.isPending}
                                    onClick={handleComplete}
                                    variant={canComplete ? "success" : "secondary"}
                                    className="flex-1"
                                    size="sm"
                                    loading={submitReview.isPending}
                                >
                                    <Check className="w-3 h-3 mr-2" /> Complete Review (+{HONORS_PER_REVIEW} Honors)
                                </ModernButton>
                                <ModernButton onClick={() => refetch()} variant="secondary" size="sm">
                                    <SkipForward className="w-3 h-3 mr-2" /> Skip
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