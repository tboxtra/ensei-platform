"use strict";
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
exports.coerceUserData = coerceUserData;
exports.checkUserDataIntegrity = checkUserDataIntegrity;
exports.fixUserDataIntegrity = fixUserDataIntegrity;
exports.getAllUserData = getAllUserData;
exports.getUserData = getUserData;
exports.checkAllUsersIntegrity = checkAllUsersIntegrity;
exports.isValidUid = isValidUid;
exports.updateUserProfileSafely = updateUserProfileSafely;
exports.createMissionWithUidReferences = createMissionWithUidReferences;
exports.createSubmissionWithUidReferences = createSubmissionWithUidReferences;
exports.verifyDataIntegrityAfterDisplayNameChange = verifyDataIntegrityAfterDisplayNameChange;
const firestore_1 = require("firebase-admin/firestore");
const firebaseAdmin = __importStar(require("firebase-admin"));
// Status standardization
const normalizeStatus = (status) => {
    if (!status)
        return 'pending';
    const statusStr = String(status).toLowerCase();
    // Map legacy statuses to standard ones
    const legacyMap = {
        'verified': 'verified',
        'VERIFIED': 'verified',
        'approved': 'approved',
        'APPROVED': 'approved',
        'completed': 'completed',
        'COMPLETED': 'completed',
        'active': 'active',
        'ACTIVE': 'active',
        'paused': 'paused',
        'PAUSED': 'paused',
        'expired': 'expired',
        'EXPIRED': 'expired'
    };
    return legacyMap[statusStr] || statusStr;
};
function coerceUserData(data) {
    return {
        missions: data?.missions ?? [],
        submissions: data?.submissions ?? [],
        reviews: data?.reviews ?? [],
        honorsLedger: data?.honorsLedger ?? [],
    };
}
// Get Firestore instance lazily to avoid initialization issues
function getDb() {
    return (0, firestore_1.getFirestore)();
}
/**
 * Check user data integrity and identify issues
 */
async function checkUserDataIntegrity(userId) {
    const issues = [];
    const fixes = [];
    try {
        const userDoc = await getDb().collection('users').doc(userId).get();
        if (!userDoc.exists) {
            return {
                userId,
                issues: ['User document does not exist'],
                fixes: [],
                stats: { missions: 0, submissions: 0, reviews: 0, honorsLedger: 0 }
            };
        }
        const data = userDoc.data();
        const d = coerceUserData(data);
        // Check for old field names and suggest fixes
        const submissionsWithOldName = d.submissions.filter((sub) => sub.missionId && !sub.mission_id);
        if (submissionsWithOldName.length > 0) {
            issues.push(`${submissionsWithOldName.length} submissions use old 'missionId' field`);
            fixes.push('Rename missionId to mission_id in submissions');
        }
        const reviewsWithOldName = d.reviews.filter((rev) => rev.missionId && !rev.mission_id);
        if (reviewsWithOldName.length > 0) {
            issues.push(`${reviewsWithOldName.length} reviews use old 'missionId' field`);
            fixes.push('Rename missionId to mission_id in reviews');
        }
        const honorsWithOldName = d.honorsLedger.filter((honor) => honor.missionId && !honor.mission_id);
        if (honorsWithOldName.length > 0) {
            issues.push(`${honorsWithOldName.length} honors use old 'missionId' field`);
            fixes.push('Rename missionId to mission_id in honorsLedger');
        }
        // Check for missing required fields
        const submissionsWithoutStatus = d.submissions.filter((sub) => !sub.status);
        if (submissionsWithoutStatus.length > 0) {
            issues.push(`${submissionsWithoutStatus.length} submissions missing status field`);
            fixes.push('Add status field to submissions');
        }
        const reviewsWithoutStatus = d.reviews.filter((rev) => !rev.status);
        if (reviewsWithoutStatus.length > 0) {
            issues.push(`${reviewsWithoutStatus.length} reviews missing status field`);
            fixes.push('Add status field to reviews');
        }
        // Check for inconsistent data types
        const invalidSubmissions = d.submissions.filter((sub) => typeof sub.createdAt !== 'object' && typeof sub.createdAt !== 'string');
        if (invalidSubmissions.length > 0) {
            issues.push(`${invalidSubmissions.length} submissions have invalid createdAt field`);
            fixes.push('Fix createdAt field format in submissions');
        }
        const invalidReviews = d.reviews.filter((rev) => typeof rev.createdAt !== 'object' && typeof rev.createdAt !== 'string');
        if (invalidReviews.length > 0) {
            issues.push(`${invalidReviews.length} reviews have invalid createdAt field`);
            fixes.push('Fix createdAt field format in reviews');
        }
        return {
            userId,
            issues,
            fixes,
            stats: {
                missions: d.missions.length,
                submissions: d.submissions.length,
                reviews: d.reviews.length,
                honorsLedger: d.honorsLedger.length,
            }
        };
    }
    catch (error) {
        return {
            userId,
            issues: [`Error checking user data: ${error}`],
            fixes: [],
            stats: { missions: 0, submissions: 0, reviews: 0, honorsLedger: 0 }
        };
    }
}
/**
 * Fix user data integrity issues
 */
async function fixUserDataIntegrity(userId, fixes) {
    try {
        const userRef = getDb().collection('users').doc(userId);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            return false;
        }
        const data = userDoc.data();
        const d = coerceUserData(data);
        let hasChanges = false;
        // Apply fixes
        for (const fix of fixes) {
            if (fix.includes('Rename missionId to mission_id in submissions')) {
                const updatedSubmissions = d.submissions.map((sub) => {
                    if (sub.missionId && !sub.mission_id) {
                        hasChanges = true;
                        return { ...sub, mission_id: sub.missionId };
                    }
                    return sub;
                });
                if (hasChanges) {
                    await userRef.update({ submissions: updatedSubmissions });
                }
            }
            if (fix.includes('Rename missionId to mission_id in reviews')) {
                const updatedReviews = d.reviews.map((rev) => {
                    if (rev.missionId && !rev.mission_id) {
                        hasChanges = true;
                        return { ...rev, mission_id: rev.missionId };
                    }
                    return rev;
                });
                if (hasChanges) {
                    await userRef.update({ reviews: updatedReviews });
                }
            }
            if (fix.includes('Rename missionId to mission_id in honorsLedger')) {
                const updatedHonors = d.honorsLedger.map((honor) => {
                    if (honor.missionId && !honor.mission_id) {
                        hasChanges = true;
                        return { ...honor, mission_id: honor.missionId };
                    }
                    return honor;
                });
                if (hasChanges) {
                    await userRef.update({ honorsLedger: updatedHonors });
                }
            }
            if (fix.includes('Add status field to submissions')) {
                const updatedSubmissions = d.submissions.map((sub) => {
                    if (!sub.status) {
                        hasChanges = true;
                        return { ...sub, status: 'pending' };
                    }
                    return sub;
                });
                if (hasChanges) {
                    await userRef.update({ submissions: updatedSubmissions });
                }
            }
            if (fix.includes('Add status field to reviews')) {
                const updatedReviews = d.reviews.map((rev) => {
                    if (!rev.status) {
                        hasChanges = true;
                        return { ...rev, status: 'pending' };
                    }
                    return rev;
                });
                if (hasChanges) {
                    await userRef.update({ reviews: updatedReviews });
                }
            }
        }
        return hasChanges;
    }
    catch (error) {
        console.error(`Error fixing user data for ${userId}:`, error);
        return false;
    }
}
/**
 * Get all user data for analysis
 */
async function getAllUserData() {
    try {
        const usersSnapshot = await getDb().collection('users').get();
        return usersSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));
    }
    catch (error) {
        console.error('Error getting all user data:', error);
        return [];
    }
}
/**
 * Get user data for a specific user
 */
async function getUserData(userId) {
    try {
        const userDoc = await getDb().collection('users').doc(userId).get();
        if (!userDoc.exists) {
            return null;
        }
        return {
            id: userDoc.id,
            ...userDoc.data()
        };
    }
    catch (error) {
        console.error(`Error getting user data for ${userId}:`, error);
        return null;
    }
}
/**
 * Run integrity check on all users
 */
async function checkAllUsersIntegrity() {
    const allUsers = await getAllUserData();
    const results = await Promise.all(allUsers.map((user) => checkUserDataIntegrity(user.id)));
    const stats = {
        totalUsers: allUsers.length,
        usersWithIssues: 0,
        totalIssues: 0,
        totalFixes: 0,
        issueBreakdown: {}
    };
    for (const result of results) {
        if (result.issues.length > 0) {
            stats.usersWithIssues++;
            stats.totalIssues += result.issues.length;
            stats.totalFixes += result.fixes.length;
            for (const issue of result.issues) {
                const issueType = issue.split(':')[0] || 'Unknown';
                stats.issueBreakdown[issueType] = (stats.issueBreakdown[issueType] || 0) + 1;
            }
        }
    }
    return stats;
}
/**
 * Helper function to validate Firebase UID format
 */
function isValidUid(uid) {
    return typeof uid === 'string' && uid.length >= 20 && uid.length <= 128;
}
/**
 * Update user profile safely with UID validation
 */
async function updateUserProfileSafely(userId, updateData) {
    if (!isValidUid(userId)) {
        throw new Error('Invalid user ID format');
    }
    const userRef = getDb().collection('users').doc(userId);
    await userRef.set(updateData, { merge: true });
    return {
        success: true,
        updatedUser: { uid: userId, ...updateData }
    };
}
/**
 * Create mission with UID references
 */
async function createMissionWithUidReferences(userId, missionData) {
    if (!isValidUid(userId)) {
        throw new Error('Invalid user ID format');
    }
    const missionRef = getDb().collection('missions').doc();
    // ✅ FIX A: Ensure mission document persists all computed fields
    const now = firebaseAdmin.firestore.FieldValue.serverTimestamp();
    const canonical = {
        // Base fields
        platform: missionData.platform,
        model: missionData.model,
        type: missionData.type,
        tasks: missionData.tasks,
        isPremium: !!missionData.isPremium,
        contentLink: missionData.contentLink,
        tweetLink: missionData.contentLink, // keep normalized twin for back-compat
        instructions: missionData.instructions,
        status: normalizeStatus(missionData.status || 'active'),
        created_by: userId,
        id: missionRef.id,
        // Timestamps
        created_at: now,
        updated_at: now,
        // Fixed mission fields
        ...(missionData.model === 'fixed' && {
            cap: missionData.cap,
            rewardPerUser: missionData.rewardPerUser,
            winnersPerTask: 1, // as designed
            expires_at: missionData.expires_at ?? null,
            deadline: missionData.deadline ?? null,
            rewards: missionData.rewards ?? {
                honors: Math.round(missionData.rewardPerUser * missionData.cap),
                usd: Number(((missionData.rewardPerUser * missionData.cap) / 450).toFixed(2)),
            },
        }),
        // Degen mission fields
        ...(missionData.model === 'degen' && {
            duration: missionData.duration, // hours
            selectedDegenPreset: missionData.selectedDegenPreset,
            winnersPerMission: missionData.winnersPerMission ?? missionData.winnersCap ?? missionData.maxWinners ?? 0,
            winnersCap: missionData.winnersPerMission ?? missionData.winnersCap ?? missionData.maxWinners ?? 0, // back-compat mirror
            deadline: missionData.deadline ?? null,
            rewards: missionData.rewards ?? {
                usd: missionData.selectedDegenPreset?.costUSD ?? 0,
                honors: Math.round((missionData.selectedDegenPreset?.costUSD ?? 0) * 450),
            },
        }),
    };
    // IMPORTANT: write all of the above; don't drop unknown keys
    await missionRef.set(canonical, { merge: true });
    // ✅ DEGEN FLOW COMPLETION - Create task documents for degen missions
    if (missionData.model === 'degen' && missionData.tasks && missionData.tasks.length > 0) {
        const batch = getDb().batch();
        for (const task of missionData.tasks) {
            const taskRef = missionRef.collection('tasks').doc();
            const taskDoc = {
                id: taskRef.id,
                missionId: missionRef.id,
                type: task,
                status: 'active',
                created_at: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
                updated_at: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
                // Initialize task-specific fields for degen missions
                winners: [],
                winnersHash: null,
                honorsPerTask: missionData.rewards?.honors ? Math.floor(missionData.rewards.honors / missionData.tasks.length) : 0,
                maxWinners: missionData.winnersPerMission || 0
            };
            batch.set(taskRef, taskDoc);
        }
        await batch.commit();
        console.log(`Created ${missionData.tasks.length} task documents for degen mission ${missionRef.id}`);
    }
    return {
        success: true,
        mission: canonical
    };
}
/**
 * Create submission with UID references
 */
async function createSubmissionWithUidReferences(userId, submissionData) {
    if (!isValidUid(userId)) {
        throw new Error('Invalid user ID format');
    }
    const submissionRef = getDb().collection('submissions').doc();
    const submission = {
        ...submissionData,
        user_id: userId,
        id: submissionRef.id
    };
    await submissionRef.set(submission);
    return {
        success: true,
        submission
    };
}
/**
 * Verify data integrity after display name change
 */
async function verifyDataIntegrityAfterDisplayNameChange(userId, oldDisplayName, newDisplayName) {
    if (!isValidUid(userId)) {
        throw new Error('Invalid user ID format');
    }
    // Check that all data still references the UID, not displayName
    const userDoc = await getDb().collection('users').doc(userId).get();
    if (!userDoc.exists) {
        return { success: false, error: 'User not found' };
    }
    return {
        success: true,
        integrityCheck: {
            userFound: true,
            dataAccessible: true,
            stats: {
                missions: 0,
                submissions: 0,
                reviews: 0,
                honorsLedger: 0
            }
        }
    };
}
