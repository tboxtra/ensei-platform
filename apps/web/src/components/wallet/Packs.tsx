'use client'
import React from 'react'
import { apiGetPacks } from '../../hooks/useApi'
import PackCard from './PackCard'
import PackDetailsModal from './PackDetailsModal'
import PacksHeader from './PacksHeader'
import { PACKS_FALLBACK } from '../../shared/config/packs.fallback'

type Props = { onPurchased?: () => void }

export default function Packs({ onPurchased }: Props) {
    const [items, setItems] = React.useState<any[]>([])
    const [loading, setLoading] = React.useState(true)
    const [error, setError] = React.useState<string | null>(null)
    const [selectedPack, setSelectedPack] = React.useState<any>(null)

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

    // Category grouping logic
    const singleGroups = [
        { title: "1 Mission Engage", ids: ["single_1_small", "single_1_medium", "single_1_large"] },
        { title: "3 Missions Engage", ids: ["single_3_small", "single_3_medium", "single_3_large"] },
        { title: "10 Missions Engage", ids: ["single_10_small", "single_10_medium", "single_10_large"] },
    ]

    const subGroups = [
        { title: "Weekly Plans", ids: ["sub_week_small", "sub_week_medium", "sub_week_large"] },
        { title: "Monthly Plans", ids: ["sub_month_small", "sub_month_medium", "sub_month_large"] },
        { title: "3-Month Plans", ids: ["sub_3m_small", "sub_3m_medium", "sub_3m_large"] },
        { title: "6-Month Plans", ids: ["sub_6m_small", "sub_6m_medium", "sub_6m_large"] },
        { title: "1-Year Plans", ids: ["sub_12m_small", "sub_12m_medium", "sub_12m_large"] },
    ]

    if (loading) {
        return (
            <div className="space-y-10">
                <section>
                    <h1 className="text-2xl font-semibold">Available Packs</h1>
                    <div className="grid gap-4 sm:gap-5 lg:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-busy={true}>
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.04] h-[140px] animate-pulse" />
                        ))}
                    </div>
                </section>
            </div>
        );
    }

    if (!items.length) {
        return (
            <div className="text-center py-10">
                <div className="text-4xl mb-3">📦</div>
                <h3 className="text-lg font-semibold mb-1">No packs available right now.</h3>
            </div>
        )
    }

    return (
        <div className="space-y-10">
            <PacksHeader />
            <section>
                <h1 className="text-2xl font-semibold">Available Packs</h1>

                {/* Single-use Groups */}
                {singleGroups.map(group => {
                    const groupPacks = items.filter(p => group.ids.includes(p.id))
                    if (groupPacks.length === 0) return null

                    return (
                        <div key={group.title} className="mt-8">
                            <h2 className="mb-3 text-lg font-semibold">{group.title}</h2>
                            <div className="grid gap-4 sm:gap-5 lg:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {groupPacks.map(p => (
                                    <PackCard
                                        key={p.id}
                                        pack={p}
                                        owned={false}
                                        onClick={() => setSelectedPack(p)}
                                    />
                                ))}
                            </div>
                        </div>
                    )
                })}

                {/* Subscription Groups */}
                {subGroups.map(group => {
                    const groupPacks = items.filter(p => group.ids.includes(p.id))
                    if (groupPacks.length === 0) return null

                    return (
                        <div key={group.title} className="mt-10">
                            <h2 className="mb-3 text-lg font-semibold">{group.title}</h2>
                            <div className="grid gap-4 sm:gap-5 lg:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {groupPacks.map(p => (
                                    <PackCard
                                        key={p.id}
                                        pack={p}
                                        owned={false}
                                        onClick={() => setSelectedPack(p)}
                                    />
                                ))}
                            </div>
                        </div>
                    )
                })}
            </section>

            {/* Pack Details Modal */}
            <PackDetailsModal
                pack={selectedPack}
                owned={false}
                onClose={() => setSelectedPack(null)}
                onPurchased={onPurchased}
            />
        </div>
    )
}