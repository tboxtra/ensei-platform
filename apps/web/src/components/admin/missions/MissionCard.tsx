'use client';

import React from 'react';

interface Mission {
  id: string;
  title: string;
  platform: string;
  type: string;
  model: 'fixed' | 'degen';
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  creatorId: string;
  creatorName: string;
  creatorEmail: string;
  createdAt: string;
  submissionsCount: number;
  approvedCount: number;
  totalCostUsd: number;
  perUserHonors?: number;
  perWinnerHonors?: number;
  winnersCap?: number;
  cap?: number;
  durationHours?: number;
  isPaused?: boolean;
  tasks?: string[];
}

interface MissionCardProps {
  mission: Mission;
  onStatusChange: (missionId: string, status: string) => void;
  onPauseMission: (missionId: string, isPaused: boolean) => void;
  onDeleteMission: (missionId: string) => void;
  onViewSubmissions: (missionId: string) => void;
  onViewUser: (userId: string) => void;
}

export const MissionCard: React.FC<MissionCardProps> = ({
  mission,
  onStatusChange,
  onPauseMission,
  onDeleteMission,
  onViewSubmissions,
  onViewUser
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlatformIcon = (platform: string) => {
    const icons: Record<string, string> = {
      twitter: '𝕏',
      instagram: '📸',
      tiktok: '🎵',
      facebook: '📘',
      whatsapp: '💬',
      snapchat: '👻',
      telegram: '📱',
      custom: '⚡'
    };
    return icons[platform] || '🌐';
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      engage: '🎯',
      content: '✍️',
      ambassador: '👑'
    };
    return icons[type] || '📋';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown date';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getCompletionRate = () => {
    if (mission.model === 'fixed' && mission.cap) {
      return Math.round((mission.approvedCount / mission.cap) * 100);
    }
    return Math.round((mission.approvedCount / mission.submissionsCount) * 100);
  };

  return (
    <div
      className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onViewSubmissions(mission.id)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3">
          <div className="text-2xl">
            {getPlatformIcon(mission.platform)}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {mission.title}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span className="flex items-center">
                {getTypeIcon(mission.type)} {mission.type}
              </span>
              <span>•</span>
              <span className="capitalize">{mission.platform}</span>
              <span>•</span>
              <span className="capitalize">{mission.model}</span>
            </div>
            
            {/* Mission Tasks */}
            {mission.tasks && mission.tasks.length > 0 && (
              <div className="mt-2">
                <div className="flex flex-wrap gap-1">
                  {mission.tasks.map((task: string, index: number) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {task.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(mission.status)}`}>
            {mission.status.toUpperCase()}
          </span>

          {mission.status === 'active' && !mission.isPaused && (
            <div className="flex space-x-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPauseMission(mission.id, true);
                }}
                className="px-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition-colors"
              >
                Pause
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteMission(mission.id);
                }}
                className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}

          {mission.isPaused && (
            <div className="flex space-x-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPauseMission(mission.id, false);
                }}
                className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors"
              >
                Resume
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteMission(mission.id);
                }}
                className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}

          {mission.status === 'paused' && (
            <button
              onClick={() => onStatusChange(mission.id, 'active')}
              className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors"
            >
              Resume
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <div className="text-sm text-gray-500">Total Cost</div>
          <div className="text-lg font-semibold text-gray-900">
            ${mission.totalCostUsd?.toLocaleString() || '0'}
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-500">Submissions</div>
          <div className="text-lg font-semibold text-gray-900">
            {mission.submissionsCount}
            {mission.cap && ` / ${mission.cap}`}
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-500">Approved</div>
          <div className="text-lg font-semibold text-gray-900">
            {mission.approvedCount}
            <span className="text-sm text-gray-500 ml-1">
              ({getCompletionRate()}%)
            </span>
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-500">Reward</div>
          <div className="text-lg font-semibold text-gray-900">
            {mission.model === 'fixed'
              ? `${mission.perUserHonors?.toLocaleString() || '0'} Honors`
              : `${mission.perWinnerHonors?.toLocaleString() || '0'} Honors`
            }
            {mission.model === 'degen' && mission.winnersCap && (
              <span className="text-sm text-gray-500 ml-1">
                (max {mission.winnersCap} winners)
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <div>
          Created by{' '}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewUser(mission.creatorId);
            }}
            className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
          >
            {mission.creatorName || 'Unknown'}
          </button>
          {' '}• {formatDate(mission.createdAt)}
        </div>

        {mission.durationHours && (
          <div>
            Duration: {mission.durationHours}h
          </div>
        )}
      </div>
    </div>
  );
};
