// Verification System Types

export interface XAccount {
    id: string;
    userId: string;
    username: string;
    displayName: string;
    profileImageUrl?: string;
    isVerified: boolean;
    linkedAt: Date;
    isImmutable: boolean; // Once set, cannot be changed
}

export interface VerificationSubmission {
    id: string;
    userId: string;
    missionId: string;
    taskId: string; // 'comment' or 'quote'
    submissionLink: string;
    username: string; // X username from linked account
    status: 'pending' | 'approved' | 'rejected' | 'expired';
    reviews: Review[];
    createdAt: Date;
    expiresAt: Date; // 24 hours from creation
    missionTitle: string;
    taskType: string;
}

export interface Review {
    id: string;
    reviewerId: string;
    reviewerUsername: string;
    rating: number; // 1-5
    reviewerCommentLink: string;
    expertise: string; // Platform expertise for assignment
    createdAt: Date;
    submissionId: string;
}

export interface UserRating {
    userId: string;
    totalRating: number; // Average of all verification ratings
    totalSubmissions: number;
    totalReviews: number;
    lastUpdated: Date;
}

export interface ReviewAssignment {
    submissionId: string;
    reviewerId: string;
    expertise: string;
    assignedAt: Date;
    completedAt?: Date;
    status: 'assigned' | 'completed' | 'expired';
}

// Expertise levels for review assignment
export type ExpertiseLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface UserExpertise {
    userId: string;
    platform: string; // 'twitter', 'instagram', etc.
    level: ExpertiseLevel;
    verifiedAt: Date;
    reviewCount: number;
    averageRating: number;
}

// Verification dropdown props
export interface VerificationDropdownProps {
    taskId: string;
    missionId: string;
    missionTitle: string;
    onSubmission: (submission: Partial<VerificationSubmission>) => void;
    onClose: () => void;
    userXAccount?: XAccount;
}

// Review card props
export interface ReviewCardProps {
    submission: VerificationSubmission;
    onReview: (review: Partial<Review>) => void;
    reviewerId: string;
    reviewerExpertise: UserExpertise[];
}

// X account linking props
export interface XAccountLinkerProps {
    onAccountLinked: (account: XAccount) => void;
    existingAccount?: XAccount;
    isImmutable?: boolean;
}
