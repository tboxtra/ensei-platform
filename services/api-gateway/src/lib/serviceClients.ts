import { calculateMissionPricing, validateDegenMission, TASK_CATALOG, DEGEN_PRESETS } from '@ensei/mission-engine';

// Service client for Mission Engine
export class MissionEngineClient {
  private baseUrl: string;

  constructor(baseUrl: string = process.env.MISSION_ENGINE_URL || 'http://localhost:3003') {
    this.baseUrl = baseUrl;
  }

  // Calculate mission pricing
  async calculatePricing(request: any) {
    try {
      // For now, we'll use the local function since Mission Engine is a library
      // In production, this would make an HTTP call to the Mission Engine service
      return calculateMissionPricing(request);
    } catch (error) {
      throw new Error(`Mission pricing calculation failed: ${(error as Error).message}`);
    }
  }

  // Validate degen mission
  async validateDegenMission(durationHours: number, winnersCap: number) {
    try {
      return validateDegenMission(durationHours, winnersCap);
    } catch (error) {
      throw new Error(`Degen mission validation failed: ${(error as Error).message}`);
    }
  }

  // Get task catalog
  async getTaskCatalog() {
    try {
      return TASK_CATALOG;
    } catch (error) {
      throw new Error(`Failed to get task catalog: ${(error as Error).message}`);
    }
  }

  // Get degen presets
  async getDegenPresets() {
    try {
      return DEGEN_PRESETS;
    } catch (error) {
      throw new Error(`Failed to get degen presets: ${(error as Error).message}`);
    }
  }
}

// Service client for Payment Service
export class PaymentServiceClient {
  private baseUrl: string;

  constructor(baseUrl: string = process.env.PAYMENT_SERVICE_URL || 'http://localhost:3004') {
    this.baseUrl = baseUrl;
  }

  // Convert USD to Honors
  async convertUsdToHonors(usdAmount: number) {
    try {
      const response = await fetch(`${this.baseUrl}/convert/usd-to-honors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usdAmount })
      });

      if (!response.ok) {
        throw new Error(`Payment service error: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      throw new Error(`USD to Honors conversion failed: ${(error as Error).message}`);
    }
  }

  // Convert Honors to USD
  async convertHonorsToUsd(honorsAmount: number) {
    try {
      const response = await fetch(`${this.baseUrl}/convert/honors-to-usd`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ honorsAmount })
      });

      if (!response.ok) {
        throw new Error(`Payment service error: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      throw new Error(`Honors to USD conversion failed: ${(error as Error).message}`);
    }
  }

  // Process withdrawal
  async processWithdrawal(userId: string, honorsAmount: number, walletAddress: string) {
    try {
      const response = await fetch(`${this.baseUrl}/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, honorsAmount, walletAddress })
      });

      if (!response.ok) {
        throw new Error(`Payment service error: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      throw new Error(`Withdrawal processing failed: ${(error as Error).message}`);
    }
  }
}

// Service client for Verification Service
export class VerificationServiceClient {
  private baseUrl: string;

  constructor(baseUrl: string = process.env.VERIFICATION_SERVICE_URL || 'http://localhost:3005') {
    this.baseUrl = baseUrl;
  }

  // Verify social media URL
  async verifySocialUrl(url: string, platform: string) {
    try {
      const response = await fetch(`${this.baseUrl}/verify/social-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, platform })
      });

      if (!response.ok) {
        throw new Error(`Verification service error: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      throw new Error(`Social URL verification failed: ${(error as Error).message}`);
    }
  }

  // Verify API credentials
  async verifyApiCredentials(platform: string, credentials: any) {
    try {
      const response = await fetch(`${this.baseUrl}/verify/api-credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, credentials })
      });

      if (!response.ok) {
        throw new Error(`Verification service error: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      throw new Error(`API credentials verification failed: ${(error as Error).message}`);
    }
  }
}

// Export singleton instances
export const missionEngineClient = new MissionEngineClient();
export const paymentServiceClient = new PaymentServiceClient();
export const verificationServiceClient = new VerificationServiceClient();


