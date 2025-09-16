'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '../../hooks/useApi';
import { ModernLayout } from '../../components/layout/ModernLayout';
import { ModernCard } from '../../components/ui/ModernCard';
import { ModernButton } from '../../components/ui/ModernButton';
import { ModernInput } from '../../components/ui/ModernInput';

export default function WalletPage() {
  const { balance, transactions, fetchBalance, fetchTransactions, withdrawFunds, loading, error } = useWallet();

  useEffect(() => {
    fetchBalance();
    fetchTransactions();
  }, [fetchBalance, fetchTransactions]);

  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAddress, setWithdrawAddress] = useState('');

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

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earned': return '💰';
      case 'withdrawn': return '💸';
      case 'refunded': return '↩️';
      case 'pending': return '⏳';
      default: return '📊';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'earned': return 'text-green-400';
      case 'withdrawn': return 'text-red-400';
      case 'refunded': return 'text-blue-400';
      case 'pending': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <ModernLayout currentPage="/wallet">
      <div className="max-w-7xl mx-auto px-2 py-2">
        {/* Header */}
        <div className="text-left mb-2">
          <h1 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-1">Wallet</h1>
          <p className="text-gray-400 text-xs">Manage your Honors balance and transaction history</p>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <ModernCard className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-400 text-xs sm:text-sm font-medium">Available Balance</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{balance?.honors?.toLocaleString() || '0'} Honors</p>
                <p className="text-xs sm:text-sm text-green-300">≈ ${balance?.usd?.toFixed(2) || '0.00'} USD</p>
              </div>
              <div className="text-2xl sm:text-3xl md:text-4xl">🏆</div>
            </div>
          </ModernCard>

          <ModernCard className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-400 text-xs sm:text-sm font-medium">Pending Balance</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{balance?.pendingHonors?.toLocaleString() || '0'} Honors</p>
                <p className="text-xs sm:text-sm text-yellow-300">≈ ${balance?.pendingUsd?.toFixed(2) || '0.00'} USD</p>
              </div>
              <div className="text-2xl sm:text-3xl md:text-4xl">⏳</div>
            </div>
          </ModernCard>

          <ModernCard className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-400 text-xs sm:text-sm font-medium">Total Earned</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{((balance?.honors || 0) + (balance?.pendingHonors || 0)).toLocaleString()} Honors</p>
                <p className="text-xs sm:text-sm text-blue-300">≈ ${((balance?.usd || 0) + (balance?.pendingUsd || 0)).toFixed(2)} USD</p>
              </div>
              <div className="text-2xl sm:text-3xl md:text-4xl">📈</div>
            </div>
          </ModernCard>

          <ModernCard className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-400 text-xs sm:text-sm font-medium">Total Withdrawn</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white">0 Honors</p>
                <p className="text-xs sm:text-sm text-purple-300">≈ $0.00 USD</p>
              </div>
              <div className="text-2xl sm:text-3xl md:text-4xl">💸</div>
            </div>
          </ModernCard>
        </div>

        {/* Quick Actions */}
        <ModernCard className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center">
            <span className="mr-2 sm:mr-3 text-xl sm:text-2xl">⚡</span>
            Quick Actions
          </h2>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <ModernButton
              onClick={() => setShowWithdrawModal(true)}
              variant="success"
              size="lg"
              className="flex items-center justify-center"
              disabled={!balance?.honors || balance.honors <= 0}
            >
              <span className="mr-2">💸</span>
              Withdraw Funds
            </ModernButton>
            <ModernButton
              variant="secondary"
              size="lg"
              className="flex items-center justify-center"
            >
              <span className="mr-2">📊</span>
              View Analytics
            </ModernButton>
            <ModernButton
              variant="secondary"
              size="lg"
              className="flex items-center justify-center"
            >
              <span className="mr-2">📄</span>
              Export History
            </ModernButton>
          </div>
        </ModernCard>

        {/* Transaction History */}
        <ModernCard>
          <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center">
            <span className="mr-2 sm:mr-3 text-xl sm:text-2xl">📋</span>
            Transaction History
          </h2>

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
            <div className="space-y-3 sm:space-y-4">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:bg-gray-700/50 transition-colors space-y-3 sm:space-y-0"
                >
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="text-xl sm:text-2xl">{getTransactionIcon(transaction.type)}</div>
                    <div>
                      <h3 className="font-semibold text-white text-sm sm:text-base">{transaction.description}</h3>
                      <p className="text-xs sm:text-sm text-gray-400">
                        {new Date(transaction.date).toLocaleDateString()} at {new Date(transaction.date).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className={`text-base sm:text-lg font-bold ${getTransactionColor(transaction.type)}`}>
                      {transaction.type === 'withdrawn' ? '-' : '+'}{transaction.amount.toLocaleString()} Honors
                    </p>
                    <p className="text-xs sm:text-sm text-gray-400">
                      ≈ ${(transaction.amount / 450).toFixed(2)} USD
                    </p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${transaction.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      transaction.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                      {transaction.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📊</div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">No transactions yet</h3>
              <p className="text-sm sm:text-base text-gray-400">Complete missions to start earning Honors!</p>
            </div>
          )}
        </ModernCard>

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
      </div>
    </ModernLayout>
  );
}
