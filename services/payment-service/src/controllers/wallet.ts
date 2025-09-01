import { Request, Response } from 'express';
import { usdToHonors, honorsToUsd } from '../services/honor-conversion';

// Stub wallet data
const userWallets = new Map<string, { honors: number; usd: number }>();

// Initialize some demo wallets
userWallets.set('user1', { honors: 50000, usd: 111.11 });
userWallets.set('user2', { honors: 25000, usd: 55.56 });
userWallets.set('user3', { honors: 100000, usd: 222.22 });

export const getWallet = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const wallet = userWallets.get(userId);
    
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    // Calculate USD equivalent
    const usdEquivalent = honorsToUsd(wallet.honors);

    res.json({
      userId,
      honors: wallet.honors,
      usdEquivalent,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching wallet:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const withdrawHonors = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { amount, targetAddress } = req.body;

    if (!userId || !amount || !targetAddress) {
      return res.status(400).json({ 
        error: 'User ID, amount, and target address are required' 
      });
    }

    const wallet = userWallets.get(userId);
    
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    if (amount > wallet.honors) {
      return res.status(400).json({ error: 'Insufficient honors balance' });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be positive' });
    }

    // Deduct from wallet
    wallet.honors -= amount;

    // Create withdrawal request (stub)
    const withdrawalId = `withdrawal_${Date.now()}`;
    
    // In a real implementation, this would be queued for processing
    console.log(`Withdrawal queued: ${withdrawalId} - ${amount} honors to ${targetAddress}`);

    res.json({
      withdrawalId,
      amount,
      targetAddress,
      status: 'queued',
      estimatedProcessingTime: '2-5 minutes',
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error processing withdrawal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getWithdrawalStatus = async (req: Request, res: Response) => {
  try {
    const { withdrawalId } = req.params;

    if (!withdrawalId) {
      return res.status(400).json({ error: 'Withdrawal ID is required' });
    }

    // Stub withdrawal status
    const statuses = ['queued', 'processing', 'completed', 'failed'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

    res.json({
      withdrawalId,
      status: randomStatus,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching withdrawal status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserWithdrawals = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Stub withdrawal history
    const withdrawals = [
      {
        id: 'withdrawal_1',
        amount: 10000,
        targetAddress: 'TON_ADDRESS_1',
        status: 'completed',
        createdAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
      },
      {
        id: 'withdrawal_2',
        amount: 5000,
        targetAddress: 'TON_ADDRESS_2',
        status: 'processing',
        createdAt: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
      }
    ];

    res.json({
      userId,
      withdrawals,
      totalCount: withdrawals.length
    });
  } catch (error) {
    console.error('Error fetching user withdrawals:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
