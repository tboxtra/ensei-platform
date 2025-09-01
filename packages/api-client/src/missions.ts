import type { CreateMissionRequest, Mission, MissionSubmission } from '@ensei/shared-types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${token}`,
    };
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.error || `HTTP ${response.status}`,
      response.status,
      errorData.details
    );
  }

  return response.json();
}

export const missionsApi = {
  /**
   * Calculate Fixed mission pricing
   */
  async calculateFixedPricing(params: {
    platform: string;
    type: string;
    tasks: string[];
    premium: boolean;
    cap: number;
  }): Promise<{ perUserHonors: number; totalHonors: number; totalUsd: number }> {
    return apiRequest<{ perUserHonors: number; totalHonors: number; totalUsd: number }>(
      '/missions/pricing/fixed',
      {
        method: 'POST',
        body: JSON.stringify(params),
      }
    );
  },

  /**
   * Calculate Degen mission pricing
   */
  async calculateDegenPricing(params: {
    baseCost: number;
    premium: boolean;
    winnersCap: number;
    taskCount: number;
  }): Promise<{ totalCostUsd: number; userPoolHonors: number; perWinnerHonors: number }> {
    return apiRequest<{ totalCostUsd: number; userPoolHonors: number; perWinnerHonors: number }>(
      '/missions/pricing/degen',
      {
        method: 'POST',
        body: JSON.stringify(params),
      }
    );
  },

  /**
   * Get Degen duration options
   */
  async getDegenDurations(): Promise<Array<{ hours: number; cost: number; maxWinners: number; label: string }>> {
    return apiRequest<Array<{ hours: number; cost: number; maxWinners: number; label: string }>>(
      '/missions/pricing/degen-durations'
    );
  },

  /**
   * Get audience presets
   */
  async getAudiencePresets(): Promise<Array<{ name: string; hours: number }>> {
    return apiRequest<Array<{ name: string; hours: number }>>('/missions/pricing/audience-presets');
  },

  /**
   * Get valid tasks for platform and mission type
   */
  async getValidTasks(platform: string, type: string): Promise<string[]> {
    return apiRequest<string[]>(`/missions/tasks/${platform}/${type}`);
  },

  /**
   * Get all missions
   */
  async getMissions(): Promise<Mission[]> {
    return apiRequest<Mission[]>('/missions');
  },

  /**
   * Get mission by ID
   */
  async getMission(id: string): Promise<Mission> {
    return apiRequest<Mission>(`/missions/${id}`);
  },

  /**
   * Get user's missions
   */
  async getMyMissions(): Promise<Mission[]> {
    return apiRequest<Mission[]>('/missions/my');
  },

  /**
   * Create new mission
   */
  async createMission(data: CreateMissionRequest): Promise<{ id: string; message: string }> {
    return apiRequest<{ id: string; message: string }>('/missions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Submit proof for mission
   */
  async submitProof(
    missionId: string,
    proofs: Array<{ type: string; content: string; metadata?: any }>
  ): Promise<{ id: string; message: string }> {
    return apiRequest<{ id: string; message: string }>(`/missions/${missionId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ proofs }),
    });
  },

  /**
   * Get mission submissions (for mission creator)
   */
  async getMissionSubmissions(missionId: string): Promise<MissionSubmission[]> {
    return apiRequest<MissionSubmission[]>(`/missions/${missionId}/submissions`);
  },

  /**
   * Approve submission (for mission creator)
   */
  async approveSubmission(
    missionId: string,
    submissionId: string
  ): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/missions/${missionId}/submissions/${submissionId}/approve`, {
      method: 'POST',
    });
  },

  /**
   * Reject submission (for mission creator)
   */
  async rejectSubmission(
    missionId: string,
    submissionId: string,
    reason: string
  ): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/missions/${missionId}/submissions/${submissionId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }
};

// React Query hooks
export const useMissions = () => {
  return {
    getMissions: () => missionsApi.getMissions(),
    getMission: (id: string) => missionsApi.getMission(id),
    getMyMissions: () => missionsApi.getMyMissions(),
    createMission: (data: CreateMissionRequest) => missionsApi.createMission(data),
    submitProof: (missionId: string, proofs: any[]) => missionsApi.submitProof(missionId, proofs),
    getMissionSubmissions: (missionId: string) => missionsApi.getMissionSubmissions(missionId),
    approveSubmission: (missionId: string, submissionId: string) =>
      missionsApi.approveSubmission(missionId, submissionId),
    rejectSubmission: (missionId: string, submissionId: string, reason: string) =>
      missionsApi.rejectSubmission(missionId, submissionId, reason),
  };
};

// Export individual functions for direct use
export const {
  getMissions,
  getMission,
  getMyMissions,
  createMission,
  submitProof,
  getMissionSubmissions,
  approveSubmission,
  rejectSubmission,
} = missionsApi;
