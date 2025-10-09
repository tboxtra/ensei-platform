'use client'
import React from 'react'
import { apiGetPacks } from '../../hooks/useApi'
import PackCard from './PackCard'
import { SectionHeader } from '../ui/SectionHeader'
import { PACKS_FALLBACK } from '../../shared/config/packs.fallback'

type Props = { onPurchased?: () => void }

export default function Packs({ onPurchased }: Props) {
  const [items, setItems] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [filter, setFilter] = React.useState('All')

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
            <div className="text-center py-10">
                <div className="text-4xl mb-3">📦</div>
                <h3 className="text-lg font-semibold mb-1">No packs available</h3>
                <p className="text-gray-400 mb-4">Please check back later.</p>
            </div>
        )
    }

    // Filter items based on selected filter
    const filteredItems = items.filter(p => {
        if (filter === 'All') return true
        if (filter === 'Single') return p.kind === 'single'
        if (filter === 'Subscriptions') return p.kind === 'subscription'
        return true
    })

    const singles = filteredItems.filter(p => p.kind === 'single')
    const subs = filteredItems.filter(p => p.kind === 'subscription')

    return (
        <div className="space-y-8">
            {/* Header bar with filters */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-4">
                <p className="text-sm text-gray-400">Pick a pack to prefill your next Fixed mission.</p>
                <div className="inline-flex bg-white/5 border border-white/10 rounded-lg p-1">
                    {['All','Single','Subscriptions'].map(f => (
                        <button key={f}
                            className={`px-3 py-1.5 rounded-md text-sm ${filter===f ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
                            onClick={() => setFilter(f)}
                        >{f}</button>
                    ))}
                </div>
            </div>

            {singles.length > 0 && (
                <section>
                    <SectionHeader icon="📦" title="Single-use Packs" subtitle="Engagement quotas are per tweet; one-time use packs." />
                    <div className="grid gap-4 sm:gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {singles.map(p => <PackCard key={p.id} pack={p} onPurchased={onPurchased} />)}
                    </div>
                </section>
            )}

            {subs.length > 0 && (
                <section>
                    <SectionHeader icon="🔄" title="Subscription Packs" subtitle="Engagement quotas are per tweet; subscriptions cap at 1 tweet/hour." />
                    <div className="grid gap-4 sm:gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {subs.map(p => <PackCard key={p.id} pack={p} onPurchased={onPurchased} />)}
                    </div>
                </section>
            )}
        </div>
    )
}