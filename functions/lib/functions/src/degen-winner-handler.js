"use strict";
/**
 * Cloud Function handler for degen mission winner selection
 * Triggers when degen mission winners are chosen and distributes honors
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.onDegenMissionCompleted = exports.onDegenWinnersChosen = void 0;
const functions = __importStar(require("firebase-functions"));
const firebaseAdmin = __importStar(require("firebase-admin"));
const degen_calculator_1 = require("../../shared/degen-calculator");
const db = firebaseAdmin.firestore();
/**
 * Cloud Function triggered when degen mission winners are selected
 * Updates user stats with degen mission honors
 */
exports.onDegenWinnersChosen = functions.firestore
    .document('missions/{missionId}/winners/{winnerId}')
    .onCreate(async (snap, context) => {
    const { missionId } = context.params;
    const afterData = snap.data();
    // Only process if this is a new winner selection
    if (!afterData) {
        console.log(`Skipping degen winner processing for ${missionId} - no data`);
        return;
    }
    try {
        console.log(`Processing degen mission winner selection for mission: ${missionId}`);
        // Get mission data to verify it's a degen mission
        const missionDoc = await db.collection('missions').doc(missionId).get();
        if (!missionDoc.exists) {
            console.error(`Mission ${missionId} not found`);
            return;
        }
        const missionData = missionDoc.data();
        if (missionData?.type !== 'degen') {
            console.log(`Mission ${missionId} is not a degen mission, skipping`);
            return;
        }
        // Get all winners for this mission
        const winnersSnapshot = await db
            .collection('missions')
            .doc(missionId)
            .collection('winners')
            .get();
        const winners = winnersSnapshot.docs.map(doc => ({
            userId: doc.data().userId,
            taskId: doc.data().taskId
        }));
        if (winners.length === 0) {
            console.log(`No winners found for degen mission ${missionId}`);
            return;
        }
        // Calculate degen payouts
        const degenResult = (0, degen_calculator_1.calculateDegenPayouts)(missionId, winners, missionData);
        // Validate the calculation
        if (!(0, degen_calculator_1.validateDegenPayouts)(degenResult)) {
            console.error(`Degen payout validation failed for mission ${missionId}`, degenResult);
            return;
        }
        console.log(`Degen mission ${missionId} payout calculation:`, {
            totalWinners: degenResult.totalWinners,
            totalPayout: degenResult.totalPayout
        });
        // Update user stats for each winner
        const batch = db.batch();
        const userStatsUpdates = new Map();
        for (const winner of degenResult.winners) {
            const userStatsRef = db.doc(`users/${winner.userId}/stats/summary`);
            // Get current user stats
            const userStatsDoc = await userStatsRef.get();
            const currentStats = userStatsDoc.exists ? userStatsDoc.data() : {
                missionsCreated: 0,
                missionsCompleted: 0,
                tasksDone: 0,
                totalEarned: 0
            };
            if (!currentStats) {
                console.error(`No stats data found for user ${winner.userId}`);
                continue;
            }
            // Update stats
            const newTotalEarned = (currentStats?.totalEarned || 0) + winner.payout;
            const newTasksDone = (currentStats?.tasksDone || 0) + 1;
            userStatsUpdates.set(winner.userId, {
                totalEarned: newTotalEarned,
                tasksDone: newTasksDone
            });
            batch.update(userStatsRef, {
                totalEarned: newTotalEarned,
                tasksDone: newTasksDone,
                updatedAt: new Date()
            });
            // Update wallet balance
            const walletRef = db.collection('wallets').doc(winner.userId);
            batch.set(walletRef, {
                honors: firebaseAdmin.firestore.FieldValue.increment(winner.payout),
                usd: firebaseAdmin.firestore.FieldValue.increment(winner.payout * 0.0022), // Convert to USD
                updated_at: firebaseAdmin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            // Create transaction record
            batch.set(db.collection('transactions').doc(), {
                user_id: winner.userId,
                type: 'earned',
                amount: winner.payout,
                currency: 'honors',
                description: `Earned from degen mission completion`,
                mission_id: missionId,
                task_id: winner.taskId,
                created_at: firebaseAdmin.firestore.FieldValue.serverTimestamp()
            });
            console.log(`Updated user ${winner.userId} stats and wallet: +${winner.payout} Honors for task ${winner.taskId}`);
        }
        // Commit all user stat updates
        await batch.commit();
        // Log the degen mission completion
        await db.collection('degen_mission_logs').add({
            missionId,
            processedAt: new Date(),
            totalWinners: degenResult.totalWinners,
            totalPayout: degenResult.totalPayout,
            winners: degenResult.winners.map(w => ({
                userId: w.userId,
                taskId: w.taskId,
                payout: w.payout
            }))
        });
        console.log(`Successfully processed degen mission ${missionId} with ${degenResult.totalWinners} winners and ${degenResult.totalPayout} total payout`);
    }
    catch (error) {
        console.error(`Error processing degen mission ${missionId}:`, error);
        // Log the error for debugging
        await db.collection('degen_mission_errors').add({
            missionId,
            error: error?.message || 'Unknown error',
            timestamp: new Date(),
            stack: error?.stack
        });
    }
});
/**
 * Cloud Function to handle degen mission completion
 * Triggers when a degen mission is marked as completed
 */
exports.onDegenMissionCompleted = functions.firestore
    .document('missions/{missionId}')
    .onUpdate(async (change, context) => {
    const { missionId } = context.params;
    const beforeData = change.before.exists ? change.before.data() : null;
    const afterData = change.after.exists ? change.after.data() : null;
    // Only process if mission status changed to completed
    if (!afterData || beforeData?.status === afterData?.status) {
        return;
    }
    if (afterData?.status === 'completed' && afterData?.type === 'degen') {
        console.log(`Degen mission ${missionId} completed - ready for winner selection`);
        // Create a completion log
        await db.collection('degen_mission_completions').add({
            missionId,
            completedAt: new Date(),
            totalParticipants: afterData.totalParticipants || 0,
            readyForWinners: true
        });
    }
});
