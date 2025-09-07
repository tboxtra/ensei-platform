'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { MissionCard } from '../../components/missions/MissionCard';
import { MissionFilters } from '../../components/missions/MissionFilters';
import { MissionStats } from '../../components/missions/MissionStats';
import { apiClient } from '../../lib/api';

interface Mission {
  id: string;
  title: string;
  platform: string;
  type: string;
  model: 'fixed' | 'degen';
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  creatorId: string;
  createdAt: string;
  submissionsCount: number;
  approvedCount: number;
  totalCostUsd: number;
  perUserHonors?: number;
  perWinnerHonors?: number;
  winnersCap?: number;
  cap?: number;
  durationHours?: number;
}

interface MissionFilters {
  status: string;
  platform: string;
  type: string;
  model: string;
  search: string;
}

export default function MissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<MissionFilters>({
    status: '',
    platform: '',
    type: '',
    model: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // Mock data for development
  const mockMissions: Mission[] = [
    {
      id: 'mission_1',
      title: 'Twitter Engagement Campaign',
      platform: 'twitter',
      type: 'engage',
      model: 'fixed',
      status: 'active',
      creatorId: 'creator_1',
      createdAt: '2024-01-15T10:30:00Z',
      submissionsCount: 45,
      approvedCount: 42,
      totalCostUsd: 500,
      perUserHonors: 250,
      cap: 100
    },
    {
      id: 'mission_2',
      title: 'Instagram Content Creation',
      platform: 'instagram',
      type: 'content',
      model: 'degen',
      status: 'active',
      creatorId: 'creator_2',
      createdAt: '2024-01-14T15:20:00Z',
      submissionsCount: 23,
      approvedCount: 18,
      totalCostUsd: 750,
      perWinnerHonors: 11250,
      winnersCap: 3,
      durationHours: 8
    },
    {
      id: 'mission_3',
      title: 'TikTok Ambassador Program',
      platform: 'tiktok',
      type: 'ambassador',
      model: 'fixed',
      status: 'completed',
      creatorId: 'creator_3',
      createdAt: '2024-01-10T09:15:00Z',
      submissionsCount: 80,
      approvedCount: 75,
      totalCostUsd: 1200,
      perUserHonors: 400,
      cap: 100
    }
  ];

  useEffect(() => {
    loadMissions();
  }, [filters, pagination.page]);

  const loadMissions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For now, use mock data
      // const response = await apiClient.getMissions({
      //   page: pagination.page,
      //   limit: pagination.limit,
      //   ...filters
      // });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setMissions(mockMissions);
      setPagination(prev => ({
        ...prev,
        total: mockMissions.length,
        totalPages: Math.ceil(mockMissions.length / pagination.limit)
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load missions');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: Partial<MissionFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleMissionStatusChange = async (missionId: string, status: string) => {
    try {
      // await apiClient.updateMissionStatus(missionId, status);
      
      // Update local state
      setMissions(prev =>
        prev.map(mission =>
          mission.id === missionId
            ? { ...mission, status: status as any }
            : mission
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update mission status');
    }
  };

  return (
    <ProtectedRoute requiredPermission="missions:read">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Mission Management</h1>
          <div className="text-sm text-gray-500">
            {pagination.total} total missions
          </div>
        </div>

        <MissionStats missions={missions} />

        <MissionFilters
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
            {missions.map((mission) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                onStatusChange={handleMissionStatusChange}
              />
            ))}
          </div>
        )}

        {missions.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">No missions found</p>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
