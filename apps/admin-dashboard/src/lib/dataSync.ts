import { apiClient } from './api';

export interface DataSyncConfig {
    cacheDuration: number; // in milliseconds
    retryAttempts: number;
}

export class AdminDataSyncService {
    private static instance: AdminDataSyncService;
    private cache: Map<string, { data: any; timestamp: number }> = new Map();
    private refreshInterval: NodeJS.Timeout | null = null;

    private constructor() { }

    public static getInstance(): AdminDataSyncService {
        if (!AdminDataSyncService.instance) {
            AdminDataSyncService.instance = new AdminDataSyncService();
        }
        return AdminDataSyncService.instance;
    }

    /**
     * Get data with caching and automatic refresh
     */
    async getData<T>(
        key: string,
        query: () => Promise<T>,
        config: DataSyncConfig = { cacheDuration: 5 * 60 * 1000, retryAttempts: 3 }
    ): Promise<T> {
        const cached = this.getCachedData<T>(key, config.cacheDuration);
        if (cached) {
            return cached;
        }

        let lastError: Error | null = null;
        for (let attempt = 1; attempt <= config.retryAttempts; attempt++) {
            try {
                const data = await query();
                this.setCachedData(key, data);
                return data;
            } catch (error) {
                lastError = error as Error;
                console.warn(`AdminDataSync: Attempt ${attempt} failed for key ${key}:`, error);

                if (attempt < config.retryAttempts) {
                    // Exponential backoff
                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
                }
            }
        }

        throw lastError || new Error(`Failed to fetch data for key ${key} after ${config.retryAttempts} attempts`);
    }

    /**
     * Get missions with caching and filtering
     */
    async getMissions(filters?: {
        status?: string;
        platform?: string;
        type?: string;
        model?: string;
        page?: number;
        limit?: number;
    }): Promise<{ data: any[]; pagination: any }> {
        const cacheKey = `missions_${JSON.stringify(filters || {})}`;

        return this.getData(
            cacheKey,
            async () => {
                const response = await apiClient.getMissions(filters);
                if (response.success && response.data) {
                    return {
                        data: response.data,
                        pagination: response.pagination || {
                            page: 1,
                            limit: 20,
                            total: response.data.length,
                            totalPages: 1
                        }
                    };
                }
                throw new Error(response.message || 'Failed to fetch missions');
            },
            {
                cacheDuration: 2 * 60 * 1000, // 2 minutes cache for admin data
                retryAttempts: 3
            }
        );
    }

    /**
     * Get mission by ID with caching
     */
    async getMission(id: string): Promise<any> {
        return this.getData(
            `mission_${id}`,
            async () => {
                const response = await apiClient.getMission(id);
                if (response.success && response.data) {
                    return response.data;
                }
                throw new Error(response.message || 'Failed to fetch mission');
            },
            {
                cacheDuration: 5 * 60 * 1000, // 5 minutes cache
                retryAttempts: 3
            }
        );
    }

    /**
     * Update mission status and invalidate cache
     */
    async updateMissionStatus(id: string, status: string): Promise<void> {
        const response = await apiClient.updateMissionStatus(id, status);
        if (!response.success) {
            throw new Error(response.message || 'Failed to update mission status');
        }

        // Invalidate related caches
        this.invalidateMissionCache(id);
        this.invalidateMissionsCache();
    }

    /**
     * Create mission and invalidate cache
     */
    async createMission(missionData: any): Promise<any> {
        const response = await apiClient.createMission(missionData);
        if (!response.success) {
            throw new Error(response.message || 'Failed to create mission');
        }

        // Invalidate missions cache
        this.invalidateMissionsCache();

        return response.data;
    }

    /**
     * Start automatic refresh for critical data
     */
    startAutoRefresh(intervalMs: number = 5 * 60 * 1000): void {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }

        this.refreshInterval = setInterval(() => {
            // Refresh critical caches
            this.invalidateMissionsCache();
            console.log('AdminDataSync: Auto-refresh completed');
        }, intervalMs);
    }

    /**
     * Stop automatic refresh
     */
    stopAutoRefresh(): void {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    /**
     * Invalidate cache for a specific key
     */
    invalidateCache(key: string): void {
        this.cache.delete(key);
    }

    /**
     * Invalidate all mission-related caches
     */
    invalidateMissionsCache(): void {
        const keysToDelete: string[] = [];
        this.cache.forEach((_, key) => {
            if (key.startsWith('missions_') || key.startsWith('mission_')) {
                keysToDelete.push(key);
            }
        });
        keysToDelete.forEach(key => this.cache.delete(key));
    }

    /**
     * Invalidate cache for a specific mission
     */
    invalidateMissionCache(missionId: string): void {
        this.cache.delete(`mission_${missionId}`);
    }

    /**
     * Clear all cache
     */
    clearCache(): void {
        this.cache.clear();
    }

    /**
     * Get cached data if still valid
     */
    private getCachedData<T>(key: string, cacheDuration: number): T | null {
        const cached = this.cache.get(key);
        if (cached && (Date.now() - cached.timestamp) < cacheDuration) {
            return cached.data;
        }
        return null;
    }

    /**
     * Set cached data with timestamp
     */
    private setCachedData(key: string, data: any): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    /**
     * Cleanup resources
     */
    cleanup(): void {
        this.stopAutoRefresh();
        this.cache.clear();
    }
}

// Export singleton instance
export const adminDataSync = AdminDataSyncService.getInstance();

