'use client';
import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { PACKS_FALLBACK } from '../../shared/config/packs.fallback';

export function usePrefilledPack() {
    const params = useSearchParams();
    const packId = params.get('packId');
    const pack = useMemo(() => PACKS_FALLBACK.find(p => p.id === packId), [packId]);
    return pack; // undefined if none
}
