'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import type { Pack, Entitlement } from '../../../types/packs'
import { usePacks } from '../../../hooks/useApi'

export function usePrefilledPack() {
    const params = useSearchParams()
    const packId = params.get('packId') || undefined
    const { packs, entitlements, fetchPacks, fetchEntitlements } = usePacks()
    const [pack, setPack] = useState<Pack | undefined>(undefined)
    const [entitlement, setEntitlement] = useState<Entitlement | undefined>(undefined)

    useEffect(() => {
        fetchPacks()
        fetchEntitlements()
    }, [fetchPacks, fetchEntitlements])

    useEffect(() => {
        if (!packId || !packs.length) return

        const foundPack = packs.find(p => p.id === packId)
        setPack(foundPack)

        if (foundPack) {
            const foundEntitlement = entitlements.find(e => e.packId === packId && e.status === 'active')
            setEntitlement(foundEntitlement)
        }
    }, [packId, packs, entitlements])

    return {
        pack,
        entitlement,
        isActive: entitlement?.status === 'active',
        remainingQuota: entitlement ? entitlement.quotas.tweets - entitlement.usage.tweetsUsed : 0,
        isExpired: entitlement?.expiresAt ? new Date(entitlement.expiresAt) < new Date() : false
    }
}
