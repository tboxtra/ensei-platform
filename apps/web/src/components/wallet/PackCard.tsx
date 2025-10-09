'use client'
import React from 'react'
import { Pack } from '../../types/packs'
import { ModernCard } from '../ui/ModernCard'
import { ModernButton } from '../ui/ModernButton'
import ValueBar from './ValueBar'
import { PACKS_TOKENS as T } from './packs.tokens'
import { briefQuota, briefSub } from './packs.utils'
import { apiEthUsd, apiPaymentStatus, apiStartPurchase } from '../../hooks/useApi'

type Props = { pack: Pack; owned?: boolean; onPurchased?: () => void }

export default function PackCard({ pack, owned, onPurchased }: Props) {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [ethUsd, setEthUsd] = React.useState<number | null>(null)

  React.useEffect(() => { apiEthUsd().then(p=>setEthUsd(p.price)).catch(()=>{}) }, [])

  const pct = pack.meta?.discountPct ?? (
    pack.meta?.originalUsd && pack.meta.originalUsd > pack.priceUsd
      ? Math.round(100 - (pack.priceUsd / pack.meta.originalUsd) * 100)
      : undefined
  )

  const total = pack.quotas.likes + pack.quotas.retweets + pack.quotas.comments
  const subHint = pack.kind === 'subscription' ? briefSub(pack.meta) : ''
  const sizePill = T.sizeAccent[pack.size]

  async function buy() {
    try {
      setError(null); setLoading(true)
      const { txId } = await apiStartPurchase(pack.id)
      if (!txId) throw new Error('no tx id')
      const poll = async () => {
        const s = await apiPaymentStatus(txId)
        if (s.status === 'confirmed') onPurchased?.()
        else if (['failed','expired'].includes(s.status)) setError('Payment failed or expired.')
        else setTimeout(poll, 1400)
      }; poll()
    } catch {
      // demo fallback
      setTimeout(()=>onPurchased?.(), 1000)
    } finally { setLoading(false) }
  }

  return (
    <ModernCard
      className={[
        "relative overflow-hidden min-h-[172px] p-4 sm:p-5",
        T.border, T.hoverLift,
        `bg-gradient-to-b ${T.glassFrom} ${T.glassTo}`, T.radius
      ].join(' ')}
    >
      {/* edge gradient */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[linear-gradient(90deg,rgba(16,185,129,.18),transparent,rgba(99,102,241,.18))] opacity-35" />

      {/* discount chip */}
      {pct != null && (
        <span className="absolute top-3 right-3 text-[11px] font-semibold px-2 py-1 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30">
          -{pct}%
        </span>
      )}

      {/* header */}
      <div className="grid grid-cols-[1fr,auto] gap-3 items-start">
        <div className="min-w-0">
          <span className={`inline-flex items-center text-[10px] uppercase px-2 py-0.5 rounded-full border ${sizePill}`}>
            {pack.size}
          </span>
          {pack.kind === 'subscription' && (
            <span className="ml-2 text-[10px] uppercase px-2 py-0.5 rounded-full border text-blue-300 bg-blue-400/10 border-blue-400/20">sub</span>
          )}
          <h3 className="mt-1 text-base sm:text-lg font-semibold leading-tight break-words">
            {pack.label}
          </h3>
        </div>

        {/* price */}
        <div className="text-right pl-3 border-l border-white/10">
          <div className="text-emerald-400 font-bold text-xl tabular-nums">${pack.priceUsd.toFixed(2)}</div>
          {!!pack.meta?.originalUsd && pack.meta.originalUsd > pack.priceUsd && (
            <div className="text-[12px] line-through text-white/50">${pack.meta.originalUsd.toFixed(2)}</div>
          )}
          {/* per mission hint (tiny) */}
          {pack.tweets > 1 && (
            <div className="text-[11px] text-white/50">~${(pack.priceUsd/pack.tweets).toFixed(2)}/mission</div>
          )}
        </div>
      </div>

      {/* single, tight value line */}
      <div className="mt-3 text-[13px] text-white/70">
        {pack.tweets} {pack.tweets === 1 ? 'mission' : 'missions'} • {briefQuota(pack.quotas)}
      </div>

      {/* subscription compact hint */}
      {subHint && <div className="mt-1 text-[12px] text-blue-300/85">{subHint}</div>}

      {/* value bar */}
      <div className="mt-3"><ValueBar v={total} /></div>

      {/* actions */}
      <div className="mt-4 flex gap-2">
        <a
          href={`/create?type=fixed&packId=${encodeURIComponent(pack.id)}`}
          className={`flex-1 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-sm text-center ${T.focusRing}`}
          aria-label={`Select ${pack.label}`}
        >
          Select
        </a>
        {owned ? (
          <ModernButton variant="secondary" disabled className="flex-1">Owned</ModernButton>
        ) : (
          <ModernButton onClick={buy} loading={loading} className="flex-1" aria-label={`Buy ${pack.label}`}>
            Buy →
          </ModernButton>
        )}
      </div>

      {error && <div className="text-red-400 text-xs mt-2">{error}</div>}
    </ModernCard>
  )
}