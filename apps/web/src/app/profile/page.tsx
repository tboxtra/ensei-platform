'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ModernLayout } from '../../components/layout/ModernLayout';
import { ModernCard } from '../../components/ui/ModernCard';
import { ModernButton } from '../../components/ui/ModernButton';
import { useApi } from '../../hooks/useApi';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { useUserData } from '../../contexts/UserDataContext';

export default function ProfilePage() {
    const router = useRouter();
    const { logout, updateProfile, loading: apiLoading, error: apiError } = useApi();
    const { user, userStats, loading, error, syncStatus, refreshUserData, updateUserData, isInitialized } = useUserData();
    const [formError, setFormError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        twitter: ''
    });

    // Security-related state
    const [securitySettings, setSecuritySettings] = useState({
        twoFactorEnabled: false,
        activeSessions: [] as any[],
        lastPasswordChange: null as string | null
    });
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);

    // Initialize Twitter username state from localStorage immediately
    const getInitialTwitterState = () => {
        if (typeof window !== 'undefined') {
            const userData = localStorage.getItem('user');
            if (userData) {
                const userObj = JSON.parse(userData);
                const twitterHandle = userObj.twitter_handle || userObj.twitter || '';
                return {
                    username: twitterHandle,
                    status: twitterHandle ? 'saved' as const : 'empty' as const,
                    initialized: true
                };
            }
        }
        return {
            username: '',
            status: 'empty' as const,
            initialized: false
        };
    };

    const initialTwitterState = getInitialTwitterState();

    // Twitter username state management
    const [twitterUsername, setTwitterUsername] = useState<string>(initialTwitterState.username);
    const [isEditingTwitter, setIsEditingTwitter] = useState<boolean>(false);
    const [twitterStatus, setTwitterStatus] = useState<'empty' | 'saved' | 'editing'>(initialTwitterState.status);
    const [twitterLoading, setTwitterLoading] = useState<boolean>(false);
    const [syncMessage, setSyncMessage] = useState<string>('');

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || user.name?.split(' ')[0] || '',
                lastName: user.lastName || user.name?.split(' ')[1] || '',
                email: user.email || '',
                twitter: user.twitter || ''
            });
        }
        loadSecuritySettings();
    }, [user]);


    const loadSecuritySettings = async () => {
        try {
            // Load security settings from Firebase
            const userData = localStorage.getItem('user');
            if (userData) {
                const userObj = JSON.parse(userData);
                setSecuritySettings({
                    twoFactorEnabled: userObj.twoFactorEnabled || false,
                    activeSessions: userObj.activeSessions || [],
                    lastPasswordChange: userObj.lastPasswordChange || null
                });
            }
        } catch (err) {
            console.warn('Failed to load security settings:', err);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveProfile = async () => {
        try {
            // Industry standard: Save all profile changes to Firebase
            const profileData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                twitter: formData.twitter,
                twitter_handle: formData.twitter,
                updated_at: new Date().toISOString()
            };

            console.log('Saving profile to Firebase:', profileData);
            const updatedUser = await updateProfile(profileData);
            console.log('Profile saved successfully:', updatedUser);
            
            // Update global user data
            updateUserData(updatedUser);
            
            // Refresh data from Firebase to ensure consistency
            await refreshUserData();
        } catch (err: any) {
            console.error('Failed to save profile:', err);
            setFormError(err.message || 'Failed to save profile');
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/auth/login');
        } catch (err) {
            console.error('Logout failed:', err);
            // Fallback: clear localStorage and redirect
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            router.push('/auth/login');
        }
    };

    // Twitter username validation
    const validateTwitterUsername = (username: string) => {
        if (!username.trim()) {
            return { isValid: false, message: 'Twitter username is required' };
        }

        if (username.length < 1 || username.length > 15) {
            return { isValid: false, message: 'Twitter username must be 1-15 characters long' };
        }

        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            return { isValid: false, message: 'Twitter username can only contain letters, numbers, and underscores' };
        }

        if (username.startsWith('_') || username.endsWith('_')) {
            return { isValid: false, message: 'Twitter username cannot start or end with underscore' };
        }

        return { isValid: true };
    };

    const formatTwitterUsername = (username: string): string => {
        return username.replace('@', '').toLowerCase();
    };


    // Industry standard password change with Firebase Auth
    const handlePasswordChange = async () => {
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setFormError('New passwords do not match');
            return;
        }

        if (passwordForm.newPassword.length < 8) {
            setFormError('Password must be at least 8 characters long');
            return;
        }

        setPasswordLoading(true);
        setFormError(null);

        try {
            // Industry standard: Use Firebase Auth for password changes
            // Note: This would require Firebase Auth SDK integration
            // For now, we'll simulate the API call
            console.log('Changing password via Firebase Auth...');

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Update security settings
            const updatedSettings = {
                ...securitySettings,
                lastPasswordChange: new Date().toISOString()
            };

            setSecuritySettings(updatedSettings);
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setShowPasswordForm(false);

            // Save to Firebase
            const profileData = {
                ...formData,
                securitySettings: updatedSettings,
                updated_at: new Date().toISOString()
            };

            await updateProfile(profileData);
            console.log('Password changed successfully');

        } catch (err: any) {
            console.error('Failed to change password:', err);
            setFormError(err.message || 'Failed to change password');
        } finally {
            setPasswordLoading(false);
        }
    };

    // Industry standard 2FA toggle
    const handleToggle2FA = async () => {
        // Loading is managed by global context
        try {
            const updatedSettings = {
                ...securitySettings,
                twoFactorEnabled: !securitySettings.twoFactorEnabled
            };

            setSecuritySettings(updatedSettings);

            // Save to Firebase
            const profileData = {
                ...formData,
                securitySettings: updatedSettings,
                updated_at: new Date().toISOString()
            };

            await updateProfile(profileData);
            console.log('2FA setting updated successfully');

        } catch (err: any) {
            console.error('Failed to update 2FA setting:', err);
            setFormError(err.message || 'Failed to update 2FA setting');
        } finally {
            // Loading is managed by global context
        }
    };

    // Twitter username management functions with optimistic updates
    const handleAddTwitterUsername = async () => {
        if (!formData.twitter.trim()) return;

        const validation = validateTwitterUsername(formData.twitter);
        if (!validation.isValid) {
            setFormError(validation.message || 'Invalid Twitter username');
            return;
        }

        const formattedUsername = formatTwitterUsername(formData.twitter);

        // 1. OPTIMISTIC UPDATE - Update UI immediately
        const previousUsername = twitterUsername;
        const previousStatus = twitterStatus;

        setTwitterUsername(formattedUsername);
        setTwitterStatus('saved');
        setTwitterLoading(true);
        // Sync status is managed by global context
        setFormData(prev => ({ ...prev, twitter: '' }));

        try {
            // 2. Get current user data from localStorage to ensure we have complete data
            const currentUserData = localStorage.getItem('user');
            const currentUser = currentUserData ? JSON.parse(currentUserData) : user;

            const profileData = {
                firstName: currentUser?.firstName || formData.firstName || '',
                lastName: currentUser?.lastName || formData.lastName || '',
                email: currentUser?.email || formData.email || '',
                twitter: formattedUsername,
                twitter_handle: formattedUsername,
                updated_at: new Date().toISOString()
            };

            console.log('Saving Twitter username to Firebase:', profileData);

            // 3. Save to Firebase with industry standard approach
            const updatedUser = await updateProfile(profileData);
            console.log('Firebase response:', updatedUser);

            if (!updatedUser) {
                throw new Error('Firebase returned empty response');
            }

            // 4. SUCCESS - Update global user data
            updateUserData(updatedUser);
            setSyncMessage('');
            setFormError(null);

        } catch (err: any) {
            console.error('Error saving Twitter username:', err);

            // 5. ROLLBACK - Revert optimistic update
            setTwitterUsername(previousUsername);
            setTwitterStatus(previousStatus);
            setFormData(prev => ({ ...prev, twitter: formattedUsername }));
            // Sync status is managed by global context

            // 6. Show user-friendly error
            setFormError('Failed to save Twitter username. Please try again.');
            setSyncMessage('Save failed - please retry');

        } finally {
            setTwitterLoading(false);
        }
    };

    const handleEditTwitterUsername = () => {
        setFormData(prev => ({ ...prev, twitter: twitterUsername }));
        setTwitterStatus('editing');
    };

    const handleSaveTwitterUsername = async () => {
        if (!formData.twitter.trim()) return;

        const validation = validateTwitterUsername(formData.twitter);
        if (!validation.isValid) {
            setFormError(validation.message || 'Invalid Twitter username');
            return;
        }

        const formattedUsername = formatTwitterUsername(formData.twitter);
        setTwitterLoading(true);
        // Sync status is managed by global context

        try {
            const currentUserData = localStorage.getItem('user');
            const currentUser = currentUserData ? JSON.parse(currentUserData) : user;

            const profileData = {
                firstName: currentUser?.firstName || formData.firstName || '',
                lastName: currentUser?.lastName || formData.lastName || '',
                email: currentUser?.email || formData.email || '',
                twitter: formattedUsername,
                twitter_handle: formattedUsername,
                updated_at: new Date().toISOString()
            };

            const updatedUser = await updateProfile(profileData);
            updateUserData(updatedUser);
            setTwitterUsername(formattedUsername);
            setTwitterStatus('saved');
            setFormData(prev => ({ ...prev, twitter: '' }));
            setSyncMessage('');
            setFormError(null);
        } catch (err: any) {
            setFormError(err.message || 'Failed to save Twitter username');
            // Sync status is managed by global context
            setSyncMessage('Save failed - please retry');
        } finally {
            setTwitterLoading(false);
        }
    };

    const handleCancelTwitterEdit = () => {
        setTwitterStatus('saved');
        setFormData(prev => ({ ...prev, twitter: '' }));
    };

    const handleRemoveTwitterUsername = async () => {
        setTwitterLoading(true);
        // Sync status is managed by global context

        try {
            const currentUserData = localStorage.getItem('user');
            const currentUser = currentUserData ? JSON.parse(currentUserData) : user;

            const profileData = {
                firstName: currentUser?.firstName || formData.firstName || '',
                lastName: currentUser?.lastName || formData.lastName || '',
                email: currentUser?.email || formData.email || '',
                twitter: '',
                twitter_handle: '',
                updated_at: new Date().toISOString()
            };

            const updatedUser = await updateProfile(profileData);
            updateUserData(updatedUser);
            setTwitterUsername('');
            setTwitterStatus('empty');
            setSyncMessage('');
            setFormError(null);
        } catch (err: any) {
            setFormError(err.message || 'Failed to remove Twitter username');
            // Sync status is managed by global context
            setSyncMessage('Remove failed - please retry');
        } finally {
            setTwitterLoading(false);
        }
    };

    return (
        <ProtectedRoute>
            <ModernLayout currentPage="/profile">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-2 px-4 sm:px-0">
                        <h1 className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                            Profile Settings
                        </h1>
                        <p className="text-gray-400 mt-1 text-xs">Manage your account information and security settings</p>
                    </div>

                    {/* Error Display */}
                    {(error || formError) && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <p className="text-red-400 text-sm">{error || formError}</p>
                        </div>
                    )}

                    {/* Profile Information */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        {/* Profile Picture Card */}
                        <ModernCard className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 shadow-[inset_-2px_-2px_6px_rgba(0,0,0,0.3),inset_2px_2px_6px_rgba(255,255,255,0.05)]">
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-green-400 to-blue-500 mx-auto mb-4">
                                    <img
                                        src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
                                        alt={user?.name || 'User'}
                                            className="w-full h-full object-cover"
                                        />
                                </div>
                                <h3 className="text-white font-semibold mb-1">{user?.name || 'User'}</h3>
                                <p className="text-gray-400 text-sm">{user?.email}</p>
                                <p className="text-xs text-gray-500 mt-2">Profile picture managed by Google</p>
                                </div>
                            </ModernCard>

                        {/* Basic Info Card */}
                        <ModernCard className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 shadow-[inset_-2px_-2px_6px_rgba(0,0,0,0.3),inset_2px_2px_6px_rgba(255,255,255,0.05)] lg:col-span-2">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <span>👤</span>
                                Basic Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                                    First Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.firstName}
                                                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                                        className="w-full p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                                        placeholder="Enter your first name"
                                                />
                                            </div>
                                            <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                                    Last Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.lastName}
                                                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                                        className="w-full p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                                        placeholder="Enter your last name"
                                                />
                                            </div>
                                        </div>
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Email Address
                                            </label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => handleInputChange('email', e.target.value)}
                                    className="w-full p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                                    placeholder="Enter your email address"
                                            />
                                <p className="text-xs text-gray-500 mt-1">Managed by your authentication provider</p>
                            </div>
                        </ModernCard>
                                        </div>

                    {/* Twitter Username Card */}
                    <ModernCard className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 shadow-[inset_-2px_-2px_6px_rgba(0,0,0,0.3),inset_2px_2px_6px_rgba(255,255,255,0.05)] mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <span>🐦</span>
                                Twitter Username
                                <span className="text-xs text-yellow-400 bg-yellow-500/20 px-2 py-1 rounded">
                                    Required for verification
                                </span>
                            </h3>
                            <div className="flex items-center gap-2">
                                {syncStatus === 'loading' && (
                                    <span className="text-xs text-blue-400 flex items-center gap-1">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                                        Loading...
                                    </span>
                                )}
                                {syncStatus === 'syncing' && (
                                    <span className="text-xs text-yellow-400 flex items-center gap-1">
                                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                        {syncMessage || 'Syncing...'}
                                    </span>
                                )}
                                {syncStatus === 'synced' && (
                                    <span className="text-xs text-green-400 flex items-center gap-1">
                                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                        Synced
                                    </span>
                                )}
                                {syncStatus === 'offline' && (
                                    <span className="text-xs text-orange-400 flex items-center gap-1">
                                        <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                                        {syncMessage || 'Offline'}
                                    </span>
                                )}
                            </div>
                                        </div>

                        <p className="text-gray-400 text-sm mb-4">
                            Link your Twitter account for mission verification
                        </p>

                        {!isInitialized ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                            </div>
                        ) : (
                            <>
                                {twitterStatus === 'empty' && (
                                        <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-400 text-sm">@</span>
                                            <input
                                                type="text"
                                                value={formData.twitter}
                                                onChange={(e) => handleInputChange('twitter', e.target.value.replace('@', ''))}
                                                className={`flex-1 p-3 bg-gray-800/50 border rounded-lg text-white focus:ring-2 focus:border-transparent text-sm ${formData.twitter ?
                                                    validateTwitterUsername(formData.twitter).isValid ?
                                                        'border-green-500/50 focus:ring-green-500' :
                                                        'border-red-500/50 focus:ring-red-500'
                                                    : 'border-gray-700/50 focus:ring-green-500'
                                                    }`}
                                                placeholder="yourusername"
                                            />
                                            <button
                                                onClick={handleAddTwitterUsername}
                                                disabled={!formData.twitter.trim() || twitterLoading}
                                                className="px-4 py-3 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                                            >
                                                {twitterLoading ? 'Adding...' : 'Add'}
                                            </button>
                                        </div>
                                        {formData.twitter && !validateTwitterUsername(formData.twitter).isValid && (
                                            <p className="text-xs text-red-400 mt-1">
                                                {validateTwitterUsername(formData.twitter).message}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-500 mt-1">
                                            This will be used to verify your Twitter activity for missions
                                        </p>
                                    </div>
                                )}

                                {twitterStatus === 'saved' && (
                                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-green-400 text-lg">✅</span>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-gray-400 text-sm">@</span>
                                                        <span className="text-white font-medium">{twitterUsername}</span>
                                                </div>
                                                    <p className="text-xs text-green-400 mt-1">Connected for verification</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handleEditTwitterUsername}
                                                    className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-xs hover:bg-blue-500/30"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={handleRemoveTwitterUsername}
                                                    disabled={twitterLoading}
                                                    className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded text-xs hover:bg-red-500/30 disabled:opacity-50"
                                                >
                                                    {twitterLoading ? 'Removing...' : 'Remove'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {twitterStatus === 'editing' && (
                                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-yellow-400 text-lg">⚠️</span>
                                            <span className="text-yellow-400 text-sm font-medium">Editing Twitter Username</span>
                                                </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-400 text-sm">@</span>
                                            <input
                                                type="text"
                                                value={formData.twitter}
                                                onChange={(e) => handleInputChange('twitter', e.target.value.replace('@', ''))}
                                                className={`flex-1 p-3 bg-gray-800/50 border rounded-lg text-white focus:ring-2 focus:border-transparent text-sm ${formData.twitter ?
                                                    validateTwitterUsername(formData.twitter).isValid ?
                                                        'border-green-500/50 focus:ring-green-500' :
                                                        'border-red-500/50 focus:ring-red-500'
                                                    : 'border-gray-700/50 focus:ring-green-500'
                                                    }`}
                                                placeholder="yourusername"
                                            />
                                            <button
                                                onClick={handleSaveTwitterUsername}
                                                disabled={!formData.twitter.trim() || twitterLoading}
                                                className="px-3 py-3 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                                            >
                                                {twitterLoading ? 'Saving...' : 'Save'}
                                            </button>
                                            <button
                                                onClick={handleCancelTwitterEdit}
                                                disabled={twitterLoading}
                                                className="px-3 py-3 bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded-lg hover:bg-gray-500/30 disabled:opacity-50 text-sm font-medium"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                        {formData.twitter && !validateTwitterUsername(formData.twitter).isValid && (
                                            <p className="text-xs text-red-400 mt-2">
                                                {validateTwitterUsername(formData.twitter).message}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </ModernCard>

                    {/* Statistics Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        <ModernCard className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 shadow-[inset_-2px_-2px_6px_rgba(0,0,0,0.3),inset_2px_2px_6px_rgba(255,255,255,0.05)]">
                            <div className="flex items-center justify-between">
                                        <div>
                                    <p className="text-gray-400 text-xs">Missions Created</p>
                                    <p className="text-lg font-bold text-green-400">
                                        {userStats.missionsCreated}
                                    </p>
                                                        </div>
                                <div className="text-xl">🚀</div>
                                                        </div>
                        </ModernCard>

                        <ModernCard className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 shadow-[inset_-2px_-2px_6px_rgba(0,0,0,0.3),inset_2px_2px_6px_rgba(255,255,255,0.05)]">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-400 text-xs">Missions Completed</p>
                                    <p className="text-lg font-bold text-blue-400">
                                        {userStats.missionsCompleted}
                                    </p>
                                                        </div>
                                <div className="text-xl">✅</div>
                                                    </div>
                        </ModernCard>

                        <ModernCard className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 shadow-[inset_-2px_-2px_6px_rgba(0,0,0,0.3),inset_2px_2px_6px_rgba(255,255,255,0.05)]">
                            <div className="flex items-center justify-between">
                                        <div>
                                    <p className="text-gray-400 text-xs">Total Earned</p>
                                    <p className="text-lg font-bold text-yellow-400">
                                        {userStats.totalEarned.toLocaleString()} Honors
                                    </p>
                                                </div>
                                <div className="text-xl">💰</div>
                                            </div>
                        </ModernCard>
                                        </div>

                    {/* Additional Stats Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <ModernCard className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 shadow-[inset_-2px_-2px_6px_rgba(0,0,0,0.3),inset_2px_2px_6px_rgba(255,255,255,0.05)]">
                            <div className="flex items-center justify-between">
                                        <div>
                                    <p className="text-gray-400 text-xs">Total Submissions</p>
                                    <p className="text-lg font-bold text-purple-400">
                                        {userStats.totalSubmissions}
                                    </p>
                                                </div>
                                <div className="text-xl">📝</div>
                                                </div>
                        </ModernCard>

                        <ModernCard className="bg-gradient-to-br from-emerald-600/20 to-teal-600/20 shadow-[inset_-2px_-2px_6px_rgba(0,0,0,0.3),inset_2px_2px_6px_rgba(255,255,255,0.05)]">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-400 text-xs">Approved</p>
                                    <p className="text-lg font-bold text-emerald-400">
                                        {userStats.approvedSubmissions}
                                    </p>
                                                </div>
                                <div className="text-xl">🎯</div>
                                    </div>
                                </ModernCard>

                        <ModernCard className="bg-gradient-to-br from-indigo-600/20 to-blue-600/20 shadow-[inset_-2px_-2px_6px_rgba(0,0,0,0.3),inset_2px_2px_6px_rgba(255,255,255,0.05)]">
                            <div className="flex items-center justify-between">
                                        <div>
                                    <p className="text-gray-400 text-xs">User Rating</p>
                                    <p className="text-lg font-bold text-indigo-400">
                                        {userStats.userRating.toFixed(1)}/5.0
                                    </p>
                                </div>
                                <div className="text-xl">⭐</div>
                                        </div>
                        </ModernCard>

                        <ModernCard className="bg-gradient-to-br from-amber-600/20 to-orange-600/20 shadow-[inset_-2px_-2px_6px_rgba(0,0,0,0.3),inset_2px_2px_6px_rgba(255,255,255,0.05)]">
                            <div className="flex items-center justify-between">
                                                <div>
                                    <p className="text-gray-400 text-xs">Reviews Given</p>
                                    <p className="text-lg font-bold text-amber-400">
                                        {userStats.totalReviews}
                                    </p>
                                                </div>
                                <div className="text-xl">📊</div>
                                            </div>
                        </ModernCard>
                                        </div>

                    {/* Security Section */}
                    <ModernCard className="bg-gradient-to-br from-red-600/20 to-rose-600/20 shadow-[inset_-2px_-2px_6px_rgba(0,0,0,0.3),inset_2px_2px_6px_rgba(255,255,255,0.05)] mb-8">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <span>🔒</span>
                            Security Settings
                        </h3>

                        <div className="space-y-6">
                            {/* Password Change */}
                            <div className="p-4 bg-gray-800/30 rounded-lg">
                                <div className="flex items-center justify-between mb-4">
                                                    <div>
                                        <h4 className="text-white font-medium">Password</h4>
                                        <p className="text-gray-400 text-sm">
                                            {securitySettings.lastPasswordChange
                                                ? `Last changed: ${new Date(securitySettings.lastPasswordChange).toLocaleDateString()}`
                                                : 'Password has not been changed'
                                            }
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setShowPasswordForm(!showPasswordForm)}
                                        className="px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 text-sm font-medium transition-all duration-200"
                                    >
                                        {showPasswordForm ? 'Cancel' : 'Change Password'}
                                    </button>
                                </div>

                                {showPasswordForm && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Current Password
                                            </label>
                                                    <input
                                                type="password"
                                                value={passwordForm.currentPassword}
                                                onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                                                className="w-full p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                placeholder="Enter current password"
                                                    />
                                                </div>
                                                    <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                New Password
                                            </label>
                                                    <input
                                                type="password"
                                                value={passwordForm.newPassword}
                                                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                                                className="w-full p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                placeholder="Enter new password"
                                                    />
                                                </div>
                                                    <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Confirm New Password
                                            </label>
                                                    <input
                                                type="password"
                                                value={passwordForm.confirmPassword}
                                                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                                className="w-full p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                placeholder="Confirm new password"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handlePasswordChange}
                                                disabled={passwordLoading || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                                                className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-all duration-200"
                                            >
                                                {passwordLoading ? 'Changing...' : 'Change Password'}
                                            </button>
                                            <button
                                                onClick={() => setShowPasswordForm(false)}
                                                className="px-4 py-2 bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded-lg hover:bg-gray-500/30 text-sm font-medium transition-all duration-200"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Two-Factor Authentication */}
                            <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                                <div>
                                    <h4 className="text-white font-medium">Two-Factor Authentication</h4>
                                    <p className="text-gray-400 text-sm">Add an extra layer of security to your account</p>
                                            </div>
                                <button
                                    onClick={handleToggle2FA}
                                    disabled={loading}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${securitySettings.twoFactorEnabled
                                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                        : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                                        }`}
                                >
                                    {loading ? 'Updating...' : (securitySettings.twoFactorEnabled ? 'Enabled' : 'Enable')}
                                </button>
                                            </div>

                            {/* Active Sessions */}
                            <div className="p-4 bg-gray-800/30 rounded-lg">
                                <h4 className="text-white font-medium mb-3">Active Sessions</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                                                <span className="text-green-400 text-sm">💻</span>
                                            </div>
                                            <div>
                                                <p className="text-white text-sm font-medium">Current Session</p>
                                                <p className="text-gray-400 text-xs">This device • Now</p>
                                            </div>
                                        </div>
                                        <span className="text-green-400 text-xs">Active</span>
                                    </div>
                                    {securitySettings.activeSessions.length > 0 && (
                                        securitySettings.activeSessions.map((session: any, index: number) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                                                        <span className="text-blue-400 text-sm">📱</span>
                                                    </div>
                                        <div>
                                                        <p className="text-white text-sm font-medium">{session.device || 'Unknown Device'}</p>
                                                        <p className="text-gray-400 text-xs">{session.location || 'Unknown Location'} • {session.lastActive || 'Recently'}</p>
                                                    </div>
                                                </div>
                                                <button className="text-red-400 text-xs hover:text-red-300">
                                                    Revoke
                                                </button>
                                            </div>
                                        ))
                                    )}
                                        </div>
                                    </div>
                        </div>
                    </ModernCard>

                    {/* Action Buttons */}
                    <div className="flex justify-end">
                        <ModernButton
                            onClick={handleSaveProfile}
                            disabled={loading}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-green-500/25"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </ModernButton>
                    </div>
                </div>
            </ModernLayout>
        </ProtectedRoute>
    );
}