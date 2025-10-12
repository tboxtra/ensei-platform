'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { WizardState } from '../types/wizard.types';
import { usePacks, useWallet } from '../../../../hooks/useApi';

interface PaymentStepProps {
    state: WizardState;
    updateState: (updates: Partial<WizardState>) => void;
    onSubmit: () => void;
    onPrevious: () => void;
    onReset: () => void;
    isLoading?: boolean;
}

export const PaymentStep: React.FC<PaymentStepProps> = ({
    state,
    updateState,
    onSubmit,
    onPrevious,
    onReset,
    isLoading = false,
}) => {
    const router = useRouter();
    const { packs, entitlements, purchasePack, loading: packsLoading, error: packsError } = usePacks();
    const { balance, fetchBalance } = useWallet();
    const [purchasing, setPurchasing] = useState(false);
    const [purchaseError, setPurchaseError] = useState<string | null>(null);
    const [showPurchaseConfirmation, setShowPurchaseConfirmation] = useState(false);

    // Fetch packs when component mounts
    useEffect(() => {
        // Packs will be fetched automatically by usePacks hook
    }, []);

    // Check if user has active entitlements
    const activeEntitlements = entitlements.filter(entitlement =>
        entitlement.status === 'active' &&
        entitlement.endsAt &&
        new Date(entitlement.endsAt) > new Date()
    );

    // Feature flags for rollback/guardrails
    const SHOW_ACTIVE_ENTITLEMENTS = process.env.NEXT_PUBLIC_SHOW_ACTIVE_ENTITLEMENTS !== 'false'; // Default ON, can be disabled
    const ENABLE_PACK_PURCHASE = !packsError && process.env.NEXT_PUBLIC_ENABLE_PACK_PURCHASE !== 'false'; // Default ON, can be disabled

    // Fallback catalog for when API is unreachable
    const FALLBACK_PACKS = [
        { id: 'single_1_small', label: 'Single Small', description: '1 mission • 100 likes', priceUsd: 10, quotas: { tweets: 1, likes: 100, retweets: 60, comments: 40 } },
        { id: 'single_1_medium', label: 'Single Medium', description: '1 mission • 200 likes', priceUsd: 15, quotas: { tweets: 1, likes: 200, retweets: 120, comments: 80 } },
        { id: 'single_1_large', label: 'Single Large', description: '1 mission • 500 likes', priceUsd: 25, quotas: { tweets: 1, likes: 500, retweets: 300, comments: 200 } }
    ];

    // Use fallback packs if API fails
    const displayPacks = packsError ? FALLBACK_PACKS : packs;

    const handlePaymentSelect = (paymentType: 'single-use' | 'pack') => {
        updateState({ paymentType });
        setPurchaseError(null);
    };

    const handlePackSelect = (packId: string) => {
        // Get pack details to auto-configure mission settings
        const pack = packs.find(p => p.id === packId);
        if (pack) {
            // Determine participant cap based on pack size
            let maxParticipants = 100; // default small
            if (pack.size === 'medium') maxParticipants = 200;
            if (pack.size === 'large') maxParticipants = 500;

            // Auto-configure mission settings based on pack
            updateState({
                packId,
                cap: Math.min(state.cap || 100, maxParticipants), // Don't exceed pack limit
                // Keep existing tasks and other settings
            });
        } else {
            updateState({ packId });
        }
        setPurchaseError(null);
    };

    const handlePackPurchase = async (packId: string) => {
        setPurchasing(true);
        setPurchaseError(null);
        try {
            await purchasePack(packId);
            // Pack purchased successfully, update state with pack-specific settings
            const pack = packs.find(p => p.id === packId);
            if (pack) {
                // Determine participant cap based on pack size
                let maxParticipants = 100; // default small
                if (pack.size === 'medium') maxParticipants = 200;
                if (pack.size === 'large') maxParticipants = 500;

                // Auto-configure mission settings based on pack
                updateState({
                    packId,
                    cap: Math.min(state.cap || 100, maxParticipants), // Don't exceed pack limit
                    // Keep existing tasks and other settings
                });
            } else {
                updateState({ packId });
            }
        } catch (error) {
            console.error('Pack purchase failed:', error);
            setPurchaseError(error instanceof Error ? error.message : 'Failed to purchase pack');
        } finally {
            setPurchasing(false);
        }
    };

    const handleBuyPackRedirect = () => {
        // Redirect to packs page with a return URL
        const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
        router.push(`/wallet?tab=packs&return=${returnUrl}`);
    };

    // For degen missions, only show single use payment
    const isDegenMission = state.model === 'degen';

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-xl font-semibold mb-1">
                    {isDegenMission ? 'Payment Required' : 'Payment Options'}
                </h2>
                <p className="text-gray-400 text-sm">
                    {isDegenMission
                        ? 'Pay for your degen mission based on duration'
                        : 'Choose how you want to pay for this mission'
                    }
                </p>
            </div>

            {/* Payment Type Selection - Only show for fixed missions */}
            {!isDegenMission && (
                <div>
                    <label className="block text-xs font-medium mb-3">Payment Method</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={() => handlePaymentSelect('single-use')}
                            className={`p-6 rounded-xl text-left transition ${state.paymentType === 'single-use'
                                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700/50'
                                }`}
                        >
                            <div className="text-3xl mb-2">💳</div>
                            <div className="font-bold text-lg mb-1">Single Use</div>
                            <div className="text-sm opacity-90 mb-3">Pay once for this mission only</div>
                            <div className="text-sm">
                                • No recurring charges<br />
                                • Pay per mission<br />
                                • Full control
                            </div>
                        </button>

                        <button
                            onClick={() => handlePaymentSelect('pack')}
                            className={`p-6 rounded-xl text-left transition ${state.paymentType === 'pack'
                                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700/50'
                                }`}
                        >
                            <div className="text-3xl mb-2">📦</div>
                            <div className="font-bold text-lg mb-1">Pack Purchase</div>
                            <div className="text-sm opacity-90 mb-3">Buy a pack for multiple missions</div>
                            <div className="text-sm">
                                • Better value<br />
                                • Multiple missions<br />
                                • Bulk pricing
                            </div>
                        </button>
                    </div>
                </div>
            )}

            {/* For degen missions, automatically set to single-use */}
            {isDegenMission && (
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
                    <div className="text-3xl mb-2">💳</div>
                    <div className="font-bold text-lg mb-1">Single Use Payment</div>
                    <div className="text-sm opacity-90 mb-3">Pay once for this degen mission</div>
                    <div className="text-sm">
                        • Duration-based pricing<br />
                        • No recurring charges<br />
                        • Full control
                    </div>
                </div>
            )}

            {/* Active Entitlements */}
            {state.model === 'fixed' && state.paymentType === 'pack' && SHOW_ACTIVE_ENTITLEMENTS && activeEntitlements.length > 0 && (
                <div>
                    <label className="block text-xs font-medium mb-3">Your Active Packs</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {activeEntitlements.map((entitlement) => {
                            const pack = packs.find(p => p.id === entitlement.packId);
                            if (!pack) return null;

                            const isSelected = state.packId === entitlement.packId;
                            const remainingQuota = entitlement.quotas?.tweetsUsed - entitlement.usage?.tweetsUsed || 0;

                            return (
                                <div
                                    key={entitlement.id}
                                    className={`relative bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-10 border border-white/10 rounded-2xl p-6 text-left transition-all duration-300 ${isSelected
                                        ? 'border-2 border-emerald-500/50 shadow-lg scale-105'
                                        : 'hover:scale-105'
                                        }`}
                                >
                                    {/* Status Badge */}
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${remainingQuota > 5
                                            ? 'bg-emerald-400/15 text-emerald-300 border border-emerald-400/30'
                                            : remainingQuota > 0
                                                ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30'
                                                : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                                            }`}>
                                            {remainingQuota > 5 ? 'ACTIVE' : remainingQuota > 0 ? 'LOW QUOTA' : 'EXHAUSTED'}
                                        </span>
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-400/15 text-blue-300 border border-blue-400/30">
                                            {remainingQuota} left
                                        </span>
                                    </div>

                                    <div className="font-semibold text-lg mb-1">{pack.label}</div>
                                    <div className="text-sm opacity-90 mb-2">{pack.description}</div>

                                    {/* Pack Constraints Info */}
                                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-3">
                                        <div className="text-xs text-blue-400 font-medium mb-1">Pack Constraints:</div>
                                        <div className="text-xs text-blue-300 space-y-1">
                                            <div>• Max Participants: {pack.size === 'small' ? '100' : pack.size === 'medium' ? '200' : '500'} users</div>
                                            <div>• Engagement: {pack.quotas?.likes || 0} likes, {pack.quotas?.retweets || 0} retweets, {pack.quotas?.comments || 0} comments</div>
                                        </div>
                                    </div>

                                    <div className="text-sm mb-2">
                                        <div className="text-xs opacity-75">
                                            Expires: {new Date(entitlement.endsAt).toLocaleDateString()}
                                        </div>
                                    </div>

                                    {remainingQuota > 0 && (
                                        <button
                                            onClick={() => handlePackSelect(entitlement.packId)}
                                            className={`w-full mt-3 py-2 px-4 rounded-lg text-sm font-medium transition ${isSelected
                                                ? 'bg-green-600 text-white'
                                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                                                }`}
                                        >
                                            {isSelected ? '✓ Pack selected' : 'Use This Pack'}
                                        </button>
                                    )}

                                    {remainingQuota === 0 && (
                                        <div className="w-full mt-3 py-2 px-4 rounded-lg text-sm font-medium bg-gray-500/20 text-gray-400 text-center border border-gray-500/30">
                                            Not enough quota for this mission
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Pack Selection (only for fixed missions with pack payment) */}
            {state.model === 'fixed' && state.paymentType === 'pack' && (
                <div>
                    <label className="block text-xs font-medium mb-3">Available Packs</label>

                    {/* Error Display */}
                    {purchaseError && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
                            <p className="text-red-400 text-sm">
                                {purchaseError.includes('network') || purchaseError.includes('fetch')
                                    ? "Couldn't complete purchase. Try again."
                                    : purchaseError.includes('insufficient') || purchaseError.includes('balance')
                                        ? "Insufficient balance for this purchase."
                                        : purchaseError
                                }
                            </p>
                        </div>
                    )}

                    {/* Loading State */}
                    {packsLoading ? (
                        <div className="text-center py-6">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
                            <p className="text-gray-400 text-sm">Loading packs...</p>
                        </div>
                    ) : packsError ? (
                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-4">
                            <p className="text-amber-400 text-sm mb-2">Using offline pack catalog. Purchase is temporarily disabled.</p>
                            <p className="text-amber-300 text-xs">You can still use &quot;Single Use&quot; payment for this mission.</p>
                        </div>
                    ) : !ENABLE_PACK_PURCHASE ? (
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
                            <p className="text-blue-400 text-sm mb-2">Pack purchases are temporarily disabled for maintenance.</p>
                            <p className="text-blue-300 text-xs">You can still use &quot;Single Use&quot; payment for this mission.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {displayPacks.map((pack) => {
                                const isSelected = state.packId === pack.id;
                                const isPurchasing = purchasing && state.packId === pack.id;

                                return (
                                    <div
                                        key={pack.id}
                                        className={`relative bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-10 border border-white/10 rounded-2xl p-6 text-left transition-all duration-300 ${isSelected
                                            ? 'border-2 border-emerald-500/50 shadow-lg scale-105'
                                            : 'hover:scale-105'
                                            }`}
                                    >
                                        <div className="font-semibold text-lg mb-1">{pack.label}</div>
                                        <div className="text-sm opacity-90 mb-2">{pack.description}</div>
                                        <div className="text-lg font-bold text-green-400">${pack.priceUsd}</div>
                                        <div className="text-xs opacity-75">{pack.quotas?.tweetsUsed || 0} missions</div>

                                        {/* Purchase Button */}
                                        {!isSelected && (
                                            <button
                                                onClick={() => handlePackPurchase(pack.id)}
                                                disabled={purchasing || !ENABLE_PACK_PURCHASE}
                                                className={`w-full mt-3 py-2 px-4 rounded-lg text-sm font-medium transition ${purchasing || !ENABLE_PACK_PURCHASE
                                                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                                    }`}
                                            >
                                                {!ENABLE_PACK_PURCHASE ? 'Purchase Disabled' :
                                                    isPurchasing ? 'Purchasing...' : 'Purchase Pack'}
                                            </button>
                                        )}

                                        {/* Selected State */}
                                        {isSelected && (
                                            <div className="w-full mt-3 py-2 px-4 rounded-lg text-sm font-medium bg-emerald-600 text-white text-center">
                                                ✓ Pack purchased and selected
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Single Use Pricing Display */}
            {state.paymentType === 'single-use' && (
                <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/30">
                    <h3 className="font-semibold mb-2">Single Use Pricing</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span>Mission Type:</span>
                            <span className="font-semibold">{state.model === 'fixed' ? 'Fixed Mission' : 'Degen Mission'}</span>
                        </div>
                        {state.model === 'fixed' && (
                            <>
                                <div className="flex justify-between">
                                    <span>Participant Cap:</span>
                                    <span className="font-semibold">{state.cap} users</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Tasks Selected:</span>
                                    <span className="font-semibold">{state.tasks?.length || 0} tasks</span>
                                </div>
                            </>
                        )}
                        <div className="border-t border-gray-700/30 pt-2 mt-2">
                            <div className="flex justify-between text-lg font-bold">
                                <span>Total Cost:</span>
                                <span className="text-green-400">
                                    {state.model === 'fixed'
                                        ? (() => {
                            // Fixed mission pricing varies by participant cap (aligned with single-use pack pricing)
                            let costUSD = 10; // default small
                            if (state.cap >= 500) {
                                costUSD = 25; // large
                            } else if (state.cap >= 200) {
                                costUSD = 15; // medium
                            }
                                            return `$${costUSD}.00`;
                                        })()
                                        : state.selectedDegenPreset?.costUSD 
                                            ? `$${state.selectedDegenPreset.costUSD}`
                                            : 'Variable (based on engagement)'
                                    }
                                </span>
                            </div>
                            {state.model === 'degen' && state.selectedDegenPreset && (
                                <div className="text-sm text-gray-400 mt-1">
                                    Duration: {state.selectedDegenPreset.hours}h • Max Winners: {state.selectedDegenPreset.maxWinners}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
                <button
                    onClick={() => setShowPurchaseConfirmation(true)}
                    disabled={isLoading || !state.paymentType || (state.model === 'fixed' && state.paymentType === 'pack' && !state.packId)}
                    className={`px-8 py-3 rounded-lg font-semibold transition ${isLoading || !state.paymentType || (state.model === 'fixed' && state.paymentType === 'pack' && !state.packId)
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg'
                        }`}
                >
                    {isLoading ? 'Creating Mission...' : 'Create Mission'}
                </button>
            </div>

            {/* Purchase Confirmation Modal */}
            {showPurchaseConfirmation && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 max-w-md w-full border border-gray-700">
                        <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center">
                            <span className="mr-2">💳</span>
                            Confirm Mission Creation
                        </h3>

                        <div className="space-y-3 sm:space-y-4">
                            {/* Mission Details */}
                            <div className="bg-gray-800/30 rounded-lg p-3">
                                <h4 className="font-semibold text-sm mb-2">Mission Details</h4>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span>Type:</span>
                                        <span className="font-medium">{state.model === 'fixed' ? 'Fixed Mission' : 'Degen Mission'}</span>
                                    </div>
                                    {state.model === 'fixed' && (
                                        <>
                                            <div className="flex justify-between">
                                                <span>Participants:</span>
                                                <span className="font-medium">{state.cap} users</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Tasks:</span>
                                                <span className="font-medium">{state.tasks?.length || 0} tasks</span>
                                            </div>
                                        </>
                                    )}
                                    {state.model === 'degen' && state.selectedDegenPreset && (
                                        <>
                                            <div className="flex justify-between">
                                                <span>Duration:</span>
                                                <span className="font-medium">{state.selectedDegenPreset.hours}h</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Max Winners:</span>
                                                <span className="font-medium">{state.selectedDegenPreset.maxWinners}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Payment Details */}
                            <div className="bg-gray-800/30 rounded-lg p-3">
                                <h4 className="font-semibold text-sm mb-2">Payment Details</h4>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span>Payment Method:</span>
                                        <span className="font-medium">
                                            {state.paymentType === 'single-use' ? 'Single Use' : 'Pack Usage'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Cost:</span>
                                        <span className="font-medium text-green-400">
                                            {state.model === 'fixed'
                                                ? (() => {
                            // Fixed mission pricing varies by participant cap (aligned with single-use pack pricing)
                            let costUSD = 10; // default small
                            if (state.cap >= 500) {
                                costUSD = 25; // large
                            } else if (state.cap >= 200) {
                                costUSD = 15; // medium
                            }
                                                    return `$${costUSD}.00`;
                                                })()
                                                : state.selectedDegenPreset?.costUSD 
                                                    ? `$${state.selectedDegenPreset.costUSD}`
                                                    : 'Variable'
                                            }
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Your Balance:</span>
                                        <span className="font-medium">
                                            {balance?.honors?.toLocaleString() || '0'} Honors
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Balance Warning */}
                            {(() => {
                                const costUSD = state.model === 'fixed' 
                                    ? (() => {
                                        // Fixed mission pricing varies by participant cap
                                        let cost = 5; // default small
                                        if (state.cap >= 500) {
                                            cost = 20; // large
                                        } else if (state.cap >= 200) {
                                            cost = 10; // medium
                                        }
                                        return cost;
                                    })()
                                    : (state.selectedDegenPreset?.costUSD || 0);
                                const requiredHonors = Math.round(costUSD * 450);
                                const hasEnoughBalance = balance?.honors && balance.honors >= requiredHonors;

                                if (!hasEnoughBalance && state.paymentType === 'single-use') {
                                    return (
                                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                            <div className="flex items-start gap-2">
                                                <span className="text-red-400 text-sm">⚠️</span>
                                                <div className="text-xs text-red-300">
                                                    <p className="font-medium mb-1">Insufficient Balance</p>
                                                    <p>You need {requiredHonors} Honors (${costUSD}) to create this mission.</p>
                                                    <p>You have {balance?.honors || 0} Honors available.</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            })()}

                            {/* Confirmation Message */}
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                                <div className="flex items-start gap-2">
                                    <span className="text-blue-400 text-sm">ℹ️</span>
                                    <div className="text-xs text-blue-300">
                                        <p className="font-medium mb-1">Confirmation Required</p>
                                        <p>This will deduct the required Honors from your wallet and create your mission immediately.</p>
                                        <p>Make sure all details are correct before proceeding.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowPurchaseConfirmation(false)}
                                className="flex-1 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-medium transition-colors"
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    setShowPurchaseConfirmation(false);
                                    onSubmit();
                                }}
                                disabled={isLoading || (() => {
                                    const costUSD = state.model === 'fixed' 
                                        ? (() => {
                                            // Fixed mission pricing varies by participant cap
                                            let cost = 5; // default small
                                            if (state.cap >= 500) {
                                                cost = 20; // large
                                            } else if (state.cap >= 200) {
                                                cost = 10; // medium
                                            }
                                            return cost;
                                        })()
                                        : (state.selectedDegenPreset?.costUSD || 0);
                                    const requiredHonors = Math.round(costUSD * 450);
                                    return !!(state.paymentType === 'single-use' && balance?.honors && balance.honors < requiredHonors);
                                })()}
                                className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Creating...' : 'Confirm & Create Mission'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
