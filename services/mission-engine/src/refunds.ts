import type { Mission, MissionModel } from '@ensei/shared-types';

export interface RefundCalculation {
  missionId: string;
  model: MissionModel;
  totalRefundHonors: number;
  totalRefundUsd: number;
  reason: string;
  breakdown: {
    unusedSlots?: number;
    unusedTimeHours?: number;
    timeRemainingPercentage?: number;
    baseRefund: number;
    platformFeeRefund: number;
  };
}

export interface RefundRequest {
  missionId: string;
  reason: 'incomplete' | 'cancelled' | 'expired' | 'manual';
  requestedBy: string;
  notes?: string;
}

export class RefundCalculator {
  private static instance: RefundCalculator;

  private constructor() { }

  static getInstance(): RefundCalculator {
    if (!RefundCalculator.instance) {
      RefundCalculator.instance = new RefundCalculator();
    }
    return RefundCalculator.instance;
  }

  /**
   * Calculate refund for a fixed mission
   */
  calculateFixedRefund(mission: Mission, currentParticipants: number): RefundCalculation {
    if (mission.model !== 'fixed') {
      throw new Error('Mission is not a fixed mission');
    }

    const unusedSlots = (mission.cap || 0) - currentParticipants;
    const unusedSlotsPercentage = unusedSlots / (mission.cap || 1);

    // Calculate refund based on unused slots - we need to estimate total cost honors
    const estimatedTotalCostHonors = (mission.total_cost_usd || 0) * 450; // 1 USD = 450 Honors
    const baseRefund = Math.floor(estimatedTotalCostHonors * unusedSlotsPercentage);
    const platformFeeRefund = Math.floor(baseRefund * 0.1); // 10% platform fee refund

    const totalRefundHonors = baseRefund + platformFeeRefund;
    const totalRefundUsd = totalRefundHonors / 450; // 1 USD = 450 Honors

    return {
      missionId: mission.id,
      model: 'fixed',
      totalRefundHonors,
      totalRefundUsd,
      reason: `Unused participant slots: ${unusedSlots}/${mission.cap}`,
      breakdown: {
        unusedSlots,
        baseRefund,
        platformFeeRefund
      }
    };
  }

  /**
   * Calculate refund for a degen mission
   */
  calculateDegenRefund(mission: Mission, currentTime: Date): RefundCalculation {
    if (mission.model !== 'degen') {
      throw new Error('Mission is not a degen mission');
    }

    const now = currentTime.getTime();
    const startTime = new Date(mission.started_at || 0).getTime();
    const endTime = new Date(mission.expires_at || 0).getTime();

    if (now >= endTime) {
      // Mission has ended, no refund
      return {
        missionId: mission.id,
        model: 'degen',
        totalRefundHonors: 0,
        totalRefundUsd: 0,
        reason: 'Mission has ended, no refund available',
        breakdown: {
          unusedTimeHours: 0,
          timeRemainingPercentage: 0,
          baseRefund: 0,
          platformFeeRefund: 0
        }
      };
    }

    const totalDurationMs = endTime - startTime;
    const elapsedMs = now - startTime;
    const remainingMs = endTime - now;

    const timeRemainingPercentage = remainingMs / totalDurationMs;
    const unusedTimeHours = Math.floor(remainingMs / (1000 * 60 * 60));

    // Calculate refund based on remaining time
    const estimatedTotalCostHonors = (mission.total_cost_usd || 0) * 450; // 1 USD = 450 Honors
    const baseRefund = Math.floor(estimatedTotalCostHonors * timeRemainingPercentage);
    const platformFeeRefund = Math.floor(baseRefund * 0.1); // 10% platform fee refund

    const totalRefundHonors = baseRefund + platformFeeRefund;
    const totalRefundUsd = totalRefundHonors / 450;

    return {
      missionId: mission.id,
      model: 'degen',
      totalRefundHonors,
      totalRefundUsd,
      reason: `Unused time: ${unusedTimeHours} hours remaining`,
      breakdown: {
        unusedTimeHours,
        timeRemainingPercentage: Math.round(timeRemainingPercentage * 100),
        baseRefund,
        platformFeeRefund
      }
    };
  }

  /**
   * Calculate refund for any mission type
   */
  calculateRefund(mission: Mission, currentParticipants: number, currentTime: Date): RefundCalculation {
    switch (mission.model) {
      case 'fixed':
        return this.calculateFixedRefund(mission, currentParticipants);
      case 'degen':
        return this.calculateDegenRefund(mission, currentTime);
      default:
        throw new Error(`Unknown mission model: ${mission.model}`);
    }
  }

  /**
   * Check if a mission is eligible for refund
   */
  isEligibleForRefund(mission: Mission, currentParticipants: number, currentTime: Date): boolean {
    try {
      const refund = this.calculateRefund(mission, currentParticipants, currentTime);
      return refund.totalRefundHonors > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get refund eligibility status
   */
  getRefundEligibility(mission: Mission, currentParticipants: number, currentTime: Date): {
    eligible: boolean;
    reason: string;
    estimatedRefund?: RefundCalculation;
  } {
    try {
      const refund = this.calculateRefund(mission, currentParticipants, currentTime);

      return {
        eligible: refund.totalRefundHonors > 0,
        reason: refund.reason,
        estimatedRefund: refund
      };
    } catch (error) {
      return {
        eligible: false,
        reason: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Validate refund request
   */
  validateRefundRequest(request: RefundRequest, mission: Mission): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!request.missionId) {
      errors.push('Mission ID is required');
    }

    if (!request.requestedBy) {
      errors.push('Requested by is required');
    }

    if (!['incomplete', 'cancelled', 'expired', 'manual'].includes(request.reason)) {
      errors.push('Invalid refund reason');
    }

    // Check if mission exists and is in a refundable state
    if (mission.status === 'completed') {
      errors.push('Completed missions are not eligible for refund');
    }

    if (mission.status === 'cancelled') {
      errors.push('Already cancelled missions are not eligible for refund');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
export const refundCalculator = RefundCalculator.getInstance();
