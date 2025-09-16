'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface NavigationItem {
    href: string;
    icon: string;
    label: string;
}

interface CollapsibleSidebarProps {
    navigation: NavigationItem[];
    currentPage?: string;
    user?: any;
}

export function CollapsibleSidebar({ navigation, currentPage, user }: CollapsibleSidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className={`bg-black/30 backdrop-blur-lg border-r border-gray-800/50 min-h-screen sticky top-20 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'
            }`}>
            {/* Toggle Button */}
            <div className="p-4 border-b border-gray-800/50">
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="w-full flex items-center justify-center p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors duration-200"
                >
                    <span className="text-lg">
                        {isCollapsed ? '→' : '←'}
                    </span>
                    {!isCollapsed && (
                        <span className="ml-2 text-sm text-gray-400">Collapse</span>
                    )}
                </button>
            </div>

            {/* Navigation */}
            <nav className="p-4 space-y-2">
                {navigation.map((item) => {
                    const isActive = currentPage === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center p-3 rounded-lg transition-all duration-200 group relative ${isActive
                                    ? 'text-green-400 bg-green-500/10 border border-green-500/20'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                            title={isCollapsed ? item.label : undefined}
                        >
                            <span className={`text-lg transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'
                                }`}>
                                {item.icon}
                            </span>

                            {!isCollapsed && (
                                <span className="ml-3 text-sm font-medium truncate">
                                    {item.label}
                                </span>
                            )}

                            {/* Tooltip for collapsed state */}
                            {isCollapsed && (
                                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                    {item.label}
                                </div>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* User Stats - Only show when expanded */}
            {user && !isCollapsed && (
                <div className="p-4 border-t border-gray-800/50 mt-auto">
                    <div className="bg-gray-800/30 rounded-lg p-4">
                        <div className="text-xs text-gray-400 mb-2">Quick Stats</div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Honors</span>
                                <span className="text-green-400 font-medium">
                                    {user.honors_balance || 0}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Missions</span>
                                <span className="text-blue-400 font-medium">
                                    {user.missions_count || 0}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

