// Backend Verification System Types

export interface XAccount {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  profileImageUrl?: string;
  isVerified: boolean;
  linkedAt: Date;
  isImmutable: boolean;
}

export interface VerificationSubmission {
  id: string;
  userId: string;
  missionId: string;
  taskId: string;
  submissionLink: string;
  username: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  reviews: Review[];
  createdAt: Date;
  expiresAt: Date;
  missionTitle: string;
  taskType: string;
  averageRating?: number;
  totalReviews: number;
}

export interface Review {
  id: string;
  reviewerId: string;
  reviewerUsername: string;
  rating: number;
  reviewerCommentLink: string;
  expertise: string;
  createdAt: Date;
  submissionId: string;
  isValid: boolean;
}

export interface UserRating {
  userId: string;
  totalRating: number;
  totalSubmissions: number;
  totalReviews: number;
  lastUpdated: Date;
  ratingHistory: RatingHistory[];
}

export interface RatingHistory {
  submissionId: string;
  rating: number;
  date: Date;
  missionTitle: string;
  taskType: string;
}

export interface ReviewAssignment {
  id: string;
  submissionId: string;
  reviewerId: string;
  expertise: string;
  assignedAt: Date;
  completedAt?: Date;
  status: 'assigned' | 'completed' | 'expired';
  priority: number; // Higher priority for expertise-based assignment
}

export interface UserExpertise {
  userId: string;
  platform: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  verifiedAt: Date;
  reviewCount: number;
  averageRating: number;
  specialties: string[]; // e.g., ['marketing', 'tech', 'lifestyle']
}

// API Request/Response Types
export interface LinkXAccountRequest {
  username: string;
  userId: string;
}

export interface LinkXAccountResponse {
  success: boolean;
  account?: XAccount;
  error?: string;
}

export interface SubmitVerificationRequest {
  userId: string;
  missionId: string;
  taskId: string;
  submissionLink: string;
  missionTitle: string;
  taskType: string;
}

export interface SubmitVerificationResponse {
  success: boolean;
  submission?: VerificationSubmission;
  error?: string;
}

export interface SubmitReviewRequest {
  reviewerId: string;
  submissionId: string;
  rating: number;
  reviewerCommentLink: string;
}

export interface SubmitReviewResponse {
  success: boolean;
  review?: Review;
  error?: string;
}

export interface GetSubmissionsRequest {
  userId?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export interface GetSubmissionsResponse {
  success: boolean;
  submissions?: VerificationSubmission[];
  total?: number;
  error?: string;
}

export interface GetReviewsRequest {
  submissionId?: string;
  reviewerId?: string;
  limit?: number;
  offset?: number;
}

export interface GetReviewsResponse {
  success: boolean;
  reviews?: Review[];
  total?: number;
  error?: string;
}

// Validation Types
export interface ValidationResult {
  isValid: boolean;
  error?: string;
  warnings?: string[];
}

export interface XLinkValidation {
  isValidUrl: boolean;
  isXLink: boolean;
  username?: string;
  isAccessible: boolean;
  error?: string;
}

// Expertise Assignment Types
export interface ExpertiseMatch {
  reviewerId: string;
  expertise: UserExpertise;
  matchScore: number;
  specialties: string[];
}

export interface AssignmentStrategy {
  type: 'expertise' | 'random' | 'balanced';
  parameters: {
    expertiseWeight: number;
    reviewCountWeight: number;
    ratingWeight: number;
  };
}

// Analytics Types
export interface VerificationAnalytics {
  totalSubmissions: number;
  pendingSubmissions: number;
  approvedSubmissions: number;
  rejectedSubmissions: number;
  expiredSubmissions: number;
  averageRating: number;
  averageReviewTime: number; // in hours
  topReviewers: {
    userId: string;
    reviewCount: number;
    averageRating: number;
  }[];
  platformBreakdown: {
    platform: string;
    submissions: number;
    averageRating: number;
  }[];
}

// Error Types
export class VerificationError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'VerificationError';
  }
}

export class XAccountError extends VerificationError {
  constructor(message: string, statusCode: number = 400) {
    super(message, 'X_ACCOUNT_ERROR', statusCode);
  }
}

export class SubmissionError extends VerificationError {
  constructor(message: string, statusCode: number = 400) {
    super(message, 'SUBMISSION_ERROR', statusCode);
  }
}

export class ReviewError extends VerificationError {
  constructor(message: string, statusCode: number = 400) {
    super(message, 'REVIEW_ERROR', statusCode);
  }
}
