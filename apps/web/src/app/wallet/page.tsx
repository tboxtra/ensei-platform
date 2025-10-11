'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useWallet, useDashboardSummary } from '../../hooks/useApi';
import { ModernLayout } from '../../components/layout/ModernLayout';
import { ModernCard } from '../../components/ui/ModernCard';
import { ModernButton } from '../../components/ui/ModernButton';
import { ModernInput } from '../../components/ui/ModernInput';
import { SectionHeader } from '../../components/ui/SectionHeader';
import Packs from '../../components/wallet/Packs';
import MyPacks from '../../components/wallet/MyPacks';

export default function WalletPage() {
  const { balance, transactions, fetchBalance, fetchTransactions, withdrawFunds, depositCrypto, loading, error } = useWallet();
  const { summary, fetchSummary } = useDashboardSummary();
  const params = useSearchParams();
  const router = useRouter();

  const urlTab = (params.get('tab') as 'wallet' | 'packs' | 'mine' | 'analytics') || 'wallet';
  const [tab, setTab] = useState<'wallet' | 'packs' | 'mine' | 'analytics'>(urlTab);

  useEffect(() => {
    fetchBalance();
    fetchTransactions();
    fetchSummary();
  }, [fetchBalance, fetchTransactions, fetchSummary]);

  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositCurrency, setDepositCurrency] = useState('USDC');
  const [depositAddress, setDepositAddress] = useState('');
  const [depositTxHash, setDepositTxHash] = useState('');
  const [depositProcessing, setDepositProcessing] = useState(false);

  const setTabAndSync = (t: typeof tab) => {
    setTab(t);
    const qs = new URLSearchParams(params.toString());
    qs.set('tab', t);
    router.push(`/wallet?${qs.toString()}`, { scroll: false });
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (amount > 0 && amount <= (balance?.honors || 0) && withdrawAddress.trim()) {
      try {
        await withdrawFunds(amount);
        setShowWithdrawModal(false);
        setWithdrawAmount('');
        setWithdrawAddress('');
        fetchBalance(); // Refresh balance
      } catch (err) {
        console.error('Withdrawal failed:', err);
      }
    }
  };

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (amount > 0 && depositAddress.trim() && depositTxHash.trim()) {
      setDepositProcessing(true);
      try {
        await depositCrypto(amount, depositCurrency, depositTxHash, depositAddress);
        setShowDepositModal(false);
        setDepositAmount('');
        setDepositAddress('');
        setDepositTxHash('');
        fetchBalance();
        fetchTransactions();
      } catch (err) {
        console.error('Deposit failed:', err);
      } finally {
        setDepositProcessing(false);
      }
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earned': return '💰';
      case 'deposited': return '📥';
      case 'withdrawn': return '💸';
      case 'refunded': return '↩️';
      case 'pending': return '⏳';
      default: return '📊';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'earned': return 'text-green-400';
      case 'deposited': return 'text-blue-400';
      case 'withdrawn': return 'text-red-400';
      case 'refunded': return 'text-blue-400';
      case 'pending': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <ModernLayout currentPage="/wallet">
      <div className="max-w-7xl mx-auto px-2 py-2">
        {/* Tab Switcher */}
        <div role="tablist" className="inline-flex items-center gap-1 mb-6 p-1 bg-white/5 border border-white/10 rounded-xl">
          {[
            { key: 'wallet', icon: '💰', label: 'Wallet' },
            { key: 'packs', icon: '📦', label: 'Packs' },
            { key: 'mine', icon: '🎒', label: 'My Packs' },
            { key: 'analytics', icon: '📊', label: 'Analytics' },
          ].map(t => (
            <button
              key={t.key}
              role="tab"
              aria-current={tab === t.key ? 'page' : undefined}
              onClick={() => setTabAndSync(t.key as any)}
              className={`px-4 py-2 rounded-lg text-sm transition
                ${tab === t.key ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <span className="mr-2">{t.icon}</span>{t.label}
            </button>
          ))}
        </div>

        {/* Conditional Content Based on Tab */}
        {tab === 'wallet' && (
          <>
            {/* Balance Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-10 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <span className="text-lg">💰</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-teal-400 font-medium">Available</div>
                    <div className="text-xs text-gray-400">Real-time</div>
                  </div>
                </div>
                <div className="mb-2">
                  <div className="text-3xl font-bold text-white">{balance?.honors?.toLocaleString() || '0'}</div>
                  <div className="text-sm text-teal-400">Honors</div>
                </div>
                <div className="text-sm text-gray-300 mb-3">
                  ${balance?.usd?.toFixed(2) || '0.00'} USD
                </div>
                <div className="flex items-center text-xs text-teal-400">
                  <span className="mr-1">💰</span>
                  Available balance
                </div>
              </div>

              <div className="bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-10 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                    <span className="text-lg">⏳</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-indigo-400 font-medium">Pending</div>
                    <div className="text-xs text-gray-400">Processing</div>
                  </div>
                </div>
                <div className="mb-2">
                  <div className="text-3xl font-bold text-white">0</div>
                  <div className="text-sm text-indigo-400">Honors</div>
                </div>
                <div className="text-sm text-gray-300 mb-3">
                  $0.00 USD
                </div>
                <div className="flex items-center text-xs text-indigo-400">
                  <span className="mr-1">⏱</span>
                  No pending rewards
                </div>
              </div>

              <div className="bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-10 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <span className="text-lg">📈</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-blue-400 font-medium">Total Earned</div>
                    <div className="text-xs text-gray-400">All time</div>
                  </div>
                </div>
                <div className="mb-2">
                  <div className="text-3xl font-bold text-white">{summary?.honorsEarned?.toLocaleString() || '0'}</div>
                  <div className="text-sm text-blue-400">Honors</div>
                </div>
                <div className="text-sm text-gray-300 mb-3">
                  ${((summary?.honorsEarned || 0) * 0.0022).toFixed(2)} USD
                </div>
                <div className="flex items-center text-xs text-blue-400">
                  <span className="mr-1">📊</span>
                  Total earned
                </div>
              </div>

              <div className="bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-10 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <span className="text-lg">💸</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-purple-400 font-medium">Withdrawn</div>
                    <div className="text-xs text-gray-400">Total (all-time)</div>
                  </div>
                </div>
                <div className="mb-2">
                  <div className="text-3xl font-bold text-white">1,200</div>
                  <div className="text-sm text-purple-400">Honors</div>
                </div>
                <div className="text-sm text-gray-300 mb-3">
                  $2.67 USD
                </div>
                <div className="flex items-center text-xs text-purple-400">
                  <span className="mr-1">💳</span>
                  Last: 3 days ago
                </div>
              </div>

              {/* Crypto Balance Card */}
              <div className="bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-10 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                    <span className="text-lg">₿</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-orange-400 font-medium">Crypto</div>
                    <div className="text-xs text-gray-400">Deposited</div>
                  </div>
                </div>
                <div className="mb-2">
                  <div className="text-3xl font-bold text-white">
                    {balance?.crypto ?
                      Object.values(balance.crypto).reduce((sum, val) => sum + (val || 0), 0).toFixed(4) :
                      '0.0000'
                    }
                  </div>
                  <div className="text-sm text-orange-400">Total Crypto</div>
                </div>
                <div className="text-sm text-gray-300 mb-3">
                  {balance?.crypto && (
                    <div className="space-y-1">
                      {Object.entries(balance.crypto).map(([currency, amount]) =>
                        amount > 0 ? (
                          <div key={currency} className="text-xs">
                            {amount.toFixed(4)} {currency}
                          </div>
                        ) : null
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center text-xs text-orange-400">
                  <span className="mr-1">📥</span>
                  Deposited funds
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-10 border border-white/10 rounded-2xl p-6 mb-6 sm:mb-8">
              <h3 className="text-lg font-semibold mb-6">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => setShowDepositModal(true)}
                  className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transition-all duration-200"
                >
                  <span className="text-xl">💰</span>
                  <div className="text-left">
                    <div className="font-semibold text-sm">Deposit</div>
                    <div className="text-xs opacity-90">Add crypto</div>
                  </div>
                </button>
                <button
                  onClick={() => setShowWithdrawModal(true)}
                  className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white transition-all duration-200"
                  disabled={!balance?.honors || balance.honors <= 0}
                >
                  <span className="text-xl">💸</span>
                  <div className="text-left">
                    <div className="font-semibold text-sm">Withdraw</div>
                    <div className="text-xs opacity-90">Send to wallet</div>
                  </div>
                </button>
                <button
                  onClick={() => setTabAndSync('analytics')}
                  className="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200"
                >
                  <span className="text-xl">📊</span>
                  <div className="text-left">
                    <div className="font-semibold text-sm">Analytics</div>
                    <div className="text-xs text-gray-400">View insights</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Transaction History */}
            <div className="bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-10 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Transaction History</h3>
                <div className="flex gap-2">
                  <button className="px-3 py-1 rounded-lg bg-white/10 text-xs">All</button>
                  <button className="px-3 py-1 rounded-lg text-xs text-gray-400 hover:text-white">Earnings</button>
                  <button className="px-3 py-1 rounded-lg text-xs text-gray-400 hover:text-white">Deposits</button>
                  <button className="px-3 py-1 rounded-lg text-xs text-gray-400 hover:text-white">Withdrawals</button>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">⏳</div>
                  <p className="text-sm sm:text-base text-gray-400">Loading transactions...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">❌</div>
                  <p className="text-sm sm:text-base text-red-400">Failed to load transactions</p>
                </div>
              ) : transactions && transactions.length > 0 ? (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                          <span className="text-lg">{getTransactionIcon(transaction.type)}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm">{transaction.description || 'Transaction'}</h4>
                          <p className="text-xs text-gray-400">
                            {transaction.date ?
                              `${new Date(transaction.date).toLocaleDateString()} • ${new Date(transaction.date).toLocaleTimeString()}` :
                              'Recent transaction'
                            }
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getTransactionColor(transaction.type)}`}>
                          {transaction.type === 'withdrawn' ? '-' : '+'}{transaction.amount?.toLocaleString() || '0'}
                        </div>
                        <div className="text-xs text-gray-400">Honors</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">💳</div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">No transactions yet</h3>
                  <p className="text-sm sm:text-base text-gray-400 mb-4">Your transaction history will appear here once you start earning or spending Honors.</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={() => setTabAndSync('packs')}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm transition-colors"
                    >
                      Browse Packs
                    </button>
                    <button
                      onClick={() => window.location.href = '/missions'}
                      className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm transition-colors"
                    >
                      View Missions
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Withdraw Modal */}
            {showWithdrawModal && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-gray-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 max-w-md w-full border border-gray-700">
                  <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center">
                    <span className="mr-2">💸</span>
                    Withdraw Funds
                  </h3>

                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium mb-2">Amount (Honors)</label>
                      <input
                        type="number"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder="Enter amount to withdraw"
                        max={balance?.honors || 0}
                        min="1"
                        className="w-full p-3 sm:p-4 bg-gray-800/50 border border-gray-700/50 rounded-lg sm:rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Available: {balance?.honors?.toLocaleString() || '0'} Honors
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium mb-2">TON Wallet Address</label>
                      <input
                        type="text"
                        value={withdrawAddress}
                        onChange={(e) => setWithdrawAddress(e.target.value)}
                        placeholder="Enter your TON wallet address"
                        className="w-full p-3 sm:p-4 bg-gray-800/50 border border-gray-700/50 rounded-lg sm:rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                      />
                    </div>

                    {withdrawAmount && (
                      <div className="bg-gray-800/50 rounded-lg p-3 sm:p-4">
                        <p className="text-xs sm:text-sm text-gray-400">Estimated USD Value:</p>
                        <p className="text-base sm:text-lg font-bold text-green-400">
                          ${((parseFloat(withdrawAmount) || 0) / 450).toFixed(2)} USD
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mt-4 sm:mt-6">
                    <ModernButton
                      onClick={() => setShowWithdrawModal(false)}
                      variant="secondary"
                      size="md"
                      className="flex-1"
                    >
                      Cancel
                    </ModernButton>
                    <ModernButton
                      onClick={handleWithdraw}
                      variant="success"
                      size="md"
                      className="flex-1"
                      disabled={!withdrawAmount || !withdrawAddress.trim() || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > (balance?.honors || 0)}
                    >
                      Withdraw
                    </ModernButton>
                  </div>
                </div>
              </div>
            )}

            {/* Deposit Modal */}
            {showDepositModal && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-gray-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 max-w-md w-full border border-gray-700">
                  <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center">
                    <span className="mr-2">📥</span>
                    Deposit Funds
                  </h3>

                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium mb-2">Currency</label>
                      <select
                        value={depositCurrency}
                        onChange={(e) => setDepositCurrency(e.target.value)}
                        className="w-full p-3 sm:p-4 bg-gray-800/50 border border-gray-700/50 rounded-lg sm:rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                      >
                        <option value="USDC">USDC</option>
                        <option value="USDT">USDT</option>
                        <option value="ETH">ETH</option>
                        <option value="BTC">BTC</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium mb-2">Amount</label>
                      <input
                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder={`Enter amount in ${depositCurrency}`}
                        min="0.000001"
                        step="0.000001"
                        className="w-full p-3 sm:p-4 bg-gray-800/50 border border-gray-700/50 rounded-lg sm:rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium mb-2">Transaction Hash</label>
                      <input
                        type="text"
                        value={depositTxHash}
                        onChange={(e) => setDepositTxHash(e.target.value)}
                        placeholder="Enter transaction hash from blockchain"
                        className="w-full p-3 sm:p-4 bg-gray-800/50 border border-gray-700/50 rounded-lg sm:rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium mb-2">Your Wallet Address</label>
                      <input
                        type="text"
                        value={depositAddress}
                        onChange={(e) => setDepositAddress(e.target.value)}
                        placeholder="Enter your wallet address"
                        className="w-full p-3 sm:p-4 bg-gray-800/50 border border-gray-700/50 rounded-lg sm:rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                      />
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <span className="text-blue-400 text-sm">ℹ️</span>
                        <div className="text-xs text-blue-300">
                          <p className="font-medium mb-1">Deposit Instructions:</p>
                          <ul className="space-y-1 text-blue-200">
                            <li>• Send {depositCurrency} to your wallet</li>
                            <li>• Enter the transaction hash from blockchain</li>
                            <li>• Deposits are converted to Honors automatically</li>
                            <li>• Processing time: 5-15 minutes</li>
                            <li>• Minimum deposit: $1 USD worth</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <ModernButton
                      variant="secondary"
                      onClick={() => {
                        setShowDepositModal(false);
                        setDepositAmount('');
                        setDepositAddress('');
                        setDepositTxHash('');
                      }}
                      className="flex-1"
                      disabled={depositProcessing}
                    >
                      Cancel
                    </ModernButton>
                    <ModernButton
                      variant="primary"
                      onClick={handleDeposit}
                      className="flex-1"
                      disabled={!depositAmount || !depositAddress.trim() || !depositTxHash.trim() || parseFloat(depositAmount) <= 0 || depositProcessing}
                    >
                      {depositProcessing ? 'Processing...' : 'Process Deposit'}
                    </ModernButton>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {tab === 'packs' && <Packs onPurchased={() => setTab('mine')} />}

        {tab === 'mine' && <MyPacks />}

        {tab === 'analytics' && (
          <>
            {/* Performance Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Key Metrics */}
              <div className="lg:col-span-2 bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-10 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Engagement Performance</h3>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 rounded-lg bg-white/10 text-xs">7D</button>
                    <button className="px-3 py-1 rounded-lg text-xs text-gray-400 hover:text-white">30D</button>
                    <button className="px-3 py-1 rounded-lg text-xs text-gray-400 hover:text-white">90D</button>
                  </div>
                </div>
                <div className="h-64 bg-white/5 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📊</div>
                    <p className="text-gray-400">Performance Chart</p>
                    <p className="text-xs text-gray-500">Chart.js integration coming soon</p>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-10 border border-white/10 rounded-2xl p-6 hover:scale-105 transition-transform">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-sm">Total Earned</h4>
                    <span className="text-2xl">💰</span>
                  </div>
                  <div className="text-2xl font-bold text-teal-400">
                    {summary?.totalEarned ? `+${summary.totalEarned.toLocaleString()}` : '0'}
                  </div>
                  <div className="text-xs text-gray-400">Honors earned</div>
                  <div className="mt-2 text-xs text-teal-400">
                    {summary?.missionsCompleted ? `${summary.missionsCompleted} missions completed` : 'No missions yet'}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-10 border border-white/10 rounded-2xl p-6 hover:scale-105 transition-transform">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-sm">Mission Success Rate</h4>
                    <span className="text-2xl">🎯</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-400">
                    {summary?.missionsCompleted && summary?.missionsAttempted ?
                      `${Math.round((summary.missionsCompleted / summary.missionsAttempted) * 100)}%` :
                      '0%'
                    }
                  </div>
                  <div className="text-xs text-gray-400">Completion rate</div>
                  <div className="mt-2 text-xs text-blue-400">
                    {summary?.missionsAttempted ? `${summary.missionsAttempted} total attempts` : 'No attempts yet'}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-10 border border-white/10 rounded-2xl p-6 hover:scale-105 transition-transform">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-sm">Current Balance</h4>
                    <span className="text-2xl">💳</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-400">
                    {balance?.honors ? balance.honors.toLocaleString() : '0'}
                  </div>
                  <div className="text-xs text-gray-400">Honors available</div>
                  <div className="mt-2 text-xs text-purple-400">
                    ${balance?.usd ? balance.usd.toFixed(2) : '0.00'} USD
                  </div>
                </div>
              </div>
            </div>

            {/* Pack Performance Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-10 border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-6">Pack Performance Analysis</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <span className="text-lg">🚀</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">Engagement Boost</h4>
                        <p className="text-xs text-gray-400">200 users × 3 missions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-teal-400">96%</div>
                      <div className="text-xs text-gray-400">Success Rate</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <span className="text-lg">🌟</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">Monthly Mastery</h4>
                        <p className="text-xs text-gray-400">Unlimited subscription</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-teal-400">98%</div>
                      <div className="text-xs text-gray-400">Success Rate</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                        <span className="text-lg">🌱</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">Growth Sprout</h4>
                        <p className="text-xs text-gray-400">100 users × 1 mission</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-teal-400">92%</div>
                      <div className="text-xs text-gray-400">Success Rate</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-10 border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-6">Engagement Metrics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                        <span className="text-sm">❤️</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Total Likes</div>
                        <div className="text-xs text-gray-400">This month</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-teal-400">6,120</div>
                      <div className="text-xs text-teal-400">+15% vs last month</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <span className="text-sm">🔁</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Total Retweets</div>
                        <div className="text-xs text-gray-400">This month</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-400">4,895</div>
                      <div className="text-xs text-blue-400">+18% vs last month</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <span className="text-sm">💬</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Total Comments</div>
                        <div className="text-xs text-gray-400">This month</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-purple-400">3,060</div>
                      <div className="text-xs text-purple-400">+12% vs last month</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Analytics Table */}
            <div className="bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-10 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Detailed Performance Metrics</h3>
                <div className="flex gap-2">
                  <button className="px-3 py-1 rounded-lg bg-white/10 text-xs">Export</button>
                  <button className="px-3 py-1 rounded-lg text-xs text-gray-400 hover:text-white">Share</button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-400">Metric</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-400">Current</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-400">Previous</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-400">Change</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-400">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-medium">Daily Earnings</td>
                      <td className="py-3 px-4 text-right font-semibold">125 Honors</td>
                      <td className="py-3 px-4 text-right text-gray-400">115 Honors</td>
                      <td className="py-3 px-4 text-right text-teal-400">+8.7%</td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-teal-400">↗</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-medium">Mission Success Rate</td>
                      <td className="py-3 px-4 text-right font-semibold">94.2%</td>
                      <td className="py-3 px-4 text-right text-gray-400">92.1%</td>
                      <td className="py-3 px-4 text-right text-teal-400">+2.1%</td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-teal-400">↗</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-medium">Avg. Mission Duration</td>
                      <td className="py-3 px-4 text-right font-semibold">2.3 hours</td>
                      <td className="py-3 px-4 text-right text-gray-400">2.1 hours</td>
                      <td className="py-3 px-4 text-right text-amber-400">+9.5%</td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-amber-400">↘</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-medium">Total Missions</td>
                      <td className="py-3 px-4 text-right font-semibold">47</td>
                      <td className="py-3 px-4 text-right text-gray-400">43</td>
                      <td className="py-3 px-4 text-right text-teal-400">+9.3%</td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-teal-400">↗</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-medium">Engagement Rate</td>
                      <td className="py-3 px-4 text-right font-semibold">87.3%</td>
                      <td className="py-3 px-4 text-right text-gray-400">85.1%</td>
                      <td className="py-3 px-4 text-right text-teal-400">+2.2%</td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-teal-400">↗</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </ModernLayout>
  );
}
