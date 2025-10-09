'use client'
import React from 'react'
import { apiGetPacks } from '../../hooks/useApi'
import PackCard from './PackCard'
import { ModernCard } from '../ui/ModernCard'
import { PACKS_FALLBACK } from '../../shared/config/packs.fallback'

export default function Packs() {
  const [items, setItems] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const load = async () => {
    setLoading(true); setError(null)
    try {
      const data = await apiGetPacks()
      setItems(Array.isArray(data) ? data : [])
    } catch (e) {
      // Use local fallback instead of hard error
      setItems(PACKS_FALLBACK)
      setError(null)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => { load() }, [])

  if (loading) return <div className="opacity-70">Loading packs…</div>

  // Remove the "Unable to load packs" hard error screen; we already fall back
  if (!items.length) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">📦</div>
        <h3 className="text-lg font-semibold mb-2">No packs available</h3>
        <p className="text-gray-400 mb-4">Please check back later.</p>
      </div>
    )
  }

  const singles = items.filter(p => p.kind === 'single')
  const subs    = items.filter(p => p.kind === 'subscription')

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-xl font-semibold mb-4">Single-use Packs</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {singles.map(p => <PackCard key={p.id} pack={p} />)}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Subscription Packs</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subs.map(p => <PackCard key={p.id} pack={p} />)}
        </div>
      </section>
    </div>
  )
}