/**
 * Error Boundary Component
 * Industry Standard: React Error Boundary for graceful error handling
 * Catches JavaScript errors anywhere in the component tree
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { errorHandler } from '../lib/error-handling';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log the error
        errorHandler.handleError(error, 'ErrorBoundary', {
            showToast: false,
            logError: true
        });

        this.setState({
            error,
            errorInfo
        });

        // Call custom error handler if provided
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
    }

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default fallback UI
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-900">
                    <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg p-6">
                        <div className="flex items-center mb-4">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-bold">!</span>
                                </div>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-lg font-medium text-white">
                                    Something went wrong
                                </h3>
                            </div>
                        </div>

                        <div className="mb-4">
                            <p className="text-gray-300 text-sm">
                                We're sorry, but something unexpected happened. Please try refreshing the page.
                            </p>
                        </div>

                        <div className="flex space-x-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                            >
                                Refresh Page
                            </button>
                            <button
                                onClick={() => this.setState({ hasError: false, error: undefined, errorInfo: undefined })}
                                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                            >
                                Try Again
                            </button>
                        </div>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mt-4">
                                <summary className="text-gray-400 text-sm cursor-pointer hover:text-gray-300">
                                    Error Details (Development)
                                </summary>
                                <div className="mt-2 p-3 bg-gray-900 rounded-md">
                                    <pre className="text-red-400 text-xs overflow-auto">
                                        {this.state.error.toString()}
                                        {this.state.errorInfo?.componentStack}
                                    </pre>
                                </div>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
    Component: React.ComponentType<P>,
    fallback?: ReactNode
) {
    return function WrappedComponent(props: P) {
        return (
            <ErrorBoundary fallback={fallback}>
                <Component {...props} />
            </ErrorBoundary>
        );
    };
}

// Hook for error boundary functionality in functional components
export function useErrorHandler() {
    const handleError = (error: Error, context?: string) => {
        errorHandler.handleError(error, context);
    };

    return { handleError };
}
