'use client'
import React from 'react'
import Link from 'next/link'
import { Pack } from '../../types/packs'
import { apiStartPurchase, apiEthUsd, apiPaymentStatus } from '../../hooks/useApi'
import { ModernCard } from '../ui/ModernCard'
import { ModernButton } from '../ui/ModernButton'

type Props = { pack: Pack; owned?: boolean; onPurchased?: () => void }

export default function PackCard({ pack, owned, onPurchased }: Props) {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [ethUsd, setEthUsd] = React.useState<number | null>(null)

  const alive = { v: true }
  React.useEffect(() => {
    let m = true
    apiEthUsd().then(p => m && setEthUsd(p.price)).catch(() => { })
    return () => { m = false; alive.v = false }
  }, [])

  const handleBuy = async () => {
    try {
      setError(null); setLoading(true)
      const { txId } = await apiStartPurchase(pack.id)
      if (txId) {
        const poll = async () => {
          if (!alive.v) return
          const s = await apiPaymentStatus(txId!)
          if (!alive.v) return
          if (s.status === 'confirmed') onPurchased?.()
          else if (['failed', 'expired'].includes(s.status)) setError('Payment failed or expired.')
          else setTimeout(poll, 2000)
        }
        poll()
      }
    } catch (e: any) {
      console.error('Purchase failed:', e)
      setError('Purchase API not available yet. This is a demo.')
      setTimeout(() => { setLoading(false); onPurchased?.() }, 2000)
    } finally {
      setLoading(false)
    }
  }

  const fmtUSD = (n: number) => `$${n.toFixed(2)}`
  const usd = fmtUSD(pack.priceUsd)
  const eth = ethUsd ? `≈ ${(pack.priceUsd / ethUsd).toFixed(4)} ETH` : ''
  
  // Auto-compute discount percentage if not provided
  const pct = pack.meta?.discountPct ?? (
    pack.meta?.originalUsd && pack.meta.originalUsd > pack.priceUsd
      ? Math.round(100 - (pack.priceUsd / pack.meta.originalUsd) * 100)
      : undefined
  )

  return (
    <ModernCard className="relative flex flex-col gap-3 overflow-hidden group min-h-[200px]">
      {/* Discount chip (optional) */}
      {pct != null && (
        <div aria-hidden className="absolute top-3 right-3 text-[11px] font-semibold px-2 py-1 rounded-full bg-yellow-400/15 text-yellow-300 border border-yellow-400/30">
          -{pct}%
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs tracking-wide text-white/60 uppercase">
            {pack.meta?.tierNote || pack.size.toUpperCase()}
          </div>
          <h3 className="text-lg font-semibold break-words">{pack.label}</h3>
        </div>

        {/* Price block */}
        <div className="text-right">
          <div className="text-emerald-400 font-bold text-xl">
            {usd}
          </div>
          {!!pack.meta?.originalUsd && pack.meta.originalUsd > pack.priceUsd && (
            <div className="text-[12px] line-through opacity-60">
              {fmtUSD(pack.meta.originalUsd)}
            </div>
          )}
          {eth && <div className="text-[11px] opacity-60 mt-0.5">{eth}</div>}
        </div>
      </div>

      {/* Quotas */}
      <div className="space-y-1 text-sm">
        <div>Likes: {pack.quotas.likes.toLocaleString()}</div>
        <div>Retweets: {pack.quotas.retweets.toLocaleString()}</div>
        <div>Comments: {pack.quotas.comments.toLocaleString()}</div>
        {pack.kind === 'subscription' && (
          <div className="mt-2 text-xs text-blue-300/90 bg-blue-500/10 border border-blue-500/20 rounded-lg p-2">
            Max {pack.meta?.maxPerHour ?? 1} tweet/hour • Duration {pack.meta?.durationDays ?? 7} days
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-1 flex gap-2">
        <a
          href={`/create?type=fixed&packId=${encodeURIComponent(pack.id)}`}
          aria-label={`Select ${pack.label}`}
          className="flex-1 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-sm text-white text-center transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400/70 focus:ring-offset-2 focus:ring-offset-black"
        >
          Select
        </a>
        {owned ? (
          <ModernButton variant="secondary" disabled className="flex-1">Owned</ModernButton>
        ) : (
          <ModernButton
            onClick={handleBuy}
            loading={loading}
            className="flex-1"
            aria-label={`Buy ${pack.label}`}
          >
            Buy Pack →
          </ModernButton>
        )}
      </div>

      {/* Optional comparison stub */}
      <button
        type="button"
        className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400/70 focus:ring-offset-2 focus:ring-offset-black"
        aria-label={`Compare ${pack.label}`}
        onClick={() => alert('Comparison coming soon')}
      >
        ↔︎ Compare
      </button>

      {error && <div className="text-red-400 text-xs">{error}</div>}
    </ModernCard>
  )
}