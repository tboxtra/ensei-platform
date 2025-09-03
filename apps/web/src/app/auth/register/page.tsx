'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ModernLayout } from '../../../components/layout/ModernLayout';
import { ModernCard } from '../../../components/ui/ModernCard';
import { ModernButton } from '../../../components/ui/ModernButton';
import { useApi } from '../../../hooks/useApi';

export default function RegisterPage() {
    const router = useRouter();
    const { register, loading, error } = useApi();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeToTerms: false,
        agreeToMarketing: false
    });
    const [step, setStep] = useState(1);
    const [apiError, setApiError] = useState('');

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        setApiError(''); // Clear error when user starts typing
    };

    const validateStep1 = () => {
        if (!formData.firstName.trim()) {
            setApiError('First name is required');
            return false;
        }
        if (!formData.lastName.trim()) {
            setApiError('Last name is required');
            return false;
        }
        if (!formData.email.trim()) {
            setApiError('Email is required');
            return false;
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            setApiError('Please enter a valid email address');
            return false;
        }
        return true;
    };

    const validateStep2 = () => {
        if (formData.password.length < 8) {
            setApiError('Password must be at least 8 characters long');
            return false;
        }
        if (!/(?=.*[a-z])/.test(formData.password)) {
            setApiError('Password must contain at least one lowercase letter');
            return false;
        }
        if (!/(?=.*[A-Z])/.test(formData.password)) {
            setApiError('Password must contain at least one uppercase letter');
            return false;
        }
        if (!/(?=.*\d)/.test(formData.password)) {
            setApiError('Password must contain at least one number');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setApiError('Passwords do not match');
            return false;
        }
        if (!formData.agreeToTerms) {
            setApiError('You must agree to the terms and conditions');
            return false;
        }
        return true;
    };

    const handleNext = () => {
        if (validateStep1()) {
            setStep(2);
        }
    };

    const handleBack = () => {
        setStep(1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateStep2()) return;

        setApiError('');

        try {
            // Try real API first
            await register({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password,
                agreeToTerms: formData.agreeToTerms,
                agreeToMarketing: formData.agreeToMarketing
            });

            router.push('/dashboard');
        } catch (err) {
            console.log('API registration failed, falling back to demo mode:', err);

            // Fallback to demo mode if API is not available
            localStorage.setItem('user', JSON.stringify({
                id: '1',
                email: formData.email,
                name: `${formData.firstName} ${formData.lastName}`,
                firstName: formData.firstName,
                lastName: formData.lastName,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.email}`,
                joinedAt: new Date().toISOString(),
                preferences: {
                    marketing: formData.agreeToMarketing
                }
            }));

            router.push('/dashboard');
        }
    };

    const handleSocialRegister = (provider: string) => {
        // For now, social registration uses demo mode
        localStorage.setItem('user', JSON.stringify({
            id: '1',
            email: `user@${provider}.com`,
            name: `${provider} User`,
            firstName: provider,
            lastName: 'User',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${provider}`,
            joinedAt: new Date().toISOString()
        }));
        router.push('/dashboard');
    };

    return (
        <ModernLayout currentPage="/auth/register">
            <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    {/* Header */}
                    <div className="text-center">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 via-emerald-500 to-blue-500 bg-clip-text text-transparent mb-2">
                            Join Ensei
                        </h1>
                        <p className="text-gray-400">
                            Create your account and start earning rewards
                        </p>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-center space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 1 ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-400'
                            }`}>
                            1
                        </div>
                        <div className={`w-12 h-1 ${step >= 2 ? 'bg-green-500' : 'bg-gray-700'
                            }`}></div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 2 ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-400'
                            }`}>
                            2
                        </div>
                    </div>

                    <ModernCard className="p-8">
                        {/* Social Registration Buttons */}
                        <div className="space-y-4 mb-8">
                            <ModernButton
                                onClick={() => handleSocialRegister('google')}
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
                                onClick={() => handleSocialRegister('twitter')}
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
                                <span className="px-2 bg-gray-900 text-gray-400">Or register with email</span>
                            </div>
                        </div>

                        {/* Registration Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {(apiError || error) && (
                                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                                    <p className="text-red-400 text-sm">{apiError || error}</p>
                                </div>
                            )}

                            {step === 1 ? (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="firstName" className="block text-sm font-medium text-white mb-2">
                                                First Name
                                            </label>
                                            <input
                                                id="firstName"
                                                name="firstName"
                                                type="text"
                                                required
                                                value={formData.firstName}
                                                onChange={(e) => handleInputChange('firstName', e.target.value)}
                                                className="w-full p-4 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                placeholder="John"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="lastName" className="block text-sm font-medium text-white mb-2">
                                                Last Name
                                            </label>
                                            <input
                                                id="lastName"
                                                name="lastName"
                                                type="text"
                                                required
                                                value={formData.lastName}
                                                onChange={(e) => handleInputChange('lastName', e.target.value)}
                                                className="w-full p-4 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                placeholder="Doe"
                                            />
                                        </div>
                                    </div>

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
                                            placeholder="john@example.com"
                                        />
                                    </div>

                                    <ModernButton
                                        type="button"
                                        onClick={handleNext}
                                        variant="success"
                                        className="w-full"
                                    >
                                        Continue
                                    </ModernButton>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                                            Password
                                        </label>
                                        <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            required
                                            value={formData.password}
                                            onChange={(e) => handleInputChange('password', e.target.value)}
                                            className="w-full p-4 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            placeholder="Create a strong password"
                                        />
                                        <p className="text-xs text-gray-400 mt-2">
                                            Must be at least 8 characters with uppercase, lowercase, and number
                                        </p>
                                    </div>

                                    <div>
                                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2">
                                            Confirm Password
                                        </label>
                                        <input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type="password"
                                            required
                                            value={formData.confirmPassword}
                                            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                            className="w-full p-4 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            placeholder="Confirm your password"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-start">
                                            <input
                                                id="agree-terms"
                                                name="agree-terms"
                                                type="checkbox"
                                                checked={formData.agreeToTerms}
                                                onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                                                className="mt-1 h-4 w-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500 focus:ring-2"
                                            />
                                            <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-300">
                                                I agree to the{' '}
                                                <Link href="/terms" className="text-green-400 hover:text-green-300">
                                                    Terms of Service
                                                </Link>{' '}
                                                and{' '}
                                                <Link href="/privacy" className="text-green-400 hover:text-green-300">
                                                    Privacy Policy
                                                </Link>
                                            </label>
                                        </div>

                                        <div className="flex items-start">
                                            <input
                                                id="agree-marketing"
                                                name="agree-marketing"
                                                type="checkbox"
                                                checked={formData.agreeToMarketing}
                                                onChange={(e) => handleInputChange('agreeToMarketing', e.target.checked)}
                                                className="mt-1 h-4 w-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500 focus:ring-2"
                                            />
                                            <label htmlFor="agree-marketing" className="ml-2 block text-sm text-gray-300">
                                                I agree to receive marketing communications from Ensei
                                            </label>
                                        </div>
                                    </div>

                                    <div className="flex space-x-4">
                                        <ModernButton
                                            type="button"
                                            onClick={handleBack}
                                            variant="secondary"
                                            className="flex-1"
                                        >
                                            Back
                                        </ModernButton>
                                        <ModernButton
                                            type="submit"
                                            variant="success"
                                            className="flex-1"
                                            loading={loading}
                                        >
                                            {loading ? 'Creating Account...' : 'Create Account'}
                                        </ModernButton>
                                    </div>
                                </>
                            )}
                        </form>

                        {/* Sign In Link */}
                        <div className="mt-6 text-center">
                            <p className="text-gray-400">
                                Already have an account?{' '}
                                <Link href="/auth/login" className="text-green-400 hover:text-green-300 font-medium">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </ModernCard>

                    {/* Demo Notice */}
                    <div className="text-center">
                        <p className="text-xs text-gray-500">
                            💡 Demo Mode: Will fallback to demo if API is unavailable
                        </p>
                    </div>
                </div>
            </div>
        </ModernLayout>
    );
}
