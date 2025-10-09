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

    if (loading) {
        return (
            <div className="space-y-10">
                <PacksHeader />
                <section>
                    <div className="mb-1 text-2xl font-semibold">Available Packs</div>
                    <p className="text-sm text-white/60 mb-6">Purchase mission packs to save on your campaigns.</p>
                    <div className="grid gap-4 sm:gap-5 lg:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-busy={true}>
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.04] h-[180px] animate-pulse" />
                        ))}
                    </div>
                </section>
            </div>
        );
    }

    // Remove the "Unable to load packs" hard error screen; we already fall back
    if (!items.length) {
        return (
            <div className="text-center py-10">
                <div className="text-4xl mb-3">📦</div>
                <h3 className="text-lg font-semibold mb-1">No packs available right now.</h3>
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
                <h1 className="text-2xl font-semibold">Available Packs</h1>

                {/* Single-use */}
                {singles.length > 0 && (
                    <>
                        <h2 className="mt-5 mb-3 text-lg font-semibold">Single-use</h2>
                        <div className="grid gap-4 sm:gap-5 lg:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {singles.map(p => <PackCard key={p.id} pack={p} owned={false} onPurchased={onPurchased} />)}
                        </div>
                    </>
                )}

                {/* Subscriptions */}
                {subs.length > 0 && (
                    <>
                        <h2 className="mt-10 mb-3 text-lg font-semibold">Subscriptions</h2>
                        <div className="grid gap-4 sm:gap-5 lg:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {subs.map(p => <PackCard key={p.id} pack={p} owned={false} onPurchased={onPurchased} />)}
                        </div>
                    </>
                )}
            </section>
        </div>
    )
}