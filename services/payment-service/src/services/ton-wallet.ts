import { honorsToUsd } from './honor-conversion';

export interface TonConnectReceipt {
  id: string;
  amount: number; // in USD
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: string;
  txHash?: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  honorsAmount: number;
  usdAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  txHash?: string;
}

// Stub data storage
const fundingReceipts = new Map<string, TonConnectReceipt>();
const withdrawalQueue = new Map<string, WithdrawalRequest>();

let receiptIdCounter = 1;
let withdrawalIdCounter = 1;

/**
 * Process TonConnect funding receipt
 * @param amount Amount in USD
 * @returns Receipt with pending status
 */
export function processTonConnectFunding(amount: number): TonConnectReceipt {
  const receipt: TonConnectReceipt = {
    id: `receipt_${receiptIdCounter++}`,
    amount,
    status: 'pending',
    timestamp: new Date().toISOString()
  };

  fundingReceipts.set(receipt.id, receipt);

  // Simulate confirmation after 5 seconds
  setTimeout(() => {
    const confirmedReceipt = fundingReceipts.get(receipt.id);
    if (confirmedReceipt) {
      confirmedReceipt.status = 'confirmed';
      confirmedReceipt.txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
    }
  }, 5000);

  return receipt;
}

/**
 * Get funding receipt by ID
 * @param receiptId Receipt ID
 * @returns Receipt or undefined
 */
export function getFundingReceipt(receiptId: string): TonConnectReceipt | undefined {
  return fundingReceipts.get(receiptId);
}

/**
 * Add withdrawal to queue
 * @param userId User ID
 * @param honorsAmount Amount in Honors
 * @returns Withdrawal request
 */
export function addWithdrawalToQueue(userId: string, honorsAmount: number): WithdrawalRequest {
  const usdAmount = honorsToUsd(honorsAmount);

  const withdrawal: WithdrawalRequest = {
    id: `withdrawal_${withdrawalIdCounter++}`,
    userId,
    honorsAmount,
    usdAmount,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  withdrawalQueue.set(withdrawal.id, withdrawal);

  // Simulate processing after 10 seconds
  setTimeout(() => {
    const processingWithdrawal = withdrawalQueue.get(withdrawal.id);
    if (processingWithdrawal) {
      processingWithdrawal.status = 'processing';

      // Simulate completion after another 5 seconds
      setTimeout(() => {
        const completedWithdrawal = withdrawalQueue.get(withdrawal.id);
        if (completedWithdrawal) {
          completedWithdrawal.status = 'completed';
          completedWithdrawal.completedAt = new Date().toISOString();
          completedWithdrawal.txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
        }
      }, 5000);
    }
  }, 10000);

  return withdrawal;
}

/**
 * Get withdrawal by ID
 * @param withdrawalId Withdrawal ID
 * @returns Withdrawal request or undefined
 */
export function getWithdrawal(withdrawalId: string): WithdrawalRequest | undefined {
  return withdrawalQueue.get(withdrawalId);
}

/**
 * Get all withdrawals for a user
 * @param userId User ID
 * @returns Array of withdrawal requests
 */
export function getUserWithdrawals(userId: string): WithdrawalRequest[] {
  return Array.from(withdrawalQueue.values())
    .filter(withdrawal => withdrawal.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Get all pending withdrawals
 * @returns Array of pending withdrawal requests
 */
export function getPendingWithdrawals(): WithdrawalRequest[] {
  return Array.from(withdrawalQueue.values())
    .filter(withdrawal => withdrawal.status === 'pending')
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}
