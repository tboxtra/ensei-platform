'use client'
import React from 'react'
import { Pack } from '../../types/packs'
import { ModernCard } from '../ui/ModernCard'
import ValueBar from './ValueBar'
import { PACKS_TOKENS as T } from './packs.tokens'
import { briefQuota } from './packs.utils'

type Props = {
  pack: Pack
  owned?: boolean
  onClick: () => void
}

export default function PackCard({ pack, owned, onClick }: Props) {
  const pct = pack.meta?.discountPct ?? (
    pack.meta?.originalUsd && pack.meta.originalUsd > pack.priceUsd
      ? Math.round(100 - (pack.priceUsd / pack.meta.originalUsd) * 100)
      : undefined
  )

  const total = pack.quotas.likes + pack.quotas.retweets + pack.quotas.comments
  const sizePill = T.sizeAccent[pack.size]

  return (
    <div onClick={onClick}>
      <ModernCard
        className={[
          "cursor-pointer min-h-[140px] p-4 sm:p-5",
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

        {/* main content */}
        <div className="flex justify-between items-start">
          <div className="min-w-0 flex-1">
            <span className={`inline-flex items-center text-[10px] uppercase px-2 py-0.5 rounded-full border ${sizePill}`}>
              {pack.size}
            </span>
            <h3 className="mt-1 text-base sm:text-lg font-semibold leading-tight break-words">
              {pack.label}
            </h3>
            <p className="mt-1 text-[13px] text-white/70">
              {briefQuota(pack.quotas)}
            </p>
          </div>

          {/* price */}
          <div className="text-right pl-3">
            <div className="text-emerald-400 font-bold text-xl tabular-nums">${pack.priceUsd.toFixed(2)}</div>
            {pct != null && (
              <div className="text-[11px] text-amber-300">-{pct}% off</div>
            )}
          </div>
        </div>

        {/* progress bar - only for owned packs */}
        {owned && (
          <div className="mt-3">
            <ValueBar v={total} />
          </div>
        )}
      </ModernCard>
    </div>
  )
}