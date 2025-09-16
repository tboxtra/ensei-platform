'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ModernLayout } from '../../../components/layout/ModernLayout';
import { ModernCard } from '../../../components/ui/ModernCard';
import { ModernButton } from '../../../components/ui/ModernButton';
import { getFirebaseAuth, googleProvider } from '../../../lib/firebase';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '../../../contexts/UserAuthContext';

export default function LoginPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading: authLoading, login, error: authError } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });
    const [apiError, setApiError] = useState('');
    const [loading, setLoading] = useState(false);

    // Redirect if already authenticated
    useEffect(() => {
        if (!authLoading && isAuthenticated && user) {
            console.log('User already authenticated, redirecting to dashboard');
            router.push('/dashboard');
        }
    }, [isAuthenticated, authLoading, user, router]);

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        setApiError(''); // Clear error when user starts typing
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setApiError('');
        setLoading(true);

        try {
            // Use the auth context login method
            await login(formData.email, formData.password);

            // The auth context will handle storing user data and tokens
            // The useEffect above will handle redirecting to dashboard
            console.log('Login successful via auth context');
        } catch (err: any) {
            console.error('Login failed:', err);
            let errorMessage = 'Login failed';

            if (err.message) {
                if (err.message.includes('user-not-found')) {
                    errorMessage = 'No account found with this email address';
                } else if (err.message.includes('wrong-password')) {
                    errorMessage = 'Incorrect password';
                } else if (err.message.includes('invalid-email')) {
                    errorMessage = 'Invalid email address';
                } else if (err.message.includes('too-many-requests')) {
                    errorMessage = 'Too many failed attempts. Please try again later';
                } else {
                    errorMessage = err.message;
                }
            }

            setApiError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = async (provider: string) => {
        setLoading(true);
        setApiError('');

        try {
            if (provider === 'google') {
                const auth = getFirebaseAuth();
                const result = await signInWithPopup(auth, googleProvider);
                const user = result.user;

                // Get the ID token
                const token = await user.getIdToken();

                localStorage.setItem('user', JSON.stringify({
                    id: user.uid,
                    email: user.email,
                    name: user.displayName || user.email?.split('@')[0] || 'User',
                    avatar: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
                    joinedAt: new Date().toISOString()
                }));

                // Store the Firebase token
                localStorage.setItem('firebaseToken', token);

                router.push('/dashboard');
                return;
            }
        } catch (err: any) {
            console.error('Firebase social login failed:', err);
            let errorMessage = 'Social login failed';

            if (err.code === 'auth/popup-closed-by-user') {
                errorMessage = 'Login popup was closed';
            } else if (err.code === 'auth/popup-blocked') {
                errorMessage = 'Login popup was blocked by browser';
            } else if (err.message) {
                errorMessage = err.message;
            }

            setApiError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Show loading while auth context is initializing
    if (authLoading) {
        return (
            <ModernLayout currentPage="/auth/login">
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
                        <p className="text-gray-400">Loading...</p>
                    </div>
                </div>
            </ModernLayout>
        );
    }

    return (
        <ModernLayout currentPage="/auth/login">
            <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    {/* Header */}
                    <div className="text-center">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 via-emerald-500 to-blue-500 bg-clip-text text-transparent mb-2">
                            Welcome Back
                        </h1>
                        <p className="text-gray-400">
                            Sign in to your Ensei account to continue
                        </p>
                    </div>

                    <ModernCard className="p-8">
                        {/* Social Login Buttons */}
                        <div className="space-y-4 mb-8">
                            <ModernButton
                                onClick={() => handleSocialLogin('google')}
                                variant="secondary"
                                className="w-full"
                                loading={loading}
                            >
                                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Continue with Google
                            </ModernButton>

                            <ModernButton
                                onClick={() => handleSocialLogin('twitter')}
                                variant="secondary"
                                className="w-full"
                                loading={loading}
                            >
                                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                                Continue with Twitter
                            </ModernButton>
                        </div>

                        <div className="relative mb-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-700"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-gray-900 text-gray-400">Or continue with email</span>
                            </div>
                        </div>

                        {/* Login Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {apiError && (
                                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                                    <p className="text-red-400 text-sm">{apiError}</p>
                                </div>
                            )}

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    className="w-full p-4 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="Enter your email"
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                    className="w-full p-4 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="Enter your password"
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        checked={formData.rememberMe}
                                        onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                                        className="h-4 w-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500 focus:ring-2"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                                        Remember me
                                    </label>
                                </div>

                                <div className="text-sm">
                                    <Link href="/auth/forgot-password" className="text-green-400 hover:text-green-300">
                                        Forgot your password?
                                    </Link>
                                </div>
                            </div>

                            <ModernButton
                                type="submit"
                                variant="success"
                                className="w-full"
                                loading={loading}
                            >
                                {loading ? 'Signing in...' : 'Sign In'}
                            </ModernButton>
                        </form>

                        {/* Sign Up Link */}
                        <div className="mt-6 text-center">
                            <p className="text-gray-400">
                                Don't have an account?{' '}
                                <Link href="/auth/register" className="text-green-400 hover:text-green-300 font-medium">
                                    Sign up for free
                                </Link>
                            </p>
                        </div>
                    </ModernCard>

                    {/* Firebase Auth Notice */}
                    <div className="text-center">
                        <p className="text-xs text-gray-500">
                            🔐 Powered by Firebase Authentication
                        </p>
                    </div>
                </div>
            </div>
        </ModernLayout>
    );
}
