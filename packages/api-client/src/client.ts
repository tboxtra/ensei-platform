import type {
    ApiClientConfig,
    CreateMissionRequest,
    MissionResponse,
    MissionListResponse,
    CreateSubmissionRequest,
    SubmissionResponse,
    ReviewDecisionRequest,
    ReviewResponse,
    DegenPresetsResponse,
    FundMissionRequest,
    FundingReceiptResponse,
    WithdrawalRequest,
    WithdrawalResponse,
    UserWithdrawalsResponse,
    ConvertHonorsToUsdRequest,
    ConvertHonorsToUsdResponse,
    ConvertUsdToHonorsRequest,
    ConvertUsdToHonorsResponse,
    RefundRequest,
    RefundResponse,
    TelegramProofValidationRequest,
    TelegramProofValidationResponse,
    TelegramChannelResponse,
    ErrorResponse
} from './types';

export class ApiClient {
    private config: ApiClientConfig;

    constructor(config: ApiClientConfig) {
        this.config = {
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
            },
            ...config,
        };
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.config.baseUrl}${endpoint}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    ...this.config.headers,
                    ...options.headers,
                },
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData: ErrorResponse = await response.json().catch(() => ({ error: 'Unknown error' }));
                throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            clearTimeout(timeoutId);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Network error');
        }
    }

    // Mission endpoints
    async createMission(request: CreateMissionRequest): Promise<MissionResponse> {
        return this.request<MissionResponse>('/v1/missions', {
            method: 'POST',
            body: JSON.stringify(request),
        });
    }

    async listMissions(): Promise<MissionListResponse> {
        return this.request<MissionListResponse>('/v1/missions');
    }

    async submitMission(missionId: string, request: CreateSubmissionRequest): Promise<SubmissionResponse> {
        return this.request<SubmissionResponse>(`/v1/missions/${missionId}/submit`, {
            method: 'POST',
            body: JSON.stringify(request),
        });
    }

    async reviewSubmission(submissionId: string, request: ReviewDecisionRequest): Promise<ReviewResponse> {
        return this.request<ReviewResponse>(`/v1/submissions/${submissionId}/review`, {
            method: 'POST',
            body: JSON.stringify(request),
        });
    }

    async getDegenPresets(): Promise<DegenPresetsResponse> {
        return this.request<DegenPresetsResponse>('/v1/meta/degen-presets');
    }

    // Payment endpoints
    async fundMission(request: FundMissionRequest): Promise<FundingReceiptResponse> {
        return this.request<FundingReceiptResponse>('/v1/fund-mission', {
            method: 'POST',
            body: JSON.stringify(request),
        });
    }

    async getFundingStatus(receiptId: string): Promise<FundingReceiptResponse> {
        return this.request<FundingReceiptResponse>(`/v1/fund-mission/${receiptId}`);
    }

    async requestWithdrawal(request: WithdrawalRequest): Promise<WithdrawalResponse> {
        return this.request<WithdrawalResponse>('/v1/withdrawals', {
            method: 'POST',
            body: JSON.stringify(request),
        });
    }

    async getWithdrawalStatus(withdrawalId: string): Promise<WithdrawalResponse> {
        return this.request<WithdrawalResponse>(`/v1/withdrawals/${withdrawalId}`);
    }

    async getUserWithdrawals(userId: string): Promise<UserWithdrawalsResponse> {
        return this.request<UserWithdrawalsResponse>(`/v1/withdrawals/user/${userId}`);
    }

    // Conversion endpoints
    async convertHonorsToUsd(request: ConvertHonorsToUsdRequest): Promise<ConvertHonorsToUsdResponse> {
        return this.request<ConvertHonorsToUsdResponse>('/v1/convert/honors-to-usd', {
            method: 'POST',
            body: JSON.stringify(request),
        });
    }

    async convertUsdToHonors(request: ConvertUsdToHonorsRequest): Promise<ConvertUsdToHonorsResponse> {
        return this.request<ConvertUsdToHonorsResponse>('/v1/convert/usd-to-honors', {
            method: 'POST',
            body: JSON.stringify(request),
        });
    }

    // Refund endpoints
    async requestRefund(missionId: string, request: RefundRequest): Promise<RefundResponse> {
        return this.request<RefundResponse>(`/v1/missions/${missionId}/refund`, {
            method: 'POST',
            body: JSON.stringify(request),
        });
    }

    // Telegram endpoints
    async validateTelegramProof(proof: TelegramProofValidationRequest): Promise<TelegramProofValidationResponse> {
        return this.request<TelegramProofValidationResponse>('/v1/telegram/proofs/validate', {
            method: 'POST',
            body: JSON.stringify(proof),
        });
    }

    async getTelegramChannel(channelId: string): Promise<TelegramChannelResponse> {
        return this.request<TelegramChannelResponse>(`/v1/telegram/channels/${channelId}`);
    }
}

// Default client instance
export const createApiClient = (config: ApiClientConfig) => new ApiClient(config);

// Default client for development
export const apiClient = new ApiClient({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
});
