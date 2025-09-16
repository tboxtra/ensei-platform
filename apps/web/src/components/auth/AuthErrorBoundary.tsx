'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ModernLayout } from '../layout/ModernLayout';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class AuthErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Auth Error Boundary caught an error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <ModernLayout currentPage="/error">
                    <div className="min-h-screen flex items-center justify-center">
                        <div className="text-center max-w-md mx-auto">
                            <div className="text-6xl mb-4">⚠️</div>
                            <h1 className="text-2xl font-bold text-red-400 mb-4">
                                Authentication Error
                            </h1>
                            <p className="text-gray-400 mb-6">
                                Something went wrong with the authentication system.
                                Please try refreshing the page or contact support if the problem persists.
                            </p>
                            <div className="space-y-3">
                                <button
                                    onClick={() => window.location.reload()}
                                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                                >
                                    🔄 Refresh Page
                                </button>
                                <button
                                    onClick={() => {
                                        // Clear auth state and redirect to login
                                        localStorage.removeItem('user');
                                        localStorage.removeItem('firebaseToken');
                                        window.location.href = '/auth/login';
                                    }}
                                    className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                                >
                                    🚪 Go to Login
                                </button>
                            </div>
                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <details className="mt-6 text-left">
                                    <summary className="cursor-pointer text-sm text-gray-500">
                                        Error Details (Development Only)
                                    </summary>
                                    <pre className="mt-2 text-xs text-red-400 bg-gray-800 p-3 rounded overflow-auto">
                                        {this.state.error.stack}
                                    </pre>
                                </details>
                            )}
                        </div>
                    </div>
                </ModernLayout>
            );
        }

        return this.props.children;
    }
}
