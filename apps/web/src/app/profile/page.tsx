'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ModernLayout } from '../../components/layout/ModernLayout';
import { ModernCard } from '../../components/ui/ModernCard';
import { ModernButton } from '../../components/ui/ModernButton';
import { useApi } from '../../hooks/useApi';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';

export default function ProfilePage() {
    const router = useRouter();
    const { getCurrentUser, logout, updateProfile, loading: apiLoading, error: apiError } = useApi();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        bio: '',
        location: '',
        website: '',
        twitter: ''
    });

    // Twitter username state management
    const [twitterUsername, setTwitterUsername] = useState<string>('');
    const [isEditingTwitter, setIsEditingTwitter] = useState<boolean>(false);
    const [twitterStatus, setTwitterStatus] = useState<'empty' | 'saved' | 'editing'>('empty');
    const [twitterLoading, setTwitterLoading] = useState<boolean>(false);
    const [syncStatus, setSyncStatus] = useState<'loading' | 'synced' | 'offline' | 'syncing'>('loading');

    useEffect(() => {
        loadUserData();
    }, []);

    // Additional useEffect to ensure Twitter username state is properly initialized
    useEffect(() => {
        if (user && !twitterUsername) {
            const twitterHandle = user.twitter_handle || user.twitter || '';
            console.log('Additional useEffect - setting Twitter username:', {
                user: user,
                twitterUsername: twitterUsername,
                twitter_handle: user.twitter_handle,
                twitter: user.twitter,
                finalHandle: twitterHandle
            });
            if (twitterHandle) {
                setTwitterUsername(twitterHandle);
                setTwitterStatus('saved');
            }
        }
    }, [user, twitterUsername]);

    const loadUserData = async () => {
        setLoading(true);
        setError(null);
        setSyncStatus('loading');

        // First, try to load from localStorage (this should always work if user is logged in)
        const userData = localStorage.getItem('user');
        if (userData) {
            const userObj = JSON.parse(userData);
            setUser(userObj);
            setFormData({
                firstName: userObj.firstName || userObj.name?.split(' ')[0] || '',
                lastName: userObj.lastName || userObj.name?.split(' ')[1] || '',
                email: userObj.email || '',
                bio: userObj.bio || '',
                location: userObj.location || '',
                website: userObj.website || '',
                twitter: userObj.twitter || ''
            });

            // Set Twitter username state from localStorage (fast initial render)
            const twitterHandle = userObj.twitter_handle || userObj.twitter || '';
            console.log('Loading Twitter username from localStorage:', {
                twitter_handle: userObj.twitter_handle,
                twitter: userObj.twitter,
                finalHandle: twitterHandle,
                userObj: userObj
            });
            setTwitterUsername(twitterHandle);
            setTwitterStatus(twitterHandle ? 'saved' : 'empty');

            // Set sync status to syncing while we fetch from Firebase
            setSyncStatus('syncing');
        } else {
            // No user data in localStorage, redirect to login
            router.push('/auth/login');
            return;
        }

        // Then try to refresh from API in background (ensure data is current)
        try {
            const freshUserData = await getCurrentUser();
            setUser(freshUserData);
            setFormData({
                firstName: freshUserData.firstName || freshUserData.name?.split(' ')[0] || '',
                lastName: freshUserData.lastName || freshUserData.name?.split(' ')[1] || '',
                email: freshUserData.email || '',
                bio: freshUserData.bio || '',
                location: freshUserData.location || '',
                website: freshUserData.website || '',
                twitter: freshUserData.twitter || ''
            });

            // Update Twitter username state from fresh data (only if different)
            const freshTwitterHandle = freshUserData.twitter_handle || freshUserData.twitter || '';
            if (freshTwitterHandle !== twitterUsername) {
                setTwitterUsername(freshTwitterHandle);
                setTwitterStatus(freshTwitterHandle ? 'saved' : 'empty');
            }

            // Update localStorage with fresh data
            localStorage.setItem('user', JSON.stringify(freshUserData));
            setSyncStatus('synced');
        } catch (err) {
            console.warn('Failed to refresh user data from API, using cached data:', err);
            setSyncStatus('offline');
            // Don't show error or redirect - just use the localStorage data we already loaded
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Twitter username validation
    const validateTwitterUsername = (username: string): { isValid: boolean; message?: string } => {
        if (!username) return { isValid: true }; // Optional field

        // Remove @ if present
        const cleanUsername = username.replace('@', '');

        // Twitter username rules: 1-15 characters, alphanumeric and underscore only
        if (cleanUsername.length < 1 || cleanUsername.length > 15) {
            return { isValid: false, message: 'Twitter username must be 1-15 characters long' };
        }

        if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
            return { isValid: false, message: 'Twitter username can only contain letters, numbers, and underscores' };
        }

        if (cleanUsername.startsWith('_') || cleanUsername.endsWith('_')) {
            return { isValid: false, message: 'Twitter username cannot start or end with underscore' };
        }

        return { isValid: true };
    };

    const formatTwitterUsername = (username: string): string => {
        return username.replace('@', '').toLowerCase();
    };

    // Twitter username management functions
    const handleAddTwitterUsername = async () => {
        if (!formData.twitter.trim()) return;

        setTwitterLoading(true);
        setSyncStatus('syncing');
        try {
            const validation = validateTwitterUsername(formData.twitter);
            if (!validation.isValid) {
                setError(validation.message || 'Invalid Twitter username');
                setTwitterLoading(false);
                setSyncStatus('offline');
                return;
            }

            const formattedUsername = formatTwitterUsername(formData.twitter);
            const profileData = {
                ...formData,
                twitter: formattedUsername,
                twitter_handle: formattedUsername
            };

            const updatedUser = await updateProfile(profileData);
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));

            setTwitterUsername(formattedUsername);
            setTwitterStatus('saved');
            setFormData(prev => ({ ...prev, twitter: '' }));
            setSyncStatus('synced');
        } catch (err: any) {
            setError(err.message || 'Failed to save Twitter username');
            setSyncStatus('offline');
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

        setTwitterLoading(true);
        setSyncStatus('syncing');
        try {
            const validation = validateTwitterUsername(formData.twitter);
            if (!validation.isValid) {
                setError(validation.message || 'Invalid Twitter username');
                setTwitterLoading(false);
                setSyncStatus('offline');
                return;
            }

            const formattedUsername = formatTwitterUsername(formData.twitter);
            const profileData = {
                ...formData,
                twitter: formattedUsername,
                twitter_handle: formattedUsername
            };

            const updatedUser = await updateProfile(profileData);
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));

            setTwitterUsername(formattedUsername);
            setTwitterStatus('saved');
            setSyncStatus('synced');
        } catch (err: any) {
            setError(err.message || 'Failed to update Twitter username');
            setSyncStatus('offline');
        } finally {
            setTwitterLoading(false);
        }
    };

    const handleCancelTwitterEdit = () => {
        setFormData(prev => ({ ...prev, twitter: '' }));
        setTwitterStatus('saved');
    };

    const handleRemoveTwitterUsername = async () => {
        if (!confirm('Are you sure you want to remove your Twitter username? This will affect mission verification.')) {
            return;
        }

        setTwitterLoading(true);
        setSyncStatus('syncing');
        try {
            const profileData = {
                ...formData,
                twitter: '',
                twitter_handle: ''
            };

            const updatedUser = await updateProfile(profileData);
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));

            setTwitterUsername('');
            setTwitterStatus('empty');
            setFormData(prev => ({ ...prev, twitter: '' }));
            setSyncStatus('synced');
        } catch (err: any) {
            setError(err.message || 'Failed to remove Twitter username');
            setSyncStatus('offline');
        } finally {
            setTwitterLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        setLoading(true);
        setError(null);

        try {
            // No validation needed for basic profile fields

            // Prepare profile data for API
            const profileData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                bio: formData.bio,
                location: formData.location,
                website: formData.website,
                name: `${formData.firstName} ${formData.lastName}`.trim()
            };

            // Call the API to update profile
            const updatedUser = await updateProfile(profileData);

            // Update local state
            setUser(updatedUser);

            // Update localStorage for consistency
            localStorage.setItem('user', JSON.stringify(updatedUser));

            // Show success message
            alert('Profile updated successfully!');
        } catch (err: any) {
            console.error('Profile update error:', err);
            setError(err.message || 'Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            localStorage.removeItem('user');
            localStorage.removeItem('firebaseToken');
            router.push('/auth/login');
        }
    };

    if (!user) {
        return (
            <ModernLayout currentPage="/profile">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                        <p className="text-gray-400">Loading profile...</p>
                    </div>
                </div>
            </ModernLayout>
        );
    }

    return (
        <ProtectedRoute>
            <ModernLayout currentPage="/profile">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6 md:mb-8">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-400 via-emerald-500 to-blue-500 bg-clip-text text-transparent mb-2">
                            Profile Settings
                        </h1>
                        <p className="text-gray-400 text-sm md:text-base">
                            Manage your account settings and preferences
                        </p>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="mb-8 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                            <p className="text-red-400 text-sm">{error}</p>
                            <button
                                onClick={loadUserData}
                                className="mt-2 text-red-400 hover:text-red-300 text-sm underline"
                            >
                                Try again
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
                        {/* Sidebar */}
                        <div className="lg:col-span-1 order-2 lg:order-1">
                            <ModernCard className="p-4 sm:p-6">
                                {/* User Info */}
                                <div className="text-center mb-6">
                                    <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 rounded-full overflow-hidden bg-gradient-to-br from-green-400 to-blue-500">
                                        <img
                                            src={user.avatar}
                                            alt={user.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <h2 className="text-lg sm:text-xl font-bold text-white mb-1">{user.name}</h2>
                                    <p className="text-gray-400 text-sm">{user.email}</p>
                                    <p className="text-gray-500 text-xs mt-1">
                                        Member since {new Date(user.joinedAt).toLocaleDateString()}
                                    </p>
                                </div>

                                {/* Navigation Tabs */}
                                <div className="space-y-2">
                                    {[
                                        { id: 'profile', name: 'Profile', icon: '👤' },
                                        { id: 'ratings', name: 'Ratings', icon: '⭐' },
                                        { id: 'account', name: 'Account', icon: '⚙️' },
                                        { id: 'security', name: 'Security', icon: '🔒' },
                                        { id: 'preferences', name: 'Preferences', icon: '🎨' },
                                        { id: 'statistics', name: 'Statistics', icon: '📊' }
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-all duration-200 ${activeTab === tab.id
                                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                                                }`}
                                        >
                                            <span className="text-base sm:text-lg">{tab.icon}</span>
                                            <span className="text-sm sm:text-base">{tab.name}</span>
                                        </button>
                                    ))}
                                </div>

                                {/* Logout Button */}
                                <div className="mt-6 pt-6 border-t border-gray-700">
                                    <ModernButton
                                        onClick={handleLogout}
                                        variant="danger"
                                        className="w-full"
                                    >
                                        🚪 Sign Out
                                    </ModernButton>
                                </div>
                            </ModernCard>
                        </div>

                        {/* Main Content */}
                        <div className="lg:col-span-2 order-1 lg:order-2">
                            {activeTab === 'profile' && (
                                <ModernCard title="Profile Information" icon="👤">
                                    <div className="space-y-4 sm:space-y-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-white mb-2">
                                                    First Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.firstName}
                                                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                                                    className="w-full p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-white mb-2">
                                                    Last Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.lastName}
                                                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                                                    className="w-full p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-white mb-2">
                                                Email Address
                                            </label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => handleInputChange('email', e.target.value)}
                                                className="w-full p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-white mb-2">
                                                Bio
                                            </label>
                                            <textarea
                                                value={formData.bio}
                                                onChange={(e) => handleInputChange('bio', e.target.value)}
                                                rows={4}
                                                className="w-full p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-sm sm:text-base"
                                                placeholder="Tell us about yourself..."
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-white mb-2">
                                                Location
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.location}
                                                onChange={(e) => handleInputChange('location', e.target.value)}
                                                className="w-full p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                                                placeholder="City, Country"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-white mb-2">
                                                Website
                                            </label>
                                            <input
                                                type="url"
                                                value={formData.website}
                                                onChange={(e) => handleInputChange('website', e.target.value)}
                                                className="w-full p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                                                placeholder="https://yourwebsite.com"
                                            />
                                        </div>

                                        {/* Twitter Username Section */}
                                        <div className="border-t border-gray-700 pt-6">
                                            <h3 className="text-base sm:text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                                <span>🐦</span>
                                                Twitter Username
                                                <span className="text-xs text-yellow-400 bg-yellow-500/20 px-2 py-1 rounded">
                                                    Required for verification
                                                </span>
                                            </h3>
                                            <div className="flex items-center justify-between mb-4">
                                                <p className="text-gray-400 text-sm">
                                                    Link your Twitter account for mission verification
                                                </p>
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
                                                            Syncing...
                                                        </span>
                                                    )}
                                                    {syncStatus === 'synced' && (
                                                        <span className="text-xs text-green-400 flex items-center gap-1">
                                                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                                            Synced
                                                        </span>
                                                    )}
                                                    {syncStatus === 'offline' && (
                                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                                            Offline
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {console.log('Twitter section render:', { twitterStatus, twitterUsername, user: user?.twitter_handle || user?.twitter })}
                                            {twitterStatus === 'empty' && (
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-gray-400 text-sm">@</span>
                                                        <input
                                                            type="text"
                                                            value={formData.twitter}
                                                            onChange={(e) => handleInputChange('twitter', e.target.value.replace('@', ''))}
                                                            className={`flex-1 p-3 bg-gray-800/50 border rounded-lg text-white focus:ring-2 focus:border-transparent text-sm sm:text-base ${formData.twitter ?
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
                                                            className={`flex-1 p-3 bg-gray-800/50 border rounded-lg text-white focus:ring-2 focus:border-transparent text-sm sm:text-base ${formData.twitter ?
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
                                        </div>

                                        <ModernButton
                                            onClick={handleSaveProfile}
                                            variant="success"
                                            loading={loading}
                                            className="w-full sm:w-auto"
                                        >
                                            {loading ? 'Saving...' : 'Save Changes'}
                                        </ModernButton>
                                    </div>
                                </ModernCard>
                            )}

                            {activeTab === 'account' && (
                                <ModernCard title="Account Settings" icon="⚙️">
                                    <div className="space-y-4 sm:space-y-6">
                                        <div>
                                            <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Account Information</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="text-gray-400">User ID:</span>
                                                    <span className="text-white ml-2">{user.id}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-400">Member Since:</span>
                                                    <span className="text-white ml-2">
                                                        {new Date(user.joinedAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-400">Account Status:</span>
                                                    <span className="text-green-400 ml-2">Active</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-400">Email Verified:</span>
                                                    <span className="text-green-400 ml-2">Yes</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-700 pt-6">
                                            <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Danger Zone</h3>
                                            <div className="space-y-4">
                                                <ModernButton
                                                    variant="danger"
                                                    size="sm"
                                                >
                                                    🗑️ Delete Account
                                                </ModernButton>
                                            </div>
                                        </div>
                                    </div>
                                </ModernCard>
                            )}

                            {activeTab === 'ratings' && (
                                <ModernCard title="User Ratings & Performance" icon="⭐">
                                    <div className="space-y-4 sm:space-y-6">
                                        {/* Overall Rating */}
                                        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg p-4 sm:p-6 border border-green-500/30">
                                            <div className="text-center">
                                                <div className="text-3xl sm:text-4xl font-bold text-green-400 mb-2">4.8</div>
                                                <div className="text-base sm:text-lg text-white mb-2">Overall Rating</div>
                                                <div className="flex justify-center space-x-1">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <span key={star} className="text-xl sm:text-2xl">
                                                            {star <= 4 ? '⭐' : '⭐'}
                                                        </span>
                                                    ))}
                                                </div>
                                                <div className="text-xs sm:text-sm text-gray-400 mt-2">Based on 0 completed missions</div>
                                            </div>
                                        </div>

                                        {/* Rating Distribution */}
                                        <div>
                                            <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Rating Distribution</h3>
                                            <div className="space-y-3">
                                                {[5, 4, 3, 2, 1].map((rating) => (
                                                    <div key={rating} className="flex items-center space-x-3">
                                                        <div className="flex items-center space-x-1 w-16">
                                                            <span className="text-white text-sm">{rating}</span>
                                                            <span className="text-yellow-400 text-sm">⭐</span>
                                                        </div>
                                                        <div className="flex-1 bg-gray-700 rounded-full h-2">
                                                            <div
                                                                className="bg-yellow-400 h-2 rounded-full"
                                                                style={{
                                                                    width: `${rating === 5 ? 65 : rating === 4 ? 25 : rating === 3 ? 8 : rating === 2 ? 2 : 0}%`
                                                                }}
                                                            ></div>
                                                        </div>
                                                        <div className="text-xs sm:text-sm text-gray-400 w-12 text-right">
                                                            {rating === 5 ? '65%' : rating === 4 ? '25%' : rating === 3 ? '8%' : rating === 2 ? '2%' : '0%'}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Recent Mission Ratings */}
                                        <div>
                                            <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Recent Mission Ratings</h3>
                                            <div className="space-y-3">
                                                <div className="text-center py-8">
                                                    <div className="text-4xl mb-3">⭐</div>
                                                    <p className="text-gray-400 text-sm">No mission ratings yet</p>
                                                    <p className="text-gray-500 text-xs mt-1">Complete missions to see your ratings here</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Performance Stats */}
                                        <div>
                                            <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Performance Statistics</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                                                    <div className="text-xl sm:text-2xl font-bold text-green-400 mb-1">0</div>
                                                    <div className="text-xs sm:text-sm text-gray-400">Missions Completed</div>
                                                </div>
                                                <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                                                    <div className="text-xl sm:text-2xl font-bold text-blue-400 mb-1">-</div>
                                                    <div className="text-xs sm:text-sm text-gray-400">Success Rate</div>
                                                </div>
                                                <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                                                    <div className="text-xl sm:text-2xl font-bold text-purple-400 mb-1">-</div>
                                                    <div className="text-xs sm:text-sm text-gray-400">Avg. Completion Time</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </ModernCard>
                            )}

                            {activeTab === 'security' && (
                                <ModernCard title="Security Settings" icon="🔒">
                                    <div className="space-y-4 sm:space-y-6">
                                        <div>
                                            <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Password</h3>
                                            <ModernButton variant="secondary" size="sm">
                                                🔑 Change Password
                                            </ModernButton>
                                        </div>

                                        <div className="border-t border-gray-700 pt-6">
                                            <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Two-Factor Authentication</h3>
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                                                <div>
                                                    <p className="text-white text-sm sm:text-base">Enable 2FA for extra security</p>
                                                    <p className="text-gray-400 text-xs sm:text-sm">Protect your account with an additional verification step</p>
                                                </div>
                                                <ModernButton variant="secondary" size="sm">
                                                    🔐 Enable 2FA
                                                </ModernButton>
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-700 pt-6">
                                            <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Active Sessions</h3>
                                            <div className="space-y-3">
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-800/30 rounded-lg space-y-2 sm:space-y-0">
                                                    <div>
                                                        <p className="text-white text-sm sm:text-base">Current Session</p>
                                                        <p className="text-gray-400 text-xs sm:text-sm">Chrome on macOS</p>
                                                    </div>
                                                    <span className="text-green-400 text-xs sm:text-sm">Active</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </ModernCard>
                            )}

                            {activeTab === 'preferences' && (
                                <ModernCard title="Preferences" icon="🎨">
                                    <div className="space-y-4 sm:space-y-6">
                                        <div>
                                            <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Notifications</h3>
                                            <div className="space-y-4">
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                                                    <div>
                                                        <p className="text-white text-sm sm:text-base">Email Notifications</p>
                                                        <p className="text-gray-400 text-xs sm:text-sm">Receive updates about your missions and rewards</p>
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        defaultChecked
                                                        className="h-4 w-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500 focus:ring-2"
                                                    />
                                                </div>
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                                                    <div>
                                                        <p className="text-white text-sm sm:text-base">Push Notifications</p>
                                                        <p className="text-gray-400 text-xs sm:text-sm">Get instant notifications in your browser</p>
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        defaultChecked
                                                        className="h-4 w-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500 focus:ring-2"
                                                    />
                                                </div>
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                                                    <div>
                                                        <p className="text-white text-sm sm:text-base">Marketing Emails</p>
                                                        <p className="text-gray-400 text-xs sm:text-sm">Receive promotional content and updates</p>
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        defaultChecked={user.preferences?.marketing}
                                                        className="h-4 w-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500 focus:ring-2"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-700 pt-6">
                                            <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Privacy</h3>
                                            <div className="space-y-4">
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                                                    <div>
                                                        <p className="text-white text-sm sm:text-base">Public Profile</p>
                                                        <p className="text-gray-400 text-xs sm:text-sm">Allow others to see your profile</p>
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        defaultChecked
                                                        className="h-4 w-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500 focus:ring-2"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </ModernCard>
                            )}

                            {activeTab === 'statistics' && (
                                <ModernCard title="Your Statistics" icon="📊">
                                    <div className="space-y-4 sm:space-y-6">
                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                                            <div className="text-center p-3 sm:p-4 bg-gray-800/30 rounded-lg">
                                                <div className="text-xl sm:text-2xl font-bold text-green-400 mb-1">0</div>
                                                <div className="text-xs sm:text-sm text-gray-400">Missions Created</div>
                                            </div>
                                            <div className="text-center p-3 sm:p-4 bg-gray-800/30 rounded-lg">
                                                <div className="text-xl sm:text-2xl font-bold text-blue-400 mb-1">0</div>
                                                <div className="text-xs sm:text-sm text-gray-400">Missions Completed</div>
                                            </div>
                                            <div className="text-center p-3 sm:p-4 bg-gray-800/30 rounded-lg">
                                                <div className="text-xl sm:text-2xl font-bold text-purple-400 mb-1">0</div>
                                                <div className="text-xs sm:text-sm text-gray-400">Honors Earned</div>
                                            </div>
                                            <div className="text-center p-3 sm:p-4 bg-gray-800/30 rounded-lg">
                                                <div className="text-xl sm:text-2xl font-bold text-yellow-400 mb-1">-</div>
                                                <div className="text-xs sm:text-sm text-gray-400">Success Rate</div>
                                            </div>
                                        </div>

                                        {/* Activity Chart */}
                                        <div>
                                            <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Recent Activity</h3>
                                            <div className="space-y-3">
                                                <div className="text-center py-8">
                                                    <div className="text-4xl mb-3">📊</div>
                                                    <p className="text-gray-400 text-sm">No recent activity</p>
                                                    <p className="text-gray-500 text-xs mt-1">Start participating in missions to see your activity here</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </ModernCard>
                            )}
                        </div>
                    </div>
                </div>
            </ModernLayout>
        </ProtectedRoute>
    );
}
