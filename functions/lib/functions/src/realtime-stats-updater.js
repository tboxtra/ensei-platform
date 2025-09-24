"use strict";
/**
 * Real-time user stats updater
 * Incrementally updates user statistics when mission participations change
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
exports.onMissionCreate = exports.onParticipationUpdate = void 0;
const functions = __importStar(require("firebase-functions"));
const firebaseAdmin = __importStar(require("firebase-admin"));
const honors_1 = require("../../shared/honors");
const db = firebaseAdmin.firestore();
/**
 * Cloud Function triggered on mission_participations write/update
 * Incrementally updates single user's stats to keep QuickStats fresh
 */
exports.onParticipationUpdate = functions.firestore
    .document('mission_participations/{participationId}')
    .onWrite(async (change, context) => {
    const { participationId } = context.params;
    const beforeData = change.before.exists ? change.before.data() : null;
    const afterData = change.after.exists ? change.after.data() : null;
    // Only process if this is a new participation or status change
    if (!afterData) {
        console.log(`Participation ${participationId} deleted, skipping stats update`);
        return;
    }
    const userId = afterData.user_id;
    if (!userId) {
        console.error(`No user_id found in participation ${participationId}`);
        return;
    }
    try {
        console.log(`Updating real-time stats for user ${userId} based on participation ${participationId}`);
        // Get current user stats
        const userStatsRef = db.doc(`users/${userId}/stats/summary`);
        const userStatsDoc = await userStatsRef.get();
        const currentStats = userStatsDoc.exists ? userStatsDoc.data() : {
            missionsCreated: 0,
            missionsCompleted: 0,
            tasksDone: 0,
            totalEarned: 0
        };
        if (!currentStats) {
            console.error(`No stats data found for user ${userId}`);
            return;
        }
        // Calculate delta from this participation
        const delta = calculateParticipationDelta(beforeData, afterData);
        if (delta.tasksDoneDelta === 0 && delta.totalEarnedDelta === 0) {
            console.log(`No meaningful changes in participation ${participationId}, skipping update`);
            return;
        }
        // Update user stats with delta
        const newStats = {
            missionsCreated: currentStats?.missionsCreated || 0,
            missionsCompleted: currentStats?.missionsCompleted || 0,
            tasksDone: (currentStats?.tasksDone || 0) + delta.tasksDoneDelta,
            totalEarned: (currentStats?.totalEarned || 0) + delta.totalEarnedDelta,
            updatedAt: new Date()
        };
        await userStatsRef.set(newStats, { merge: true });
        console.log(`Updated user ${userId} stats:`, {
            tasksDoneDelta: delta.tasksDoneDelta,
            totalEarnedDelta: delta.totalEarnedDelta,
            newTotal: newStats.totalEarned
        });
    }
    catch (error) {
        console.error(`Error updating real-time stats for user ${userId}:`, error);
        // Log the error for debugging
        await db.collection('stats_update_errors').add({
            participationId,
            userId,
            error: error?.message || 'Unknown error',
            timestamp: new Date(),
            stack: error?.stack
        });
    }
});
/**
 * Calculate the delta in tasks and honors between before and after participation data
 */
function calculateParticipationDelta(beforeData, afterData) {
    const beforeTasks = beforeData?.tasks_completed || [];
    const afterTasks = afterData?.tasks_completed || [];
    // Find newly completed tasks
    const beforeCompleted = new Set(beforeTasks
        .filter((task) => task.status === 'completed')
        .map((task) => `${afterData.mission_id}:${task.task_id}`));
    const afterCompleted = new Set(afterTasks
        .filter((task) => task.status === 'completed')
        .map((task) => `${afterData.mission_id}:${task.task_id}`));
    // Calculate delta
    let tasksDoneDelta = 0;
    let totalEarnedDelta = 0;
    afterCompleted.forEach((taskKey) => {
        if (!beforeCompleted.has(taskKey)) {
            // New completed task
            const [, taskId] = taskKey.split(':');
            const honors = (0, honors_1.getFixedTaskHonors)(taskId);
            tasksDoneDelta += 1;
            totalEarnedDelta += honors;
        }
    });
    return { tasksDoneDelta, totalEarnedDelta };
}
/**
 * Cloud Function to handle mission creation stats
 * Updates missionsCreated count when user creates a new mission
 */
exports.onMissionCreate = functions.firestore
    .document('missions/{missionId}')
    .onCreate(async (snap, context) => {
    const { missionId } = context.params;
    const afterData = snap.data();
    // Only process new mission creation
    if (!afterData) {
        return;
    }
    const createdBy = afterData.created_by;
    if (!createdBy) {
        console.error(`No created_by found in mission ${missionId}`);
        return;
    }
    // Skip if mission is soft-deleted
    if (afterData.deleted === true) {
        console.log(`Mission ${missionId} is soft-deleted, skipping stats update`);
        return;
    }
    try {
        console.log(`Updating missionsCreated count for user ${createdBy}`);
        const userStatsRef = db.doc(`users/${createdBy}/stats/summary`);
        const userStatsDoc = await userStatsRef.get();
        const currentStats = userStatsDoc.exists ? userStatsDoc.data() : {
            missionsCreated: 0,
            missionsCompleted: 0,
            tasksDone: 0,
            totalEarned: 0
        };
        if (!currentStats) {
            console.error(`No stats data found for user ${createdBy}`);
            return;
        }
        const newStats = {
            ...currentStats,
            missionsCreated: (currentStats?.missionsCreated || 0) + 1,
            updatedAt: new Date()
        };
        await userStatsRef.set(newStats, { merge: true });
        console.log(`Updated user ${createdBy} missionsCreated: ${newStats.missionsCreated}`);
    }
    catch (error) {
        console.error(`Error updating missionsCreated for user ${createdBy}:`, error);
    }
});
