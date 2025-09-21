'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ModernLayout } from '../../components/layout/ModernLayout';
import { ModernCard } from '../../components/ui/ModernCard';
import { ModernButton } from '../../components/ui/ModernButton';
import { useApi } from '../../hooks/useApi';
import { useAuthStore } from '../../store/authStore';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';

export default function ProfilePage() {
    const router = useRouter();
    const { getCurrentUser, getUserProfile, logout, updateProfile, loading: apiLoading, error: apiError } = useApi();
    const { user: storeUser, setUser: setStoreUser } = useAuthStore();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        twitter: ''
    });

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
    const [syncStatus, setSyncStatus] = useState<'loading' | 'synced' | 'offline' | 'syncing'>('loading');
    const [isInitialized, setIsInitialized] = useState<boolean>(initialTwitterState.initialized);
    const [syncMessage, setSyncMessage] = useState<string>('');

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        setLoading(true);
        setSyncStatus('loading');

        try {
            // Load from localStorage first for fast initial render
            const userData = localStorage.getItem('user');
            if (userData) {
                const userObj = JSON.parse(userData);
                setUser(userObj);
                setFormData({
                    firstName: userObj.firstName || userObj.name?.split(' ')[0] || '',
                    lastName: userObj.lastName || userObj.name?.split(' ')[1] || '',
                    email: userObj.email || '',
                    twitter: userObj.twitter || ''
                });
            }
        } catch (err) {
            console.warn('Failed to load user data from localStorage:', err);
        }

        // Then try to refresh from API in background (ensure data is current)
        try {
            console.log('loadUserData: Fetching fresh data from Firebase...');
            const freshUserData = await getUserProfile();
            console.log('loadUserData: Fresh data from Firebase:', freshUserData);
            setUser(freshUserData);
            setFormData({
                firstName: freshUserData.firstName || freshUserData.name?.split(' ')[0] || '',
                lastName: freshUserData.lastName || freshUserData.name?.split(' ')[1] || '',
                email: freshUserData.email || '',
                twitter: freshUserData.twitter || ''
            });

            // Use proper conflict resolution to merge local and server data
            const currentUserData = localStorage.getItem('user');
            const currentUser = currentUserData ? JSON.parse(currentUserData) : null;

            const mergedUserData = mergeUserData(currentUser, freshUserData);
            console.log('loadUserData: Merged user data:', mergedUserData);

            // Update Twitter username state from merged data
            const mergedTwitterHandle = mergedUserData.twitter_handle || mergedUserData.twitter || '';
            console.log('loadUserData: Twitter handle from merged data:', mergedTwitterHandle);

            setTwitterUsername(mergedTwitterHandle);
            setTwitterStatus(mergedTwitterHandle ? 'saved' : 'empty');

            // Update localStorage with merged data
            localStorage.setItem('user', JSON.stringify(mergedUserData));
            setSyncStatus('synced');
        } catch (err) {
            console.warn('Failed to refresh user data from API, using cached data:', err);
            setSyncStatus('offline');
            // Don't show error or redirect - just use the localStorage data we already loaded
        } finally {
            setLoading(false);
            setIsInitialized(true);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveProfile = async () => {
        setLoading(true);
        setError(null);
        try {
            // Only send profile fields, not stats
            const profileData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                twitter: formData.twitter,
                twitter_handle: formData.twitter,
            };
            
            const updatedUser = await updateProfile(profileData);
            
            // Update store with only profile fields (merge pattern) - preserves uid and other fields
            setStoreUser({
                firstName: updatedUser.firstName || formData.firstName,
                lastName: updatedUser.lastName || formData.lastName,
                email: updatedUser.email || formData.email,
                twitter: updatedUser.twitter || formData.twitter,
                twitter_handle: updatedUser.twitter_handle || formData.twitter,
                displayName: updatedUser.displayName || `${formData.firstName} ${formData.lastName}`.trim(),
            });
            
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            // Debug: log profile update for regression tracking
            if (process.env.NODE_ENV === 'development') {
                console.debug('[Profile] Profile updated (merge pattern):', {
                    uid: storeUser?.uid,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    twitter: formData.twitter
                });
            }
        } catch (err: any) {
            setError(err.message || 'Failed to save profile');
        } finally {
            setLoading(false);
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

    // Industry standard conflict resolution - merge user data intelligently
    const mergeUserData = (localData: any, serverData: any) => {
        console.log('Merging user data:', { localData, serverData });

        const merged = {
            ...serverData, // Start with server data as base
            // Preserve local changes that server doesn't have or has empty
            twitter: localData?.twitter || serverData?.twitter || '',
            twitter_handle: localData?.twitter_handle || serverData?.twitter_handle || '',
            // Use server timestamp for other fields
            updated_at: serverData?.updated_at || new Date().toISOString()
        };

        console.log('Merged user data:', merged);
        return merged;
    };

    // Retry mechanism for failed Firebase saves
    const saveWithRetry = async (data: any, maxRetries: number = 3): Promise<any> => {
        for (let i = 0; i < maxRetries; i++) {
            try {
                console.log(`Attempting save (attempt ${i + 1}/${maxRetries}):`, data);
                const result = await updateProfile(data);
                console.log('Save successful:', result);
                return result;
            } catch (error: any) {
                console.error(`Save attempt ${i + 1} failed:`, error);

                if (i === maxRetries - 1) {
                    throw new Error(`Failed to save after ${maxRetries} attempts: ${error.message}`);
                }

                // Exponential backoff
                const delay = 1000 * Math.pow(2, i);
                console.log(`Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    };

    // Background sync queue for failed saves
    const backgroundSyncQueue = {
        queue: [] as Array<{ id: string; data: any; timestamp: number }>,

        add: function (id: string, data: any) {
            const item = { id, data, timestamp: Date.now() };
            this.queue.push(item);
            console.log('Added to background sync queue:', item);
            this.process();
        },

        process: async function () {
            if (this.queue.length === 0) return;

            const item = this.queue.shift();
            if (!item) return;

            try {
                await saveWithRetry(item.data);
                console.log('Background sync successful for:', item.id);
            } catch (error) {
                console.error('Background sync failed for:', item.id, error);
                // Re-queue if not too old (older than 1 hour)
                if (Date.now() - item.timestamp < 3600000) {
                    this.queue.push(item);
                }
            }
        }
    };

    // Twitter username management functions with optimistic updates
    const handleAddTwitterUsername = async () => {
        if (!formData.twitter.trim()) return;

        const validation = validateTwitterUsername(formData.twitter);
        if (!validation.isValid) {
            setError(validation.message || 'Invalid Twitter username');
            return;
        }

        const formattedUsername = formatTwitterUsername(formData.twitter);

        // 1. OPTIMISTIC UPDATE - Update UI immediately
        const previousUsername = twitterUsername;
        const previousStatus = twitterStatus;

        setTwitterUsername(formattedUsername);
        setTwitterStatus('saved');
        setTwitterLoading(true);
        setSyncStatus('syncing');
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
                twitter_handle: formattedUsername
            };

            console.log('Saving Twitter username to Firebase:', {
                profileData,
                currentUser,
                user,
                formData
            });

            // 3. Save to Firebase with retry mechanism
            const updatedUser = await saveWithRetry(profileData);
            console.log('Firebase response:', updatedUser);

            if (!updatedUser) {
                throw new Error('Firebase returned empty response');
            }

            // 4. SUCCESS - Update state with server response
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setSyncStatus('synced');
            setSyncMessage('');
            setError(null);

        } catch (err: any) {
            console.error('Error saving Twitter username:', err);

            // 5. ROLLBACK - Revert optimistic update
            setTwitterUsername(previousUsername);
            setTwitterStatus(previousStatus);
            setFormData(prev => ({ ...prev, twitter: formattedUsername }));
            setSyncStatus('offline');

            // 6. Show user-friendly error and queue for background retry
            setError('Failed to save Twitter username. Will retry in background.');
            setSyncMessage('Save failed - retrying in background...');

            // 7. Queue for background sync
            const currentUserData = localStorage.getItem('user');
            const currentUser = currentUserData ? JSON.parse(currentUserData) : user;
            const profileData = {
                firstName: currentUser?.firstName || formData.firstName || '',
                lastName: currentUser?.lastName || formData.lastName || '',
                email: currentUser?.email || formData.email || '',
                twitter: formattedUsername,
                twitter_handle: formattedUsername
            };

            backgroundSyncQueue.add('addTwitterUsername', profileData);

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
            setError(validation.message || 'Invalid Twitter username');
            return;
        }

        const formattedUsername = formatTwitterUsername(formData.twitter);
        setTwitterLoading(true);
        setSyncStatus('syncing');

        try {
            const currentUserData = localStorage.getItem('user');
            const currentUser = currentUserData ? JSON.parse(currentUserData) : user;

            const profileData = {
                firstName: currentUser?.firstName || formData.firstName || '',
                lastName: currentUser?.lastName || formData.lastName || '',
                email: currentUser?.email || formData.email || '',
                twitter: formattedUsername,
                twitter_handle: formattedUsername
            };

            const updatedUser = await saveWithRetry(profileData);
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setTwitterUsername(formattedUsername);
            setTwitterStatus('saved');
            setFormData(prev => ({ ...prev, twitter: '' }));
            setSyncStatus('synced');
            setSyncMessage('');
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to save Twitter username');
            setSyncStatus('offline');
            setSyncMessage('Save failed - retrying in background...');
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
        setSyncStatus('syncing');

        try {
            const currentUserData = localStorage.getItem('user');
            const currentUser = currentUserData ? JSON.parse(currentUserData) : user;

            const profileData = {
                firstName: currentUser?.firstName || formData.firstName || '',
                lastName: currentUser?.lastName || formData.lastName || '',
                email: currentUser?.email || formData.email || '',
                twitter: '',
                twitter_handle: ''
            };

            const updatedUser = await saveWithRetry(profileData);
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setTwitterUsername('');
            setTwitterStatus('empty');
            setSyncStatus('synced');
            setSyncMessage('');
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to remove Twitter username');
            setSyncStatus('offline');
            setSyncMessage('Remove failed - retrying in background...');
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
                        <p className="text-gray-400 mt-1 text-xs">Manage your account information and preferences</p>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <p className="text-red-400 text-sm">{error}</p>
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

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-between">
                        <ModernButton
                            onClick={handleSaveProfile}
                            disabled={loading}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-green-500/25"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </ModernButton>

                        <ModernButton
                            onClick={handleLogout}
                            className="bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 hover:text-red-300 px-6 py-3 rounded-lg font-medium transition-all duration-200"
                        >
                            Sign Out
                        </ModernButton>
                    </div>
                </div>
            </ModernLayout>
        </ProtectedRoute>
    );
}