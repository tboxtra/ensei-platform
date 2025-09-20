'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useApi } from '../hooks/useApi';

interface UserStats {
    missionsCreated: number;
    missionsCompleted: number;
    totalEarned: number;
    totalSubmissions: number;
    approvedSubmissions: number;
    reputation: number;
    userRating: number;
    totalReviews: number;
}

interface UserData {
    id: string;
    email: string;
    name: string;
    firstName: string;
    lastName: string;
    avatar: string;
    twitter: string;
    twitter_handle: string;
    stats: {
        missions_created: number;
        missions_completed: number;
        total_honors_earned: number;
        total_usd_earned: number;
    };
    userRating: number;
    totalReviews: number;
    totalSubmissions: number;
    approvedSubmissions: number;
    reputation: number;
    [key: string]: any;
}

interface UserDataContextType {
    user: UserData | null;
    userStats: UserStats;
    loading: boolean;
    error: string | null;
    syncStatus: 'loading' | 'synced' | 'offline' | 'syncing';
    refreshUserData: () => Promise<void>;
    updateUserData: (updates: Partial<UserData>) => void;
    isInitialized: boolean;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export const useUserData = () => {
    const context = useContext(UserDataContext);
    if (context === undefined) {
        throw new Error('useUserData must be used within a UserDataProvider');
    }
    return context;
};

interface UserDataProviderProps {
    children: React.ReactNode;
}

export const UserDataProvider: React.FC<UserDataProviderProps> = ({ children }) => {
    const { getUserProfile, getUserRatings } = useApi();
    const [user, setUser] = useState<UserData | null>(null);
    const [userStats, setUserStats] = useState<UserStats>({
        missionsCreated: 0,
        missionsCompleted: 0,
        totalEarned: 0,
        totalSubmissions: 0,
        approvedSubmissions: 0,
        reputation: 0,
        userRating: 0,
        totalReviews: 0
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [syncStatus, setSyncStatus] = useState<'loading' | 'synced' | 'offline' | 'syncing'>('loading');
    const [isInitialized, setIsInitialized] = useState(false);

    // Load user data from localStorage immediately on mount
    useEffect(() => {
        const loadFromLocalStorage = () => {
            try {
                const userData = localStorage.getItem('user');
                if (userData) {
                    const userObj = JSON.parse(userData);
                    setUser(userObj);
                    
                    // Calculate stats from user data
                    const stats = {
                        missionsCreated: userObj.stats?.missions_created || userObj.missionsCreated || 0,
                        missionsCompleted: userObj.stats?.missions_completed || userObj.missionsCompleted || 0,
                        totalEarned: userObj.stats?.total_honors_earned || userObj.totalEarned || 0,
                        totalSubmissions: userObj.totalSubmissions || 0,
                        approvedSubmissions: userObj.approvedSubmissions || 0,
                        reputation: userObj.reputation || 0,
                        userRating: userObj.userRating || 0,
                        totalReviews: userObj.totalReviews || 0
                    };
                    setUserStats(stats);
                    setIsInitialized(true);
                }
            } catch (err) {
                console.warn('Failed to load user data from localStorage:', err);
            }
        };

        loadFromLocalStorage();
    }, []);

    // Refresh user data from Firebase
    const refreshUserData = useCallback(async () => {
        if (loading) return; // Prevent multiple simultaneous requests
        
        setLoading(true);
        setSyncStatus('syncing');
        setError(null);

        try {
            console.log('UserDataContext: Fetching fresh data from Firebase...');
            
            // Fetch both profile and ratings data in parallel
            const [freshUserData, userRatingsData] = await Promise.all([
                getUserProfile(),
                getUserRatings()
            ]);
            
            console.log('UserDataContext: Fresh user data:', freshUserData);
            console.log('UserDataContext: User ratings data:', userRatingsData);
            
            if (freshUserData) {
                // Merge profile and ratings data
                const mergedUserData: UserData = {
                    ...freshUserData,
                    userRating: userRatingsData?.totalRating || 0,
                    totalReviews: userRatingsData?.totalReviews || 0,
                    totalSubmissions: userRatingsData?.totalSubmissions || 0
                };

                // Update user state
                setUser(mergedUserData);
                
                // Calculate and update stats
                const stats: UserStats = {
                    missionsCreated: mergedUserData.stats?.missions_created || mergedUserData.missionsCreated || 0,
                    missionsCompleted: mergedUserData.stats?.missions_completed || mergedUserData.missionsCompleted || 0,
                    totalEarned: mergedUserData.stats?.total_honors_earned || mergedUserData.totalEarned || 0,
                    totalSubmissions: mergedUserData.totalSubmissions || 0,
                    approvedSubmissions: mergedUserData.approvedSubmissions || 0,
                    reputation: mergedUserData.reputation || 0,
                    userRating: mergedUserData.userRating || 0,
                    totalReviews: mergedUserData.totalReviews || 0
                };
                setUserStats(stats);

                // Update localStorage with fresh data
                localStorage.setItem('user', JSON.stringify(mergedUserData));
                setSyncStatus('synced');
                
                console.log('UserDataContext: Data refreshed successfully');
            }
        } catch (err: any) {
            console.error('UserDataContext: Failed to refresh user data:', err);
            setError(err.message || 'Failed to refresh user data');
            setSyncStatus('offline');
        } finally {
            setLoading(false);
        }
    }, [getUserProfile, getUserRatings, loading]);

    // Update user data locally and sync to Firebase
    const updateUserData = useCallback((updates: Partial<UserData>) => {
        if (!user) return;

        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        
        // Update stats if relevant fields changed
        const stats: UserStats = {
            missionsCreated: updatedUser.stats?.missions_created || updatedUser.missionsCreated || 0,
            missionsCompleted: updatedUser.stats?.missions_completed || updatedUser.missionsCompleted || 0,
            totalEarned: updatedUser.stats?.total_honors_earned || updatedUser.totalEarned || 0,
            totalSubmissions: updatedUser.totalSubmissions || 0,
            approvedSubmissions: updatedUser.approvedSubmissions || 0,
            reputation: updatedUser.reputation || 0,
            userRating: updatedUser.userRating || 0,
            totalReviews: updatedUser.totalReviews || 0
        };
        setUserStats(stats);

        // Update localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser));
    }, [user]);

    // Auto-refresh data when component mounts (if user exists)
    useEffect(() => {
        if (user && !loading) {
            // Refresh data in background
            refreshUserData();
        }
    }, [user?.id]); // Only refresh when user ID changes

    const value: UserDataContextType = {
        user,
        userStats,
        loading,
        error,
        syncStatus,
        refreshUserData,
        updateUserData,
        isInitialized
    };

    return (
        <UserDataContext.Provider value={value}>
            {children}
        </UserDataContext.Provider>
    );
};
