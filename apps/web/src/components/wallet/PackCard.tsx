'use client'
import React from 'react'
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
    apiEthUsd().then(p => m && setEthUsd(p.price)).catch(() => {})
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
          else if (['failed','expired'].includes(s.status)) setError('Payment failed or expired.')
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
    <ModernCard className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{pack.label}</h3>
        <div className="text-right">
          <div className="text-emerald-400 font-bold">{usd}</div>
          {eth && <div className="text-xs opacity-70">{eth}</div>}
        </div>
      </div>

      <div className="text-sm opacity-80">
        <div>Likes: {pack.quotas.likes}</div>
        <div>Retweets: {pack.quotas.retweets}</div>
        <div>Comments: {pack.quotas.comments}</div>
        {pack.kind === 'subscription' && (
          <div className="mt-1 text-xs">
            Max {pack.meta?.maxPerHour ?? 1} tweet/hour • Duration {pack.meta?.durationDays ?? 7} days
          </div>
        )}
      </div>

      <div className="mt-2">
        {owned ? (
          <ModernButton variant="secondary" disabled>Owned</ModernButton>
        ) : (
          <>
            <ModernButton onClick={handleBuy} loading={loading}>Buy Pack →</ModernButton>
            <div className="mt-2 text-xs">
              <a
                href={`/create?type=fixed&packId=${encodeURIComponent(pack.id)}`}
                className="opacity-80 hover:opacity-100 underline"
              >
                Select for Fixed Mission
              </a>
            </div>
          </>
        )}
        {error && <div className="text-red-400 text-xs mt-2">{error}</div>}
      </div>
    </ModernCard>
  )
}