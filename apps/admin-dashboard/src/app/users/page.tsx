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

  // Mock data for development
  const mockUsers: User[] = [
    {
      id: 'user_1',
      email: 'john.doe@example.com',
      name: 'John Doe',
      role: 'premium',
      status: 'active',
      createdAt: '2024-01-10T10:30:00Z',
      lastLogin: '2024-01-15T14:20:00Z',
      totalSubmissions: 25,
      approvedSubmissions: 23,
      totalEarned: 12500,
      reputation: 4.2,
      missionsCreated: 3,
      missionsCompleted: 22
    },
    {
      id: 'user_2',
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
      role: 'user',
      status: 'active',
      createdAt: '2024-01-12T15:45:00Z',
      lastLogin: '2024-01-15T09:15:00Z',
      totalSubmissions: 18,
      approvedSubmissions: 16,
      totalEarned: 8500,
      reputation: 3.8,
      missionsCreated: 1,
      missionsCompleted: 15
    },
    {
      id: 'user_3',
      email: 'bob.wilson@example.com',
      name: 'Bob Wilson',
      role: 'user',
      status: 'suspended',
      createdAt: '2024-01-08T12:20:00Z',
      lastLogin: '2024-01-14T16:30:00Z',
      totalSubmissions: 8,
      approvedSubmissions: 5,
      totalEarned: 2500,
      reputation: 2.1,
      missionsCreated: 0,
      missionsCompleted: 5
    },
    {
      id: 'user_4',
      email: 'alice.brown@example.com',
      name: 'Alice Brown',
      role: 'premium',
      status: 'active',
      createdAt: '2024-01-05T08:15:00Z',
      lastLogin: '2024-01-15T11:45:00Z',
      totalSubmissions: 42,
      approvedSubmissions: 38,
      totalEarned: 22500,
      reputation: 4.7,
      missionsCreated: 7,
      missionsCompleted: 35
    }
  ];

  useEffect(() => {
    loadUsers();
  }, [filters, pagination.page]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For now, use mock data
      // const response = await apiClient.getUsers({
      //   page: pagination.page,
      //   limit: pagination.limit,
      //   ...filters
      // });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUsers(mockUsers);
      setPagination(prev => ({
        ...prev,
        total: mockUsers.length,
        totalPages: Math.ceil(mockUsers.length / pagination.limit)
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
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
      // await apiClient.updateUserStatus(userId, status);
      
      // Update local state
      setUsers(prev =>
        prev.map(user =>
          user.id === userId
            ? { ...user, status }
            : user
        )
      );
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
