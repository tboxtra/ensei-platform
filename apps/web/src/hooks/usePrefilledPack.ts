import { useEffect, useState } from 'react'
import { apiGetEntitlements } from './useApi'

export function usePrefilledPack() {
    const [packId, setPackId] = useState<string | null>(null)
    useEffect(() => {
        apiGetEntitlements().then(list => {
            const active = list.find((e) => e.status === 'active')
            if (active) setPackId(active.packId)
        }).catch(() => { })
    }, [])
    return packId
}
