'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ModernLayout } from '../../../components/layout/ModernLayout';
import { ModernCard } from '../../../components/ui/ModernCard';
import { ModernButton } from '../../../components/ui/ModernButton';
import { useAuth } from '../../../contexts/UserAuthContext';

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
        } catch (error: any) {
            console.error('Error resending verification email:', error);
            setResendError(error.message || 'Failed to resend verification email');
        } finally {
            setResendLoading(false);
        }
    };

    const handleCheckVerification = async () => {
        // Reload the page to check if email is verified
        window.location.reload();
    };

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

                            {/* Instructions */}
                            <div className="text-left space-y-3">
                                <h3 className="text-lg font-semibold text-white mb-3">Next Steps:</h3>
                                <div className="space-y-2 text-sm text-gray-300">
                                    <div className="flex items-start space-x-2">
                                        <span className="text-green-400 mt-1">1.</span>
                                        <span>Check your email inbox (and spam folder)</span>
                                    </div>
                                    <div className="flex items-start space-x-2">
                                        <span className="text-green-400 mt-1">2.</span>
                                        <span>Click the verification link in the email</span>
                                    </div>
                                    <div className="flex items-start space-x-2">
                                        <span className="text-green-400 mt-1">3.</span>
                                        <span>Return here and click "I've Verified My Email"</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                <ModernButton
                                    onClick={handleCheckVerification}
                                    className="w-full"
                                    size="lg"
                                >
                                    ✅ I've Verified My Email
                                </ModernButton>

                                <ModernButton
                                    onClick={handleResendVerification}
                                    variant="secondary"
                                    className="w-full"
                                    loading={resendLoading}
                                    disabled={resendLoading}
                                >
                                    {resendLoading ? 'Sending...' : '📤 Resend Verification Email'}
                                </ModernButton>
                            </div>

                            {/* Status Messages */}
                            {resendSuccess && (
                                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                                    <p className="text-green-400 text-sm">
                                        ✅ Verification email sent successfully! Check your inbox.
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

                            {/* Help Text */}
                            <div className="text-xs text-gray-500 space-y-1">
                                <p>Didn't receive the email? Check your spam folder.</p>
                                <p>Still having trouble? Contact support.</p>
                            </div>
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
