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

  React.useEffect(() => {
    let m = true
    apiEthUsd().then(p => m && setEthUsd(p.price)).catch(() => { })
    return () => { m = false }
  }, [])

  const handleBuy = async () => {
    try {
      setError(null); setLoading(true)
      const { txId } = await apiStartPurchase(pack.id)
      if (txId) {
        const poll = async () => {
          const s = await apiPaymentStatus(txId!)
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

  const usd = `$${pack.priceUsd.toFixed(2)}`
  const eth = ethUsd ? `≈ ${(pack.priceUsd / ethUsd).toFixed(4)} ETH` : ''

  return (
    <ModernCard className="flex flex-col gap-3 p-4 sm:p-5 border border-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] transition-transform duration-150 will-change-transform hover:scale-[1.01] active:scale-[0.99]">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{pack.label}</h3>
        <div className="text-right">
          <div className="text-emerald-400 font-bold">${pack.priceUsd.toFixed(2)}</div>
          {eth && <div className="text-[11px] opacity-70">{eth}</div>}
        </div>
      </div>

      <div className="text-sm text-gray-300/90 space-y-1">
        <div className="flex justify-between"><span className="text-gray-400">Likes</span><span>{pack.quotas.likes}</span></div>
        <div className="flex justify-between"><span className="text-gray-400">Retweets</span><span>{pack.quotas.retweets}</span></div>
        <div className="flex justify-between"><span className="text-gray-400">Comments</span><span>{pack.quotas.comments}</span></div>
        {pack.kind === 'subscription' && (
          <div className="text-xs text-blue-300/90 mt-2">
            Max {pack.meta?.maxPerHour ?? 1}/hour • Duration {pack.meta?.durationDays ?? 7} days
          </div>
        )}
      </div>

      <div className="mt-2 flex gap-2">
        <Link
          href={`/create?type=fixed&packId=${encodeURIComponent(pack.id)}`}
          className="flex-1 px-4 py-2 rounded-lg text-center bg-white/10 hover:bg-white/15 border border-white/10 text-white text-sm"
        >
          Select
        </Link>
        {owned ? (
          <ModernButton variant="secondary" disabled className="flex-1">Owned</ModernButton>
        ) : (
          <ModernButton className="flex-1" onClick={handleBuy} loading={loading}>Buy Pack →</ModernButton>
        )}
      </div>
      {error && <div className="text-red-400 text-xs mt-2">{error}</div>}
    </ModernCard>
  )
}