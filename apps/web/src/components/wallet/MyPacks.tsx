'use client'
import React from 'react'
import Link from 'next/link'
import { apiGetEntitlements } from '../../hooks/useApi'
import { ModernCard } from '../ui/ModernCard'
import { ModernButton } from '../ui/ModernButton'
import { SectionHeader } from '../ui/SectionHeader'

export default function MyPacks() {
  const [items, setItems] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const load = async () => {
    setLoading(true); setError(null)
    try {
      const e = await apiGetEntitlements()
      setItems(e)
    } catch (err) {
      console.error('Failed to load entitlements:', err)
      // Graceful fallback: show empty state
      setItems([])
      setError(null)
    } finally { setLoading(false) }
  }
  React.useEffect(() => { load() }, [])

  if (loading) {
    return (
      <div className="space-y-10">
        <section>
          <div className="text-2xl font-semibold mb-1">Your Active Packs</div>
          <p className="text-sm text-white/60 mb-6">Your purchased packs with remaining missions</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy={true}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.04] h-40 animate-pulse" />
            ))}
          </div>
        </section>
        <section>
          <div className="text-2xl font-semibold mb-1">Purchase History</div>
          <p className="text-sm text-white/60 mb-4">Your recent pack purchases</p>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] h-32 animate-pulse" />
        </section>
      </div>
    );
  }
  if (!items.length) {
    return (
      <div className="text-center py-10">
        <div className="text-4xl mb-3">🎒</div>
        <h3 className="text-lg font-semibold mb-1">No packs yet — browse packs to start.</h3>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Active Packs */}
      <div className="bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-10 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">My Active Packs</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">2 active packs</span>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        </div>

        {items.filter(i => i.status === 'active').length === 0 ? (
          <div className="text-center py-10 opacity-70">No active packs yet.</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Pack 1 */}
            <div className="relative bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-10 border border-white/10 rounded-2xl p-6 border-2 border-green-500/30 hover:scale-105 transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-400/15 text-green-300 border border-green-400/30">
                  ACTIVE
                </span>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-400/15 text-blue-300 border border-blue-400/30">
                  3 days left
                </span>
              </div>

              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center text-2xl">
                🚀
              </div>

              <h3 className="text-lg font-semibold mb-2 text-center">Engagement Boost</h3>
              <p className="text-sm text-gray-400 text-center mb-4">200 users × 3 missions</p>

              {/* Mission Selection Status */}
              <div className="bg-blue-900/20 rounded-lg p-3 mb-4">
                <div className="text-xs text-blue-400 mb-2">Mission Selection Status</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span>Selected Missions:</span>
                    <span className="font-semibold text-teal-400">3/3</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>Completed Missions:</span>
                    <span className="font-semibold text-blue-400">1/3</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>Remaining Missions:</span>
                    <span className="font-semibold text-indigo-400">2</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-400 mb-2">
                  <span>Overall Progress</span>
                  <span>33%</span>
                </div>
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full" style={{ width: '33%' }}></div>
                </div>
              </div>

              {/* Mission Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-300">Mission 1: Social Media Post</span>
                  <span className="text-teal-400">✅ Completed</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-300">Mission 2: Content Creation</span>
                  <span className="text-indigo-400">⏳ In Progress</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-300">Mission 3: Brand Awareness</span>
                  <span className="text-gray-400">⏸️ Pending</span>
                </div>
              </div>

              <button className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold transition-all duration-200">
                Continue Mission →
              </button>
            </div>

            {/* Active Pack 2 */}
            <div className="relative bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-10 border border-white/10 rounded-2xl p-6 border-2 border-purple-500/30 hover:scale-105 transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-400/15 text-green-300 border border-green-400/30">
                  ACTIVE
                </span>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-400/15 text-purple-300 border border-purple-400/30">
                  12 days left
                </span>
              </div>

              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-2xl">
                🌟
              </div>

              <h3 className="text-lg font-semibold mb-2 text-center">Monthly Mastery</h3>
              <p className="text-sm text-gray-400 text-center mb-4">Unlimited missions subscription</p>

              {/* Usage Statistics */}
              <div className="bg-purple-900/20 rounded-lg p-3 mb-4">
                <div className="text-xs text-purple-400 mb-2">This Month's Usage</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Missions Completed:</span>
                    <span className="font-semibold text-teal-400">24</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Total Engagement:</span>
                    <span className="font-semibold text-blue-400">4,800</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Success Rate:</span>
                    <span className="font-semibold text-teal-400">96%</span>
                  </div>
                </div>
              </div>

              {/* Recent Missions */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-300">Latest: Social Media Campaign</span>
                  <span className="text-teal-400">✅ 200 users</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-300">Previous: Content Creation</span>
                  <span className="text-teal-400">✅ 200 users</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-300">Earlier: Brand Awareness</span>
                  <span className="text-teal-400">✅ 200 users</span>
                </div>
              </div>

              <button className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold transition-all duration-200">
                Start New Mission →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Pack History */}
      <div className="bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-10 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Pack History & Performance</h3>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded-lg bg-white/10 text-xs">All Time</button>
            <button className="px-3 py-1 rounded-lg text-xs text-gray-400 hover:text-white">30 Days</button>
            <button className="px-3 py-1 rounded-lg text-xs text-gray-400 hover:text-white">7 Days</button>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-8 opacity-70">No purchases yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-400">Pack</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-400">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-400">Users</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-400">Results</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-400">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-400">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <span className="text-sm">🚀</span>
                      </div>
                      <div>
                        <div className="font-medium">Engagement Boost</div>
                        <div className="text-xs text-gray-400">3 Mission Pack</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      Single Use
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm">200 users</div>
                    <div className="text-xs text-gray-400">× 3 missions</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm text-teal-400">1,200+ likes</div>
                    <div className="text-xs text-gray-400">960+ retweets</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded-full text-xs bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      Active
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm">3 days ago</div>
                  </td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <span className="text-sm">🌟</span>
                      </div>
                      <div>
                        <div className="font-medium">Monthly Mastery</div>
                        <div className="text-xs text-gray-400">Subscription</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded-full text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30">
                      Subscription
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm">Unlimited</div>
                    <div className="text-xs text-gray-400">24 missions used</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm text-teal-400">4,800+ likes</div>
                    <div className="text-xs text-gray-400">3,840+ retweets</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded-full text-xs bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      Active
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm">12 days ago</div>
                  </td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                        <span className="text-sm">🌱</span>
                      </div>
                      <div>
                        <div className="font-medium">Growth Sprout</div>
                        <div className="text-xs text-gray-400">Single Mission</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded-full text-xs bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      Single Use
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm">100 users</div>
                    <div className="text-xs text-gray-400">× 1 mission</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm text-teal-400">120+ likes</div>
                    <div className="text-xs text-gray-400">95+ retweets</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded-full text-xs bg-gray-500/20 text-gray-400 border border-gray-500/30">
                      Completed
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm">1 week ago</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}