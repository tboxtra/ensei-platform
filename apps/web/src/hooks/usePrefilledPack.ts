import { useEffect, useState } from 'react'
import { usePacks } from './useApi'

export function usePrefilledPack() {
    const [packId, setPackId] = useState<string | null>(null)
    const { entitlements, fetchEntitlements } = usePacks()

    useEffect(() => {
        fetchEntitlements('prefilled_pack_load')
    }, []) // Remove dependencies to prevent infinite loops

    useEffect(() => {
        const active = entitlements.find((e) => e.status === 'active')
        if (active) setPackId(active.packId)
    }, [entitlements])

    return packId
}
