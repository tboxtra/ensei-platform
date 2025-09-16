'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApi } from '../../hooks/useApi';
import { NavigationIcon, Icon } from '../ui/Icon';

interface ModernLayoutProps {
    children: React.ReactNode;
    currentPage?: string;
}

export function ModernLayout({ children, currentPage }: ModernLayoutProps) {
    const [user, setUser] = useState<any>(null);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isScrolled, setIsScrolled] = useState(false);
    const [quickStats, setQuickStats] = useState({
        missionsCreated: 0,
        missionsCompleted: 0,
        totalEarned: 0
    });
    const { logout, getMissions } = useApi();

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
        setIsLoading(false);
    }, []);

    // Fetch quick stats data
    useEffect(() => {
        const fetchQuickStats = async () => {
            if (!user) return;

            try {
                const allMissions = await getMissions();

                const userMissions = allMissions?.filter((mission: any) =>
                    mission.created_by === user.id
                ) || [];

                const participatedMissions = allMissions?.filter((mission: any) =>
                    mission.participants?.some((participant: any) => participant.id === user.id)
                ) || [];

                const missionsCreated = userMissions.length;
                const missionsCompleted = participatedMissions.filter((mission: any) =>
                    mission.status === 'completed' || mission.status === 'ended'
                ).length;

                const totalEarned = participatedMissions.reduce((total: number, mission: any) => {
                    const participant = mission.participants?.find((p: any) => p.id === user.id);
                    return total + (participant?.honors_earned || 0);
                }, 0);

                setQuickStats({
                    missionsCreated,
                    missionsCompleted,
                    totalEarned
                });
            } catch (error) {
                console.error('Error fetching quick stats:', error);
            }
        };

        fetchQuickStats();
    }, [user, getMissions]);

    // Scroll detection for mobile full-screen UI
    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            setIsScrolled(scrollTop > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navigation = [
        { href: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
        { href: '/missions', icon: 'discover', label: 'Discover & Earn' },
        { href: '/missions/create', icon: 'missions', label: 'Create Mission' },
        { href: '/missions/my', icon: 'missions', label: 'My Missions' },
        { href: '/review', icon: 'review', label: 'Review & Earn' },
        { href: '/claim', icon: 'claims', label: 'Claim' },
        { href: '/wallet', icon: 'wallet', label: 'Wallet' }
    ];

    const handleLogout = async () => {
        try {
            await logout();
            setUser(null);
            window.location.href = '/auth/login';
        } catch (err) {
            console.error('Logout failed:', err);
            // Fallback: clear localStorage and redirect
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            setUser(null);
            window.location.href = '/auth/login';
        }
    };

    // For auth pages, show minimal layout without authentication checks
    if (currentPage?.startsWith('/auth')) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
                {children}
            </div>
        );
    }

    // Show loading state while checking authentication
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    // If user is not authenticated and not on auth pages, redirect to login
    if (!user && !currentPage?.startsWith('/auth')) {
        // Use window.location for redirect to avoid hydration issues
        if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
        }
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Redirecting to login...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
            {/* Modern Header */}
            <div className="bg-gray-800/40 backdrop-blur-lg px-4 sm:px-6 py-2 sm:py-3 lg:sticky lg:top-0 z-50 shadow-[inset_-1px_-1px_3px_rgba(0,0,0,0.3),inset_1px_1px_3px_rgba(255,255,255,0.05)]">
                <div className="flex justify-between items-center max-w-7xl mx-auto">
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <Link href="/dashboard" className="flex items-center space-x-2 sm:space-x-4">
                            <img 
                                src="/icons/ensei-logo-large.svg" 
                                alt="Ensei" 
                                className="w-10 h-10 sm:w-12 sm:h-12"
                            />
                            <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-green-400 bg-clip-text text-transparent">
                                Ensei
                            </div>
                            <div className="hidden sm:block text-sm text-gray-400">Mission Platform</div>
                        </Link>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="lg:hidden p-2 rounded-lg hover:bg-gray-800/50 transition-all duration-200"
                        >
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        {user ? (
                            <>
                                {/* Hide honors on very small screens */}
                                <div className="hidden sm:block text-center">
                                    <div className="text-base sm:text-lg font-semibold text-green-400">0 Honors</div>
                                    <div className="text-xs text-gray-400">≈ $0.00 USD</div>
                                </div>
                                <div className="relative">
                                    <button
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                        className="flex items-center space-x-2 sm:space-x-3 p-2 rounded-lg hover:bg-gray-800/50 transition-all duration-200"
                                    >
                                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-gradient-to-br from-green-400 to-blue-500">
                                            <img
                                                src={user.avatar}
                                                alt={user.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <span className="hidden sm:block text-white font-medium text-sm sm:text-base">{user.name}</span>
                                        <svg className="hidden sm:block w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {showUserMenu && (
                                        <div className="absolute right-0 mt-2 w-48 bg-gray-800/90 backdrop-blur-lg rounded-lg z-50 shadow-[inset_-2px_-2px_6px_rgba(0,0,0,0.4),inset_2px_2px_6px_rgba(255,255,255,0.05)]">
                                            <div className="py-2">
                                                <Link
                                                    href="/profile"
                                                    className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors"
                                                    onClick={() => setShowUserMenu(false)}
                                                >
                                                    <Icon name="profile" size={16} className="mr-2" />
                                                    Profile Settings
                                                </Link>
                                                <Link
                                                    href="/wallet"
                                                    className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors"
                                                    onClick={() => setShowUserMenu(false)}
                                                >
                                                    <Icon name="wallet" size={16} className="mr-2" />
                                                    Wallet
                                                </Link>
                                                <div className="border-t border-gray-700 my-1"></div>
                                                <button
                                                    onClick={handleLogout}
                                                    className="flex items-center w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                                                >
                                                    <Icon name="logout" size={16} className="mr-2" />
                                                    Sign Out
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center space-x-2 sm:space-x-4">
                                <Link
                                    href="/auth/login"
                                    className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/auth/register"
                                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 sm:px-6 py-2 rounded-full hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-green-500/25 text-sm sm:text-base"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex">
                {/* Modern Sidebar */}
                <div className="w-56 bg-gray-800/40 backdrop-blur-lg min-h-screen p-4 fixed top-16 left-0 hidden lg:block shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.4),inset_2px_2px_8px_rgba(255,255,255,0.05)]">
                    <nav className="space-y-3">
                        {navigation.map((item) => {
                            const isActive = currentPage === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center p-2 rounded-xl transition-all duration-200 group ${isActive
                                        ? 'text-green-400 bg-green-500/10 shadow-[inset_-1px_-1px_3px_rgba(0,0,0,0.3),inset_1px_1px_3px_rgba(255,255,255,0.1)]'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5 shadow-[inset_-1px_-1px_2px_rgba(0,0,0,0.2),inset_1px_1px_2px_rgba(255,255,255,0.05)] hover:shadow-[inset_-1px_-1px_1px_rgba(0,0,0,0.1),inset_1px_1px_1px_rgba(255,255,255,0.08)]'
                                        }`}
                                >
                                    <NavigationIcon
                                        page={item.icon}
                                        size={20}
                                        className={`mr-2 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}
                                    />
                                    <span className="font-medium text-sm">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Quick Stats */}
                    {user && (
                        <div className="mt-6 p-3 bg-gray-800/30 rounded-lg shadow-[inset_-1px_-1px_3px_rgba(0,0,0,0.3),inset_1px_1px_3px_rgba(255,255,255,0.05)]">
                            <h3 className="text-xs font-semibold text-white mb-2">Quick Stats</h3>
                            <div className="space-y-1 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Missions Created:</span>
                                    <span className="text-white">{quickStats.missionsCreated}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Missions Completed:</span>
                                    <span className="text-white">{quickStats.missionsCompleted}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Total Earned:</span>
                                    <span className="text-green-400">{quickStats.totalEarned.toLocaleString()} Honors</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Content */}
                <div className={`flex-1 transition-all duration-300 lg:ml-56 ${isScrolled ? 'lg:p-4 lg:p-8 p-0' : 'p-3 sm:p-4 lg:p-8'
                    }`}>
                    {children}
                </div>
            </div>

            {/* Click outside to close user menu */}
            {showUserMenu && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                />
            )}

            {/* Mobile Navigation Overlay */}
            {showUserMenu && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-lg" onClick={() => setShowUserMenu(false)} />
                    <div className="absolute right-0 top-0 h-full w-72 sm:w-80 bg-gray-900/95 backdrop-blur-lg p-4 sm:p-6 shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.4),inset_2px_2px_8px_rgba(255,255,255,0.05)]">
                        <div className="flex justify-between items-center mb-6 sm:mb-8">
                            <h2 className="text-lg sm:text-xl font-bold text-white">Menu</h2>
                            <button
                                onClick={() => setShowUserMenu(false)}
                                className="p-2 rounded-lg hover:bg-gray-800/50 transition-all duration-200"
                            >
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* User Info in Mobile Menu */}
                        {user && (
                            <div className="mb-6 p-4 bg-gray-800/30 rounded-lg shadow-[inset_-1px_-1px_3px_rgba(0,0,0,0.3),inset_1px_1px_3px_rgba(255,255,255,0.05)]">
                                <div className="flex items-center space-x-3 mb-3">
                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-green-400 to-blue-500">
                                        <img
                                            src={user.avatar}
                                            alt={user.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <div className="text-white font-medium text-sm">{user.name}</div>
                                        <div className="text-green-400 text-xs">{quickStats.totalEarned.toLocaleString()} Honors</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <nav className="space-y-2 sm:space-y-3">
                            {navigation.map((item) => {
                                const isActive = currentPage === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center p-3 rounded-xl transition-all duration-200 group ${isActive
                                            ? 'text-green-400 bg-green-500/10 shadow-[inset_-1px_-1px_3px_rgba(0,0,0,0.3),inset_1px_1px_3px_rgba(255,255,255,0.1)]'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5 shadow-[inset_-1px_-1px_2px_rgba(0,0,0,0.2),inset_1px_1px_2px_rgba(255,255,255,0.05)] hover:shadow-[inset_-1px_-1px_1px_rgba(0,0,0,0.1),inset_1px_1px_1px_rgba(255,255,255,0.08)]'
                                            }`}
                                        onClick={() => setShowUserMenu(false)}
                                    >
                                        <NavigationIcon
                                            page={item.icon}
                                            size={24}
                                            className={`mr-3 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}
                                        />
                                        <span className="font-medium text-sm sm:text-base">{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Quick Actions in Mobile Menu */}
                        {user && (
                            <div className="mt-6 pt-6 border-t border-gray-700">
                                <div className="space-y-2">
                                    <Link
                                        href="/profile"
                                        className="flex items-center p-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200"
                                        onClick={() => setShowUserMenu(false)}
                                    >
                                        <Icon name="profile" size={20} className="mr-3" />
                                        <span className="font-medium text-sm">Profile</span>
                                    </Link>
                                    <Link
                                        href="/wallet"
                                        className="flex items-center p-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200"
                                        onClick={() => setShowUserMenu(false)}
                                    >
                                        <Icon name="wallet" size={20} className="mr-3" />
                                        <span className="font-medium text-sm">Wallet</span>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center p-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
                                    >
                                        <Icon name="logout" size={20} className="mr-3" />
                                        <span className="font-medium text-sm">Sign Out</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
