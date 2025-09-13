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

  // No mock data - using real API

  useEffect(() => {
    loadMissions();
  }, [filters, pagination.page]);

  const loadMissions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.getMissions({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      });

      if (response.success && response.data) {
        setMissions(response.data);
        // Note: API should return pagination info in response
        setPagination(prev => ({
          ...prev,
          total: response.data?.length || 0,
          totalPages: Math.ceil((response.data?.length || 0) / pagination.limit)
        }));
      } else {
        setMissions([]);
        setPagination(prev => ({
          ...prev,
          total: 0,
          totalPages: 0
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load missions');
      setMissions([]);
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
      const response = await apiClient.updateMissionStatus(missionId, status);

      if (response.success) {
        // Update local state
        setMissions(prev =>
          prev.map(mission =>
            mission.id === missionId
              ? { ...mission, status: status as any }
              : mission
          )
        );
      } else {
        setError(response.message || 'Failed to update mission status');
      }
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
