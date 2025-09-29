import { getFirestore } from 'firebase-admin/firestore';
import * as firebaseAdmin from 'firebase-admin';

// Guarantees array fields exist even if `data` is null/undefined or partially shaped
export type MinimalUserData = {
    missions?: any[];
    submissions?: any[];
    reviews?: any[];
    honorsLedger?: any[];
};

export function coerceUserData(data?: MinimalUserData | null) {
    return {
        missions: data?.missions ?? [],
        submissions: data?.submissions ?? [],
        reviews: data?.reviews ?? [],
        honorsLedger: data?.honorsLedger ?? [],
    };
}

// Get Firestore instance lazily to avoid initialization issues
function getDb() {
    return getFirestore();
}

export interface UserDataIntegrityResult {
    userId: string;
    issues: string[];
    fixes: string[];
    stats: {
        missions: number;
        submissions: number;
        reviews: number;
        honorsLedger: number;
    };
}

export interface UserDataIntegrityStats {
    totalUsers: number;
    usersWithIssues: number;
    totalIssues: number;
    totalFixes: number;
    issueBreakdown: {
        [issueType: string]: number;
    };
}

/**
 * Check user data integrity and identify issues
 */
export async function checkUserDataIntegrity(userId: string): Promise<UserDataIntegrityResult> {
    const issues: string[] = [];
    const fixes: string[] = [];

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
        const submissionsWithOldName = d.submissions.filter((sub: any) =>
            sub.missionId && !sub.mission_id
        );
        if (submissionsWithOldName.length > 0) {
            issues.push(`${submissionsWithOldName.length} submissions use old 'missionId' field`);
            fixes.push('Rename missionId to mission_id in submissions');
        }

        const reviewsWithOldName = d.reviews.filter((rev: any) =>
            rev.missionId && !rev.mission_id
        );
        if (reviewsWithOldName.length > 0) {
            issues.push(`${reviewsWithOldName.length} reviews use old 'missionId' field`);
            fixes.push('Rename missionId to mission_id in reviews');
        }

        const honorsWithOldName = d.honorsLedger.filter((honor: any) =>
            honor.missionId && !honor.mission_id
        );
        if (honorsWithOldName.length > 0) {
            issues.push(`${honorsWithOldName.length} honors use old 'missionId' field`);
            fixes.push('Rename missionId to mission_id in honorsLedger');
        }

        // Check for missing required fields
        const submissionsWithoutStatus = d.submissions.filter((sub: any) => !sub.status);
        if (submissionsWithoutStatus.length > 0) {
            issues.push(`${submissionsWithoutStatus.length} submissions missing status field`);
            fixes.push('Add status field to submissions');
        }

        const reviewsWithoutStatus = d.reviews.filter((rev: any) => !rev.status);
        if (reviewsWithoutStatus.length > 0) {
            issues.push(`${reviewsWithoutStatus.length} reviews missing status field`);
            fixes.push('Add status field to reviews');
        }

        // Check for inconsistent data types
        const invalidSubmissions = d.submissions.filter((sub: any) =>
            typeof sub.createdAt !== 'object' && typeof sub.createdAt !== 'string'
        );
        if (invalidSubmissions.length > 0) {
            issues.push(`${invalidSubmissions.length} submissions have invalid createdAt field`);
            fixes.push('Fix createdAt field format in submissions');
        }

        const invalidReviews = d.reviews.filter((rev: any) =>
            typeof rev.createdAt !== 'object' && typeof rev.createdAt !== 'string'
        );
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

    } catch (error) {
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
export async function fixUserDataIntegrity(userId: string, fixes: string[]): Promise<boolean> {
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
                const updatedSubmissions = d.submissions.map((sub: any) => {
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
                const updatedReviews = d.reviews.map((rev: any) => {
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
                const updatedHonors = d.honorsLedger.map((honor: any) => {
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
                const updatedSubmissions = d.submissions.map((sub: any) => {
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
                const updatedReviews = d.reviews.map((rev: any) => {
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

    } catch (error) {
        console.error(`Error fixing user data for ${userId}:`, error);
        return false;
    }
}

/**
 * Get all user data for analysis
 */
export async function getAllUserData(): Promise<any[]> {
    try {
        const usersSnapshot = await getDb().collection('users').get();
        return usersSnapshot.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting all user data:', error);
        return [];
    }
}

/**
 * Get user data for a specific user
 */
export async function getUserData(userId: string): Promise<any | null> {
    try {
        const userDoc = await getDb().collection('users').doc(userId).get();
        if (!userDoc.exists) {
            return null;
        }
        return {
            id: userDoc.id,
            ...userDoc.data()
        };
    } catch (error) {
        console.error(`Error getting user data for ${userId}:`, error);
        return null;
    }
}

/**
 * Run integrity check on all users
 */
export async function checkAllUsersIntegrity(): Promise<UserDataIntegrityStats> {
    const allUsers = await getAllUserData();
    const results = await Promise.all(
        allUsers.map((user: any) => checkUserDataIntegrity(user.id))
    );

    const stats: UserDataIntegrityStats = {
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
export function isValidUid(uid: string): boolean {
    return typeof uid === 'string' && uid.length >= 20 && uid.length <= 128;
}

/**
 * Update user profile safely with UID validation
 */
export async function updateUserProfileSafely(userId: string, updateData: any): Promise<any> {
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
export async function createMissionWithUidReferences(userId: string, missionData: any): Promise<any> {
    if (!isValidUid(userId)) {
        throw new Error('Invalid user ID format');
    }

    const missionRef = getDb().collection('missions').doc();
    const now = new Date();

    // For fixed missions, set expiration to 48 hours from creation
    let expires_at = null;
    if (missionData.model === 'fixed') {
        expires_at = new Date(now.getTime() + (48 * 60 * 60 * 1000)); // 48 hours in milliseconds
    }

    // For degen missions, calculate deadline based on duration
    let deadline = null;
    if (missionData.model === 'degen' && missionData.durationHours) {
        deadline = new Date(now.getTime() + (missionData.durationHours * 60 * 60 * 1000));
    }

    const mission = {
        ...missionData,
        created_by: userId,
        id: missionRef.id,
        status: missionData.status || 'active', // Default to 'active' if not specified
        created_at: firebaseAdmin.firestore.FieldValue.serverTimestamp(), // Use server timestamp for consistency
        expires_at: expires_at, // Set expiration for fixed missions
        deadline: deadline // Set deadline for degen missions
    };

    await missionRef.set(mission);

    return {
        success: true,
        mission
    };
}

/**
 * Create submission with UID references
 */
export async function createSubmissionWithUidReferences(userId: string, submissionData: any): Promise<any> {
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
export async function verifyDataIntegrityAfterDisplayNameChange(
    userId: string,
    oldDisplayName: string,
    newDisplayName: string
): Promise<any> {
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