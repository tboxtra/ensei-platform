/**
 * User Data Integrity Utilities
 * 
 * This module provides utilities to ensure user data integrity when display names change.
 * It enforces the use of Firebase Auth UID as the primary key for all user-related data.
 */

import * as admin from 'firebase-admin';
import { db } from '../firebase';

export interface UserDataIntegrityCheck {
    isValid: boolean;
    issues: string[];
    recommendations: string[];
}

/**
 * Validate that a user document uses UID as the primary key
 */
export function validateUserDocumentStructure(userData: any, docId: string): UserDataIntegrityCheck {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check if document ID is a valid UID
    if (!isValidUid(docId)) {
        issues.push(`Document ID '${docId}' is not a valid Firebase UID`);
        recommendations.push('Use Firebase Auth UID as the document ID');
    }

    // Check if userData has a uid field that matches the document ID
    if (userData.uid && userData.uid !== docId) {
        issues.push(`Document ID '${docId}' does not match uid field '${userData.uid}'`);
        recommendations.push('Ensure document ID matches the uid field');
    }

    // Check for required fields
    if (!userData.email) {
        issues.push('Missing required email field');
        recommendations.push('Include email field in user document');
    }

    // Check for displayName field (should be stored as a field, not used as key)
    if (userData.displayName && typeof userData.displayName !== 'string') {
        issues.push('displayName field should be a string');
        recommendations.push('Ensure displayName is stored as a string field');
    }

    return {
        isValid: issues.length === 0,
        issues,
        recommendations
    };
}

/**
 * Validate that a mission document uses UID for created_by field
 */
export function validateMissionDocumentStructure(missionData: any): UserDataIntegrityCheck {
    const issues: string[] = [];
    const recommendations: string[] = [];

    if (!missionData.created_by) {
        issues.push('Missing required created_by field');
        recommendations.push('Include created_by field with Firebase Auth UID');
    } else if (!isValidUid(missionData.created_by)) {
        issues.push(`created_by field '${missionData.created_by}' is not a valid Firebase UID`);
        recommendations.push('Use Firebase Auth UID for created_by field');
    }

    return {
        isValid: issues.length === 0,
        issues,
        recommendations
    };
}

/**
 * Validate that a submission document uses UID for user_id field
 */
export function validateSubmissionDocumentStructure(submissionData: any): UserDataIntegrityCheck {
    const issues: string[] = [];
    const recommendations: string[] = [];

    if (!submissionData.user_id) {
        issues.push('Missing required user_id field');
        recommendations.push('Include user_id field with Firebase Auth UID');
    } else if (!isValidUid(submissionData.user_id)) {
        issues.push(`user_id field '${submissionData.user_id}' is not a valid Firebase UID`);
        recommendations.push('Use Firebase Auth UID for user_id field');
    }

    return {
        isValid: issues.length === 0,
        issues,
        recommendations
    };
}

/**
 * Ensure user profile update preserves data integrity
 */
export async function updateUserProfileSafely(
    userId: string,
    updateData: any
): Promise<{ success: boolean; error?: string; updatedUser?: any }> {
    try {
        // Validate that userId is a valid UID
        if (!isValidUid(userId)) {
            return {
                success: false,
                error: 'Invalid user ID format. Must be a Firebase Auth UID.'
            };
        }

        // Get current user document
        const userDoc = await db.collection('users').doc(userId).get();

        if (!userDoc.exists) {
            // Create new user document with UID as key
            const newUser = {
                uid: userId,
                email: updateData.email || '',
                displayName: updateData.displayName || updateData.name || '',
                firstName: updateData.firstName || '',
                lastName: updateData.lastName || '',
                avatar: updateData.avatar || '',
                twitter: updateData.twitter || '',
                twitter_handle: updateData.twitter_handle || updateData.twitter || '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                stats: {
                    missions_created: 0,
                    missions_completed: 0,
                    total_honors_earned: 0,
                    total_usd_earned: 0
                }
            };

            await db.collection('users').doc(userId).set(newUser);
            return { success: true, updatedUser: newUser };
        }

        // Update existing user document
        const currentUser = userDoc.data();
        const updatedUser = {
            ...currentUser,
            ...updateData,
            uid: userId, // Ensure UID is always set correctly
            updated_at: new Date().toISOString()
        };

        // Use set with merge to avoid security rule conflicts
        await db.collection('users').doc(userId).set(updatedUser, { merge: true });

        // Get updated document
        const updatedUserDoc = await db.collection('users').doc(userId).get();
        return {
            success: true,
            updatedUser: updatedUserDoc.data()
        };

    } catch (error) {
        console.error('Error updating user profile safely:', error);
        return {
            success: false,
            error: `Failed to update user profile: ${error}`
        };
    }
}

/**
 * Get user data by UID (ensures data integrity)
 */
export async function getUserDataByUid(userId: string): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
        // Validate UID format
        if (!isValidUid(userId)) {
            return {
                success: false,
                error: 'Invalid user ID format. Must be a Firebase Auth UID.'
            };
        }

        const userDoc = await db.collection('users').doc(userId).get();

        if (!userDoc.exists) {
            return {
                success: false,
                error: 'User not found'
            };
        }

        const userData = userDoc.data();

        // Validate document structure
        const validation = validateUserDocumentStructure(userData, userId);
        if (!validation.isValid) {
            console.warn('User document structure issues:', validation.issues);
        }

        return {
            success: true,
            user: userData
        };

    } catch (error) {
        console.error('Error getting user data by UID:', error);
        return {
            success: false,
            error: `Failed to get user data: ${error}`
        };
    }
}

/**
 * Create mission with UID-based references
 */
export async function createMissionWithUidReferences(
    userId: string,
    missionData: any
): Promise<{ success: boolean; mission?: any; error?: string }> {
    try {
        // Validate UID format
        if (!isValidUid(userId)) {
            return {
                success: false,
                error: 'Invalid user ID format. Must be a Firebase Auth UID.'
            };
        }

        // Ensure mission data uses UID for created_by
        const missionWithUid = {
            ...missionData,
            created_by: userId, // Always use UID, never displayName
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            status: 'active',
            participants_count: 0,
            submissions_count: 0
        };

        // Validate mission structure
        const validation = validateMissionDocumentStructure(missionWithUid);
        if (!validation.isValid) {
            return {
                success: false,
                error: `Mission validation failed: ${validation.issues.join(', ')}`
            };
        }

        // Create mission document
        const missionRef = await db.collection('missions').add(missionWithUid);
        const createdMission = { id: missionRef.id, ...missionWithUid };

        return {
            success: true,
            mission: createdMission
        };

    } catch (error) {
        console.error('Error creating mission with UID references:', error);
        return {
            success: false,
            error: `Failed to create mission: ${error}`
        };
    }
}

/**
 * Create submission with UID-based references
 */
export async function createSubmissionWithUidReferences(
    userId: string,
    submissionData: any
): Promise<{ success: boolean; submission?: any; error?: string }> {
    try {
        // Validate UID format
        if (!isValidUid(userId)) {
            return {
                success: false,
                error: 'Invalid user ID format. Must be a Firebase Auth UID.'
            };
        }

        // Ensure submission data uses UID for user_id
        const submissionWithUid = {
            ...submissionData,
            user_id: userId, // Always use UID, never displayName
            submitted_at: new Date().toISOString(),
            status: 'pending'
        };

        // Validate submission structure
        const validation = validateSubmissionDocumentStructure(submissionWithUid);
        if (!validation.isValid) {
            return {
                success: false,
                error: `Submission validation failed: ${validation.issues.join(', ')}`
            };
        }

        // Create submission document
        const submissionRef = await db.collection('submissions').add(submissionWithUid);
        const createdSubmission = { id: submissionRef.id, ...submissionWithUid };

        return {
            success: true,
            submission: createdSubmission
        };

    } catch (error) {
        console.error('Error creating submission with UID references:', error);
        return {
            success: false,
            error: `Failed to create submission: ${error}`
        };
    }
}

/**
 * Validate if a string is a valid Firebase UID
 */
export function isValidUid(uid: string): boolean {
    // Firebase UIDs are typically 28 characters long and contain alphanumeric characters
    // They don't contain special characters like spaces, which displayNames might have
    return /^[a-zA-Z0-9]{28}$/.test(uid);
}

/**
 * Get all user-related data by UID (missions, submissions, reviews, etc.)
 */
export async function getAllUserDataByUid(userId: string): Promise<{
    success: boolean;
    data?: {
        user: any;
        missions: any[];
        submissions: any[];
        reviews: any[];
        honorsLedger: any[];
    };
    error?: string;
}> {
    try {
        if (!isValidUid(userId)) {
            return {
                success: false,
                error: 'Invalid user ID format. Must be a Firebase Auth UID.'
            };
        }

        // Get user data
        const userResult = await getUserDataByUid(userId);
        if (!userResult.success) {
            return {
                success: false,
                error: userResult.error
            };
        }

        // Get user's missions
        const missionsSnapshot = await db.collection('missions')
            .where('created_by', '==', userId)
            .get();
        const missions = missionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Get user's submissions
        const submissionsSnapshot = await db.collection('submissions')
            .where('user_id', '==', userId)
            .get();
        const submissions = submissionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Get user's reviews
        const reviewsSnapshot = await db.collection('reviews')
            .where('user_id', '==', userId)
            .get();
        const reviews = reviewsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Get user's honors ledger
        const honorsSnapshot = await db.collection('honors_ledger')
            .where('user_id', '==', userId)
            .get();
        const honorsLedger = honorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        return {
            success: true,
            data: {
                user: userResult.user,
                missions,
                submissions,
                reviews,
                honorsLedger
            }
        };

    } catch (error) {
        console.error('Error getting all user data by UID:', error);
        return {
            success: false,
            error: `Failed to get user data: ${error}`
        };
    }
}

/**
 * Verify data integrity after displayName change
 */
export async function verifyDataIntegrityAfterDisplayNameChange(
    userId: string,
    oldDisplayName: string,
    newDisplayName: string
): Promise<{
    success: boolean;
    verified: boolean;
    issues: string[];
    dataCounts: {
        missions: number;
        submissions: number;
        reviews: number;
        honorsLedger: number;
    };
}> {
    try {
        if (!isValidUid(userId)) {
            return {
                success: false,
                verified: false,
                issues: ['Invalid user ID format'],
                dataCounts: { missions: 0, submissions: 0, reviews: 0, honorsLedger: 0 }
            };
        }

        // Get all user data by UID
        const userDataResult = await getAllUserDataByUid(userId);
        if (!userDataResult.success) {
            return {
                success: false,
                verified: false,
                issues: [userDataResult.error || 'Failed to get user data'],
                dataCounts: { missions: 0, submissions: 0, reviews: 0, honorsLedger: 0 }
            };
        }

        const { data } = userDataResult;
        const issues: string[] = [];

        // Verify that all data is still accessible by UID
        if (!data.user) {
            issues.push('User document not found');
        }

        // Check if any documents still reference the old displayName
        const missionsWithOldName = data.missions.filter(mission =>
            mission.created_by === oldDisplayName
        );
        if (missionsWithOldName.length > 0) {
            issues.push(`${missionsWithOldName.length} missions still reference old displayName`);
        }

        const submissionsWithOldName = data.submissions.filter(submission =>
            submission.user_id === oldDisplayName
        );
        if (submissionsWithOldName.length > 0) {
            issues.push(`${submissionsWithOldName.length} submissions still reference old displayName`);
        }

        const reviewsWithOldName = data.reviews.filter(review =>
            review.user_id === oldDisplayName || review.reviewer_id === oldDisplayName
        );
        if (reviewsWithOldName.length > 0) {
            issues.push(`${reviewsWithOldName.length} reviews still reference old displayName`);
        }

        const honorsWithOldName = data.honorsLedger.filter(entry =>
            entry.user_id === oldDisplayName
        );
        if (honorsWithOldName.length > 0) {
            issues.push(`${honorsWithOldName.length} honors ledger entries still reference old displayName`);
        }

        return {
            success: true,
            verified: issues.length === 0,
            issues,
            dataCounts: {
                missions: data.missions.length,
                submissions: data.submissions.length,
                reviews: data.reviews.length,
                honorsLedger: data.honorsLedger.length
            }
        };

    } catch (error) {
        console.error('Error verifying data integrity:', error);
        return {
            success: false,
            verified: false,
            issues: [`Verification failed: ${error}`],
            dataCounts: { missions: 0, submissions: 0, reviews: 0, honorsLedger: 0 }
        };
    }
}
