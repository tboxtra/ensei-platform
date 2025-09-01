import React from 'react';

interface ModernLayoutProps {
    children: React.ReactNode;
    currentPage?: string;
}

export function ModernLayout({ children, currentPage }: ModernLayoutProps) {
    const navigation = [
        { href: '/dashboard', icon: '🏠', label: 'Dashboard' },
        { href: '/missions', icon: '🔍', label: 'Discover & Earn' },
        { href: '/missions/create', icon: '🚀', label: 'Create Mission' },
        { href: '/missions/my', icon: '📊', label: 'My Missions' },
        { href: '/review', icon: '📄', label: 'Review' },
        { href: '/claim', icon: '💰', label: 'Claim' },
        { href: '/wallet', icon: '👛', label: 'Wallet' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
            {/* Modern Header */}
            <div className="bg-black/50 backdrop-blur-lg border-b border-gray-800/50 px-6 py-4 sticky top-0 z-50">
                <div className="flex justify-between items-center max-w-7xl mx-auto">
                    <div className="flex items-center space-x-4">
                        <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                            Ensei
                        </div>
                        <div className="text-sm text-gray-400">Mission Platform</div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="text-center">
                            <div className="text-lg font-semibold text-green-400">0 Honors</div>
                            <div className="text-xs text-gray-400">≈ $0.00 USD</div>
                        </div>
                        <button className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-full hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-green-500/25">
                            Connect Wallet
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex max-w-7xl mx-auto">
                {/* Modern Sidebar */}
                <div className="w-80 bg-black/30 backdrop-blur-lg border-r border-gray-800/50 min-h-screen p-6 sticky top-20">
                    <nav className="space-y-3">
                        {navigation.map((item) => {
                            const isActive = currentPage === item.href;
                            return (
                                <a
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center p-3 rounded-xl transition-all duration-200 group ${isActive
                                        ? 'text-green-400 bg-green-500/10 border border-green-500/20'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <span className={`mr-3 text-lg transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                                        {item.icon}
                                    </span>
                                    <span className="font-medium">{item.label}</span>
                                </a>
                            );
                        })}
                    </nav>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-8">
                    {children}
                </div>
            </div>
        </div>
    );
}
