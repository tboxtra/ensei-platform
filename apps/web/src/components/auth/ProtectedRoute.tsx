'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/UserAuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    redirectTo?: string;
}

export function ProtectedRoute({ children, redirectTo = '/auth/login' }: ProtectedRouteProps) {
    const { user, isAuthenticated, isLoading, isEmailVerified } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            console.log('ProtectedRoute: User not authenticated, redirecting to login');
            router.push(redirectTo);
        } else if (!isLoading && isAuthenticated && user && !isEmailVerified) {
            console.log('ProtectedRoute: User not verified, redirecting to email verification');
            router.push('/auth/verify-email');
        }
    }, [isAuthenticated, isLoading, isEmailVerified, user, router, redirectTo]);

    // Show loading while checking authentication
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    // Show nothing while redirecting
    if (!isAuthenticated || (isAuthenticated && user && !isEmailVerified)) {
        return null;
    }

    // Render children if authenticated and email verified
    return <>{children}</>;
}
