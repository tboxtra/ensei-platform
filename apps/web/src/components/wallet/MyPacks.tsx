'use client'
import React from 'react'
import { apiGetEntitlements } from '../../hooks/useApi'
import { ModernCard } from '../ui/ModernCard'
import { ModernButton } from '../ui/ModernButton'

export default function MyPacks() {
  const [items, setItems] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const load = async () => {
    setLoading(true); setError(null)
    try {
      const e = await apiGetEntitlements()
      setItems(e)
    } catch (err) {
      console.error('Failed to load entitlements:', err)
      // Graceful fallback: show empty state
      setItems([])
      setError(null)
    } finally { setLoading(false) }
  }
  React.useEffect(() => { load() }, [])

  if (loading) return <div className="opacity-70">Loading your packs…</div>
  if (!items.length) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">🎒</div>
        <h3 className="text-lg font-semibold mb-2">No packs yet</h3>
        <p className="text-gray-400">Purchase packs from the Packs tab to get started!</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {items.map((ent) => {
        const pct = Math.min(100, Math.round((ent.usage.tweetsUsed / ent.quotas.tweets) * 100))
        return (
          <ModernCard key={ent.id} className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{ent.packLabel}</div>
                <div className="text-xs opacity-70">Status: {ent.status}</div>
              </div>
              {ent.status === 'active' ? (
                <a
                  href={`/create?type=fixed&packId=${encodeURIComponent(ent.packId)}`}
                  className="inline-flex items-center px-3 py-2 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/30"
                >
                  Use Pack →
                </a>
              ) : (
                <ModernButton variant="secondary" disabled>Use Pack</ModernButton>
              )}
            </div>

            <div className="text-xs opacity-80">
              Tweets: {ent.usage.tweetsUsed}/{ent.quotas.tweets} • Likes: {ent.usage.likes}/{ent.quotas.likes} •
              Retweets: {ent.usage.retweets}/{ent.quotas.retweets} • Comments: {ent.usage.comments}/{ent.quotas.comments}
            </div>
            <div className="h-2 bg-white/10 rounded">
              <div className="h-2 bg-emerald-500 rounded" style={{ width: `${pct}%` }} />
            </div>
          </ModernCard>
        )
      })}
    </div>
  )
}