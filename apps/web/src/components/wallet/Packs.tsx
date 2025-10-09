'use client'
import React from 'react'
import { apiGetPacks, apiGetEntitlements } from '../../hooks/useApi'
import { ModernCard } from '../ui/ModernCard'
import PackCard from './PackCard'

export default function Packs() {
  const [packs, setPacks] = React.useState<any[]>([])
  const [entitlements, setEntitlements] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const load = async () => {
    setLoading(true); setError(null)
    try {
      const [p, e] = await Promise.all([
        apiGetPacks(),
        apiGetEntitlements().catch(() => []), // ok if not logged in
      ])
      setPacks(Array.isArray(p) ? p : [])
      setEntitlements(Array.isArray(e) ? e : [])
    } catch (err) {
      console.error('Failed to load packs:', err)
      setError('Failed to load packs. Please try again later.')
    } finally { setLoading(false) }
  }
  React.useEffect(() => { load() }, [])

  if (loading) return <div className="opacity-70">Loading packs…</div>
  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">⚠️</div>
        <h3 className="text-lg font-semibold mb-2 text-yellow-400">Unable to load packs</h3>
        <p className="text-gray-400 mb-4">{error}</p>
        <button
          onClick={load}
          className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  const ownedIds = new Set(entitlements?.map((e: any) => e.packId))
  const byGroup = (g: string) => packs.filter((p: any) => p.group === g)

  const sections = [
    { title: 'Single-use Packs', items: byGroup('Single-use Packs') },
    { title: 'Subscription Packs', items: byGroup('Subscriptions') },
  ]

  return (
    <div className="flex flex-col gap-6">
      {sections.map(s => s.items.length ? (
        <ModernCard key={s.title} className="p-4">
          <h2 className="text-lg font-bold mb-3">{s.title}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {s.items.map((p: any) => (
              <PackCard key={p.id} pack={p} owned={ownedIds.has(p.id)} onPurchased={load} />
            ))}
          </div>
        </ModernCard>
      ) : null)}
    </div>
  )
}