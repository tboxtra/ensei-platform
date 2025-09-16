'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ModernLayout } from '../../../components/layout/ModernLayout';
import { ModernCard } from '../../../components/ui/ModernCard';
import { ModernButton } from '../../../components/ui/ModernButton';
import { useAuth } from '../../../contexts/UserAuthContext';
import { getFirebaseAuth } from '../../../lib/firebase';

export default function VerifyEmailPage() {
    const router = useRouter();
    const { user, isEmailVerified, sendEmailVerification, isLoading } = useAuth();
    const [resendLoading, setResendLoading] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);
    const [resendError, setResendError] = useState('');

    // Redirect if user is not authenticated
    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/auth/login');
        }
    }, [user, isLoading, router]);

    // Redirect if email is already verified
    useEffect(() => {
        if (!isLoading && user && isEmailVerified) {
            router.push('/dashboard');
        }
    }, [user, isEmailVerified, isLoading, router]);

    const handleResendVerification = async () => {
        setResendLoading(true);
        setResendError('');
        setResendSuccess(false);

        try {
            await sendEmailVerification();
            setResendSuccess(true);
            // Clear success message after 5 seconds
            setTimeout(() => setResendSuccess(false), 5000);
        } catch (error: any) {
            console.error('Error resending verification email:', error);
            let errorMessage = 'Failed to resend verification email';
            
            // Provide more specific error messages
            if (error.code === 'auth/too-many-requests') {
                errorMessage = 'Too many requests. Please wait a few minutes before trying again.';
            } else if (error.code === 'auth/user-not-found') {
                errorMessage = 'User not found. Please try logging in again.';
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            setResendError(errorMessage);
        } finally {
            setResendLoading(false);
        }
    };

    // Auto-check verification status every 3 seconds
    useEffect(() => {
        if (!user || isEmailVerified) return;

        let checkCount = 0;
        const maxChecks = 60; // Stop checking after 3 minutes (60 * 3 seconds)

        const checkVerification = async () => {
            try {
                checkCount++;
                
                // Force refresh the user's auth state from Firebase
                const auth = getFirebaseAuth();
                if (auth.currentUser) {
                    await auth.currentUser.reload();
                    const updatedUser = auth.currentUser;
                    
                    if (updatedUser.emailVerified) {
                        // Update localStorage with verified status
                        const userData = JSON.parse(localStorage.getItem('user') || '{}');
                        userData.emailVerified = true;
                        localStorage.setItem('user', JSON.stringify(userData));
                        
                        // Redirect to dashboard
                        router.push('/dashboard');
                        return true; // Stop checking
                    }
                }
                
                // Stop checking after max attempts
                if (checkCount >= maxChecks) {
                    console.log('Stopped checking verification status after maximum attempts');
                    return true; // Stop checking
                }
                
                return false; // Continue checking
            } catch (error) {
                console.error('Error checking verification status:', error);
                return false; // Continue checking on error
            }
        };

        // Check immediately
        checkVerification();

        // Set up interval to check every 3 seconds
        const interval = setInterval(async () => {
            const shouldStop = await checkVerification();
            if (shouldStop) {
                clearInterval(interval);
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [user, isEmailVerified, router]);

    if (isLoading) {
        return (
            <ModernLayout currentPage="/auth/verify-email">
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
                        <p className="text-gray-400">Loading...</p>
                    </div>
                </div>
            </ModernLayout>
        );
    }

    if (!user) {
        return null; // Will redirect to login
    }

    if (isEmailVerified) {
        return null; // Will redirect to dashboard
    }

    return (
        <ModernLayout currentPage="/auth/verify-email">
            <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    {/* Header */}
                    <div className="text-center">
                        <div className="text-6xl mb-4">📧</div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 via-emerald-500 to-blue-500 bg-clip-text text-transparent mb-2">
                            Verify Your Email
                        </h1>
                        <p className="text-gray-400">
                            We've sent a verification link to your email address
                        </p>
                    </div>

                    <ModernCard className="p-8">
                        <div className="text-center space-y-6">
                            {/* Email Address */}
                            <div className="bg-gray-800/50 rounded-lg p-4">
                                <p className="text-sm text-gray-400 mb-1">Verification email sent to:</p>
                                <p className="text-lg font-semibold text-white">{user.email}</p>
                            </div>

                            {/* Simple Instructions */}
                            <div className="text-center space-y-3">
                                <p className="text-gray-300">
                                    Check your email and click the verification link. You'll be automatically redirected once verified.
                                </p>
                                
                                {/* Auto-check indicator */}
                                <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
                                    <span>Checking verification status...</span>
                                </div>
                            </div>

                            {/* Resend Button */}
                            <ModernButton
                                onClick={handleResendVerification}
                                variant="secondary"
                                className="w-full"
                                loading={resendLoading}
                                disabled={resendLoading}
                            >
                                {resendLoading ? 'Sending...' : '📤 Resend Email'}
                            </ModernButton>

                            {/* Status Messages */}
                            {resendSuccess && (
                                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                                    <p className="text-green-400 text-sm">
                                        ✅ Verification email sent! Check your inbox.
                                    </p>
                                </div>
                            )}

                            {resendError && (
                                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                                    <p className="text-red-400 text-sm">
                                        ❌ {resendError}
                                    </p>
                                </div>
                            )}
                        </div>
                    </ModernCard>

                    {/* Back to Login */}
                    <div className="text-center">
                        <Link
                            href="/auth/login"
                            className="text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            ← Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </ModernLayout>
    );
}
