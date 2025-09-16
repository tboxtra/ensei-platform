import * as firebaseAdmin from 'firebase-admin';

// Get Firestore instance (assumes Firebase Admin is already initialized)
const getDb = () => firebaseAdmin.firestore();

// Data models and initialization
export interface User {
    id: string;
    email: string;
    name: string;
    firstName: string;
    lastName: string;
    avatar: string;
    role: 'user' | 'admin' | 'moderator';
    status: 'active' | 'inactive' | 'suspended';
    wallet: {
        honors: number;
        usd: number;
    };
    profile: {
        bio?: string;
        skills?: string[];
        socialLinks?: {
            twitter?: string;
            instagram?: string;
            linkedin?: string;
        };
    };
    stats: {
        missionsCreated: number;
        missionsCompleted: number;
        totalEarnings: number;
        rating: number;
    };
    createdAt: string;
    updatedAt: string;
}

export interface Mission {
    id: string;
    title: string;
    description: string;
    category: string;
    platform: string;
    type: 'engage' | 'content' | 'custom';
    model: 'fixed' | 'degen';
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    tasks: string[];
    requirements: string[];
    deliverables: string[];
    rewards: {
        honors: number;
        usd: number;
    };
    total_cost_honors: number;
    duration_hours: number;
    cap: number;
    max_participants: number;
    deadline: string;
    status: 'active' | 'paused' | 'completed' | 'cancelled';
    created_by: string;
    participants_count: number;
    submissions_count: number;
    createdAt: string;
    updatedAt: string;
}

export interface MissionParticipation {
    id: string;
    mission_id: string;
    user_id: string;
    status: 'pending' | 'active' | 'completed' | 'cancelled';
    joined_at: string;
    completed_at?: string;
    progress: number; // 0-100
}

export interface Submission {
    id: string;
    mission_id: string;
    user_id: string;
    participation_id: string;
    content: string;
    proof_urls: string[];
    files: string[];
    status: 'pending' | 'under_review' | 'approved' | 'rejected';
    submitted_at: string;
    reviewed_at?: string;
    reviewer_id?: string;
    review_notes?: string;
}

export interface Review {
    id: string;
    submission_id: string;
    reviewer_id: string;
    status: 'pending' | 'approved' | 'rejected';
    score: number; // 1-10
    feedback: string;
    created_at: string;
    updated_at: string;
}

export interface Transaction {
    id: string;
    user_id: string;
    type: 'earn' | 'spend' | 'reward' | 'penalty';
    amount: number;
    currency: 'honors' | 'usd';
    description: string;
    mission_id?: string;
    submission_id?: string;
    status: 'pending' | 'completed' | 'failed';
    created_at: string;
}

export interface Wallet {
    id: string;
    user_id: string;
    honors: number;
    usd: number;
    total_earned: number;
    total_spent: number;
    last_updated: string;
}

export interface Reward {
    id: string;
    user_id: string;
    mission_id: string;
    submission_id: string;
    amount: number;
    currency: 'honors' | 'usd';
    status: 'pending' | 'claimed' | 'expired';
    claimed_at?: string;
    expires_at: string;
    created_at: string;
}

// Initialize sample data
export const initializeSampleData = async () => {
    try {
        console.log('Initializing sample data...');
        const db = getDb();

        // Create sample users
        const sampleUsers: Partial<User>[] = [
            {
                email: 'admin@ensei.com',
                name: 'Admin User',
                firstName: 'Admin',
                lastName: 'User',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
                role: 'admin',
                status: 'active',
                wallet: { honors: 10000, usd: 1000 },
                profile: {
                    bio: 'Platform Administrator',
                    skills: ['Management', 'Analytics', 'Review'],
                },
                stats: {
                    missionsCreated: 0,
                    missionsCompleted: 0,
                    totalEarnings: 0,
                    rating: 5.0,
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            {
                email: 'moderator@ensei.com',
                name: 'Moderator User',
                firstName: 'Moderator',
                lastName: 'User',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=moderator',
                role: 'moderator',
                status: 'active',
                wallet: { honors: 5000, usd: 500 },
                profile: {
                    bio: 'Content Moderator',
                    skills: ['Review', 'Quality Control'],
                },
                stats: {
                    missionsCreated: 0,
                    missionsCompleted: 0,
                    totalEarnings: 0,
                    rating: 4.8,
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
        ];

        // Create sample missions
        const sampleMissions: Partial<Mission>[] = [
            {
                title: 'Twitter Engagement Campaign',
                description: 'Engage with our latest product launch tweet to increase visibility and reach.',
                category: 'Social Media',
                platform: 'twitter',
                type: 'engage',
                model: 'fixed',
                difficulty: 'beginner',
                tasks: ['like', 'retweet', 'comment'],
                requirements: ['Active Twitter account', 'Engaging comments'],
                deliverables: ['Screenshot of engagement', 'Link to tweet'],
                rewards: { honors: 100, usd: 5 },
                total_cost_honors: 100,
                duration_hours: 24,
                cap: 100,
                max_participants: 100,
                deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'active',
                created_by: 'system',
                participants_count: 0,
                submissions_count: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            {
                title: 'Content Creation for Tech Blog',
                description: 'Create engaging content about AI and blockchain technologies for our blog.',
                category: 'Content Creation',
                platform: 'custom',
                type: 'content',
                model: 'fixed',
                difficulty: 'intermediate',
                tasks: ['research', 'write', 'edit'],
                requirements: ['Tech writing experience', 'Knowledge of AI/Blockchain'],
                deliverables: ['1000+ word article', 'SEO optimized content'],
                rewards: { honors: 500, usd: 25 },
                total_cost_honors: 500,
                duration_hours: 48,
                cap: 10,
                max_participants: 10,
                deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'active',
                created_by: 'system',
                participants_count: 0,
                submissions_count: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
        ];

        // Add sample data to Firestore
        const batch = db.batch();

        // Add users
        for (const user of sampleUsers) {
            const userRef = db.collection('users').doc();
            batch.set(userRef, user);
        }

        // Add missions
        for (const mission of sampleMissions) {
            const missionRef = db.collection('missions').doc();
            batch.set(missionRef, mission);
        }

        await batch.commit();
        console.log('Sample data initialized successfully');

    } catch (error) {
        console.error('Error initializing sample data:', error);
        throw error;
    }
};

// Check if collections exist and have data
export const checkDataStatus = async () => {
    try {
        const db = getDb();
        const collections = ['users', 'missions', 'submissions', 'reviews', 'transactions', 'wallets', 'rewards'];
        const status: Record<string, number> = {};

        for (const collection of collections) {
            const snapshot = await db.collection(collection).limit(1).get();
            status[collection] = snapshot.size;
        }

        return status;
    } catch (error) {
        console.error('Error checking data status:', error);
        return {};
    }
};

// Initialize system settings
export const initializeSystemSettings = async () => {
    try {
        const db = getDb();
        const settings = {
            platform: {
                name: 'Ensei Platform',
                version: '1.0.0',
                maintenance: false,
                registration_enabled: true,
            },
            rewards: {
                default_honors_rate: 1.0,
                default_usd_rate: 0.05,
                min_mission_reward: 10,
                max_mission_reward: 10000,
            },
            limits: {
                max_missions_per_user: 10,
                max_participants_per_mission: 1000,
                max_file_size_mb: 10,
                max_files_per_submission: 5,
            },
            features: {
                notifications_enabled: true,
                analytics_enabled: true,
                file_uploads_enabled: true,
                real_time_updates: true,
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        await db.collection('system').doc('settings').set(settings);
        console.log('System settings initialized');
    } catch (error) {
        console.error('Error initializing system settings:', error);
        throw error;
    }
};
