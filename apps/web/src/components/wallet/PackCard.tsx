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
    <ModernCard
      className="relative overflow-hidden group min-h-[172px] p-4 sm:p-5
                 border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent
                 transition-transform hover:-translate-y-[2px]"
    >
      {/* gradient edge & sheen */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl
                      [mask-image:linear-gradient(to_bottom,rgba(0,0,0,.5),transparent)]
                      bg-[linear-gradient(90deg,rgba(16,185,129,.25),transparent,rgba(99,102,241,.25))] opacity-40" />
      <div className="pointer-events-none absolute -top-16 -left-16 h-40 w-40 rotate-12
                      bg-white/5 blur-2xl transition-opacity group-hover:opacity-60 opacity-0" />

      {/* small discount chip (optional) */}
      {pct != null && (
        <span className="absolute top-3 right-3 text-[11px] font-semibold px-2 py-1
                         rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30">
          -{pct}%
        </span>
      )}

      {/* header: name + size pill + price rail */}
      <div className="grid grid-cols-[1fr,auto] gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[10px] tracking-wide uppercase
                             text-white/70 bg-white/5 border border-white/10 rounded-full px-2 py-0.5">
              {pack.size}
            </span>
            {pack.kind === 'subscription' && (
              <span className="text-[10px] text-blue-300/80 bg-blue-500/10 border border-blue-500/20 rounded-full px-2 py-0.5">
                Sub
              </span>
            )}
          </div>
          <h3 className="mt-1 text-base sm:text-lg font-semibold leading-tight break-words">
            {pack.label}
          </h3>
        </div>

        <div className="text-right pl-3 border-l border-white/10">
          <div className="text-emerald-400 font-bold text-xl tabular-nums">
            ${pack.priceUsd.toFixed(2)}
          </div>
          {!!pack.meta?.originalUsd && pack.meta.originalUsd > pack.priceUsd && (
            <div className="text-[12px] line-through text-white/50">${pack.meta.originalUsd.toFixed(2)}</div>
          )}
        </div>
      </div>

      {/* concise quotas: one line summary */}
      <p className="mt-3 text-[13px] text-white/70">
        {pack.tweets} {pack.tweets === 1 ? 'mission' : 'missions'} •
        {' '}Likes {pack.quotas.likes} • RT {pack.quotas.retweets} • CM {pack.quotas.comments}
      </p>

      {/* subscription hint (compact) */}
      {pack.kind === 'subscription' && (
        <p className="mt-2 text-[12px] text-blue-300/85">
          Max {pack.meta?.maxPerHour ?? 1}/hr • {pack.meta?.durationDays ?? 7} days
        </p>
      )}

      {/* actions */}
      <div className="mt-4 flex gap-2">
        <a
          href={`/create?type=fixed&packId=${encodeURIComponent(pack.id)}`}
          aria-label={`Select ${pack.label}`}
          title="Prefill this pack in Create Mission"
          className="flex-1 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-sm text-center
                     transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400/70
                     focus:ring-offset-2 focus:ring-offset-black"
        >
          Select
        </a>
        {owned ? (
          <ModernButton variant="secondary" disabled className="flex-1">Owned</ModernButton>
        ) : (
          <ModernButton onClick={handleBuy} loading={loading} className="flex-1" aria-label={`Buy ${pack.label}`}>
            Buy →
          </ModernButton>
        )}
      </div>

      {error && <div className="text-red-400 text-xs mt-2">{error}</div>}
    </ModernCard>
  )
}