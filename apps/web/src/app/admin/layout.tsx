'use client';

import { useAuth } from '../../contexts/AdminAuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Navigation from '../../components/admin/layout/Navigation';
import ProtectedRoute from '../../components/admin/auth/ProtectedRoute';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
                <Navigation />
                <main className="py-6">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {children}
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
