'use client'
import React from 'react'
import Link from 'next/link'
import { apiGetEntitlements } from '../../hooks/useApi'
import { ModernCard } from '../ui/ModernCard'
import { ModernButton } from '../ui/ModernButton'
import { SectionHeader } from '../ui/SectionHeader'

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
      <div className="text-center py-10">
        <div className="text-4xl mb-3">🎒</div>
        <h3 className="text-lg font-semibold mb-1">No packs yet</h3>
        <p className="text-gray-400 mb-4">Browse packs to get started.</p>
        <ModernButton onClick={() => window.location.href = '/wallet?tab=packs'}>Browse Packs</ModernButton>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <SectionHeader icon="🎒" title="Your Packs" />
      
      <div className="grid gap-4 sm:gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {items.map((ent) => {
          const pct = Math.min(100, Math.round((ent.usage.tweetsUsed / ent.quotas.tweets) * 100))
          
          // Status chip styling
          const chip = (s: string) => s === 'active' ? 'bg-green-500/15 text-green-300' :
            s === 'consumed' ? 'bg-yellow-500/15 text-yellow-300' : 'bg-red-500/15 text-red-300';

          return (
            <ModernCard key={ent.id} className="flex flex-col gap-3 p-4 sm:p-5 border border-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{ent.packLabel}</div>
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-[11px] ${chip(ent.status)}`}>
                    {ent.status.toUpperCase()}
                  </div>
                </div>
                {ent.status === 'active' ? (
                  <Link
                    href={`/create?type=fixed&packId=${encodeURIComponent(ent.packId)}`}
                    className="px-3 py-2 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-300 hover:bg-blue-600/30 text-sm"
                  >
                    Use Pack →
                  </Link>
                ) : (
                  <ModernButton variant="secondary" disabled size="sm">Use Pack</ModernButton>
                )}
              </div>

              <div className="text-sm text-gray-300/90 space-y-1">
                <div className="flex justify-between"><span className="text-gray-400">Tweets</span><span>{ent.usage.tweetsUsed}/{ent.quotas.tweets}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Likes</span><span>{ent.usage.likes}/{ent.quotas.likes}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Retweets</span><span>{ent.usage.retweets}/{ent.quotas.retweets}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Comments</span><span>{ent.usage.comments}/{ent.quotas.comments}</span></div>
              </div>
              
              <div className="h-2 bg-white/10 rounded">
                <div className="h-2 rounded bg-gradient-to-r from-emerald-400 to-blue-400" style={{ width: `${pct}%` }} />
              </div>
            </ModernCard>
          )
        })}
      </div>
    </div>
  )
}