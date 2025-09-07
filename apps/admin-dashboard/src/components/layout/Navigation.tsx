'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { RealTimeUpdates } from '../realtime/RealTimeUpdates';

export const Navigation: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-indigo-600">
              Ensei Admin
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link 
              href="/review" 
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Review Queue
            </Link>
            <Link 
              href="/missions" 
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Missions
            </Link>
            <Link 
              href="/users" 
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Users
            </Link>
            <Link 
              href="/analytics" 
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Analytics
            </Link>
            <Link 
              href="/settings" 
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Settings
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <RealTimeUpdates />
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-indigo-600">
                  {user?.name?.charAt(0) || 'A'}
                </span>
              </div>
              <div className="hidden md:block">
                <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                <div className="text-xs text-gray-500">{user?.role}</div>
              </div>
            </div>
            
            <button
              onClick={logout}
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
