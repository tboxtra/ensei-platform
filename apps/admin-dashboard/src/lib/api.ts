import { mockAuth } from './auth';

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API Client class
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = mockAuth.getToken();
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        data,
        success: true
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        data: null as T,
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Submissions API
  async getSubmissions(params?: {
    status?: string;
  }): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);

    return this.request(`/v1/admin/submissions?${queryParams}`);
  }

  async getSubmission(id: string): Promise<ApiResponse<any>> {
    return this.request(`/v1/admin/submissions/${id}`);
  }

  async reviewSubmission(id: string, action: 'approve' | 'reject', reason?: string): Promise<ApiResponse<any>> {
    return this.request(`/v1/admin/submissions/${id}/review`, {
      method: 'POST',
      body: JSON.stringify({ action, reason })
    });
  }

  // Missions API
  async getMissions(params?: {
    status?: string;
    platform?: string;
    model?: string;
  }): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.platform) queryParams.append('platform', params.platform);
    if (params?.model) queryParams.append('model', params.model);

    return this.request(`/v1/admin/missions?${queryParams}`);
  }

  async getMission(id: string): Promise<ApiResponse<any>> {
    return this.request(`/v1/admin/missions/${id}`);
  }

  async updateMissionStatus(id: string, status: string): Promise<ApiResponse<any>> {
    return this.request(`/v1/admin/missions/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  // Users API
  async getUsers(params?: {
    role?: string;
    status?: string;
  }): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams();
    if (params?.role) queryParams.append('role', params.role);
    if (params?.status) queryParams.append('status', params.status);

    return this.request(`/v1/admin/users?${queryParams}`);
  }

  async getUser(id: string): Promise<ApiResponse<any>> {
    return this.request(`/v1/admin/users/${id}`);
  }

  async updateUserStatus(id: string, status: 'active' | 'suspended' | 'banned'): Promise<ApiResponse<any>> {
    return this.request(`/v1/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  // Analytics API
  async getAnalyticsOverview(): Promise<ApiResponse<any>> {
    return this.request('/v1/admin/analytics/overview');
  }

  async getRevenueData(period?: string): Promise<ApiResponse<any>> {
    const queryParams = period ? `?period=${period}` : '';
    return this.request(`/v1/admin/analytics/revenue${queryParams}`);
  }

  async getUserGrowthData(period?: string): Promise<ApiResponse<any>> {
    const queryParams = period ? `?period=${period}` : '';
    return this.request(`/v1/admin/analytics/user-growth${queryParams}`);
  }

  async getPlatformPerformance(): Promise<ApiResponse<any>> {
    return this.request('/v1/admin/analytics/platform-performance');
  }

  async getMissionPerformance(period?: string): Promise<ApiResponse<any>> {
    const queryParams = period ? `?period=${period}` : '';
    return this.request(`/v1/admin/analytics/mission-performance${queryParams}`);
  }

  // Review System API
  async getReviewQueue(params?: {
    page?: number;
    limit?: number;
    type?: 'fixed' | 'degen';
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.type) queryParams.append('type', params.type);

    return this.request(`/v1/admin/review/queue?${queryParams}`);
  }

  async submitReviewVote(assignmentId: string, rating: number, commentLink?: string): Promise<ApiResponse<any>> {
    return this.request(`/v1/admin/review/vote`, {
      method: 'POST',
      body: JSON.stringify({ assignmentId, rating, commentLink })
    });
  }

  // System Configuration API
  async getSystemConfig(): Promise<ApiResponse<any>> {
    return this.request('/v1/admin/system/config');
  }

  async updateSystemConfig(config: any): Promise<ApiResponse<any>> {
    return this.request('/v1/admin/system/config', {
      method: 'PUT',
      body: JSON.stringify(config)
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL);
