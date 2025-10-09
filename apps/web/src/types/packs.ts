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
  meta?: {
    durationDays?: number
    maxPerHour?: number
    /** strike-through "was" price if present */
    originalUsd?: number
    /** small corner badge like "-15%" */
    discountPct?: number
    /** tiny gray subtitle under label, e.g., STARTER / MEDIUM / LARGE */
    tierNote?: string
  }
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