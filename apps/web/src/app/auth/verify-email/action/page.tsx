'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ModernLayout } from '../../../../components/layout/ModernLayout';
import { ModernCard } from '../../../../components/ui/ModernCard';
import { ModernButton } from '../../../../components/ui/ModernButton';
import { verifyEmailWithCode, checkEmailVerificationCode } from '../../../../lib/firebase';

export default function VerifyEmailActionPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'invalid'>('loading');
    const [errorMessage, setErrorMessage] = useState('');
    const [userEmail, setUserEmail] = useState('');

    useEffect(() => {
        const verifyEmail = async () => {
            const actionCode = searchParams.get('oobCode');
            const mode = searchParams.get('mode');

            if (!actionCode || mode !== 'verifyEmail') {
                setStatus('invalid');
                return;
            }

            try {
                // First check if the code is valid
                const info = await checkEmailVerificationCode(actionCode);
                setUserEmail(info.data.email || '');

                // Then apply the verification
                await verifyEmailWithCode(actionCode);
                setStatus('success');
            } catch (error: any) {
                console.error('Email verification failed:', error);
                setErrorMessage(error.message || 'Email verification failed');
                setStatus('error');
            }
        };

        verifyEmail();
    }, [searchParams]);

    const handleContinue = () => {
        router.push('/dashboard');
    };

    const handleResend = () => {
        router.push('/auth/verify-email');
    };

    if (status === 'loading') {
        return (
            <ModernLayout currentPage="/auth/verify-email/action">
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
                        <p className="text-gray-400">Verifying your email...</p>
                    </div>
                </div>
            </ModernLayout>
        );
    }

    return (
        <ModernLayout currentPage="/auth/verify-email/action">
            <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        {status === 'success' && (
                            <>
                                <div className="text-6xl mb-4">✅</div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 via-emerald-500 to-blue-500 bg-clip-text text-transparent mb-2">
                                    Email Verified!
                                </h1>
                                <p className="text-gray-400 mb-6">
                                    Your email address has been successfully verified.
                                </p>
                                {userEmail && (
                                    <p className="text-sm text-gray-500 mb-6">
                                        Verified: {userEmail}
                                    </p>
                                )}
                                <ModernButton
                                    onClick={handleContinue}
                                    className="w-full"
                                    size="lg"
                                >
                                    Continue to Dashboard
                                </ModernButton>
                            </>
                        )}

                        {status === 'error' && (
                            <>
                                <div className="text-6xl mb-4">❌</div>
                                <h1 className="text-3xl font-bold text-red-400 mb-2">
                                    Verification Failed
                                </h1>
                                <p className="text-gray-400 mb-6">
                                    {errorMessage || 'There was an error verifying your email address.'}
                                </p>
                                <div className="space-y-3">
                                    <ModernButton
                                        onClick={handleResend}
                                        className="w-full"
                                        size="lg"
                                    >
                                        Try Again
                                    </ModernButton>
                                    <ModernButton
                                        onClick={() => router.push('/auth/login')}
                                        variant="secondary"
                                        className="w-full"
                                    >
                                        Back to Login
                                    </ModernButton>
                                </div>
                            </>
                        )}

                        {status === 'invalid' && (
                            <>
                                <div className="text-6xl mb-4">⚠️</div>
                                <h1 className="text-3xl font-bold text-yellow-400 mb-2">
                                    Invalid Link
                                </h1>
                                <p className="text-gray-400 mb-6">
                                    This verification link is invalid or has expired.
                                </p>
                                <div className="space-y-3">
                                    <ModernButton
                                        onClick={handleResend}
                                        className="w-full"
                                        size="lg"
                                    >
                                        Request New Verification Email
                                    </ModernButton>
                                    <ModernButton
                                        onClick={() => router.push('/auth/login')}
                                        variant="secondary"
                                        className="w-full"
                                    >
                                        Back to Login
                                    </ModernButton>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </ModernLayout>
    );
}
