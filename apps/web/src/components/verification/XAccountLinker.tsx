'use client';

import React, { useState, useEffect } from 'react';
import { XAccount, XAccountLinkerProps } from '@/types/verification';
import { ModernButton } from '@/components/ui/ModernButton';
import { ModernInput } from '@/components/ui/ModernInput';

export const XAccountLinker: React.FC<XAccountLinkerProps> = ({
    onAccountLinked,
    existingAccount,
    isImmutable = false
}) => {
    const [xUsername, setXUsername] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isValidating, setIsValidating] = useState(false);

    useEffect(() => {
        if (existingAccount) {
            setXUsername(existingAccount.username);
        }
    }, [existingAccount]);

    const validateXUsername = async (username: string): Promise<boolean> => {
        // Remove @ symbol if present
        const cleanUsername = username.replace('@', '');

        // Basic validation
        if (!cleanUsername || cleanUsername.length < 1 || cleanUsername.length > 15) {
            setError('Username must be 1-15 characters long');
            return false;
        }

        // Check for valid characters (alphanumeric and underscore)
        if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
            setError('Username can only contain letters, numbers, and underscores');
            return false;
        }

        // TODO: In production, validate against X API
        // For demo, we'll simulate validation
        setIsValidating(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Mock validation - in production, check X API
            const isValid = cleanUsername.length >= 3;

            if (!isValid) {
                setError('Username not found on X (Twitter)');
                return false;
            }

            setError('');
            return true;
        } catch (err) {
            setError('Failed to validate username. Please try again.');
            return false;
        } finally {
            setIsValidating(false);
        }
    };

    const handleLinkAccount = async () => {
        if (!xUsername.trim()) {
            setError('Please enter your X username');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const isValid = await validateXUsername(xUsername);

            if (!isValid) {
                return;
            }

            // Create X account object
            const xAccount: XAccount = {
                id: `x_${Date.now()}`,
                userId: 'current_user', // Will be replaced with actual user ID
                username: xUsername.replace('@', ''),
                displayName: xUsername.replace('@', ''), // Will be fetched from X API
                isVerified: false, // Will be determined by X API
                linkedAt: new Date(),
                isImmutable: isImmutable || !!existingAccount
            };

            onAccountLinked(xAccount);
        } catch (err) {
            setError('Failed to link X account. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUsernameChange = (value: string) => {
        setXUsername(value);
        setError('');
    };

    if (existingAccount && isImmutable) {
        return (
            <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <span className="text-blue-400 font-bold text-lg">X</span>
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <span className="text-white font-medium">@{existingAccount.username}</span>
                            {existingAccount.isVerified && (
                                <span className="text-blue-400 text-xs">✓ Verified</span>
                            )}
                        </div>
                        <p className="text-gray-400 text-sm">
                            Linked on {existingAccount.linkedAt.toLocaleDateString()}
                        </p>
                    </div>
                    <div className="text-gray-500 text-xs">
                        Immutable
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/50">
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <span className="text-blue-400 font-bold text-lg">X</span>
                    </div>
                    <div>
                        <h3 className="text-white font-medium">Link X Account</h3>
                        <p className="text-gray-400 text-sm">
                            Connect your X account for verification tasks
                        </p>
                    </div>
                </div>

                <div className="space-y-3">
                    <ModernInput
                        label="X Username"
                        placeholder="Enter your X username (without @)"
                        value={xUsername}
                        onChange={handleUsernameChange}
                        error={error}
                        disabled={isLoading || isValidating}
                        required
                    />

                    {isValidating && (
                        <div className="flex items-center gap-2 text-blue-400 text-sm">
                            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                            Validating username...
                        </div>
                    )}

                    {existingAccount && (
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                            <p className="text-yellow-400 text-sm">
                                ⚠️ Once linked, your X account cannot be changed. Make sure you're using the correct username.
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex gap-3">
                    <ModernButton
                        onClick={handleLinkAccount}
                        disabled={isLoading || isValidating || !xUsername.trim()}
                        className="flex-1"
                    >
                        {isLoading ? 'Linking...' : existingAccount ? 'Update Account' : 'Link Account'}
                    </ModernButton>
                </div>
            </div>
        </div>
    );
};
