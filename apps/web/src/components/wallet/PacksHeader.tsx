'use client'
import Link from 'next/link'
import React from 'react'
import { ModernButton } from '../ui/ModernButton'
import { apiEthUsd, useWallet } from '../../hooks/useApi'

export default function PacksHeader() {
    const { balance } = useWallet()
    const [ethUsd, setEthUsd] = React.useState<number | null>(null)

    React.useEffect(() => {
        let m = true
        apiEthUsd().then(p => m && setEthUsd(p.price)).catch(() => { })
        return () => { m = false }
    }, [])

    const usd = Number.isFinite(balance?.usd) ? balance!.usd : 0
    const eth = ethUsd && ethUsd > 0 ? (usd / ethUsd).toFixed(3) : '—'

    return (
        <div className="mb-6">
            {/* Header content removed as requested */}
        </div>
    )
}
