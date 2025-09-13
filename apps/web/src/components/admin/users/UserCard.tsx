'use client';

import React from 'react';

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

interface UserCardProps {
  user: User;
  onStatusChange: (userId: string, status: 'active' | 'suspended' | 'banned') => void;
}

export const UserCard: React.FC<UserCardProps> = ({ user, onStatusChange }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800';
      case 'banned':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'moderator':
        return 'bg-blue-100 text-blue-800';
      case 'premium':
        return 'bg-gold-100 text-gold-800';
      case 'user':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return '👑';
      case 'moderator':
        return '🛡️';
      case 'premium':
        return '⭐';
      case 'user':
        return '👤';
      default:
        return '👤';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getApprovalRate = () => {
    return user.totalSubmissions > 0 
      ? Math.round((user.approvedSubmissions / user.totalSubmissions) * 100)
      : 0;
  };

  const getReputationStars = (reputation: number) => {
    const fullStars = Math.floor(reputation);
    const hasHalfStar = reputation % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <span key={i} className="text-yellow-400">★</span>
        ))}
        {hasHalfStar && <span className="text-yellow-400">☆</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={i} className="text-gray-300">★</span>
        ))}
        <span className="ml-1 text-sm text-gray-500">({reputation.toFixed(1)})</span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-xl">{getRoleIcon(user.role)}</span>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {user.name}
            </h3>
            <p className="text-sm text-gray-500 mb-2">{user.email}</p>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                {getRoleIcon(user.role)} {user.role.toUpperCase()}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                {user.status.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {user.status === 'active' && (
            <div className="flex space-x-1">
              <button
                onClick={() => onStatusChange(user.id, 'suspended')}
                className="px-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition-colors"
              >
                Suspend
              </button>
              <button
                onClick={() => onStatusChange(user.id, 'banned')}
                className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
              >
                Ban
              </button>
            </div>
          )}
          
          {user.status === 'suspended' && (
            <div className="flex space-x-1">
              <button
                onClick={() => onStatusChange(user.id, 'active')}
                className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors"
              >
                Reactivate
              </button>
              <button
                onClick={() => onStatusChange(user.id, 'banned')}
                className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
              >
                Ban
              </button>
            </div>
          )}
          
          {user.status === 'banned' && (
            <button
              onClick={() => onStatusChange(user.id, 'active')}
              className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors"
            >
              Unban
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <div className="text-sm text-gray-500">Submissions</div>
          <div className="text-lg font-semibold text-gray-900">
            {user.totalSubmissions}
            <span className="text-sm text-gray-500 ml-1">
              ({getApprovalRate()}% approved)
            </span>
          </div>
        </div>
        
        <div>
          <div className="text-sm text-gray-500">Total Earned</div>
          <div className="text-lg font-semibold text-gray-900">
            {user.totalEarned.toLocaleString()} Honors
          </div>
        </div>
        
        <div>
          <div className="text-sm text-gray-500">Reputation</div>
          <div className="text-sm">
            {getReputationStars(user.reputation)}
          </div>
        </div>
        
        <div>
          <div className="text-sm text-gray-500">Missions</div>
          <div className="text-lg font-semibold text-gray-900">
            {user.missionsCreated} created
            <span className="text-sm text-gray-500 ml-1">
              • {user.missionsCompleted} completed
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <div>
          Joined {formatDate(user.createdAt)}
        </div>
        
        {user.lastLogin && (
          <div>
            Last login: {formatDate(user.lastLogin)}
          </div>
        )}
      </div>
    </div>
  );
};
