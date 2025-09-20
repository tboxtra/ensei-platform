/**
 * Unified Error Handling System
 * Industry Standard: Consistent error handling across the entire application
 * Single source of truth for error management
 */

export interface AppError {
    code: string;
    message: string;
    details?: any;
    timestamp: Date;
    context?: string;
    userId?: string;
    sessionId?: string;
}

export interface ErrorHandlingOptions {
    showToast?: boolean;
    logError?: boolean;
    retryable?: boolean;
    maxRetries?: number;
    retryDelay?: number;
    fallbackMessage?: string;
}

export class ErrorHandler {
    private static instance: ErrorHandler;
    private errorLog: AppError[] = [];
    private maxLogSize = 100;

    private constructor() { }

    public static getInstance(): ErrorHandler {
        if (!ErrorHandler.instance) {
            ErrorHandler.instance = new ErrorHandler();
        }
        return ErrorHandler.instance;
    }

    /**
     * Handle application errors with consistent patterns
     */
    public handleError(
        error: Error | any,
        context: string = 'Unknown',
        options: ErrorHandlingOptions = {}
    ): AppError {
        const {
            showToast = true,
            logError = true,
            retryable = false,
            maxRetries = 3,
            retryDelay = 1000,
            fallbackMessage = 'An unexpected error occurred'
        } = options;

        const appError: AppError = {
            code: this.getErrorCode(error),
            message: this.getErrorMessage(error, fallbackMessage),
            details: this.getErrorDetails(error),
            timestamp: new Date(),
            context,
            userId: this.getCurrentUserId(),
            sessionId: this.getCurrentSessionId()
        };

        if (logError) {
            this.logError(appError);
        }

        if (showToast) {
            this.showErrorToast(appError);
        }

        return appError;
    }

    /**
     * Handle network errors with retry logic
     */
    public async handleNetworkError<T>(
        operation: () => Promise<T>,
        context: string = 'Network Operation',
        options: ErrorHandlingOptions = {}
    ): Promise<T> {
        const {
            maxRetries = 3,
            retryDelay = 1000,
            fallbackMessage = 'Network error occurred'
        } = options;

        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error as Error;

                if (attempt === maxRetries) {
                    const appError = this.handleError(error, context, {
                        ...options,
                        fallbackMessage
                    });
                    throw appError;
                }

                // Wait before retry
                await this.delay(retryDelay * attempt);
            }
        }

        throw lastError;
    }

    /**
     * Handle API errors with consistent formatting
     */
    public handleApiError(
        error: any,
        endpoint: string,
        method: string = 'GET'
    ): AppError {
        const context = `API ${method} ${endpoint}`;

        let message = 'API request failed';
        let code = 'API_ERROR';

        if (error.response) {
            // Server responded with error status
            const status = error.response.status;
            const data = error.response.data;

            code = `API_${status}`;

            switch (status) {
                case 400:
                    message = data?.message || 'Bad request';
                    break;
                case 401:
                    message = 'Authentication required';
                    break;
                case 403:
                    message = 'Access denied';
                    break;
                case 404:
                    message = 'Resource not found';
                    break;
                case 429:
                    message = 'Too many requests';
                    break;
                case 500:
                    message = 'Server error';
                    break;
                default:
                    message = data?.message || `HTTP ${status} error`;
            }
        } else if (error.request) {
            // Network error
            code = 'NETWORK_ERROR';
            message = 'Network connection failed';
        } else {
            // Other error
            message = error.message || 'Unknown API error';
        }

        return this.handleError(
            { ...error, message, code },
            context,
            { retryable: true }
        );
    }

    /**
     * Handle validation errors
     */
    public handleValidationError(
        field: string,
        message: string,
        value?: any
    ): AppError {
        return this.handleError(
            new Error(message),
            `Validation: ${field}`,
            {
                showToast: false,
                logError: false
            }
        );
    }

    /**
     * Handle authentication errors
     */
    public handleAuthError(error: any): AppError {
        return this.handleError(
            error,
            'Authentication',
            {
                showToast: true,
                logError: true,
                fallbackMessage: 'Authentication failed'
            }
        );
    }

    /**
     * Handle Firebase errors
     */
    public handleFirebaseError(error: any, operation: string): AppError {
        let message = 'Firebase operation failed';
        let code = 'FIREBASE_ERROR';

        if (error.code) {
            code = `FIREBASE_${error.code}`;

            switch (error.code) {
                case 'permission-denied':
                    message = 'Permission denied';
                    break;
                case 'unavailable':
                    message = 'Service unavailable';
                    break;
                case 'deadline-exceeded':
                    message = 'Operation timeout';
                    break;
                case 'not-found':
                    message = 'Resource not found';
                    break;
                case 'already-exists':
                    message = 'Resource already exists';
                    break;
                case 'failed-precondition':
                    message = 'Operation not allowed';
                    break;
                default:
                    message = error.message || 'Firebase error';
            }
        }

        return this.handleError(
            { ...error, message, code },
            `Firebase: ${operation}`,
            { retryable: true }
        );
    }

    /**
     * Get error code from error object
     */
    private getErrorCode(error: any): string {
        if (error.code) return error.code;
        if (error.name) return error.name;
        if (error.status) return `HTTP_${error.status}`;
        return 'UNKNOWN_ERROR';
    }

    /**
     * Get error message from error object
     */
    private getErrorMessage(error: any, fallback: string): string {
        if (error.message) return error.message;
        if (typeof error === 'string') return error;
        return fallback;
    }

    /**
     * Get error details from error object
     */
    private getErrorDetails(error: any): any {
        const details: any = {};

        if (error.stack) details.stack = error.stack;
        if (error.response) details.response = error.response;
        if (error.request) details.request = error.request;
        if (error.config) details.config = error.config;

        return Object.keys(details).length > 0 ? details : undefined;
    }

    /**
     * Get current user ID
     */
    private getCurrentUserId(): string | undefined {
        try {
            // This would be implemented based on your auth system
            return undefined;
        } catch {
            return undefined;
        }
    }

    /**
     * Get current session ID
     */
    private getCurrentSessionId(): string | undefined {
        try {
            return sessionStorage.getItem('sessionId') || undefined;
        } catch {
            return undefined;
        }
    }

    /**
     * Log error to console and store in memory
     */
    private logError(error: AppError): void {
        console.error(`[${error.context}] ${error.code}: ${error.message}`, error.details);

        this.errorLog.push(error);

        // Keep log size manageable
        if (this.errorLog.length > this.maxLogSize) {
            this.errorLog = this.errorLog.slice(-this.maxLogSize);
        }
    }

    /**
     * Show error toast notification
     */
    private showErrorToast(error: AppError): void {
        // This would integrate with your toast notification system
        console.warn(`Toast: ${error.message}`);
    }

    /**
     * Delay utility for retry logic
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get error log for debugging
     */
    public getErrorLog(): AppError[] {
        return [...this.errorLog];
    }

    /**
     * Clear error log
     */
    public clearErrorLog(): void {
        this.errorLog = [];
    }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();

// Convenience functions
export const handleError = (error: any, context?: string, options?: ErrorHandlingOptions) =>
    errorHandler.handleError(error, context, options);

export const handleNetworkError = <T>(
    operation: () => Promise<T>,
    context?: string,
    options?: ErrorHandlingOptions
) => errorHandler.handleNetworkError(operation, context, options);

export const handleApiError = (error: any, endpoint: string, method?: string) =>
    errorHandler.handleApiError(error, endpoint, method);

export const handleValidationError = (field: string, message: string, value?: any) =>
    errorHandler.handleValidationError(field, message, value);

export const handleAuthError = (error: any) =>
    errorHandler.handleAuthError(error);

export const handleFirebaseError = (error: any, operation: string) =>
    errorHandler.handleFirebaseError(error, operation);
