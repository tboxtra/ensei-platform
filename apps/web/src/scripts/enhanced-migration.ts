/**
 * Enhanced Migration Script with Reliability Features
 * Industry Standard: Streaming migration with comprehensive error handling and monitoring
 */

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, doc, getDocs, setDoc, writeBatch, query, limit, startAfter, DocumentSnapshot } from 'firebase/firestore';
import { config } from '../config/environment';

// Migration configuration
interface MigrationConfig {
    batchSize: number;
    maxRetries: number;
    retryDelay: number;
    progressInterval: number;
    enableLogging: boolean;
    enableRollback: boolean;
}

// Migration status tracking
interface MigrationStatus {
    totalRecords: number;
    processedRecords: number;
    successfulRecords: number;
    failedRecords: number;
    startTime: Date;
    endTime?: Date;
    errors: Array<{
        recordId: string;
        error: string;
        timestamp: Date;
    }>;
    rollbackData: Array<{
        collection: string;
        docId: string;
        originalData: any;
    }>;
}

// Migration result
interface MigrationResult {
    success: boolean;
    status: MigrationStatus;
    duration: number;
    message: string;
}

class EnhancedMigrationScript {
    private db: any;
    private config: MigrationConfig;
    private status: MigrationStatus;
    private isRunning: boolean;
    private shouldStop: boolean;

    constructor(migrationConfig: Partial<MigrationConfig> = {}) {
        this.config = {
            batchSize: 100,
            maxRetries: 3,
            retryDelay: 1000,
            progressInterval: 1000,
            enableLogging: true,
            enableRollback: true,
            ...migrationConfig,
        };

        this.status = {
            totalRecords: 0,
            processedRecords: 0,
            successfulRecords: 0,
            failedRecords: 0,
            startTime: new Date(),
            errors: [],
            rollbackData: [],
        };

        this.isRunning = false;
        this.shouldStop = false;

        this.initializeFirebase();
    }

    private initializeFirebase(): void {
        try {
            if (getApps().length === 0) {
                const app = initializeApp(config.firebase);
                this.db = getFirestore(app);
            } else {
                this.db = getFirestore(getApps()[0]);
            }
        } catch (error) {
            throw new Error(`Failed to initialize Firebase: ${error}`);
        }
    }

    // Main migration method
    async migrate(): Promise<MigrationResult> {
        if (this.isRunning) {
            throw new Error('Migration is already running');
        }

        this.isRunning = true;
        this.shouldStop = false;
        this.status.startTime = new Date();

        try {
            this.log('Starting migration process...');

            // Pre-migration validation
            await this.validateMigration();

            // Get total record count
            this.status.totalRecords = await this.getTotalRecordCount();
            this.log(`Total records to migrate: ${this.status.totalRecords}`);

            // Start progress monitoring
            const progressInterval = setInterval(() => {
                this.logProgress();
            }, this.config.progressInterval);

            // Perform migration
            await this.performMigration();

            // Clear progress monitoring
            clearInterval(progressInterval);

            // Post-migration validation
            await this.validateMigrationResults();

            this.status.endTime = new Date();
            this.isRunning = false;

            const result: MigrationResult = {
                success: this.status.failedRecords === 0,
                status: this.status,
                duration: this.status.endTime.getTime() - this.status.startTime.getTime(),
                message: this.status.failedRecords === 0
                    ? 'Migration completed successfully'
                    : `Migration completed with ${this.status.failedRecords} errors`,
            };

            this.log(`Migration completed: ${result.message}`);
            return result;

        } catch (error) {
            this.isRunning = false;
            this.status.endTime = new Date();

            const result: MigrationResult = {
                success: false,
                status: this.status,
                duration: this.status.endTime.getTime() - this.status.startTime.getTime(),
                message: `Migration failed: ${error}`,
            };

            this.log(`Migration failed: ${error}`);

            // Attempt rollback if enabled
            if (this.config.enableRollback) {
                await this.attemptRollback();
            }

            return result;
        }
    }

    // Validate migration prerequisites
    private async validateMigration(): Promise<void> {
        this.log('Validating migration prerequisites...');

        // Check Firebase connection
        try {
            await this.db.collection('_migration_test').limit(1).get();
        } catch (error) {
            throw new Error(`Firebase connection failed: ${error}`);
        }

        // Check source collection exists
        const sourceCollection = await this.db.collection('mission_participations').limit(1).get();
        if (sourceCollection.empty) {
            throw new Error('Source collection is empty or does not exist');
        }

        // Check destination collection is accessible
        try {
            await this.db.collection('taskCompletions').limit(1).get();
        } catch (error) {
            throw new Error(`Destination collection access failed: ${error}`);
        }

        this.log('Migration validation passed');
    }

    // Get total record count for progress tracking
    private async getTotalRecordCount(): Promise<number> {
        try {
            const snapshot = await this.db.collection('mission_participations').get();
            return snapshot.size;
        } catch (error) {
            this.log(`Warning: Could not get total record count: ${error}`);
            return 0;
        }
    }

    // Perform the actual migration
    private async performMigration(): Promise<void> {
        let lastDoc: DocumentSnapshot | null = null;
        let hasMore = true;

        while (hasMore && !this.shouldStop) {
            try {
                // Get batch of records
                const batchQuery = query(
                    collection(this.db, 'mission_participations'),
                    limit(this.config.batchSize)
                );

                const snapshot = await this.db.collection('mission_participations')
                    .limit(this.config.batchSize)
                    .get();

                if (snapshot.empty) {
                    hasMore = false;
                    break;
                }

                // Process batch
                await this.processBatch(snapshot.docs);

                // Update last document for pagination
                lastDoc = snapshot.docs[snapshot.docs.length - 1];

                // Check if we have more records
                hasMore = snapshot.docs.length === this.config.batchSize;

            } catch (error) {
                this.log(`Error processing batch: ${error}`);
                this.status.errors.push({
                    recordId: 'batch',
                    error: String(error),
                    timestamp: new Date(),
                });

                // Continue with next batch
                continue;
            }
        }
    }

    // Process a batch of records
    private async processBatch(docs: DocumentSnapshot[]): Promise<void> {
        const batch = writeBatch(this.db);
        let batchCount = 0;

        for (const docSnapshot of docs) {
            if (this.shouldStop) break;

            try {
                const originalData = docSnapshot.data();
                if (!originalData) continue;

                // Transform data
                const transformedData = this.transformRecord(originalData, docSnapshot.id);

                // Store rollback data if enabled
                if (this.config.enableRollback) {
                    this.status.rollbackData.push({
                        collection: 'taskCompletions',
                        docId: docSnapshot.id,
                        originalData: transformedData,
                    });
                }

                // Add to batch
                const newDocRef = doc(this.db, 'taskCompletions', docSnapshot.id);
                batch.set(newDocRef, transformedData);
                batchCount++;

                this.status.processedRecords++;

            } catch (error) {
                this.log(`Error transforming record ${docSnapshot.id}: ${error}`);
                this.status.errors.push({
                    recordId: docSnapshot.id,
                    error: String(error),
                    timestamp: new Date(),
                });
                this.status.failedRecords++;
            }
        }

        // Commit batch with retry logic
        if (batchCount > 0) {
            await this.commitBatchWithRetry(batch);
            this.status.successfulRecords += batchCount;
        }
    }

    // Transform a single record
    private transformRecord(originalData: any, docId: string): any {
        return {
            id: docId,
            userId: originalData.user_id || originalData.userId,
            missionId: originalData.mission_id || originalData.missionId,
            taskId: originalData.task_id || originalData.taskId || 'default',
            completionType: originalData.completion_type || 'direct',
            status: originalData.status || 'pending',
            submittedLink: originalData.submitted_link || originalData.submittedLink,
            submittedAt: originalData.submitted_at || originalData.submittedAt || new Date().toISOString(),
            verifiedAt: originalData.verified_at || originalData.verifiedAt,
            flaggedAt: originalData.flagged_at || originalData.flaggedAt,
            flaggedBy: originalData.flagged_by || originalData.flaggedBy,
            flagReason: originalData.flag_reason || originalData.flagReason,
            verifiedBy: originalData.verified_by || originalData.verifiedBy,
            createdAt: originalData.created_at || originalData.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
    }

    // Commit batch with retry logic
    private async commitBatchWithRetry(batch: any): Promise<void> {
        let attempts = 0;

        while (attempts < this.config.maxRetries) {
            try {
                await batch.commit();
                return;
            } catch (error) {
                attempts++;
                this.log(`Batch commit attempt ${attempts} failed: ${error}`);

                if (attempts >= this.config.maxRetries) {
                    throw new Error(`Batch commit failed after ${this.config.maxRetries} attempts: ${error}`);
                }

                // Wait before retry
                await this.delay(this.config.retryDelay * attempts);
            }
        }
    }

    // Validate migration results
    private async validateMigrationResults(): Promise<void> {
        this.log('Validating migration results...');

        // Check record counts
        const sourceCount = await this.getCollectionCount('mission_participations');
        const destCount = await this.getCollectionCount('taskCompletions');

        this.log(`Source records: ${sourceCount}, Destination records: ${destCount}`);

        if (destCount < sourceCount) {
            throw new Error(`Migration incomplete: ${sourceCount - destCount} records missing`);
        }

        this.log('Migration validation passed');
    }

    // Get collection count
    private async getCollectionCount(collectionName: string): Promise<number> {
        try {
            const snapshot = await this.db.collection(collectionName).get();
            return snapshot.size;
        } catch (error) {
            this.log(`Warning: Could not get count for ${collectionName}: ${error}`);
            return 0;
        }
    }

    // Attempt rollback
    private async attemptRollback(): Promise<void> {
        if (!this.config.enableRollback || this.status.rollbackData.length === 0) {
            return;
        }

        this.log('Attempting rollback...');

        try {
            const batch = writeBatch(this.db);

            for (const rollbackItem of this.status.rollbackData) {
                const docRef = doc(this.db, rollbackItem.collection, rollbackItem.docId);
                batch.delete(docRef);
            }

            await batch.commit();
            this.log('Rollback completed successfully');
        } catch (error) {
            this.log(`Rollback failed: ${error}`);
        }
    }

    // Log progress
    private logProgress(): void {
        const progress = this.status.totalRecords > 0
            ? (this.status.processedRecords / this.status.totalRecords * 100).toFixed(2)
            : '0.00';

        this.log(`Progress: ${progress}% (${this.status.processedRecords}/${this.status.totalRecords}) - Success: ${this.status.successfulRecords}, Failed: ${this.status.failedRecords}`);
    }

    // Logging utility
    private log(message: string): void {
        if (this.config.enableLogging) {
            console.log(`[Migration] ${new Date().toISOString()}: ${message}`);
        }
    }

    // Utility delay function
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Stop migration
    public stop(): void {
        this.shouldStop = true;
        this.log('Migration stop requested');
    }

    // Get current status
    public getStatus(): MigrationStatus {
        return { ...this.status };
    }

    // Check if migration is running
    public isMigrationRunning(): boolean {
        return this.isRunning;
    }
}

// Migration factory function
export const createMigration = (config?: Partial<MigrationConfig>): EnhancedMigrationScript => {
    return new EnhancedMigrationScript(config);
};

// Pre-configured migration instances
export const createStandardMigration = (): EnhancedMigrationScript => {
    return createMigration({
        batchSize: 100,
        maxRetries: 3,
        retryDelay: 1000,
        progressInterval: 1000,
        enableLogging: true,
        enableRollback: true,
    });
};

export const createFastMigration = (): EnhancedMigrationScript => {
    return createMigration({
        batchSize: 500,
        maxRetries: 2,
        retryDelay: 500,
        progressInterval: 500,
        enableLogging: false,
        enableRollback: false,
    });
};

export const createSafeMigration = (): EnhancedMigrationScript => {
    return createMigration({
        batchSize: 50,
        maxRetries: 5,
        retryDelay: 2000,
        progressInterval: 2000,
        enableLogging: true,
        enableRollback: true,
    });
};

// Export types
export type { MigrationConfig, MigrationStatus, MigrationResult };
export { EnhancedMigrationScript };

