'use client'
import React from 'react'
import { apiGetPacks, apiGetEntitlements } from '../../hooks/useApi'
import { Pack } from '../../types/packs'
import PackCard from '../../components/wallet/PackCard'

// Mock data for development
const mockPacks: Pack[] = [
    {
        id: 'pack-1',
        kind: 'single',
        label: '1 Tweet — Small',
        group: 'Single-use Packs',
        tweets: 1,
        priceUsd: 5.00,
        size: 'small',
        quotas: { likes: 10, retweets: 5, comments: 3 }
    },
    {
        id: 'pack-2',
        kind: 'single',
        label: '3 Tweets — Medium',
        group: 'Single-use Packs',
        tweets: 3,
        priceUsd: 12.00,
        size: 'medium',
        quotas: { likes: 30, retweets: 15, comments: 9 }
    },
    {
        id: 'pack-3',
        kind: 'single',
        label: '10 Tweets — Large',
        group: 'Single-use Packs',
        tweets: 10,
        priceUsd: 35.00,
        size: 'large',
        quotas: { likes: 100, retweets: 50, comments: 30 }
    },
    {
        id: 'pack-4',
        kind: 'subscription',
        label: 'Daily Pack — 7 Days',
        group: 'Subscription Packs',
        tweets: 5,
        priceUsd: 25.00,
        size: 'medium',
        quotas: { likes: 50, retweets: 25, comments: 15 },
        meta: { durationDays: 7, maxPerHour: 2 }
    },
    {
        id: 'pack-5',
        kind: 'subscription',
        label: 'Weekly Pack — 30 Days',
        group: 'Subscription Packs',
        tweets: 20,
        priceUsd: 80.00,
        size: 'large',
        quotas: { likes: 200, retweets: 100, comments: 60 },
        meta: { durationDays: 30, maxPerHour: 3 }
    }
]

export default function Packs() {
    const [packs, setPacks] = React.useState<Pack[]>([])
    const [ownedIds, setOwnedIds] = React.useState<Set<string>>(new Set())
    const [loading, setLoading] = React.useState(true)
    const [error, setError] = React.useState<string | null>(null)

    const load = React.useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const [p, e] = await Promise.all([
                apiGetPacks().catch(() => mockPacks), // Fallback to mock data
                apiGetEntitlements().catch(() => []) // Empty entitlements if API fails
            ])
            setPacks(p)
            setOwnedIds(new Set((e as any[]).map((x) => x.packId)))
        } catch (err) {
            console.error('Failed to load packs:', err)
            setError('Failed to load packs. Using demo data.')
            setPacks(mockPacks) // Use mock data as fallback
            setOwnedIds(new Set())
        } finally {
            setLoading(false)
        }
    }, [])

    React.useEffect(() => { load() }, [load])

    if (loading) return <div className="opacity-70">Loading packs…</div>

    if (packs.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="text-4xl mb-4">📦</div>
                <h3 className="text-lg font-semibold mb-2">No packs available</h3>
                <p className="text-gray-400">Check back later for new pack offerings!</p>
            </div>
        )
    }

    const groups = new Map<string, Pack[]>()
    for (const pk of packs) {
        const g = groups.get(pk.group) ?? []
        g.push(pk); groups.set(pk.group, g)
    }

    return (
        <div className="flex flex-col gap-8">
            {error && (
                <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                        <span className="text-yellow-400">⚠️</span>
                        <span className="text-yellow-400 text-sm">{error}</span>
                    </div>
                </div>
            )}
            {Array.from(groups.entries()).map(([group, list]) => (
                <section key={group}>
                    <h2 className="text-xl font-semibold mb-3">{group}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {list.map((pk) => (
                            <PackCard
                                key={pk.id}
                                pack={pk}
                                owned={ownedIds.has(pk.id)}
                                onPurchased={load}
                            />
                        ))}
                    </div>
                </section>
            ))}
        </div>
    )
}
