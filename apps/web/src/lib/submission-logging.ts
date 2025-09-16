/**
 * Submission Logging System
 * Handles logging of all task completions, verifications, and flagging actions
 */

export interface SubmissionLog {
    id: string;
    missionId: string;
    taskId: string;
    userId: string;
    userName: string;
    userEmail?: string;
    action: 'intent_opened' | 'task_completed' | 'task_verified' | 'task_flagged' | 'task_rejected';
    timestamp: Date;
    status: 'pending' | 'verified' | 'flagged' | 'rejected';
    flaggedReason?: string;
    metadata: {
        taskType: string;
        platform: string;
        userAgent?: string;
        ipAddress?: string;
        sessionId?: string;
        proof?: string; // Optional proof submission
        twitterHandle?: string;
        tweetUrl?: string;
    };
    adminNotes?: string;
    reviewedBy?: string;
    reviewedAt?: Date;
}

export interface MissionAnalytics {
    missionId: string;
    missionTitle: string;
    creatorId: string;
    totalSubmissions: number;
    verifiedSubmissions: number;
    flaggedSubmissions: number;
    pendingSubmissions: number;
    completionRate: number;
    flaggingRate: number;
    averageCompletionTime: number; // in minutes
    topFlaggingReasons: Array<{
        reason: string;
        count: number;
    }>;
    submissionTimeline: Array<{
        date: string;
        submissions: number;
        verified: number;
        flagged: number;
    }>;
    lastUpdated: Date;
}

export interface AdminDashboardData {
    totalMissions: number;
    totalSubmissions: number;
    totalUsers: number;
    flaggedSubmissions: number;
    pendingReviews: number;
    recentActivity: SubmissionLog[];
    topFlaggingReasons: Array<{
        reason: string;
        count: number;
        percentage: number;
    }>;
    missionPerformance: Array<{
        missionId: string;
        missionTitle: string;
        creatorName: string;
        submissions: number;
        flaggingRate: number;
        completionRate: number;
    }>;
    userActivity: Array<{
        userId: string;
        userName: string;
        totalSubmissions: number;
        flaggedSubmissions: number;
        verifiedSubmissions: number;
        flaggingRate: number;
    }>;
}

/**
 * Log a submission action
 */
export async function logSubmissionAction(
    missionId: string,
    taskId: string,
    userId: string,
    userName: string,
    action: SubmissionLog['action'],
    metadata: Partial<SubmissionLog['metadata']> = {}
): Promise<SubmissionLog> {
    const log: SubmissionLog = {
        id: generateId(),
        missionId,
        taskId,
        userId,
        userName,
        action,
        timestamp: new Date(),
        status: action === 'task_completed' ? 'pending' :
            action === 'task_verified' ? 'verified' :
                action === 'task_flagged' ? 'flagged' : 'pending',
        metadata: {
            taskType: taskId,
            platform: 'twitter',
            ...metadata
        }
    };

    // In a real implementation, this would save to Firebase/database
    console.log('Logging submission action:', log);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100));

    return log;
}

/**
 * Flag a submission with reason
 */
export async function flagSubmission(
    submissionId: string,
    reason: string,
    adminId: string,
    adminNotes?: string
): Promise<SubmissionLog> {
    const flaggedLog: SubmissionLog = {
        id: generateId(),
        missionId: '', // Would be populated from existing submission
        taskId: '',
        userId: '',
        userName: '',
        action: 'task_flagged',
        timestamp: new Date(),
        status: 'flagged',
        flaggedReason: reason,
        metadata: {
            taskType: '',
            platform: 'twitter'
        },
        reviewedBy: adminId,
        reviewedAt: new Date()
    };

    console.log('Flagging submission:', flaggedLog);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100));

    return flaggedLog;
}

/**
 * Verify a submission
 */
export async function verifySubmission(
    submissionId: string,
    adminId: string,
    adminNotes?: string
): Promise<SubmissionLog> {
    const verifiedLog: SubmissionLog = {
        id: generateId(),
        missionId: '',
        taskId: '',
        userId: '',
        userName: '',
        action: 'task_verified',
        timestamp: new Date(),
        status: 'verified',
        metadata: {
            taskType: '',
            platform: 'twitter'
        },
        reviewedBy: adminId,
        reviewedAt: new Date()
    };

    console.log('Verifying submission:', verifiedLog);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100));

    return verifiedLog;
}

/**
 * Get mission analytics
 */
export async function getMissionAnalytics(missionId: string): Promise<MissionAnalytics> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 200));

    return {
        missionId,
        missionTitle: 'Sample Mission',
        creatorId: 'creator-123',
        totalSubmissions: 25,
        verifiedSubmissions: 18,
        flaggedSubmissions: 5,
        pendingSubmissions: 2,
        completionRate: 72,
        flaggingRate: 20,
        averageCompletionTime: 15,
        topFlaggingReasons: [
            { reason: 'User didn\'t complete the task', count: 3 },
            { reason: 'User appears to be a bot', count: 2 }
        ],
        submissionTimeline: [
            { date: '2025-01-15', submissions: 5, verified: 4, flagged: 1 },
            { date: '2025-01-16', submissions: 8, verified: 6, flagged: 2 },
            { date: '2025-01-17', submissions: 12, verified: 8, flagged: 2 }
        ],
        lastUpdated: new Date()
    };
}

/**
 * Get admin dashboard data
 */
export async function getAdminDashboardData(): Promise<AdminDashboardData> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));

    return {
        totalMissions: 45,
        totalSubmissions: 1250,
        totalUsers: 320,
        flaggedSubmissions: 89,
        pendingReviews: 23,
        recentActivity: [], // Would be populated with recent logs
        topFlaggingReasons: [
            { reason: 'User didn\'t complete the task', count: 35, percentage: 39.3 },
            { reason: 'User appears to be a bot', count: 22, percentage: 24.7 },
            { reason: 'Low value account', count: 18, percentage: 20.2 },
            { reason: 'Spam or inappropriate content', count: 14, percentage: 15.7 }
        ],
        missionPerformance: [
            {
                missionId: 'mission-1',
                missionTitle: 'Product Launch Campaign',
                creatorName: 'John Doe',
                submissions: 45,
                flaggingRate: 12,
                completionRate: 78
            }
        ],
        userActivity: [
            {
                userId: 'user-1',
                userName: 'Alice Smith',
                totalSubmissions: 12,
                flaggedSubmissions: 1,
                verifiedSubmissions: 11,
                flaggingRate: 8.3
            }
        ]
    };
}

/**
 * Get submission logs for a mission
 */
export async function getMissionSubmissionLogs(missionId: string): Promise<SubmissionLog[]> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 200));

    return [
        {
            id: 'log-1',
            missionId,
            taskId: 'like',
            userId: 'user-1',
            userName: 'Alice Smith',
            action: 'task_completed',
            timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
            status: 'verified',
            metadata: {
                taskType: 'like',
                platform: 'twitter',
                twitterHandle: '@alice_smith',
                tweetUrl: 'https://twitter.com/ensei_platform/status/1234567890'
            },
            reviewedBy: 'admin-1',
            reviewedAt: new Date(Date.now() - 1000 * 60 * 25) // 25 minutes ago
        },
        {
            id: 'log-2',
            missionId,
            taskId: 'retweet',
            userId: 'user-2',
            userName: 'Bob Johnson',
            action: 'task_flagged',
            timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
            status: 'flagged',
            flaggedReason: 'User didn\'t complete the task',
            metadata: {
                taskType: 'retweet',
                platform: 'twitter',
                twitterHandle: '@bob_johnson'
            },
            reviewedBy: 'admin-1',
            reviewedAt: new Date(Date.now() - 1000 * 60 * 10) // 10 minutes ago
        }
    ];
}

function generateId(): string {
    return Math.random().toString(36).substr(2, 9);
}
