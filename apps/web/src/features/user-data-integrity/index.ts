/**
 * Client-side User Data Integrity Utilities
 * 
 * This module provides client-side utilities to ensure user data integrity
 * when display names change and to handle UID-based data fetching.
 */

import { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';

export interface DataIntegrityVerification {
    verified: boolean;
    issues: string[];
    dataCounts: {
        missions: number;
        submissions: number;
        reviews: number;
        honorsLedger: number;
    };
}

/**
 * Verify data integrity after displayName change
 */
export async function verifyDataIntegrity(
    oldDisplayName: string,
    newDisplayName: string
): Promise<DataIntegrityVerification> {
    try {
        const api = useApi();
        const response = await fetch('/api/v1/user/verify-data-integrity', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('firebaseToken')}`
            },
            body: JSON.stringify({
                oldDisplayName,
                newDisplayName
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error verifying data integrity:', error);
        return {
            verified: false,
            issues: [`Verification failed: ${error}`],
            dataCounts: { missions: 0, submissions: 0, reviews: 0, honorsLedger: 0 }
        };
    }
}

/**
 * Update user profile safely with data integrity checks
 */
export async function updateProfileSafely(profileData: any): Promise<{
    success: boolean;
    user?: any;
    error?: string;
    integrityCheck?: DataIntegrityVerification;
}> {
    try {
        const api = useApi();

        // Get current user data to track displayName changes
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const oldDisplayName = currentUser.displayName || currentUser.name || '';
        const newDisplayName = profileData.displayName || profileData.name || '';

        // Update profile
        const updatedUser = await api.updateProfile(profileData);

        // Verify data integrity if displayName changed
        let integrityCheck: DataIntegrityVerification | undefined;
        if (oldDisplayName !== newDisplayName) {
            integrityCheck = await verifyDataIntegrity(oldDisplayName, newDisplayName);

            if (!integrityCheck.verified) {
                console.warn('Data integrity issues detected:', integrityCheck.issues);
                // Don't fail the update, but log the issues
            }
        }

        return {
            success: true,
            user: updatedUser,
            integrityCheck
        };
    } catch (error) {
        console.error('Error updating profile safely:', error);
        return {
            success: false,
            error: `Failed to update profile: ${error}`
        };
    }
}

/**
 * Get user data by UID (ensures we're using the correct identifier)
 */
export async function getUserDataByUid(): Promise<{
    success: boolean;
    user?: any;
    error?: string;
}> {
    try {
        const api = useApi();
        const user = await api.getUserProfile();

        // Verify that the user data has a valid UID
        if (!user || !user.uid) {
            return {
                success: false,
                error: 'User data missing UID field'
            };
        }

        // Validate UID format
        if (!isValidUid(user.uid)) {
            return {
                success: false,
                error: 'Invalid UID format in user data'
            };
        }

        return {
            success: true,
            user
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
 * Get all user-related data (missions, submissions, etc.) by UID
 */
export async function getAllUserDataByUid(): Promise<{
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
        const api = useApi();

        // Get user profile
        const userResult = await getUserDataByUid();
        if (!userResult.success) {
            return {
                success: false,
                error: userResult.error
            };
        }

        // Get user's missions
        const missions = await api.getMyMissions();

        // Get user's submissions (if API supports it)
        // const submissions = await api.getMySubmissions();

        // For now, return what we have
        return {
            success: true,
            data: {
                user: userResult.user,
                missions: missions || [],
                submissions: [], // TODO: Implement when API is available
                reviews: [], // TODO: Implement when API is available
                honorsLedger: [] // TODO: Implement when API is available
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
 * Validate if a string is a valid Firebase UID
 */
export function isValidUid(uid: string): boolean {
    // Firebase UIDs are typically 28 characters long and contain alphanumeric characters
    return /^[a-zA-Z0-9]{28}$/.test(uid);
}

/**
 * Ensure user data uses UID as primary identifier
 */
export function ensureUidBasedUserData(userData: any): any {
    if (!userData) return userData;

    // If userData has an id field but no uid, use id as uid
    if (userData.id && !userData.uid && isValidUid(userData.id)) {
        return {
            ...userData,
            uid: userData.id
        };
    }

    // If userData has a uid field, ensure it's valid
    if (userData.uid && !isValidUid(userData.uid)) {
        console.warn('Invalid UID format in user data:', userData.uid);
    }

    return userData;
}

/**
 * React hook for safe profile updates with data integrity checks
 */
export function useSafeProfileUpdate() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [integrityCheck, setIntegrityCheck] = useState<DataIntegrityVerification | null>(null);

    const updateProfile = async (profileData: any) => {
        setLoading(true);
        setError(null);
        setIntegrityCheck(null);

        try {
            const result = await updateProfileSafely(profileData);

            if (!result.success) {
                setError(result.error || 'Failed to update profile');
                return null;
            }

            if (result.integrityCheck) {
                setIntegrityCheck(result.integrityCheck);
            }

            return result.user;
        } catch (err) {
            const errorMessage = `Profile update failed: ${err}`;
            setError(errorMessage);
            return null;
        } finally {
            setLoading(false);
        }
    };

    return {
        updateProfile,
        loading,
        error,
        integrityCheck
    };
}

/**
 * React hook for UID-based user data fetching
 */
export function useUidBasedUserData() {
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchUserData = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await getAllUserDataByUid();

            if (!result.success) {
                setError(result.error || 'Failed to fetch user data');
                return null;
            }

            setUserData(result.data);
            return result.data;
        } catch (err) {
            const errorMessage = `Failed to fetch user data: ${err}`;
            setError(errorMessage);
            return null;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    return {
        userData,
        loading,
        error,
        refetch: fetchUserData
    };
}
