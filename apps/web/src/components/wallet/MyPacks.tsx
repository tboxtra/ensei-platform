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

  if (loading) {
    return (
      <div className="space-y-10">
        <section>
          <div className="text-2xl font-semibold mb-1">Your Active Packs</div>
          <p className="text-sm text-white/60 mb-6">Your purchased packs with remaining missions</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy={true}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-white/[0.04] h-40 animate-pulse" />
            ))}
          </div>
        </section>
        <section>
          <div className="text-2xl font-semibold mb-1">Purchase History</div>
          <p className="text-sm text-white/60 mb-4">Your recent pack purchases</p>
          <div className="rounded-xl border border-white/10 bg-white/[0.04] h-32 animate-pulse" />
        </section>
      </div>
    );
  }
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
    <div className="space-y-10">
      {/* Active */}
      <section>
        <div className="text-2xl font-semibold mb-1">Your Active Packs</div>
        <p className="text-sm text-white/60 mb-6">Your purchased packs with remaining missions</p>

        {items.filter(i => i.status === 'active').length === 0 ? (
          <div className="text-center py-10 opacity-70">No active packs yet.</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items
              .filter(i => i.status === 'active')
              .map((ent) => {
                const pct = Math.min(100, Math.round((ent.usage.tweetsUsed / ent.quotas.tweets) * 100))
                return (
                  <ModernCard key={ent.id} className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{ent.packLabel}</div>
                        <div className="text-xs opacity-70">Engage Missions</div>
                      </div>
                      <div className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-300 border border-green-500/20">
                        ACTIVE
                      </div>
                    </div>

                    <div className="text-xs opacity-80">
                      Tweets: {ent.usage.tweetsUsed}/{ent.quotas.tweets} • Likes: {ent.usage.likes}/{ent.quotas.likes} • Retweets: {ent.usage.retweets}/{ent.quotas.retweets} • Comments: {ent.usage.comments}/{ent.quotas.comments}
                    </div>

                    <div className="h-2 bg-white/10 rounded">
                      <div className="h-2 bg-gradient-to-r from-green-500 to-blue-500 rounded" style={{ width: `${pct}%` }} />
                    </div>

                    <a
                      href={`/create?type=fixed&packId=${encodeURIComponent(ent.packId)}`}
                      className="mt-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm text-center transition-colors"
                    >
                      Use Pack →
                    </a>
                  </ModernCard>
                )
              })}
          </div>
        )}
      </section>

      {/* History */}
      <section>
        <div className="text-2xl font-semibold mb-1">Purchase History</div>
        <p className="text-sm text-white/60 mb-4">Your recent pack purchases</p>

        {items.length === 0 ? (
          <div className="text-center py-8 opacity-70">No purchases yet.</div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="min-w-full text-sm">
              <thead className="bg-white/5 text-white/70">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Date</th>
                  <th className="text-left px-4 py-3 font-medium">Pack</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Usage</th>
                </tr>
              </thead>
              <tbody>
                {items
                  .map(x => ({
                    ...x,
                    _date: x.startsAt || x.endsAt || ''
                  }))
                  .sort((a, b) => (a._date < b._date ? 1 : -1))
                  .map((ent) => (
                    <tr key={ent.id} className="border-t border-white/5">
                      <td className="px-4 py-3">{ent._date ? new Date(ent._date).toLocaleDateString() : '—'}</td>
                      <td className="px-4 py-3">{ent.packLabel}</td>
                      <td className="px-4 py-3 capitalize">{ent.status}</td>
                      <td className="px-4 py-3">
                        {ent.usage.tweetsUsed}/{ent.quotas.tweets} tweets
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}