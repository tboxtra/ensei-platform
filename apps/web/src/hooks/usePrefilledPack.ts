import { useEffect, useState } from 'react'
import { usePacks } from './useApi'

export function usePrefilledPack() {
    const [packId, setPackId] = useState<string | null>(null)
    const { entitlements, fetchEntitlements } = usePacks()
    
    useEffect(() => {
        // Fetch entitlements on mount
        fetchEntitlements('page_load')
    }, [fetchEntitlements])
    
    useEffect(() => {
        // Update packId when entitlements change
        const active = entitlements.find((e) => e.status === 'active')
        if (active) {
            setPackId(active.packId)
        }
    }, [entitlements])
    
    return packId
}
