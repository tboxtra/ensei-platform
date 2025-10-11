'use client'
import React from 'react'
import { usePacks } from '../../hooks/useApi'
import PackCard from './PackCard'
import PackDetailsModal from './PackDetailsModal'
import PacksHeader from './PacksHeader'
import { PACKS_FALLBACK } from '../../shared/config/packs.fallback'

type Props = { onPurchased?: () => void }

export default function Packs({ onPurchased }: Props) {
    const { packs, entitlements, loading, error, fetchPacks, purchasePack } = usePacks()
    const [selectedPack, setSelectedPack] = React.useState<any>(null)
    const [purchasing, setPurchasing] = React.useState<string | null>(null)
    const [purchaseError, setPurchaseError] = React.useState<string | null>(null)
    const [purchaseSuccess, setPurchaseSuccess] = React.useState<string | null>(null)
    const [showPurchaseModal, setShowPurchaseModal] = React.useState(false)
    const [packToPurchase, setPackToPurchase] = React.useState<any>(null)

    React.useEffect(() => {
        fetchPacks()
    }, [fetchPacks]) // Include fetchPacks in dependencies

    // Use fallback data if API fails and no packs are loaded
    const displayPacks = packs.length > 0 ? packs : PACKS_FALLBACK

    // Helper function to get pack status
    const getPackStatus = (packId: string) => {
        const entitlement = entitlements.find(e => e.packId === packId && e.status === 'active')
        if (!entitlement) return { status: 'available', remainingQuota: 0, isExpired: false }

        const remainingQuota = entitlement.quotas.tweets - entitlement.usage.tweetsUsed
        const isExpired = entitlement.endsAt ? new Date(entitlement.endsAt) < new Date() : false

        if (isExpired) return { status: 'expired', remainingQuota: 0, isExpired: true }
        if (remainingQuota <= 0) return { status: 'exhausted', remainingQuota: 0, isExpired: false }
        if (remainingQuota <= 1) return { status: 'low', remainingQuota, isExpired: false }
        return { status: 'active', remainingQuota, isExpired: false }
    }

    const handlePurchaseClick = (packId: string) => {
        // Find the pack details
        const pack = displayPacks.find(p => p.id === packId) || {
            id: packId,
            label: packId === 'single_1_small' ? 'Growth Sprout' : 
                   packId === 'single_1_medium' ? 'Engagement Boost' : 
                   packId === 'single_1_large' ? 'Viral Explosion' : 'Pack',
            priceUsd: packId === 'single_1_small' ? 10 : 
                     packId === 'single_1_medium' ? 15 : 
                     packId === 'single_1_large' ? 25 : 0,
            description: 'Engagement pack for mission creation'
        }
        
        setPackToPurchase(pack)
        setShowPurchaseModal(true)
        setPurchaseError(null)
    }

    const handlePurchaseConfirm = async () => {
        if (!packToPurchase) return
        
        setPurchasing(packToPurchase.id)
        setPurchaseError(null)
        setPurchaseSuccess(null)
        setShowPurchaseModal(false)
        
        try {
            await purchasePack(packToPurchase.id)
            setPurchaseSuccess(`Successfully purchased ${packToPurchase.label}!`)
            onPurchased?.()

            // Clear success message after 5 seconds
            setTimeout(() => setPurchaseSuccess(null), 5000)
        } catch (error) {
            let errorMessage = 'Purchase failed, please try again'
            
            if (error instanceof Error) {
                if (error.message.includes('Insufficient balance')) {
                    errorMessage = 'Insufficient balance. You need more Honors to purchase this pack.'
                } else if (error.message.includes('Pack not available')) {
                    errorMessage = 'This pack is currently not available.'
                } else if (error.message.includes('already purchased')) {
                    errorMessage = 'You have already purchased this pack.'
                } else if (error.message.includes('Network error')) {
                    errorMessage = 'Network error. Please check your connection and try again.'
                } else if (error.message.includes('Unauthorized')) {
                    errorMessage = 'Please log in to purchase packs.'
                } else {
                    errorMessage = error.message
                }
            }
            
            setPurchaseError(errorMessage)
        } finally {
            setPurchasing(null)
            setPackToPurchase(null)
        }
    }

    const handlePurchaseCancel = () => {
        setShowPurchaseModal(false)
        setPackToPurchase(null)
        setPurchaseError(null)
    }

    // Category grouping logic
    const singleGroups = [
        { title: "1 Mission Engage", ids: ["single_1_small", "single_1_medium", "single_1_large"] },
        { title: "3 Missions Engage", ids: ["single_3_small", "single_3_medium", "single_3_large"] },
        { title: "10 Missions Engage", ids: ["single_10_small", "single_10_medium", "single_10_large"] },
    ]

    const subGroups = [
        { title: "Weekly Plans", ids: ["sub_week_small", "sub_week_medium", "sub_week_large"] },
        { title: "Monthly Plans", ids: ["sub_month_small", "sub_month_medium", "sub_month_large"] },
        { title: "3-Month Plans", ids: ["sub_3m_small", "sub_3m_medium", "sub_3m_large"] },
        { title: "6-Month Plans", ids: ["sub_6m_small", "sub_6m_medium", "sub_6m_large"] },
        { title: "1-Year Plans", ids: ["sub_12m_small", "sub_12m_medium", "sub_12m_large"] },
    ]

    if (loading) {
        return (
            <div className="space-y-10">
                <section>
                    <h1 className="text-2xl font-semibold">Available Packs</h1>
                    <div className="grid gap-4 sm:gap-5 lg:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-busy={true}>
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.04] h-[140px] animate-pulse" />
                        ))}
                    </div>
                </section>
            </div>
        );
    }

    if (!packs.length) {
        return (
            <div className="text-center py-10">
                <div className="text-4xl mb-3">📦</div>
                <h3 className="text-lg font-semibold mb-1">No packs available right now.</h3>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <PacksHeader />

            {purchaseError && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg mb-6">
                    <div className="flex items-start gap-3">
                        <span className="text-red-400 text-lg">❌</span>
                        <div className="flex-1">
                            <p className="text-red-400 font-medium mb-1">Purchase Failed</p>
                            <p className="text-red-300 text-sm">{purchaseError}</p>
                            {purchaseError.includes('Insufficient balance') && (
                                <div className="mt-2 text-xs text-red-200">
                                    💡 <strong>Tip:</strong> Complete missions to earn Honors, or check your wallet balance.
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => setPurchaseError(null)}
                            className="text-red-400 hover:text-red-300 text-sm"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {purchaseSuccess && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-green-400 text-sm">
                        ✅ {purchaseSuccess}
                    </p>
                </div>
            )}


            {/* Pack Categories */}
            <div className="bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-10 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Engagement Packs</h3>
                </div>

                {/* Single Use Packs */}
                <div className="mb-8">
                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <span className="text-xl">🎯</span>
                        Single Mission Packs
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Small Pack */}
                        <div className="relative bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-10 border border-white/10 rounded-2xl p-6 cursor-pointer hover:scale-105 transition-all duration-300 border-l-4 border-l-teal-400/40">
                            <div className="flex justify-between items-start mb-4">
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-400/15 text-teal-300 border border-teal-400/30">
                                    STARTER
                                </span>
                                <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                    100 USERS
                                </span>
                            </div>

                            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 flex items-center justify-center text-2xl">
                                🌱
                            </div>

                            <h3 className="text-lg font-semibold mb-2 text-center">Growth Sprout</h3>
                            <p className="text-sm text-gray-400 text-center mb-4">1 mission • Perfect for testing the waters</p>

                            {/* Expected Results */}
                            <div className="bg-teal-900/20 rounded-lg p-3 mb-4">
                                <div className="text-xs text-teal-400 mb-2">Expected Results (Based on Past Data)</div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span>Minimum Likes:</span>
                                        <span className="font-semibold text-teal-400">100</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span>Minimum Retweets:</span>
                                        <span className="font-semibold text-blue-400">60</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span>Minimum Comments:</span>
                                        <span className="font-semibold text-purple-400">40</span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center mb-4">
                                <div className="text-2xl font-bold text-white">$10.00</div>
                                <div className="text-xs text-gray-400">One-time purchase</div>
                            </div>

                            {(() => {
                                const packStatus = getPackStatus('single_1_small')
                                const isDisabled = purchasing === 'single_1_small' || packStatus.status === 'exhausted' || packStatus.status === 'expired'

                                return (
                                    <>
                                        {packStatus.status === 'exhausted' && (
                                            <div className="mb-3 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                                                <p className="text-red-400 text-xs text-center">
                                                    ❌ Pack exhausted
                                                </p>
                                            </div>
                                        )}
                                        {packStatus.status === 'expired' && (
                                            <div className="mb-3 p-2 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                                                <p className="text-orange-400 text-xs text-center">
                                                    ⏰ Pack expired
                                                </p>
                                            </div>
                                        )}
                                        {packStatus.status === 'low' && (
                                            <div className="mb-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                                <p className="text-yellow-400 text-xs text-center">
                                                    ⚠️ Low quota: {packStatus.remainingQuota} left
                                                </p>
                                            </div>
                                        )}
                                        {packStatus.status === 'active' && packStatus.remainingQuota > 1 && (
                                            <div className="mb-3 p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                                                <p className="text-green-400 text-xs text-center">
                                                    ✅ Active: {packStatus.remainingQuota} tweets left
                                                </p>
                                            </div>
                                        )}

                                        <button
                                            onClick={() => handlePurchaseClick('single_1_small')}
                                            disabled={isDisabled || purchasing === 'single_1_small'}
                                            className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 ${isDisabled || purchasing === 'single_1_small'
                                                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white'
                                                }`}
                                        >
                                            {purchasing === 'single_1_small' ? 'Purchasing...' :
                                                packStatus.status === 'exhausted' ? 'Exhausted' :
                                                    packStatus.status === 'expired' ? 'Expired' :
                                                        'Purchase Pack'}
                                        </button>
                                    </>
                                )
                            })()}
                        </div>

                        {/* Medium Pack */}
                        <div className="relative bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-10 border border-white/10 rounded-2xl p-6 cursor-pointer hover:scale-105 transition-all duration-300 border-l-4 border-l-indigo-400/40">
                            <div className="flex justify-between items-start mb-4">
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-400/15 text-indigo-300 border border-indigo-400/30">
                                    BOOST
                                </span>
                                <span className="px-2 py-1 rounded-full text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                                    200 USERS
                                </span>
                            </div>

                            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-2xl">
                                🚀
                            </div>

                            <h3 className="text-lg font-semibold mb-2 text-center">Engagement Boost</h3>
                            <p className="text-sm text-gray-400 text-center mb-4">1 mission • Solid engagement increase</p>

                            {/* Expected Results */}
                            <div className="bg-indigo-900/20 rounded-lg p-3 mb-4">
                                <div className="text-xs text-indigo-400 mb-2">Expected Results (Based on Past Data)</div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span>Minimum Likes:</span>
                                        <span className="font-semibold text-teal-400">200</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span>Minimum Retweets:</span>
                                        <span className="font-semibold text-blue-400">120</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span>Minimum Comments:</span>
                                        <span className="font-semibold text-purple-400">80</span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center mb-4">
                                <div className="text-2xl font-bold text-white">$15.00</div>
                                <div className="text-xs text-gray-400">One-time purchase</div>
                            </div>

                            <button
                                onClick={() => handlePurchaseClick('single_1_medium')}
                                disabled={purchasing === 'single_1_medium'}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {purchasing === 'single_1_medium' ? 'Purchasing...' : 'Purchase Pack'}
                            </button>
                        </div>

                        {/* Large Pack */}
                        <div className="relative bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-10 border border-white/10 rounded-2xl p-6 cursor-pointer hover:scale-105 transition-all duration-300 border-l-4 border-l-amber-400/40">
                            <div className="flex justify-between items-start mb-4">
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-400/15 text-amber-300 border border-amber-400/30">
                                    EXPLOSIVE
                                </span>
                                <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-500/20 text-amber-400 border border-red-500/30">
                                    500 USERS
                                </span>
                            </div>

                            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center text-2xl">
                                💥
                            </div>

                            <h3 className="text-lg font-semibold mb-2 text-center">Viral Explosion</h3>
                            <p className="text-sm text-gray-400 text-center mb-4">1 mission • Maximum impact engagement</p>

                            {/* Expected Results */}
                            <div className="bg-amber-900/20 rounded-lg p-3 mb-4">
                                <div className="text-xs text-amber-400 mb-2">Expected Results (Based on Past Data)</div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span>Minimum Likes:</span>
                                        <span className="font-semibold text-teal-400">500</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span>Minimum Retweets:</span>
                                        <span className="font-semibold text-blue-400">300</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span>Minimum Comments:</span>
                                        <span className="font-semibold text-purple-400">200</span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center mb-4">
                                <div className="text-2xl font-bold text-white">$25.00</div>
                                <div className="text-xs text-gray-400">One-time purchase</div>
                            </div>

                            <button
                                onClick={() => handlePurchaseClick('single_1_large')}
                                disabled={purchasing === 'single_1_large'}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {purchasing === 'single_1_large' ? 'Purchasing...' : 'Purchase Pack'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* 3 Mission Packs */}
                <div className="mb-8">
                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <span className="text-xl">🎯🎯🎯</span>
                        3 Mission Packs
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Small 3-Mission Pack */}
                        <div className="relative bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-10 border border-white/10 rounded-2xl p-6 cursor-pointer hover:scale-105 transition-all duration-300 border-l-4 border-l-teal-400/40">
                            <div className="flex justify-between items-start mb-4">
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-400/15 text-green-300 border border-green-400/30">
                                    TRIPLE STARTER
                                </span>
                                <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                    100 USERS × 3
                                </span>
                            </div>

                            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 flex items-center justify-center text-2xl">
                                🌿
                            </div>

                            <h3 className="text-lg font-semibold mb-2 text-center">Triple Growth</h3>
                            <p className="text-sm text-gray-400 text-center mb-4">3 missions • Consistent engagement</p>

                            {/* Expected Results */}
                            <div className="bg-teal-900/20 rounded-lg p-3 mb-4">
                                <div className="text-xs text-teal-400 mb-2">Expected Results (Based on Past Data)</div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span>Total Likes:</span>
                                        <span className="font-semibold text-teal-400">300+</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span>Total Retweets:</span>
                                        <span className="font-semibold text-blue-400">180+</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span>Total Comments:</span>
                                        <span className="font-semibold text-purple-400">120+</span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center mb-4">
                                <div className="text-2xl font-bold text-white">$25.00</div>
                                <div className="text-xs text-gray-400">One-time purchase</div>
                            </div>

                            <button className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold transition-all duration-200">
                                Purchase Pack
                            </button>
                        </div>

                        {/* Medium 3-Mission Pack */}
                        <div className="relative bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-10 border border-white/10 rounded-2xl p-6 cursor-pointer hover:scale-105 transition-all duration-300 border-l-4 border-l-indigo-400/40">
                            <div className="flex justify-between items-start mb-4">
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-400/15 text-yellow-300 border border-yellow-400/30">
                                    TRIPLE BOOST
                                </span>
                                <span className="px-2 py-1 rounded-full text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                                    200 USERS × 3
                                </span>
                            </div>

                            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center text-2xl">
                                🔥
                            </div>

                            <h3 className="text-lg font-semibold mb-2 text-center">Triple Fire</h3>
                            <p className="text-sm text-gray-400 text-center mb-4">3 missions • Strong engagement</p>

                            {/* Expected Results */}
                            <div className="bg-indigo-900/20 rounded-lg p-3 mb-4">
                                <div className="text-xs text-indigo-400 mb-2">Expected Results (Based on Past Data)</div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span>Total Likes:</span>
                                        <span className="font-semibold text-teal-400">600+</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span>Total Retweets:</span>
                                        <span className="font-semibold text-blue-400">360+</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span>Total Comments:</span>
                                        <span className="font-semibold text-purple-400">240+</span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center mb-4">
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-2xl font-bold text-white">$40.00</span>
                                    <span className="text-sm text-gray-400 line-through">$48.00</span>
                                </div>
                                <div className="text-xs text-teal-400">Save $8.00 (17%)</div>
                            </div>

                            <button className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold transition-all duration-200">
                                Purchase Pack
                            </button>
                        </div>

                        {/* Large 3-Mission Pack */}
                        <div className="relative bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-10 border border-white/10 rounded-2xl p-6 cursor-pointer hover:scale-105 transition-all duration-300 border-l-4 border-l-amber-400/40">
                            <div className="flex justify-between items-start mb-4">
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-400/15 text-amber-300 border border-amber-400/30">
                                    TRIPLE EXPLOSIVE
                                </span>
                                <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-500/20 text-amber-400 border border-red-500/30">
                                    500 USERS × 3
                                </span>
                            </div>

                            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center text-2xl">
                                🌋
                            </div>

                            <h3 className="text-lg font-semibold mb-2 text-center">Triple Volcano</h3>
                            <p className="text-sm text-gray-400 text-center mb-4">3 missions • Explosive engagement</p>

                            {/* Expected Results */}
                            <div className="bg-amber-900/20 rounded-lg p-3 mb-4">
                                <div className="text-xs text-amber-400 mb-2">Expected Results (Based on Past Data)</div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span>Total Likes:</span>
                                        <span className="font-semibold text-teal-400">1,500+</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span>Total Retweets:</span>
                                        <span className="font-semibold text-blue-400">900+</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span>Total Comments:</span>
                                        <span className="font-semibold text-purple-400">600+</span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center mb-4">
                                <div className="text-2xl font-bold text-white">$60.00</div>
                                <div className="text-xs text-gray-400">One-time purchase</div>
                            </div>

                            <button className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold transition-all duration-200">
                                Purchase Pack
                            </button>
                        </div>
                    </div>
                </div>

                {/* 10 Mission Packs */}
                <div className="mb-8">
                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <span className="text-xl">🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯</span>
                        10 Mission Packs
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Small 10-Mission Pack */}
                        <div className="relative bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-10 border border-white/10 rounded-2xl p-6 cursor-pointer hover:scale-105 transition-all duration-300 border-l-4 border-l-teal-400/40">
                            <div className="flex justify-between items-start mb-4">
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-400/15 text-green-300 border border-green-400/30">
                                    MEGA STARTER
                                </span>
                                <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                    100 USERS × 10
                                </span>
                            </div>

                            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 flex items-center justify-center text-2xl">
                                🌳
                            </div>

                            <h3 className="text-lg font-semibold mb-2 text-center">Mega Growth</h3>
                            <p className="text-sm text-gray-400 text-center mb-4">10 missions • Sustained growth</p>

                            {/* Expected Results */}
                            <div className="bg-teal-900/20 rounded-lg p-3 mb-4">
                                <div className="text-xs text-teal-400 mb-2">Expected Results (Based on Past Data)</div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span>Total Likes:</span>
                                        <span className="font-semibold text-teal-400">1,000+</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span>Total Retweets:</span>
                                        <span className="font-semibold text-blue-400">600+</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span>Total Comments:</span>
                                        <span className="font-semibold text-purple-400">400+</span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center mb-4">
                                <div className="text-2xl font-bold text-white">$75.00</div>
                                <div className="text-xs text-gray-400">One-time purchase</div>
                            </div>

                            <button className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold transition-all duration-200">
                                Purchase Pack
                            </button>
                        </div>

                        {/* Medium 10-Mission Pack */}
                        <div className="relative bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-10 border border-white/10 rounded-2xl p-6 cursor-pointer hover:scale-105 transition-all duration-300 border-l-4 border-l-indigo-400/40">
                            <div className="flex justify-between items-start mb-4">
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-400/15 text-yellow-300 border border-yellow-400/30">
                                    MEGA BOOST
                                </span>
                                <span className="px-2 py-1 rounded-full text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                                    200 USERS × 10
                                </span>
                            </div>

                            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center text-2xl">
                                ⚡
                            </div>

                            <h3 className="text-lg font-semibold mb-2 text-center">Mega Lightning</h3>
                            <p className="text-sm text-gray-400 text-center mb-4">10 missions • Powerful engagement</p>

                            {/* Expected Results */}
                            <div className="bg-indigo-900/20 rounded-lg p-3 mb-4">
                                <div className="text-xs text-indigo-400 mb-2">Expected Results (Based on Past Data)</div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span>Total Likes:</span>
                                        <span className="font-semibold text-teal-400">2,000+</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span>Total Retweets:</span>
                                        <span className="font-semibold text-blue-400">1,200+</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span>Total Comments:</span>
                                        <span className="font-semibold text-purple-400">800+</span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center mb-4">
                                <div className="text-2xl font-bold text-white">$120.00</div>
                                <div className="text-xs text-gray-400">One-time purchase</div>
                            </div>

                            <button className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold transition-all duration-200">
                                Purchase Pack
                            </button>
                        </div>

                        {/* Large 10-Mission Pack */}
                        <div className="relative bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-10 border border-white/10 rounded-2xl p-6 cursor-pointer hover:scale-105 transition-all duration-300 border-l-4 border-l-amber-400/40">
                            <div className="flex justify-between items-start mb-4">
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-400/15 text-amber-300 border border-amber-400/30">
                                    MEGA EXPLOSIVE
                                </span>
                                <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-500/20 text-amber-400 border border-red-500/30">
                                    500 USERS × 10
                                </span>
                            </div>

                            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center text-2xl">
                                🚀
                            </div>

                            <h3 className="text-lg font-semibold mb-2 text-center">Mega Rocket</h3>
                            <p className="text-sm text-gray-400 text-center mb-4">10 missions • Explosive engagement</p>

                            {/* Expected Results */}
                            <div className="bg-amber-900/20 rounded-lg p-3 mb-4">
                                <div className="text-xs text-amber-400 mb-2">Expected Results (Based on Past Data)</div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span>Total Likes:</span>
                                        <span className="font-semibold text-teal-400">5,000+</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span>Total Retweets:</span>
                                        <span className="font-semibold text-blue-400">3,000+</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span>Total Comments:</span>
                                        <span className="font-semibold text-purple-400">2,000+</span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center mb-4">
                                <div className="text-2xl font-bold text-white">$180.00</div>
                                <div className="text-xs text-gray-400">One-time purchase</div>
                            </div>

                            <button className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold transition-all duration-200">
                                Purchase Pack
                            </button>
                        </div>
                    </div>
                </div>

                {/* Subscription Packs */}
                <div className="mb-8">
                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <span className="text-xl">🔄</span>
                        Subscription Packs
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Weekly Subscription */}
                        <div className="relative bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-10 border border-white/10 rounded-2xl p-6 cursor-pointer hover:scale-105 transition-all duration-300">
                            <div className="flex justify-between items-start mb-4">
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-400/15 text-blue-300 border border-blue-400/30">
                                    WEEKLY
                                </span>
                                <span className="px-2 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                    UNLIMITED
                                </span>
                            </div>

                            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-2xl">
                                📅
                            </div>

                            <h3 className="text-lg font-semibold mb-2 text-center">Weekly Momentum</h3>
                            <p className="text-sm text-gray-400 text-center mb-4">Unlimited missions • 7 days</p>

                            {/* Features */}
                            <div className="bg-blue-900/20 rounded-lg p-3 mb-4">
                                <div className="text-xs text-blue-400 mb-2">What&apos;s Included</div>
                                <div className="space-y-1">
                                    <div className="flex items-center text-xs text-gray-300">
                                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2"></span>
                                        Unlimited missions
                                    </div>
                                    <div className="flex items-center text-xs text-gray-300">
                                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></span>
                                        Choose any 3 from 5 tasks
                                    </div>
                                    <div className="flex items-center text-xs text-gray-300">
                                        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2"></span>
                                        Auto-renewal
                                    </div>
                                </div>
                            </div>

                            <div className="text-center mb-4">
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-2xl font-bold text-white">$500.00</span>
                                    <span className="text-sm text-gray-400">/week</span>
                                </div>
                                <div className="text-xs text-teal-400">Cancel anytime</div>
                            </div>

                            <button
                                onClick={() => handlePurchase('sub_week_small')}
                                disabled={purchasing === 'sub_week_small'}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {purchasing === 'sub_week_small' ? 'Starting...' : 'Start Weekly Plan'}
                            </button>
                        </div>

                        {/* Monthly Subscription */}
                        <div className="relative bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-10 border border-white/10 rounded-2xl p-6 cursor-pointer hover:scale-105 transition-all duration-300">
                            <div className="flex justify-between items-start mb-4">
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-400/15 text-purple-300 border border-purple-400/30">
                                    MONTHLY
                                </span>
                                <span className="px-2 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                    BEST VALUE
                                </span>
                            </div>

                            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-2xl">
                                🌟
                            </div>

                            <h3 className="text-lg font-semibold mb-2 text-center">Monthly Mastery</h3>
                            <p className="text-sm text-gray-400 text-center mb-4">Unlimited missions • 30 days</p>

                            {/* Features */}
                            <div className="bg-purple-900/20 rounded-lg p-3 mb-4">
                                <div className="text-xs text-purple-400 mb-2">What's Included</div>
                                <div className="space-y-1">
                                    <div className="flex items-center text-xs text-gray-300">
                                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2"></span>
                                        Unlimited missions
                                    </div>
                                    <div className="flex items-center text-xs text-gray-300">
                                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></span>
                                        Choose any 3 from 5 tasks
                                    </div>
                                    <div className="flex items-center text-xs text-gray-300">
                                        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2"></span>
                                        Priority support
                                    </div>
                                    <div className="flex items-center text-xs text-gray-300">
                                        <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-2"></span>
                                        Advanced analytics
                                    </div>
                                </div>
                            </div>

                            <div className="text-center mb-4">
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-2xl font-bold text-white">$2,000.00</span>
                                    <span className="text-sm text-gray-400">/month</span>
                                </div>
                                <div className="text-xs text-teal-400">Save 9% vs weekly</div>
                            </div>

                            <button className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold transition-all duration-200">
                                Start Monthly Plan
                            </button>
                        </div>

                        {/* Weekly Medium Subscription */}
                        <div className="relative bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-10 border border-white/10 rounded-2xl p-6 cursor-pointer hover:scale-105 transition-all duration-300">
                            <div className="flex justify-between items-start mb-4">
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-400/15 text-blue-300 border border-blue-400/30">
                                    WEEKLY
                                </span>
                                <span className="px-2 py-1 rounded-full text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                                    MEDIUM
                                </span>
                            </div>

                            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-2xl">
                                ⚡
                            </div>

                            <h3 className="text-lg font-semibold mb-2 text-center">Weekly Thunder</h3>
                            <p className="text-sm text-gray-400 text-center mb-4">Unlimited missions • 7 days</p>

                            <div className="text-center mb-4">
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-2xl font-bold text-white">$750.00</span>
                                    <span className="text-sm text-gray-400">/week</span>
                                </div>
                                <div className="text-xs text-teal-400">Cancel anytime</div>
                            </div>

                            <button className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold transition-all duration-200">
                                Start Weekly Plan
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pack Details Modal */}
            <PackDetailsModal
                pack={selectedPack}
                owned={false}
                onClose={() => setSelectedPack(null)}
                onPurchased={onPurchased}
            />

            {/* Purchase Confirmation Modal */}
            {showPurchaseModal && packToPurchase && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 rounded-xl sm:rounded-2xl p-6 sm:p-8 max-w-md w-full border border-gray-700">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center text-2xl">
                                📦
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Confirm Purchase</h3>
                            <p className="text-gray-400 text-sm">Are you sure you want to purchase this pack?</p>
                        </div>

                        {/* Pack Details */}
                        <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-white">{packToPurchase.label}</h4>
                                <span className="text-emerald-400 font-bold">${packToPurchase.priceUsd}</span>
                            </div>
                            <p className="text-gray-400 text-sm">{packToPurchase.description}</p>
                            
                            {/* What's Included */}
                            <div className="mt-3 pt-3 border-t border-gray-700">
                                <p className="text-xs text-gray-500 mb-2">What&apos;s included:</p>
                                <div className="text-xs text-gray-400 space-y-1">
                                    <div>• 1 mission creation</div>
                                    <div>• {packToPurchase.priceUsd === 10 ? '100' : packToPurchase.priceUsd === 15 ? '200' : '500'} engagement actions</div>
                                    <div>• 7-day validity</div>
                                </div>
                            </div>
                        </div>

                        {/* Balance Warning */}
                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-6">
                            <div className="flex items-start gap-2">
                                <span className="text-amber-400 text-sm">⚠️</span>
                                <div className="text-amber-300 text-sm">
                                    <p className="font-medium">Balance Check</p>
                                    <p className="text-xs mt-1">Make sure you have enough Honors in your wallet to complete this purchase.</p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={handlePurchaseCancel}
                                className="flex-1 py-3 px-4 rounded-lg font-semibold transition bg-gray-700/50 text-gray-300 hover:bg-gray-600/50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePurchaseConfirm}
                                className="flex-1 py-3 px-4 rounded-lg font-semibold transition bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                            >
                                Confirm Purchase
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}