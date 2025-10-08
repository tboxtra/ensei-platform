'use client'
import React from 'react'
import { apiGetEntitlements } from '../../hooks/useApi'
import { ModernCard } from '../ui/ModernCard'
import { ModernButton } from '../ui/ModernButton'

export default function MyPacks() {
    const [items, setItems] = React.useState<any[]>([])
    const [loading, setLoading] = React.useState(true)

    const load = async () => {
        setLoading(true)
        const e = await apiGetEntitlements()
        setItems(e); setLoading(false)
    }
    React.useEffect(() => { load() }, [])

    if (loading) return <div className="opacity-70">Loading…</div>
    if (!items.length) return <div className="opacity-70">You don't own any packs yet.</div>

    return (
        <div className="flex flex-col gap-4">
            {items.map((ent) => {
                const pct = Math.min(100, Math.round((ent.usage.tweetsUsed / ent.quotas.tweets) * 100))
                return (
                    <ModernCard key={ent.id} className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-semibold">{ent.packLabel}</div>
                                <div className="text-xs opacity-70">Status: {ent.status}</div>
                            </div>
                            <ModernButton variant="secondary" disabled={ent.status !== 'active'}>
                                Use Pack
                            </ModernButton>
                        </div>
                        <div className="text-xs opacity-80">
                            Tweets: {ent.usage.tweetsUsed}/{ent.quotas.tweets} • Likes: {ent.usage.likes}/{ent.quotas.likes} •
                            Retweets: {ent.usage.retweets}/{ent.quotas.retweets} • Comments: {ent.usage.comments}/{ent.quotas.comments}
                        </div>
                        <div className="h-2 bg-white/10 rounded">
                            <div className="h-2 bg-emerald-500 rounded" style={{ width: `${pct}%` }} />
                        </div>
                    </ModernCard>
                )
            })}
        </div>
    )
}
