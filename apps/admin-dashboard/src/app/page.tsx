'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    console.log('Admin Dashboard - Auth State:', { isAuthenticated, isLoading, user });

    if (!isLoading) {
      if (isAuthenticated) {
        console.log('Admin Dashboard - Redirecting to /review');
        router.push('/review');
      } else {
        console.log('Admin Dashboard - Not authenticated, should show login form');
      }
    }
  }, [isAuthenticated, isLoading, router, user]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  // This should not be reached if ProtectedRoute is working correctly
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
        <p className="text-gray-600 mb-4">Auth State: {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</p>
        <p className="text-gray-600">User: {user ? user.email : 'None'}</p>
      </div>
    </div>
  );
}
