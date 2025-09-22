"use strict";
/**
 * Firebase UID Migration Script
 *
 * This script ensures all Firestore documents use Firebase Auth UID as the primary key
 * and migrates any documents that might be using displayName as a key.
 *
 * Run this script once to migrate existing data and ensure data integrity.
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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runMigration = exports.migrateToUidBasedKeys = void 0;
const firebaseAdmin = __importStar(require("firebase-admin"));
// Get Firestore instance lazily to avoid initialization issues
function getDb() {
    return firebaseAdmin.firestore();
}
/**
 * Main migration function to ensure all documents use UID as primary key
 */
async function migrateToUidBasedKeys() {
    const result = {
        success: false,
        migrated: 0,
        errors: [],
        details: {
            users: 0,
            missions: 0,
            submissions: 0,
            reviews: 0,
            honorsLedger: 0
        }
    };
    try {
        console.log('🚀 Starting UID-based migration...');
        // 1. Migrate users collection
        await migrateUsersCollection(result);
        // 2. Migrate missions collection
        await migrateMissionsCollection(result);
        // 3. Migrate submissions collection
        await migrateSubmissionsCollection(result);
        // 4. Migrate reviews collection
        await migrateReviewsCollection(result);
        // 5. Migrate honors ledger collection
        await migrateHonorsLedgerCollection(result);
        // 6. Update any references in other collections
        await updateReferences(result);
        result.success = true;
        console.log('✅ Migration completed successfully!');
        console.log(`📊 Total documents migrated: ${result.migrated}`);
        console.log('📋 Details:', result.details);
    }
    catch (error) {
        console.error('❌ Migration failed:', error);
        result.errors.push(`Migration failed: ${error}`);
    }
    return result;
}
exports.migrateToUidBasedKeys = migrateToUidBasedKeys;
/**
 * Migrate users collection to ensure all documents use UID as key
 */
async function migrateUsersCollection(result) {
    console.log('👥 Migrating users collection...');
    try {
        const usersSnapshot = await getDb().collection('users').get();
        const batch = getDb().batch();
        let migratedCount = 0;
        for (const doc of usersSnapshot.docs) {
            const userData = doc.data();
            const docId = doc.id;
            // Check if document ID is not a valid UID format
            // UIDs are typically 28 characters long and contain alphanumeric characters
            if (!isValidUid(docId)) {
                console.log(`⚠️  Found user document with non-UID key: ${docId}`);
                // If userData has a uid field, use that as the new key
                if (userData.uid && isValidUid(userData.uid)) {
                    // Create new document with UID as key
                    const newUserRef = getDb().collection('users').doc(userData.uid);
                    batch.set(newUserRef, Object.assign(Object.assign({}, userData), { migrated_from: docId, migrated_at: new Date().toISOString() }));
                    // Delete old document
                    batch.delete(doc.ref);
                    migratedCount++;
                }
                else {
                    result.errors.push(`User document ${docId} has no valid UID field`);
                }
            }
        }
        if (migratedCount > 0) {
            await batch.commit();
            console.log(`✅ Migrated ${migratedCount} user documents`);
        }
        else {
            console.log('✅ Users collection already uses UID-based keys');
        }
        result.details.users = migratedCount;
        result.migrated += migratedCount;
    }
    catch (error) {
        console.error('❌ Error migrating users collection:', error);
        result.errors.push(`Users migration failed: ${error}`);
    }
}
/**
 * Migrate missions collection to ensure created_by uses UID
 */
async function migrateMissionsCollection(result) {
    console.log('🎯 Migrating missions collection...');
    try {
        const missionsSnapshot = await getDb().collection('missions').get();
        const batch = getDb().batch();
        let migratedCount = 0;
        for (const doc of missionsSnapshot.docs) {
            const missionData = doc.data();
            const docId = doc.id;
            // Check if created_by field is not a UID
            if (missionData.created_by && !isValidUid(missionData.created_by)) {
                console.log(`⚠️  Found mission with non-UID created_by: ${missionData.created_by}`);
                // Try to find the user by displayName and get their UID
                const userQuery = await getDb().collection('users')
                    .where('name', '==', missionData.created_by)
                    .limit(1)
                    .get();
                if (!userQuery.empty) {
                    const userDoc = userQuery.docs[0];
                    const userData = userDoc.data();
                    if (userData.uid) {
                        // Update mission with correct UID
                        batch.update(doc.ref, {
                            created_by: userData.uid,
                            migrated_at: new Date().toISOString()
                        });
                        migratedCount++;
                    }
                    else {
                        result.errors.push(`Mission ${docId} references user without UID: ${missionData.created_by}`);
                    }
                }
                else {
                    result.errors.push(`Mission ${docId} references non-existent user: ${missionData.created_by}`);
                }
            }
        }
        if (migratedCount > 0) {
            await batch.commit();
            console.log(`✅ Migrated ${migratedCount} mission documents`);
        }
        else {
            console.log('✅ Missions collection already uses UID-based references');
        }
        result.details.missions = migratedCount;
        result.migrated += migratedCount;
    }
    catch (error) {
        console.error('❌ Error migrating missions collection:', error);
        result.errors.push(`Missions migration failed: ${error}`);
    }
}
/**
 * Migrate submissions collection to ensure user_id uses UID
 */
async function migrateSubmissionsCollection(result) {
    console.log('📝 Migrating submissions collection...');
    try {
        const submissionsSnapshot = await getDb().collection('submissions').get();
        const batch = getDb().batch();
        let migratedCount = 0;
        for (const doc of submissionsSnapshot.docs) {
            const submissionData = doc.data();
            const docId = doc.id;
            // Check if user_id field is not a UID
            if (submissionData.user_id && !isValidUid(submissionData.user_id)) {
                console.log(`⚠️  Found submission with non-UID user_id: ${submissionData.user_id}`);
                // Try to find the user by displayName and get their UID
                const userQuery = await getDb().collection('users')
                    .where('name', '==', submissionData.user_id)
                    .limit(1)
                    .get();
                if (!userQuery.empty) {
                    const userDoc = userQuery.docs[0];
                    const userData = userDoc.data();
                    if (userData.uid) {
                        // Update submission with correct UID
                        batch.update(doc.ref, {
                            user_id: userData.uid,
                            migrated_at: new Date().toISOString()
                        });
                        migratedCount++;
                    }
                    else {
                        result.errors.push(`Submission ${docId} references user without UID: ${submissionData.user_id}`);
                    }
                }
                else {
                    result.errors.push(`Submission ${docId} references non-existent user: ${submissionData.user_id}`);
                }
            }
        }
        if (migratedCount > 0) {
            await batch.commit();
            console.log(`✅ Migrated ${migratedCount} submission documents`);
        }
        else {
            console.log('✅ Submissions collection already uses UID-based references');
        }
        result.details.submissions = migratedCount;
        result.migrated += migratedCount;
    }
    catch (error) {
        console.error('❌ Error migrating submissions collection:', error);
        result.errors.push(`Submissions migration failed: ${error}`);
    }
}
/**
 * Migrate reviews collection to ensure user_id and reviewer_id use UID
 */
async function migrateReviewsCollection(result) {
    console.log('⭐ Migrating reviews collection...');
    try {
        const reviewsSnapshot = await getDb().collection('reviews').get();
        const batch = getDb().batch();
        let migratedCount = 0;
        for (const doc of reviewsSnapshot.docs) {
            const reviewData = doc.data();
            let needsUpdate = false;
            const updates = {};
            // Check user_id field
            if (reviewData.user_id && !isValidUid(reviewData.user_id)) {
                const userQuery = await getDb().collection('users')
                    .where('name', '==', reviewData.user_id)
                    .limit(1)
                    .get();
                if (!userQuery.empty) {
                    const userData = userQuery.docs[0].data();
                    if (userData.uid) {
                        updates.user_id = userData.uid;
                        needsUpdate = true;
                    }
                }
            }
            // Check reviewer_id field
            if (reviewData.reviewer_id && !isValidUid(reviewData.reviewer_id)) {
                const reviewerQuery = await getDb().collection('users')
                    .where('name', '==', reviewData.reviewer_id)
                    .limit(1)
                    .get();
                if (!reviewerQuery.empty) {
                    const reviewerData = reviewerQuery.docs[0].data();
                    if (reviewerData.uid) {
                        updates.reviewer_id = reviewerData.uid;
                        needsUpdate = true;
                    }
                }
            }
            if (needsUpdate) {
                batch.update(doc.ref, Object.assign(Object.assign({}, updates), { migrated_at: new Date().toISOString() }));
                migratedCount++;
            }
        }
        if (migratedCount > 0) {
            await batch.commit();
            console.log(`✅ Migrated ${migratedCount} review documents`);
        }
        else {
            console.log('✅ Reviews collection already uses UID-based references');
        }
        result.details.reviews = migratedCount;
        result.migrated += migratedCount;
    }
    catch (error) {
        console.error('❌ Error migrating reviews collection:', error);
        result.errors.push(`Reviews migration failed: ${error}`);
    }
}
/**
 * Migrate honors ledger collection to ensure user_id uses UID
 */
async function migrateHonorsLedgerCollection(result) {
    console.log('💰 Migrating honors ledger collection...');
    try {
        const ledgerSnapshot = await getDb().collection('honors_ledger').get();
        const batch = getDb().batch();
        let migratedCount = 0;
        for (const doc of ledgerSnapshot.docs) {
            const ledgerData = doc.data();
            const docId = doc.id;
            // Check if user_id field is not a UID
            if (ledgerData.user_id && !isValidUid(ledgerData.user_id)) {
                console.log(`⚠️  Found ledger entry with non-UID user_id: ${ledgerData.user_id}`);
                // Try to find the user by displayName and get their UID
                const userQuery = await getDb().collection('users')
                    .where('name', '==', ledgerData.user_id)
                    .limit(1)
                    .get();
                if (!userQuery.empty) {
                    const userDoc = userQuery.docs[0];
                    const userData = userDoc.data();
                    if (userData.uid) {
                        // Update ledger entry with correct UID
                        batch.update(doc.ref, {
                            user_id: userData.uid,
                            migrated_at: new Date().toISOString()
                        });
                        migratedCount++;
                    }
                    else {
                        result.errors.push(`Ledger entry ${docId} references user without UID: ${ledgerData.user_id}`);
                    }
                }
                else {
                    result.errors.push(`Ledger entry ${docId} references non-existent user: ${ledgerData.user_id}`);
                }
            }
        }
        if (migratedCount > 0) {
            await batch.commit();
            console.log(`✅ Migrated ${migratedCount} ledger documents`);
        }
        else {
            console.log('✅ Honors ledger collection already uses UID-based references');
        }
        result.details.honorsLedger = migratedCount;
        result.migrated += migratedCount;
    }
    catch (error) {
        console.error('❌ Error migrating honors ledger collection:', error);
        result.errors.push(`Honors ledger migration failed: ${error}`);
    }
}
/**
 * Update any remaining references in other collections
 */
async function updateReferences(result) {
    console.log('🔗 Updating remaining references...');
    // This function can be extended to handle any other collections
    // that might reference users by displayName instead of UID
    console.log('✅ Reference updates completed');
}
/**
 * Validate if a string is a valid Firebase UID
 */
function isValidUid(uid) {
    // Firebase UIDs are typically 28 characters long and contain alphanumeric characters
    // They don't contain special characters like spaces, which displayNames might have
    return /^[a-zA-Z0-9]{28}$/.test(uid);
}
/**
 * Run the migration (can be called from Cloud Functions or locally)
 */
async function runMigration() {
    try {
        const result = await migrateToUidBasedKeys();
        if (result.success) {
            console.log('🎉 Migration completed successfully!');
            console.log(`📊 Total documents migrated: ${result.migrated}`);
            console.log('📋 Migration details:', result.details);
            if (result.errors.length > 0) {
                console.log('⚠️  Warnings/Errors:');
                result.errors.forEach(error => console.log(`  - ${error}`));
            }
        }
        else {
            console.error('❌ Migration failed');
            result.errors.forEach(error => console.error(`  - ${error}`));
        }
    }
    catch (error) {
        console.error('💥 Migration script failed:', error);
    }
}
exports.runMigration = runMigration;
//# sourceMappingURL=uid-migration.js.map