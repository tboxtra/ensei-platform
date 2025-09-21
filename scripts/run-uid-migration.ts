#!/usr/bin/env tsx

/**
 * UID Migration Runner Script
 * 
 * This script runs the UID-based migration to ensure all Firestore documents
 * use Firebase Auth UID as the primary key instead of displayName.
 * 
 * Usage:
 *   npm run migrate:uid
 *   or
 *   tsx scripts/run-uid-migration.ts
 */

import * as admin from 'firebase-admin';
import { runMigration } from '../functions/src/migration/uid-migration';

// Initialize Firebase Admin
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    : undefined;

if (!serviceAccount) {
    console.error('❌ FIREBASE_SERVICE_ACCOUNT_KEY environment variable is required');
    console.error('   Please set it to your Firebase service account JSON key');
    process.exit(1);
}

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID || 'ensei-platform'
});

console.log('🚀 Starting UID-based migration...');
console.log('📋 This will ensure all Firestore documents use Firebase Auth UID as primary key');
console.log('⚠️  This is a one-time migration. Make sure to backup your data first!');
console.log('');

// Ask for confirmation
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Do you want to proceed with the migration? (yes/no): ', async (answer) => {
    if (answer.toLowerCase() !== 'yes') {
        console.log('❌ Migration cancelled by user');
        rl.close();
        process.exit(0);
    }

    try {
        console.log('🔄 Running migration...');
        await runMigration();
        console.log('✅ Migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        rl.close();
        process.exit(0);
    }
});
