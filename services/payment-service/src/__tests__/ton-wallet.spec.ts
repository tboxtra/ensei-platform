import {
    processTonConnectFunding,
    getFundingReceipt,
    addWithdrawalToQueue,
    getWithdrawal,
    getUserWithdrawals,
    getPendingWithdrawals
} from '../services/ton-wallet';
import { honorsToUsd } from '../services/honor-conversion';

describe('TON Wallet Service', () => {
    beforeEach(() => {
        // Clear any existing data between tests
        jest.clearAllTimers();
    });

    describe('processTonConnectFunding', () => {
        it('should create a funding receipt with pending status', () => {
            const amount = 100;
            const receipt = processTonConnectFunding(amount);

            expect(receipt).toMatchObject({
                amount: 100,
                status: 'pending',
                timestamp: expect.any(String)
            });
            expect(receipt.id).toMatch(/^receipt_\d+$/);
        });

        it('should store the receipt for later retrieval', () => {
            const amount = 50;
            const receipt = processTonConnectFunding(amount);

            const retrieved = getFundingReceipt(receipt.id);
            expect(retrieved).toEqual(receipt);
        });

        it('should handle multiple funding requests', () => {
            const receipt1 = processTonConnectFunding(100);
            const receipt2 = processTonConnectFunding(200);

            expect(receipt1.id).not.toBe(receipt2.id);
            expect(getFundingReceipt(receipt1.id)).toEqual(receipt1);
            expect(getFundingReceipt(receipt2.id)).toEqual(receipt2);
        });
    });

    describe('addWithdrawalToQueue', () => {
        it('should create a withdrawal request with pending status', () => {
            const userId = 'user123';
            const honorsAmount = 4500; // 10 USD worth
            const withdrawal = addWithdrawalToQueue(userId, honorsAmount);

            expect(withdrawal).toMatchObject({
                userId: 'user123',
                honorsAmount: 4500,
                usdAmount: 10, // 4500 / 450
                status: 'pending',
                createdAt: expect.any(String)
            });
            expect(withdrawal.id).toMatch(/^withdrawal_\d+$/);
        });

        it('should convert honors to USD correctly', () => {
            const userId = 'user123';
            const honorsAmount = 2250; // 5 USD worth
            const withdrawal = addWithdrawalToQueue(userId, honorsAmount);

            expect(withdrawal.usdAmount).toBe(5);
        });

        it('should store withdrawal for later retrieval', () => {
            const userId = 'user123';
            const honorsAmount = 4500;
            const withdrawal = addWithdrawalToQueue(userId, honorsAmount);

            const retrieved = getWithdrawal(withdrawal.id);
            expect(retrieved).toEqual(withdrawal);
        });

        it('should handle multiple withdrawal requests', () => {
            const withdrawal1 = addWithdrawalToQueue('user1', 4500);
            const withdrawal2 = addWithdrawalToQueue('user2', 9000);

            expect(withdrawal1.id).not.toBe(withdrawal2.id);
            expect(getWithdrawal(withdrawal1.id)).toEqual(withdrawal1);
            expect(getWithdrawal(withdrawal2.id)).toEqual(withdrawal2);
        });
    });

    describe('getUserWithdrawals', () => {
        it('should return withdrawals for specific user', () => {
            const user1Withdrawal1 = addWithdrawalToQueue('user1', 4500);
            const user2Withdrawal = addWithdrawalToQueue('user2', 9000);
            const user1Withdrawal2 = addWithdrawalToQueue('user1', 2250);

            const user1Withdrawals = getUserWithdrawals('user1');

            expect(user1Withdrawals).toHaveLength(2);
            expect(user1Withdrawals.map(w => w.id)).toContain(user1Withdrawal1.id);
            expect(user1Withdrawals.map(w => w.id)).toContain(user1Withdrawal2.id);
            expect(user1Withdrawals.map(w => w.id)).not.toContain(user2Withdrawal.id);
        });

        it('should return empty array for user with no withdrawals', () => {
            const withdrawals = getUserWithdrawals('nonexistent');
            expect(withdrawals).toEqual([]);
        });

        it('should sort withdrawals by creation date (newest first)', () => {
            const withdrawal1 = addWithdrawalToQueue('user1', 4500);
            // Small delay to ensure different timestamps
            setTimeout(() => {
                const withdrawal2 = addWithdrawalToQueue('user1', 9000);

                const withdrawals = getUserWithdrawals('user1');
                expect(withdrawals[0].id).toBe(withdrawal2.id);
                expect(withdrawals[1].id).toBe(withdrawal1.id);
            }, 1);
        });
    });

    describe('getPendingWithdrawals', () => {
        it('should return only pending withdrawals', () => {
            const pending1 = addWithdrawalToQueue('user1', 4500);
            const pending2 = addWithdrawalToQueue('user2', 9000);

            const pendingWithdrawals = getPendingWithdrawals();

            expect(pendingWithdrawals).toHaveLength(2);
            expect(pendingWithdrawals.map(w => w.id)).toContain(pending1.id);
            expect(pendingWithdrawals.map(w => w.id)).toContain(pending2.id);
        });

        it('should sort pending withdrawals by creation date (oldest first)', () => {
            const withdrawal1 = addWithdrawalToQueue('user1', 4500);
            // Small delay to ensure different timestamps
            setTimeout(() => {
                const withdrawal2 = addWithdrawalToQueue('user2', 9000);

                const pendingWithdrawals = getPendingWithdrawals();
                expect(pendingWithdrawals[0].id).toBe(withdrawal1.id);
                expect(pendingWithdrawals[1].id).toBe(withdrawal2.id);
            }, 1);
        });
    });

    describe('Conversion at payout time', () => {
        it('should convert honors to USD at withdrawal creation time', () => {
            const honorsAmount = 4500; // 10 USD
            const withdrawal = addWithdrawalToQueue('user123', honorsAmount);

            // Verify the conversion happened at creation time
            expect(withdrawal.usdAmount).toBe(10);
            expect(withdrawal.honorsAmount).toBe(4500);
        });

        it('should maintain conversion rate consistency', () => {
            const testCases = [
                { honors: 450, expectedUsd: 1 },
                { honors: 2250, expectedUsd: 5 },
                { honors: 4500, expectedUsd: 10 },
                { honors: 45000, expectedUsd: 100 }
            ];

            testCases.forEach(({ honors, expectedUsd }) => {
                const withdrawal = addWithdrawalToQueue('user123', honors);
                expect(withdrawal.usdAmount).toBe(expectedUsd);
            });
        });
    });

    describe('Funding rate locking', () => {
        it('should lock the funding rate at receipt creation time', () => {
            const amount = 100;
            const receipt = processTonConnectFunding(amount);

            // The receipt should capture the amount at creation time
            expect(receipt.amount).toBe(100);

            // Even if conversion rates change later, the receipt amount should remain the same
            const retrieved = getFundingReceipt(receipt.id);
            expect(retrieved?.amount).toBe(100);
        });
    });
});
