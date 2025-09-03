import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';

// In-memory wallet storage (replace with database in production)
const wallets = new Map<string, any>();

// Initialize demo wallet data
const initializeDemoWallets = () => {
    const demoWallets = [
        {
            userId: 'user_1',
            balance: 2500,
            transactions: [
                {
                    id: 'tx_1',
                    type: 'earned',
                    amount: 500,
                    description: 'Mission completion reward',
                    timestamp: new Date(Date.now() - 86400000).toISOString()
                },
                {
                    id: 'tx_2',
                    type: 'earned',
                    amount: 200,
                    description: 'Mission completion reward',
                    timestamp: new Date(Date.now() - 172800000).toISOString()
                }
            ]
        }
    ];

    demoWallets.forEach(wallet => {
        wallets.set(wallet.userId, wallet);
    });
};

// Initialize demo wallets
initializeDemoWallets();

export async function walletRoutes(fastify: FastifyInstance) {
    // Get wallet balance
    fastify.get('/v1/wallet/balance', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            // For demo purposes, return a fixed balance
            // In production, this would get the user ID from JWT token
            const balance = {
                honors: 2500,
                usd: 5.56,
                pendingHonors: 150,
                pendingUsd: 0.33
            };

            return balance;
        } catch (error) {
            return reply.status(500).send({
                error: 'Internal server error'
            });
        }
    });

    // Get wallet transactions
    fastify.get('/v1/wallet/transactions', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            // Return demo transactions
            const transactions = [
                {
                    id: 'tx_1',
                    type: 'earned',
                    amount: 500,
                    description: 'Mission completion reward',
                    timestamp: new Date(Date.now() - 86400000).toISOString(),
                    status: 'completed'
                },
                {
                    id: 'tx_2',
                    type: 'earned',
                    amount: 200,
                    description: 'Mission completion reward',
                    timestamp: new Date(Date.now() - 172800000).toISOString(),
                    status: 'completed'
                },
                {
                    id: 'tx_3',
                    type: 'withdrawn',
                    amount: -100,
                    description: 'Withdrawal to bank account',
                    timestamp: new Date(Date.now() - 259200000).toISOString(),
                    status: 'completed'
                },
                {
                    id: 'tx_4',
                    type: 'earned',
                    amount: 150,
                    description: 'Mission completion reward',
                    timestamp: new Date(Date.now() - 345600000).toISOString(),
                    status: 'pending'
                }
            ];

            return transactions;
        } catch (error) {
            return reply.status(500).send({
                error: 'Internal server error'
            });
        }
    });

    // Withdraw funds
    fastify.post('/v1/wallet/withdraw', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { amount, method, accountDetails } = request.body as any;

            // Validate withdrawal request
            if (!amount || amount <= 0) {
                return reply.status(400).send({
                    error: 'Invalid withdrawal amount'
                });
            }

            // For demo purposes, always succeed
            // In production, this would validate balance and process withdrawal
            return {
                success: true,
                transactionId: `withdrawal_${Date.now()}`,
                message: 'Withdrawal request submitted successfully'
            };
        } catch (error) {
            return reply.status(500).send({
                error: 'Internal server error'
            });
        }
    });
}

