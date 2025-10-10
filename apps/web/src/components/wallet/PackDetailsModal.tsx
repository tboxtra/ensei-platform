'use client'
import React from 'react'
import { Pack } from '../../types/packs'
import { ModernButton } from '../ui/ModernButton'
import { briefQuota, briefSub } from './packs.utils'
import { apiStartPurchase, apiPaymentStatus } from '../../hooks/useApi'

type Props = {
    pack: Pack | null
    owned?: boolean
    onClose: () => void
    onPurchased?: () => void
}

export default function PackDetailsModal({ pack, owned, onClose, onPurchased }: Props) {
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    if (!pack) return null

    const pct = pack.meta?.discountPct ?? (
        pack.meta?.originalUsd && pack.meta.originalUsd > pack.priceUsd
            ? Math.round(100 - (pack.priceUsd / pack.meta.originalUsd) * 100)
            : undefined
    )

    const subHint = pack.kind === 'subscription' ? briefSub(pack.meta) : ''

    async function handleBuy() {
        if (!pack) return

        try {
            setError(null); setLoading(true)
            const { txId } = await apiStartPurchase(pack.id)
            if (!txId) throw new Error('no tx id')
            const poll = async () => {
                const s = await apiPaymentStatus(txId)
                if (s.status === 'confirmed') {
                    onPurchased?.()
                    onClose()
                } else if (['failed', 'expired'].includes(s.status)) {
                    setError('Payment failed or expired.')
                } else {
                    setTimeout(poll, 1400)
                }
            }; poll()
        } catch {
            // demo fallback
            setTimeout(() => {
                onPurchased?.()
                onClose()
            }, 1000)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-white/10">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-semibold">{pack.label}</h2>
                        <p className="text-sm text-white/70 mt-1">{briefQuota(pack.quotas)}</p>
                        {subHint && <p className="text-sm text-blue-300/85 mt-1">{subHint}</p>}
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/50 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Price */}
                <div className="mb-6">
                    <div className="flex items-center gap-3">
                        <div className="text-2xl font-bold text-emerald-400">${pack.priceUsd.toFixed(2)}</div>
                        {pct != null && (
                            <div className="text-sm text-amber-300 bg-amber-400/15 px-2 py-1 rounded-full">
                                -{pct}% off
                            </div>
                        )}
                    </div>
                    {!!pack.meta?.originalUsd && pack.meta.originalUsd > pack.priceUsd && (
                        <div className="text-sm line-through text-white/50 mt-1">
                            Was ${pack.meta.originalUsd.toFixed(2)}
                        </div>
                    )}
                    {pack.tweets > 1 && (
                        <div className="text-sm text-white/50 mt-1">
                            ~${(pack.priceUsd / pack.tweets).toFixed(2)} per mission
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <ModernButton
                        onClick={onClose}
                        variant="secondary"
                        className="flex-1"
                    >
                        Cancel
                    </ModernButton>
                    {owned ? (
                        <ModernButton variant="secondary" disabled className="flex-1">
                            Already Owned
                        </ModernButton>
                    ) : (
                        <ModernButton
                            onClick={handleBuy}
                            loading={loading}
                            className="flex-1"
                        >
                            Buy Pack
                        </ModernButton>
                    )}
                </div>

                {error && <div className="text-red-400 text-sm mt-3">{error}</div>}
            </div>
        </div>
    )
}
