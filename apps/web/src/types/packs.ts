export type PackSize = 'small' | 'medium' | 'large'
export type PackKind = 'single' | 'subscription'

export interface Pack {
    id: string
    kind: PackKind
    label: string
    group: string
    tweets: number
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