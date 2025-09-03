import { ApiClient } from '../client';
import type { TaskType } from '@ensei/shared-types';

// Mock fetch
global.fetch = jest.fn();

describe('ApiClient', () => {
    let client: ApiClient;
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

    beforeEach(() => {
        client = new ApiClient({ baseUrl: 'http://localhost:3001' });
        mockFetch.mockClear();
    });

    describe('createMission', () => {
        it('should create a fixed mission successfully', async () => {
            const mockResponse = {
                id: 'mission_1',
                model: 'fixed' as const,
                total_cost_usd: 100,
                total_cost_honors: 45000,
                per_user_honors: 500
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            } as Response);

            const request = {
                model: 'fixed' as const,
                platform: 'twitter' as const,
                type: 'engage' as const,
                target: 'all' as const,
                cap: 100,
                tasks: ['like', 'retweet'] as TaskType[]
            };

            const result = await client.createMission(request);

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:3001/v1/missions',
                expect.objectContaining({
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(request)
                })
            );

            expect(result).toEqual(mockResponse);
        });

        it('should create a degen mission successfully', async () => {
            const mockResponse = {
                id: 'mission_2',
                model: 'degen' as const,
                total_cost_usd: 150,
                total_cost_honors: 67500,
                user_pool_honors: 33750,
                per_winner_honors: 11250
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            } as Response);

            const request = {
                model: 'degen' as const,
                platform: 'twitter' as const,
                type: 'engage' as const,
                target: 'all' as const,
                durationHours: 8,
                winnersCap: 3,
                tasks: ['like', 'retweet'] as TaskType[]
            };

            const result = await client.createMission(request);

            expect(result).toEqual(mockResponse);
        });

        it('should handle API errors', async () => {
            const errorResponse = { error: 'Invalid mission data' };

            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 400,
                statusText: 'Bad Request',
                json: async () => errorResponse
            } as Response);

            const request = {
                model: 'fixed' as const,
                platform: 'twitter' as const,
                type: 'engage' as const,
                target: 'all' as const,
                cap: 50, // Invalid: less than 60
                tasks: ['like'] as TaskType[]
            };

            await expect(client.createMission(request)).rejects.toThrow('Invalid mission data');
        });
    });

    describe('listMissions', () => {
        it('should list missions successfully', async () => {
            const mockResponse = {
                missions: [
                    {
                        id: 'mission_1',
                        creator_id: 'user_1',
                        title: 'Twitter Engagement',
                        platform: 'twitter',
                        mission_type: 'engage',
                        mission_model: 'fixed',
                        target_profile: 'all',
                        status: 'active',
                        created_at: '2024-01-15T10:00:00Z'
                    }
                ]
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            } as Response);

            const result = await client.listMissions();

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:3001/v1/missions',
                expect.objectContaining({
                    method: 'GET'
                })
            );

            expect(result).toEqual(mockResponse);
        });
    });

    describe('submitMission', () => {
        it('should submit mission proof successfully', async () => {
            const mockResponse = {
                id: 'submission_1',
                status: 'pending' as const,
                created_at: '2024-01-15T10:30:00Z'
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            } as Response);

            const request = {
                userId: 'user_1',
                proofs: [
                    {
                        type: 'screenshot' as const,
                        content: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
                    }
                ]
            };

            const result = await client.submitMission('mission_1', request);

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:3001/v1/missions/mission_1/submit',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify(request)
                })
            );

            expect(result).toEqual(mockResponse);
        });
    });

    describe('reviewSubmission', () => {
        it('should review submission successfully', async () => {
            const mockResponse = {
                id: 'submission_1',
                status: 'approve' as const,
                reviewed_at: '2024-01-15T11:00:00Z'
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            } as Response);

            const request = {
                action: 'approve' as const,
                reviewerId: 'admin_1',
                reason: 'Valid proof provided'
            };

            const result = await client.reviewSubmission('submission_1', request);

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:3001/v1/submissions/submission_1/review',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify(request)
                })
            );

            expect(result).toEqual(mockResponse);
        });
    });

    describe('getDegenPresets', () => {
        it('should get degen presets successfully', async () => {
            const mockResponse = {
                presets: [
                    {
                        hours: 1,
                        costUSD: 15,
                        maxWinners: 1,
                        label: '1h - $15'
                    },
                    {
                        hours: 8,
                        costUSD: 150,
                        maxWinners: 3,
                        label: '8h - $150'
                    }
                ]
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            } as Response);

            const result = await client.getDegenPresets();

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:3001/v1/meta/degen-presets',
                expect.objectContaining({
                    method: 'GET'
                })
            );

            expect(result).toEqual(mockResponse);
        });
    });

    describe('fundMission', () => {
        it('should fund mission successfully', async () => {
            const mockResponse = {
                id: 'receipt_1',
                amount: 100,
                honorsAmount: 45000,
                status: 'pending' as const,
                timestamp: '2024-01-15T10:00:00Z'
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            } as Response);

            const request = {
                missionId: 'mission_1',
                amount: 100
            };

            const result = await client.fundMission(request);

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:3001/v1/fund-mission',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify(request)
                })
            );

            expect(result).toEqual(mockResponse);
        });
    });

    describe('convertHonorsToUsd', () => {
        it('should convert honors to USD successfully', async () => {
            const mockResponse = {
                honors: 450,
                usd: 1,
                formatted: '$1.00'
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            } as Response);

            const request = { honors: 450 };

            const result = await client.convertHonorsToUsd(request);

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:3001/v1/convert/honors-to-usd',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify(request)
                })
            );

            expect(result).toEqual(mockResponse);
        });
    });

    describe('convertUsdToHonors', () => {
        it('should convert USD to honors successfully', async () => {
            const mockResponse = {
                usd: 1,
                honors: 450,
                formatted: '450 Honors'
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            } as Response);

            const request = { usd: 1 };

            const result = await client.convertUsdToHonors(request);

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:3001/v1/convert/usd-to-honors',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify(request)
                })
            );

            expect(result).toEqual(mockResponse);
        });
    });

    describe('error handling', () => {
        it('should handle network errors', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network error'));

            await expect(client.listMissions()).rejects.toThrow('Network error');
        });

        it('should handle timeout', async () => {
            const clientWithTimeout = new ApiClient({
                baseUrl: 'http://localhost:3001',
                timeout: 100
            });

            // Mock a slow response
            mockFetch.mockImplementationOnce(() =>
                new Promise(resolve => setTimeout(resolve, 200))
            );

            await expect(clientWithTimeout.listMissions()).rejects.toThrow('Network error');
        });

        it('should handle unknown errors', async () => {
            mockFetch.mockRejectedValueOnce('Unknown error');

            await expect(client.listMissions()).rejects.toThrow('Network error');
        });
    });
});
