import crypto from 'crypto';
import { createHash } from 'crypto';

export interface ProofContent {
  type: 'image' | 'video' | 'text' | 'url';
  content: string;
  metadata?: Record<string, any>;
}

export interface NormalizedProof {
  id: string;
  originalContent: ProofContent;
  normalizedContent: ProofContent;
  hash: string;
  platform: string;
  proofType: string;
  createdAt: Date;
}

export interface TelegramProof {
  type: 'join_channel' | 'react_to_post' | 'reply_in_group' | 'share_invite' | 'channel_post';
  channelId?: string;
  messageId?: string;
  inviteLink?: string;
  screenshot?: string;
  timestamp: Date;
}

export class ProofNormalizer {
  private static instance: ProofNormalizer;
  
  private constructor() {}
  
  static getInstance(): ProofNormalizer {
    if (!ProofNormalizer.instance) {
      ProofNormalizer.instance = new ProofNormalizer();
    }
    return ProofNormalizer.instance;
  }

  /**
   * Normalize proof content for storage and verification
   */
  async normalizeProof(proof: ProofContent, platform: string, proofType: string): Promise<NormalizedProof> {
    const id = this.generateProofId();
    const hash = this.computeHash(proof);
    
    // Normalize content based on type
    const normalizedContent = await this.normalizeContent(proof);
    
    return {
      id,
      originalContent: proof,
      normalizedContent,
      hash,
      platform,
      proofType,
      createdAt: new Date()
    };
  }

  /**
   * Generate unique proof ID
   */
  private generateProofId(): string {
    return `proof_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  /**
   * Compute SHA256 hash of proof content
   */
  private computeHash(proof: ProofContent): string {
    const contentString = JSON.stringify({
      type: proof.type,
      content: proof.content,
      metadata: proof.metadata || {}
    });
    
    return createHash('sha256').update(contentString).digest('hex');
  }

  /**
   * Normalize content based on type
   */
  private async normalizeContent(proof: ProofContent): Promise<ProofContent> {
    switch (proof.type) {
      case 'image':
        return await this.normalizeImage(proof);
      case 'video':
        return await this.normalizeVideo(proof);
      case 'text':
        return await this.normalizeText(proof);
      case 'url':
        return await this.normalizeUrl(proof);
      default:
        return proof;
    }
  }

  /**
   * Normalize image content (stub - would convert to webp, strip EXIF)
   */
  private async normalizeImage(proof: ProofContent): Promise<ProofContent> {
    // In a real implementation, this would:
    // 1. Download the image
    // 2. Convert to webp format
    // 3. Strip EXIF metadata
    // 4. Resize if needed
    // 5. Upload to storage
    
    console.log('Normalizing image:', proof.content);
    
    return {
      type: 'image',
      content: proof.content, // In real implementation, this would be the processed image URL
      metadata: {
        ...proof.metadata,
        normalized: true,
        format: 'webp',
        exifStripped: true
      }
    };
  }

  /**
   * Normalize video content (stub)
   */
  private async normalizeVideo(proof: ProofContent): Promise<ProofContent> {
    console.log('Normalizing video:', proof.content);
    
    return {
      type: 'video',
      content: proof.content,
      metadata: {
        ...proof.metadata,
        normalized: true,
        format: 'mp4'
      }
    };
  }

  /**
   * Normalize text content
   */
  private async normalizeText(proof: ProofContent): Promise<ProofContent> {
    // Normalize text: trim whitespace, normalize line endings
    const normalizedText = proof.content.trim().replace(/\r\n/g, '\n');
    
    return {
      type: 'text',
      content: normalizedText,
      metadata: {
        ...proof.metadata,
        normalized: true,
        originalLength: proof.content.length,
        normalizedLength: normalizedText.length
      }
    };
  }

  /**
   * Normalize URL content
   */
  private async normalizeUrl(proof: ProofContent): Promise<ProofContent> {
    // Normalize URL: ensure protocol, remove tracking parameters
    let normalizedUrl = proof.content;
    
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }
    
    // Remove common tracking parameters
    const url = new URL(normalizedUrl);
    const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid'];
    trackingParams.forEach(param => url.searchParams.delete(param));
    
    return {
      type: 'url',
      content: url.toString(),
      metadata: {
        ...proof.metadata,
        normalized: true,
        originalUrl: proof.content,
        domain: url.hostname
      }
    };
  }

  /**
   * Validate Telegram-specific proof
   */
  validateTelegramProof(proof: TelegramProof): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    switch (proof.type) {
      case 'join_channel':
        if (!proof.channelId && !proof.inviteLink) {
          errors.push('Channel ID or invite link required for join_channel proof');
        }
        break;
        
      case 'react_to_post':
        if (!proof.channelId || !proof.messageId) {
          errors.push('Channel ID and message ID required for react_to_post proof');
        }
        break;
        
      case 'reply_in_group':
        if (!proof.channelId || !proof.messageId) {
          errors.push('Channel ID and message ID required for reply_in_group proof');
        }
        break;
        
      case 'share_invite':
        if (!proof.inviteLink) {
          errors.push('Invite link required for share_invite proof');
        }
        break;
        
      case 'channel_post':
        if (!proof.channelId || !proof.messageId) {
          errors.push('Channel ID and message ID required for channel_post proof');
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Check for duplicate proofs using hash
   */
  async checkDuplicate(proof: ProofContent, existingProofs: NormalizedProof[]): Promise<boolean> {
    const hash = this.computeHash(proof);
    
    return existingProofs.some(existing => existing.hash === hash);
  }

  /**
   * Extract metadata from Telegram proof
   */
  extractTelegramMetadata(proof: TelegramProof): Record<string, any> {
    return {
      platform: 'telegram',
      proofType: proof.type,
      channelId: proof.channelId,
      messageId: proof.messageId,
      inviteLink: proof.inviteLink,
      timestamp: proof.timestamp,
      screenshot: proof.screenshot
    };
  }
}

// Export singleton instance
export const proofNormalizer = ProofNormalizer.getInstance();
