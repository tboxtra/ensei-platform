'use client'
import React from 'react'
import { apiGetPacks } from '../../hooks/useApi'
import PackCard from './PackCard'
import PacksHeader from './PacksHeader'
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
        <div className="space-y-10">
            <PacksHeader />

            {/* Available Packs */}
            <section>
                <div className="mb-1 text-2xl font-semibold">Available Packs</div>
                <p className="text-sm text-white/60 mb-6">
                    Purchase mission packs to save on your campaigns.
                </p>

                {/* Single-use */}
                <h3 className="text-lg font-semibold mb-3">Single-use Packs</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {singles.map(p => (
                        <PackCard key={p.id} pack={p} owned={false} onPurchased={onPurchased} />
                    ))}
                </div>

                {/* Subscriptions */}
                <h3 className="text-lg font-semibold mt-10 mb-3">Subscription Packs</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {subs.map(p => (
                        <PackCard key={p.id} pack={p} owned={false} onPurchased={onPurchased} />
                    ))}
                </div>
            </section>
        </div>
    )
}