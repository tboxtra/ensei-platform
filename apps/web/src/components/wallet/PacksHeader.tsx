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
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Left CTAs */}
            <div className="flex items-center gap-2">
                <Link href="/create?type=fixed">
                    <ModernButton size="md" className="gap-2">
                        <span className="text-lg">🧩</span> Create Mission
                    </ModernButton>
                </Link>
                <Link href="/wallet">
                    <ModernButton variant="secondary" size="md" className="gap-2">
                        <span className="text-lg">💰</span> Wallet
                    </ModernButton>
                </Link>
            </div>

            {/* Right balance pills (live data) */}
            <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs">
                    <span className="opacity-70 mr-1">🪙 ETH:</span> {eth}
                </div>
                <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs">
                    <span className="opacity-70 mr-1">💵 USD:</span> {usd.toFixed(2)}
                </div>
            </div>
        </div>
    )
}
