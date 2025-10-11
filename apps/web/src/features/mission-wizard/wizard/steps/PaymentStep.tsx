'use client';

import React, { useEffect, useState } from 'react';
import { WizardState } from '../types/wizard.types';
import { usePacks } from '../../../../hooks/useApi';

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
    const { packs, entitlements, purchasePack, loading: packsLoading, error: packsError } = usePacks();
    const [purchasing, setPurchasing] = useState(false);
    const [purchaseError, setPurchaseError] = useState<string | null>(null);

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
    const SHOW_ACTIVE_ENTITLEMENTS = true; // Can be toggled to false for rollback
    const ENABLE_PACK_PURCHASE = !packsError; // Disable purchase if API fails

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
        updateState({ packId });
        setPurchaseError(null);
    };

    const handlePackPurchase = async (packId: string) => {
        setPurchasing(true);
        setPurchaseError(null);
        try {
            await purchasePack(packId);
            // Pack purchased successfully, update state
            updateState({ packId });
        } catch (error) {
            console.error('Pack purchase failed:', error);
            setPurchaseError(error instanceof Error ? error.message : 'Failed to purchase pack');
        } finally {
            setPurchasing(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-xl font-semibold mb-1">Payment Options</h2>
                <p className="text-gray-400 text-sm">Choose how you want to pay for this mission</p>
            </div>

            {/* Payment Type Selection */}
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
                                        ? '$10.00'
                                        : 'Variable (based on engagement)'
                                    }
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
                <button
                    onClick={onSubmit}
                    disabled={isLoading || !state.paymentType || (state.model === 'fixed' && state.paymentType === 'pack' && !state.packId)}
                    className={`px-8 py-3 rounded-lg font-semibold transition ${isLoading || !state.paymentType || (state.model === 'fixed' && state.paymentType === 'pack' && !state.packId)
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg'
                        }`}
                >
                    {isLoading ? 'Creating Mission...' : 'Create Mission'}
                </button>
            </div>
        </div>
    );
};
