'use client'
import Link from 'next/link'
import React from 'react'
import { ModernButton } from '../ui/ModernButton'

export default function PacksHeader() {
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

      {/* Right balance pills (static placeholders; wire to real balances later if you like) */}
      <div className="flex items-center gap-2">
        <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs">
          <span className="opacity-70 mr-1">🪙 ETH:</span> 0.000
        </div>
        <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs">
          <span className="opacity-70 mr-1">💵 USDC:</span> 0.0
        </div>
      </div>
    </div>
  )
}
