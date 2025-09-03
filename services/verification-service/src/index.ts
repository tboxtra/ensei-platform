// Verification Service - Main Entry Point
// Provides social URL verification and API verification capabilities

export * from './social-urls';
export {
    getVerifier,
    listVerifiers,
    hasVerifier,
    verifyWithApi,
    type ApiVerifier
} from './api-verifiers';

// Re-export VerificationResult from social-urls to avoid conflicts
export type { VerificationResult as SocialVerificationResult } from './social-urls';
export type { VerificationResult as ApiVerificationResult } from './api-verifiers';
