/**
 * Optimized Error Handling System
 * Industry Standard: Async error logging, optimized circuit breakers, and performance monitoring
 */

import { config } from '../config/environment';

// Error types and interfaces
interface ErrorContext {
    userId?: string;
    sessionId?: string;
    requestId?: string;
    endpoint?: string;
    timestamp: Date;
    userAgent?: string;
    ip?: string;
}

interface ErrorMetrics {
    errorCount: number;
    lastErrorTime: Date;
    errorRate: number;
    circuitBreakerState: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
}

interface CircuitBreakerConfig {
    failureThreshold: number;
    recoveryTimeout: number;
    monitoringPeriod: number;
    halfOpenMaxCalls: number;
}

// Optimized circuit breaker implementation
class OptimizedCircuitBreaker {
    private config: CircuitBreakerConfig;
    private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
    private failureCount = 0;
    private lastFailureTime: Date | null = null;
    private halfOpenCalls = 0;
    private successCount = 0;
    private totalCalls = 0;

    constructor(config: CircuitBreakerConfig) {
        this.config = config;
    }

    async execute<T>(operation: () => Promise<T>): Promise<T> {
        if (this.state === 'OPEN') {
            if (this.shouldAttemptReset()) {
                this.state = 'HALF_OPEN';
                this.halfOpenCalls = 0;
            } else {
                throw new Error('Circuit breaker is OPEN');
            }
        }

        if (this.state === 'HALF_OPEN' && this.halfOpenCalls >= this.config.halfOpenMaxCalls) {
            throw new Error('Circuit breaker HALF_OPEN limit reached');
        }

        try {
            this.totalCalls++;
            if (this.state === 'HALF_OPEN') {
                this.halfOpenCalls++;
            }

            const result = await operation();
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }

    private onSuccess(): void {
        this.successCount++;
        this.failureCount = 0;

        if (this.state === 'HALF_OPEN') {
            this.state = 'CLOSED';
        }
    }

    private onFailure(): void {
        this.failureCount++;
        this.lastFailureTime = new Date();

        if (this.failureCount >= this.config.failureThreshold) {
            this.state = 'OPEN';
        }
    }

    private shouldAttemptReset(): boolean {
        if (!this.lastFailureTime) return false;
        const timeSinceLastFailure = Date.now() - this.lastFailureTime.getTime();
        return timeSinceLastFailure >= this.config.recoveryTimeout;
    }

    getState(): 'CLOSED' | 'OPEN' | 'HALF_OPEN' {
        return this.state;
    }

    getMetrics(): ErrorMetrics {
        return {
            errorCount: this.failureCount,
            lastErrorTime: this.lastFailureTime || new Date(),
            errorRate: this.totalCalls > 0 ? this.failureCount / this.totalCalls : 0,
            circuitBreakerState: this.state,
        };
    }
}

// Async error logger with batching
class AsyncErrorLogger {
    private logQueue: Array<{ error: Error; context: ErrorContext }> = [];
    private batchSize = 10;
    private flushInterval = 5000; // 5 seconds
    private isFlushing = false;
    private flushTimer: NodeJS.Timeout | null = null;

    constructor() {
        this.startFlushTimer();
    }

    async logError(error: Error, context: ErrorContext): Promise<void> {
        this.logQueue.push({ error, context });

        if (this.logQueue.length >= this.batchSize) {
            await this.flush();
        }
    }

    private startFlushTimer(): void {
        this.flushTimer = setInterval(async () => {
            if (this.logQueue.length > 0) {
                await this.flush();
            }
        }, this.flushInterval);
    }

    private async flush(): Promise<void> {
        if (this.isFlushing || this.logQueue.length === 0) return;

        this.isFlushing = true;
        const batch = this.logQueue.splice(0, this.batchSize);

        try {
            await this.sendBatchToLoggingService(batch);
        } catch (error) {
            console.error('Failed to flush error logs:', error);
            // Re-queue failed logs
            this.logQueue.unshift(...batch);
        } finally {
            this.isFlushing = false;
        }
    }

    private async sendBatchToLoggingService(batch: Array<{ error: Error; context: ErrorContext }>): Promise<void> {
        // Send to Sentry, CloudWatch, or other logging service
        if (config.monitoring.errorTracking && process.env.SENTRY_DSN) {
            // Sentry integration (commented out until @sentry/nextjs is installed)
            // TODO: Install @sentry/nextjs package and uncomment this section
            console.log('Sentry integration would be here:', batch);
        } else {
            // Fallback to console logging
            console.error('Error batch:', batch);
        }
    }

    destroy(): void {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
        }

        // Flush remaining logs
        if (this.logQueue.length > 0) {
            this.flush();
        }
    }
}

// Performance monitoring
class PerformanceMonitor {
    private metrics: Map<string, { count: number; totalTime: number; avgTime: number }> = new Map();
    private slowOperationThreshold = 1000; // 1 second

    async monitor<T>(operation: () => Promise<T>, operationName: string): Promise<T> {
        const startTime = Date.now();

        try {
            const result = await operation();
            const duration = Date.now() - startTime;

            this.recordMetric(operationName, duration);

            if (duration > this.slowOperationThreshold) {
                console.warn(`Slow operation detected: ${operationName} took ${duration}ms`);
            }

            return result;
        } catch (error) {
            const duration = Date.now() - startTime;
            this.recordMetric(`${operationName}_error`, duration);
            throw error;
        }
    }

    private recordMetric(operationName: string, duration: number): void {
        const existing = this.metrics.get(operationName) || { count: 0, totalTime: 0, avgTime: 0 };

        existing.count++;
        existing.totalTime += duration;
        existing.avgTime = existing.totalTime / existing.count;

        this.metrics.set(operationName, existing);
    }

    getMetrics(): Map<string, { count: number; totalTime: number; avgTime: number }> {
        return new Map(this.metrics);
    }

    getSlowOperations(): Array<{ name: string; avgTime: number; count: number }> {
        return Array.from(this.metrics.entries())
            .filter(([_, metrics]) => metrics.avgTime > this.slowOperationThreshold)
            .map(([name, metrics]) => ({ name, avgTime: metrics.avgTime, count: metrics.count }))
            .sort((a, b) => b.avgTime - a.avgTime);
    }
}

// Main error handler class
class OptimizedErrorHandler {
    private circuitBreakers: Map<string, OptimizedCircuitBreaker> = new Map();
    private errorLogger: AsyncErrorLogger;
    private performanceMonitor: PerformanceMonitor;
    private errorCounts: Map<string, number> = new Map();
    private lastErrorTime: Map<string, Date> = new Map();

    constructor() {
        this.errorLogger = new AsyncErrorLogger();
        this.performanceMonitor = new PerformanceMonitor();

        // Initialize circuit breakers for different services
        this.initializeCircuitBreakers();
    }

    private initializeCircuitBreakers(): void {
        // Database operations circuit breaker
        this.circuitBreakers.set('database', new OptimizedCircuitBreaker({
            failureThreshold: 5,
            recoveryTimeout: 30000, // 30 seconds
            monitoringPeriod: 60000, // 1 minute
            halfOpenMaxCalls: 3,
        }));

        // External API circuit breaker
        this.circuitBreakers.set('external_api', new OptimizedCircuitBreaker({
            failureThreshold: 3,
            recoveryTimeout: 60000, // 1 minute
            monitoringPeriod: 120000, // 2 minutes
            halfOpenMaxCalls: 2,
        }));

        // File operations circuit breaker
        this.circuitBreakers.set('file_operations', new OptimizedCircuitBreaker({
            failureThreshold: 10,
            recoveryTimeout: 15000, // 15 seconds
            monitoringPeriod: 30000, // 30 seconds
            halfOpenMaxCalls: 5,
        }));
    }

    // Handle errors with context
    async handleError(error: Error, context: ErrorContext, service?: string): Promise<void> {
        // Update error counts
        const errorKey = `${service || 'unknown'}:${error.name}`;
        const currentCount = this.errorCounts.get(errorKey) || 0;
        this.errorCounts.set(errorKey, currentCount + 1);
        this.lastErrorTime.set(errorKey, new Date());

        // Log error asynchronously
        await this.errorLogger.logError(error, context);

        // Check if we should trigger circuit breaker
        if (service && this.circuitBreakers.has(service)) {
            const circuitBreaker = this.circuitBreakers.get(service)!;
            if (circuitBreaker.getState() === 'OPEN') {
                console.warn(`Circuit breaker for ${service} is OPEN`);
            }
        }

        // Log critical errors immediately
        if (this.isCriticalError(error)) {
            console.error('Critical error:', error, context);
        }
    }

    // Execute operation with circuit breaker protection
    async executeWithCircuitBreaker<T>(
        operation: () => Promise<T>,
        service: string,
        operationName?: string
    ): Promise<T> {
        const circuitBreaker = this.circuitBreakers.get(service);

        if (!circuitBreaker) {
            throw new Error(`No circuit breaker configured for service: ${service}`);
        }

        const wrappedOperation = operationName
            ? () => this.performanceMonitor.monitor(operation, operationName)
            : operation;

        return circuitBreaker.execute(wrappedOperation);
    }

    // Check if error is critical
    private isCriticalError(error: Error): boolean {
        const criticalErrorTypes = [
            'DatabaseConnectionError',
            'AuthenticationError',
            'AuthorizationError',
            'ValidationError',
            'SecurityError',
        ];

        return criticalErrorTypes.includes(error.name) ||
            error.message.includes('critical') ||
            error.message.includes('security');
    }

    // Get error statistics
    getErrorStatistics(): {
        totalErrors: number;
        errorCounts: Map<string, number>;
        circuitBreakerStates: Map<string, 'CLOSED' | 'OPEN' | 'HALF_OPEN'>;
        slowOperations: Array<{ name: string; avgTime: number; count: number }>;
    } {
        const totalErrors = Array.from(this.errorCounts.values()).reduce((sum, count) => sum + count, 0);

        const circuitBreakerStates = new Map();
        const entries = Array.from(this.circuitBreakers.entries());
        for (const [service, breaker] of entries) {
            circuitBreakerStates.set(service, breaker.getState());
        }

        return {
            totalErrors,
            errorCounts: new Map(this.errorCounts),
            circuitBreakerStates,
            slowOperations: this.performanceMonitor.getSlowOperations(),
        };
    }

    // Health check
    async healthCheck(): Promise<{
        healthy: boolean;
        issues: string[];
        metrics: any;
    }> {
        const issues: string[] = [];
        const metrics = this.getErrorStatistics();

        // Check circuit breaker states
        const circuitBreakerEntries = Array.from(metrics.circuitBreakerStates.entries());
        for (const [service, state] of circuitBreakerEntries) {
            if (state === 'OPEN') {
                issues.push(`Circuit breaker for ${service} is OPEN`);
            }
        }

        // Check error rates
        const totalErrors = metrics.totalErrors;
        if (totalErrors > 100) { // Threshold for high error count
            issues.push(`High error count: ${totalErrors}`);
        }

        // Check slow operations
        if (metrics.slowOperations.length > 0) {
            issues.push(`Slow operations detected: ${metrics.slowOperations.length}`);
        }

        return {
            healthy: issues.length === 0,
            issues,
            metrics,
        };
    }

    // Cleanup
    destroy(): void {
        this.errorLogger.destroy();
    }
}

// Singleton instance
export const errorHandler = new OptimizedErrorHandler();

// Utility functions
export const handleError = async (error: Error, context: ErrorContext, service?: string): Promise<void> => {
    return errorHandler.handleError(error, context, service);
};

export const executeWithCircuitBreaker = async <T>(
    operation: () => Promise<T>,
    service: string,
    operationName?: string
): Promise<T> => {
    return errorHandler.executeWithCircuitBreaker(operation, service, operationName);
};

export const getErrorStatistics = () => {
    return errorHandler.getErrorStatistics();
};

export const healthCheck = async () => {
    return errorHandler.healthCheck();
};

// Export types and classes
export type { ErrorContext, ErrorMetrics, CircuitBreakerConfig };
export { OptimizedCircuitBreaker, AsyncErrorLogger, PerformanceMonitor, OptimizedErrorHandler };

