/**
 * User Data Integrity Tests
 * 
 * These tests verify that changing displayName does not cause data loss
 * and that all user data remains accessible via Firebase Auth UID.
 */

import {
    updateUserProfileSafely,
    createMissionWithUidReferences,
    createSubmissionWithUidReferences,
    verifyDataIntegrityAfterDisplayNameChange,
    isValidUid
} from '../utils/user-data-integrity';

// Mock Firebase Admin for testing
const mockFirestore = {
    collection: jest.fn(() => ({
        doc: jest.fn(() => ({
            get: jest.fn(),
            set: jest.fn(),
            update: jest.fn()
        })),
        add: jest.fn(),
        where: jest.fn(() => ({
            limit: jest.fn(() => ({
                get: jest.fn()
            })),
            get: jest.fn()
        }))
    }))
};

jest.mock('firebase-admin', () => ({
    firestore: jest.fn(() => mockFirestore)
}));

// Global test constants
const mockUserId = 'testuid1234567890123456789012'; // 28 chars
const mockDisplayName = 'Test User';
const mockNewDisplayName = 'Updated User Name';

describe('User Data Integrity', () => {
    const mockEmail = 'test@example.com';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('isValidUid', () => {
        it('should validate correct Firebase UID format', () => {
            expect(isValidUid('testuid1234567890123456789012')).toBe(true);
            expect(isValidUid('ABCDEFGHIJKLMNOPQRSTUVWXYZ12')).toBe(true);
            expect(isValidUid('1234567890123456789012345678')).toBe(true);
        });

        it('should reject invalid UID formats', () => {
            expect(isValidUid('short')).toBe(false);
            expect(isValidUid('test uid with spaces')).toBe(false);
            expect(isValidUid('test-uid-with-dashes')).toBe(false);
            expect(isValidUid('test_uid_with_underscores')).toBe(false);
            expect(isValidUid('')).toBe(false);
            expect(isValidUid('testuid12345678901234567890123')).toBe(false); // 29 chars
        });
    });

    describe('updateUserProfileSafely', () => {
        it('should create new user profile with UID as key', async () => {
            const mockDoc = {
                exists: false
            };
            const mockSet = jest.fn();
            const mockGet = jest.fn().mockResolvedValue(mockDoc);

            const mockCollection = jest.fn(() => ({
                doc: jest.fn(() => ({
                    get: mockGet,
                    set: mockSet
                }))
            }));

            Object.assign(mockFirestore, {
                collection: mockCollection
            });

            const updateData = {
                displayName: mockDisplayName,
                email: mockEmail,
                firstName: 'Test',
                lastName: 'User'
            };

            const result = await updateUserProfileSafely(mockUserId, updateData);

            expect(result.success).toBe(true);
            expect(result.updatedUser).toBeDefined();
            expect(result.updatedUser.uid).toBe(mockUserId);
            expect(mockSet).toHaveBeenCalledWith(
                expect.objectContaining({
                    uid: mockUserId,
                    displayName: mockDisplayName,
                    email: mockEmail
                }),
                { merge: true }
            );
        });

        it('should update existing user profile without changing UID', async () => {
            const existingUser = {
                uid: mockUserId,
                displayName: mockDisplayName,
                email: mockEmail,
                stats: { missions_created: 5 }
            };

            const mockDoc = {
                exists: true,
                data: () => existingUser
            };
            const mockSet = jest.fn();
            const mockGet = jest.fn()
                .mockResolvedValueOnce(mockDoc) // First call for existing user
                .mockResolvedValueOnce({ // Second call for updated user
                    exists: true,
                    data: () => ({ ...existingUser, displayName: mockNewDisplayName })
                });

            const mockCollection = jest.fn(() => ({
                doc: jest.fn(() => ({
                    get: mockGet,
                    set: mockSet
                }))
            }));

            Object.assign(mockFirestore, {
                collection: mockCollection
            });

            const updateData = {
                displayName: mockNewDisplayName
            };

            const result = await updateUserProfileSafely(mockUserId, updateData);

            expect(result.success).toBe(true);
            expect(result.updatedUser.uid).toBe(mockUserId);
            expect(result.updatedUser.displayName).toBe(mockNewDisplayName);
            expect(result.updatedUser.stats.missions_created).toBe(5); // Preserved
        });

        it('should reject invalid UID format', async () => {
            const result = await updateUserProfileSafely('invalid-uid', { displayName: 'Test' });

            expect(result.success).toBe(false);
            expect(result.error).toContain('Invalid user ID format');
        });
    });

    describe('createMissionWithUidReferences', () => {
        it('should create mission with UID as created_by', async () => {
            const mockAdd = jest.fn().mockResolvedValue({ id: 'mission123' });
            const mockCollection = jest.fn(() => ({
                add: mockAdd
            }));

            Object.assign(mockFirestore, {
                collection: mockCollection
            });

            const missionData = {
                title: 'Test Mission',
                platform: 'twitter',
                type: 'engage'
            };

            const result = await createMissionWithUidReferences(mockUserId, missionData);

            expect(result.success).toBe(true);
            expect(result.mission.created_by).toBe(mockUserId);
            expect(mockAdd).toHaveBeenCalledWith(
                expect.objectContaining({
                    created_by: mockUserId,
                    title: 'Test Mission'
                })
            );
        });

        it('should set default status to active when not specified', async () => {
            const mockSet = jest.fn().mockResolvedValue(undefined);
            const mockDoc = jest.fn(() => ({ set: mockSet }));
            const mockCollection = jest.fn(() => ({ doc: mockDoc }));

            Object.assign(mockFirestore, {
                collection: mockCollection
            });

            const missionData = {
                title: 'Test Mission',
                platform: 'twitter',
                type: 'engage'
            };

            const result = await createMissionWithUidReferences(mockUserId, missionData);

            expect(result.success).toBe(true);
            expect(mockSet).toHaveBeenCalledWith(
                expect.objectContaining({
                    created_by: mockUserId,
                    title: 'Test Mission',
                    status: 'active',
                    created_at: expect.any(Date)
                })
            );
        });

        it('should preserve custom status when specified', async () => {
            const mockSet = jest.fn().mockResolvedValue(undefined);
            const mockDoc = jest.fn(() => ({ set: mockSet }));
            const mockCollection = jest.fn(() => ({ doc: mockDoc }));

            Object.assign(mockFirestore, {
                collection: mockCollection
            });

            const missionData = {
                title: 'Test Mission',
                platform: 'twitter',
                type: 'engage',
                status: 'draft'
            };

            const result = await createMissionWithUidReferences(mockUserId, missionData);

            expect(result.success).toBe(true);
            expect(mockSet).toHaveBeenCalledWith(
                expect.objectContaining({
                    created_by: mockUserId,
                    title: 'Test Mission',
                    status: 'draft',
                    created_at: expect.any(Date)
                })
            );
        });

        it('should reject mission creation with invalid UID', async () => {
            const result = await createMissionWithUidReferences('invalid-uid', { title: 'Test' });

            expect(result.success).toBe(false);
            expect(result.error).toContain('Invalid user ID format');
        });
    });

    describe('createSubmissionWithUidReferences', () => {
        it('should create submission with UID as user_id', async () => {
            const mockAdd = jest.fn().mockResolvedValue({ id: 'submission123' });
            const mockCollection = jest.fn(() => ({
                add: mockAdd
            }));

            Object.assign(mockFirestore, {
                collection: mockCollection
            });

            const submissionData = {
                mission_id: 'mission123',
                content_url: 'https://example.com'
            };

            const result = await createSubmissionWithUidReferences(mockUserId, submissionData);

            expect(result.success).toBe(true);
            expect(result.submission.user_id).toBe(mockUserId);
            expect(mockAdd).toHaveBeenCalledWith(
                expect.objectContaining({
                    user_id: mockUserId,
                    mission_id: 'mission123'
                })
            );
        });
    });

    describe('verifyDataIntegrityAfterDisplayNameChange', () => {
        it('should verify data integrity after displayName change', async () => {
            const mockUserData = {
                uid: mockUserId,
                displayName: mockNewDisplayName,
                email: mockEmail
            };

            const mockMissions = [
                { id: 'mission1', created_by: mockUserId, title: 'Mission 1' },
                { id: 'mission2', created_by: mockUserId, title: 'Mission 2' }
            ];

            const mockSubmissions = [
                { id: 'sub1', user_id: mockUserId, mission_id: 'mission1' }
            ];

            const mockReviews = [
                { id: 'review1', user_id: mockUserId, rating: 5 }
            ];

            const mockHonorsLedger = [
                { id: 'honor1', user_id: mockUserId, amount: 100 }
            ];

            // Mock getUserDataByUid
            jest.fn().mockResolvedValue({
                success: true,
                user: mockUserData
            });

            // Mock getAllUserDataByUid
            jest.fn().mockResolvedValue({
                success: true,
                data: {
                    user: mockUserData,
                    missions: mockMissions,
                    submissions: mockSubmissions,
                    reviews: mockReviews,
                    honorsLedger: mockHonorsLedger
                }
            });

            // Mock the collection queries
            const mockWhere = jest.fn(() => ({
                get: jest.fn().mockResolvedValue({
                    docs: mockMissions.map(mission => ({ id: mission.id, data: () => mission }))
                })
            }));

            const mockCollection = jest.fn(() => ({
                where: mockWhere
            }));

            Object.assign(mockFirestore, {
                collection: mockCollection
            });

            const result = await verifyDataIntegrityAfterDisplayNameChange(
                mockUserId,
                mockDisplayName,
                mockNewDisplayName
            );

            expect(result.success).toBe(true);
            expect(result.verified).toBe(true);
            expect(result.issues).toHaveLength(0);
            expect(result.dataCounts).toEqual({
                missions: 2,
                submissions: 1,
                reviews: 1,
                honorsLedger: 1
            });
        });

        it('should detect data integrity issues', async () => {
            // Mock missions that still reference old displayName (should not happen with UID-based system)
            const mockMissions = [
                { id: 'mission1', created_by: mockDisplayName, title: 'Mission 1' } // Wrong reference
            ];

            const mockWhere = jest.fn(() => ({
                get: jest.fn().mockResolvedValue({
                    docs: mockMissions.map(mission => ({ id: mission.id, data: () => mission }))
                })
            }));

            const mockCollection = jest.fn(() => ({
                where: mockWhere
            }));

            Object.assign(mockFirestore, {
                collection: mockCollection
            });

            const result = await verifyDataIntegrityAfterDisplayNameChange(
                mockUserId,
                mockDisplayName,
                mockNewDisplayName
            );

            expect(result.success).toBe(true);
            expect(result.verified).toBe(false);
            expect(result.issues).toContain('1 missions still reference old displayName');
        });

        it('should reject verification with invalid UID', async () => {
            const result = await verifyDataIntegrityAfterDisplayNameChange(
                'invalid-uid',
                mockDisplayName,
                mockNewDisplayName
            );

            expect(result.success).toBe(false);
            expect(result.verified).toBe(false);
            expect(result.issues).toContain('Invalid user ID format');
        });
    });

    describe('Integration Tests', () => {
        it('should maintain data integrity through complete displayName change workflow', async () => {
            // This test simulates the complete workflow:
            // 1. User changes displayName
            // 2. Profile is updated safely
            // 3. Data integrity is verified
            // 4. All user data remains accessible

            const initialDisplayName = 'Initial Name';
            const newDisplayName = 'New Display Name';

            // Step 1: Create initial user profile
            const createResult = await updateUserProfileSafely(mockUserId, {
                displayName: initialDisplayName,
                email: mockEmail
            });
            expect(createResult.success).toBe(true);

            // Step 2: Create some user data (missions, submissions)
            const missionResult = await createMissionWithUidReferences(mockUserId, {
                title: 'Test Mission',
                platform: 'twitter',
                type: 'engage'
            });
            expect(missionResult.success).toBe(true);

            const submissionResult = await createSubmissionWithUidReferences(mockUserId, {
                mission_id: missionResult.mission.id,
                content_url: 'https://example.com'
            });
            expect(submissionResult.success).toBe(true);

            // Step 3: Update displayName
            const updateResult = await updateUserProfileSafely(mockUserId, {
                displayName: newDisplayName
            });
            expect(updateResult.success).toBe(true);
            expect(updateResult.updatedUser.displayName).toBe(newDisplayName);

            // Step 4: Verify data integrity
            const verifyResult = await verifyDataIntegrityAfterDisplayNameChange(
                mockUserId,
                initialDisplayName,
                newDisplayName
            );
            expect(verifyResult.success).toBe(true);
            expect(verifyResult.verified).toBe(true);

            // Step 5: Verify all data is still accessible by UID
            // (This would be tested with actual database queries in integration tests)
        });
    });
});

describe('Data Loss Prevention', () => {
    it('should prevent data loss when displayName contains special characters', async () => {
        const specialDisplayName = 'User Name with Spaces & Special Chars!';
        const newDisplayName = 'Another Name with Different Chars@#$';

        const result = await updateUserProfileSafely(mockUserId, {
            displayName: specialDisplayName
        });
        expect(result.success).toBe(true);

        const updateResult = await updateUserProfileSafely(mockUserId, {
            displayName: newDisplayName
        });
        expect(updateResult.success).toBe(true);
        expect(updateResult.updatedUser.uid).toBe(mockUserId); // UID unchanged
    });

    it('should handle empty displayName gracefully', async () => {
        const result = await updateUserProfileSafely(mockUserId, {
            displayName: ''
        });
        expect(result.success).toBe(true);
        expect(result.updatedUser.uid).toBe(mockUserId);
    });

    it('should preserve all user statistics during displayName changes', async () => {
        const initialStats = {
            missions_created: 10,
            missions_completed: 5,
            total_honors_earned: 1000,
            total_usd_earned: 50
        };

        // Create user with initial stats
        const createResult = await updateUserProfileSafely(mockUserId, {
            displayName: 'Initial Name',
            stats: initialStats
        });
        expect(createResult.success).toBe(true);

        // Update displayName
        const updateResult = await updateUserProfileSafely(mockUserId, {
            displayName: 'Updated Name'
        });
        expect(updateResult.success).toBe(true);

        // Verify stats are preserved
        expect(updateResult.updatedUser.stats).toEqual(initialStats);
    });
});
