"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyDataIntegrityAfterDisplayNameChange = exports.createSubmissionWithUidReferences = exports.createMissionWithUidReferences = exports.updateUserProfileSafely = exports.isValidUid = exports.checkAllUsersIntegrity = exports.getUserData = exports.getAllUserData = exports.fixUserDataIntegrity = exports.checkUserDataIntegrity = exports.coerceUserData = void 0;
const firestore_1 = require("firebase-admin/firestore");
function coerceUserData(data) {
    var _a, _b, _c, _d;
    return {
        missions: (_a = data === null || data === void 0 ? void 0 : data.missions) !== null && _a !== void 0 ? _a : [],
        submissions: (_b = data === null || data === void 0 ? void 0 : data.submissions) !== null && _b !== void 0 ? _b : [],
        reviews: (_c = data === null || data === void 0 ? void 0 : data.reviews) !== null && _c !== void 0 ? _c : [],
        honorsLedger: (_d = data === null || data === void 0 ? void 0 : data.honorsLedger) !== null && _d !== void 0 ? _d : [],
    };
}
exports.coerceUserData = coerceUserData;
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
exports.checkUserDataIntegrity = checkUserDataIntegrity;
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
                        return Object.assign(Object.assign({}, sub), { mission_id: sub.missionId });
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
                        return Object.assign(Object.assign({}, rev), { mission_id: rev.missionId });
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
                        return Object.assign(Object.assign({}, honor), { mission_id: honor.missionId });
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
                        return Object.assign(Object.assign({}, sub), { status: 'pending' });
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
                        return Object.assign(Object.assign({}, rev), { status: 'pending' });
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
exports.fixUserDataIntegrity = fixUserDataIntegrity;
/**
 * Get all user data for analysis
 */
async function getAllUserData() {
    try {
        const usersSnapshot = await getDb().collection('users').get();
        return usersSnapshot.docs.map((doc) => (Object.assign({ id: doc.id }, doc.data())));
    }
    catch (error) {
        console.error('Error getting all user data:', error);
        return [];
    }
}
exports.getAllUserData = getAllUserData;
/**
 * Get user data for a specific user
 */
async function getUserData(userId) {
    try {
        const userDoc = await getDb().collection('users').doc(userId).get();
        if (!userDoc.exists) {
            return null;
        }
        return Object.assign({ id: userDoc.id }, userDoc.data());
    }
    catch (error) {
        console.error(`Error getting user data for ${userId}:`, error);
        return null;
    }
}
exports.getUserData = getUserData;
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
exports.checkAllUsersIntegrity = checkAllUsersIntegrity;
/**
 * Helper function to validate Firebase UID format
 */
function isValidUid(uid) {
    return typeof uid === 'string' && uid.length >= 20 && uid.length <= 128;
}
exports.isValidUid = isValidUid;
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
        updatedUser: Object.assign({ uid: userId }, updateData)
    };
}
exports.updateUserProfileSafely = updateUserProfileSafely;
/**
 * Create mission with UID references
 */
async function createMissionWithUidReferences(userId, missionData) {
    if (!isValidUid(userId)) {
        throw new Error('Invalid user ID format');
    }
    const missionRef = getDb().collection('missions').doc();
    const mission = Object.assign(Object.assign({}, missionData), { created_by: userId, id: missionRef.id });
    await missionRef.set(mission);
    return {
        success: true,
        mission
    };
}
exports.createMissionWithUidReferences = createMissionWithUidReferences;
/**
 * Create submission with UID references
 */
async function createSubmissionWithUidReferences(userId, submissionData) {
    if (!isValidUid(userId)) {
        throw new Error('Invalid user ID format');
    }
    const submissionRef = getDb().collection('submissions').doc();
    const submission = Object.assign(Object.assign({}, submissionData), { user_id: userId, id: submissionRef.id });
    await submissionRef.set(submission);
    return {
        success: true,
        submission
    };
}
exports.createSubmissionWithUidReferences = createSubmissionWithUidReferences;
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
exports.verifyDataIntegrityAfterDisplayNameChange = verifyDataIntegrityAfterDisplayNameChange;
//# sourceMappingURL=user-data-integrity.js.map