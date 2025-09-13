'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { UserCard } from '../../components/users/UserCard';
import { UserFilters } from '../../components/users/UserFilters';
import { UserStats } from '../../components/users/UserStats';
import { apiClient } from '../../lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'premium' | 'moderator' | 'admin';
  status: 'active' | 'suspended' | 'banned';
  createdAt: string;
  lastLogin?: string;
  totalSubmissions: number;
  approvedSubmissions: number;
  totalEarned: number;
  reputation: number;
  missionsCreated: number;
  missionsCompleted: number;
}

interface UserFilters {
  status: string;
  role: string;
  search: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<UserFilters>({
    status: '',
    role: '',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // No mock data - using real API

  useEffect(() => {
    loadUsers();
  }, [filters, pagination.page]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.getUsers({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      });

      if (response.success && response.data) {
        setUsers(response.data);
        setPagination(prev => ({
          ...prev,
          total: response.data?.length || 0,
          totalPages: Math.ceil((response.data?.length || 0) / pagination.limit)
        }));
      } else {
        setUsers([]);
        setPagination(prev => ({
          ...prev,
          total: 0,
          totalPages: 0
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: Partial<UserFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleUserStatusChange = async (userId: string, status: 'active' | 'suspended' | 'banned') => {
    try {
      const response = await apiClient.updateUserStatus(userId, status);
      
      if (response.success) {
        // Update local state
        setUsers(prev =>
          prev.map(user =>
            user.id === userId
              ? { ...user, status }
              : user
          )
        );
      } else {
        setError(response.message || 'Failed to update user status');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user status');
    }
  };

  return (
    <ProtectedRoute requiredPermission="users:read">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <div className="text-sm text-gray-500">
            {pagination.total} total users
          </div>
        </div>

        <UserStats users={users} />

        <UserFilters
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onStatusChange={handleUserStatusChange}
              />
            ))}
          </div>
        )}

        {users.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">No users found</p>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
