import { Request, Response } from 'express';
import { processTonConnectFunding, getFundingReceipt, addWithdrawalToQueue, getWithdrawal, getUserWithdrawals } from '../services/ton-wallet';
import { honorsToUsd, usdToHonors } from '../services/honor-conversion';

/**
 * Fund mission with USD
 * POST /v1/fund-mission
 */
export async function fundMission(req: Request, res: Response) {
  try {
    const { missionId, amount } = req.body;

    if (!missionId || !amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        error: 'Invalid request. missionId and amount (positive number) are required.'
      });
    }

    // Process TonConnect funding
    const receipt = processTonConnectFunding(amount);

    // Convert USD to Honors
    const honorsAmount = usdToHonors(amount);
    if (honorsAmount <= 0) {
      return res.status(400).json({
        error: 'Invalid amount: conversion resulted in zero or negative honors'
      });
    }

    return res.status(200).json({
      receiptId: receipt.id,
      amount: amount,
      honorsAmount: honorsAmount,
      status: receipt.status,
      timestamp: receipt.timestamp
    });

  } catch (error) {
    console.error('Fund mission error:', error);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
}

/**
 * Get funding receipt status
 * GET /v1/fund-mission/:receiptId
 */
export async function getFundingStatus(req: Request, res: Response) {
  try {
    const { receiptId } = req.params;

    const receipt = getFundingReceipt(receiptId);

    if (!receipt) {
      return res.status(404).json({
        error: 'Receipt not found'
      });
    }

    return res.status(200).json({
      id: receipt.id,
      amount: receipt.amount,
      status: receipt.status,
      timestamp: receipt.timestamp,
      txHash: receipt.txHash
    });

  } catch (error) {
    console.error('Get funding status error:', error);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
}

/**
 * Request withdrawal
 * POST /v1/withdrawals
 */
export async function requestWithdrawal(req: Request, res: Response) {
  try {
    const { userId, honorsAmount } = req.body;

    if (!userId || !honorsAmount || typeof honorsAmount !== 'number' || honorsAmount <= 0) {
      return res.status(400).json({
        error: 'Invalid request. userId and honorsAmount (positive number) are required.'
      });
    }

    // Add to withdrawal queue
    const withdrawal = addWithdrawalToQueue(userId, honorsAmount);

    return res.status(200).json({
      withdrawalId: withdrawal.id,
      userId: withdrawal.userId,
      honorsAmount: withdrawal.honorsAmount,
      usdAmount: withdrawal.usdAmount,
      status: withdrawal.status,
      createdAt: withdrawal.createdAt
    });

  } catch (error) {
    console.error('Request withdrawal error:', error);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
}

/**
 * Get withdrawal status
 * GET /v1/withdrawals/:withdrawalId
 */
export async function getWithdrawalStatus(req: Request, res: Response) {
  try {
    const { withdrawalId } = req.params;

    const withdrawal = getWithdrawal(withdrawalId);

    if (!withdrawal) {
      return res.status(404).json({
        error: 'Withdrawal not found'
      });
    }

    return res.status(200).json({
      id: withdrawal.id,
      userId: withdrawal.userId,
      honorsAmount: withdrawal.honorsAmount,
      usdAmount: withdrawal.usdAmount,
      status: withdrawal.status,
      createdAt: withdrawal.createdAt,
      completedAt: withdrawal.completedAt,
      txHash: withdrawal.txHash
    });

  } catch (error) {
    console.error('Get withdrawal status error:', error);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
}

/**
 * Get user withdrawals
 * GET /v1/withdrawals/user/:userId
 */
export async function getUserWithdrawalHistory(req: Request, res: Response) {
  try {
    const { userId } = req.params;

    const withdrawals = getUserWithdrawals(userId);

    return res.status(200).json({
      userId,
      withdrawals: withdrawals.map(w => ({
        id: w.id,
        honorsAmount: w.honorsAmount,
        usdAmount: w.usdAmount,
        status: w.status,
        createdAt: w.createdAt,
        completedAt: w.completedAt,
        txHash: w.txHash
      }))
    });

  } catch (error) {
    console.error('Get user withdrawals error:', error);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
}

/**
 * Convert Honors to USD
 * POST /v1/convert/honors-to-usd
 */
export async function convertHonorsToUsd(req: Request, res: Response) {
  try {
    const { honors } = req.body;

    if (!honors || typeof honors !== 'number' || honors < 0) {
      return res.status(400).json({
        error: 'Invalid request. honors (non-negative number) is required.'
      });
    }

    const usdAmount = honorsToUsd(honors);

    return res.status(200).json({
      honors,
      usd: usdAmount,
      formatted: `$${usdAmount.toFixed(2)}`
    });

  } catch (error) {
    console.error('Convert honors to USD error:', error);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
}

/**
 * Convert USD to Honors
 * POST /v1/convert/usd-to-honors
 */
export async function convertUsdToHonors(req: Request, res: Response) {
  try {
    const { usd } = req.body;

    if (!usd || typeof usd !== 'number' || usd < 0) {
      return res.status(400).json({
        error: 'Invalid request. usd (non-negative number) is required.'
      });
    }

    const honorsAmount = usdToHonors(usd);

    return res.status(200).json({
      usd,
      honors: honorsAmount,
      formatted: `${honorsAmount.toLocaleString()} Honors`
    });

  } catch (error) {
    console.error('Convert USD to honors error:', error);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
}
