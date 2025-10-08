'use client'
import React from 'react'
import { apiGetPacks, apiGetEntitlements } from '../../hooks/useApi'
import { Pack } from '../../types/packs'
import PackCard from './PackCard'

export default function Packs() {
    const [packs, setPacks] = React.useState<Pack[]>([])
    const [ownedIds, setOwnedIds] = React.useState<Set<string>>(new Set())
    const [loading, setLoading] = React.useState(true)

    const load = React.useCallback(async () => {
        setLoading(true)
        const [p, e] = await Promise.all([apiGetPacks(), apiGetEntitlements().catch(() => [])])
        setPacks(p)
        setOwnedIds(new Set((e as any[]).map((x) => x.packId)))
        setLoading(false)
    }, [])

    React.useEffect(() => { load() }, [load])

    if (loading) return <div className="opacity-70">Loading packs…</div>

    const groups = new Map<string, Pack[]>()
    for (const pk of packs) {
        const g = groups.get(pk.group) ?? []
        g.push(pk); groups.set(pk.group, g)
    }

    return (
        <div className="flex flex-col gap-8">
            {[...groups.entries()].map(([group, list]) => (
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
