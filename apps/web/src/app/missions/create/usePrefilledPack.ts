'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import type { Pack } from '../../../types/packs'
import { apiGetPacks } from '../../../hooks/useApi'

export function usePrefilledPack(): Pack | undefined {
    const params = useSearchParams()
    const packId = params.get('packId') || undefined
    const [pack, setPack] = useState<Pack | undefined>(undefined)

    useEffect(() => {
        let alive = true
        if (!packId) return
            ; (async () => {
                try {
                    const list = await apiGetPacks()
                    const found = Array.isArray(list) ? list.find(p => p.id === packId) : undefined
                    if (alive) setPack(found)
                } catch {
                    if (alive) setPack(undefined)
                }
            })()
        return () => { alive = false }
    }, [packId])

    return pack
}
