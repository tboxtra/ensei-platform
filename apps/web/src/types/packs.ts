export type PackSize = 'small' | 'medium' | 'large'
export type PackKind = 'single' | 'subscription'

export interface Pack {
    id: string
    kind: PackKind             // 'single' | 'subscription'
    label: string              // e.g., "1 Tweet — Small"
    group: string              // e.g., "Single-use Packs"
    tweets: number             // 1 | 3 | 10 or per-hour for subs
    priceUsd: number
    size: PackSize
    quotas: { likes: number; retweets: number; comments: number }
    meta?: { durationDays?: number; maxPerHour?: number }
}

export interface Entitlement {
    id: string
    packId: string
    packLabel: string
    status: 'active' | 'consumed' | 'expired' | 'pending'
    usage: { tweetsUsed: number; likes: number; retweets: number; comments: number }
    quotas: { tweets: number; likes: number; retweets: number; comments: number }
    startsAt?: string
    endsAt?: string
}
