"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedSampleData = seedSampleData;
const firebaseAdmin = __importStar(require("firebase-admin"));
// Get existing Firebase Admin app or initialize if not exists
let app;
try {
    app = firebaseAdmin.app();
}
catch (error) {
    app = firebaseAdmin.initializeApp();
}
const db = app.firestore();
async function seedSampleData() {
    try {
        console.log('🌱 Seeding sample data...');
        // Sample missions
        const sampleMissions = [
            {
                title: 'Social Media Content Creation',
                description: 'Create engaging social media content for our brand. Include 5 posts with images and captions.',
                category: 'marketing',
                difficulty: 'beginner',
                rewards: {
                    honors: 100,
                    usd: 5.00
                },
                requirements: [
                    'Create 5 social media posts',
                    'Include relevant hashtags',
                    'Use brand guidelines',
                    'Submit as image files'
                ],
                deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
                max_participants: 10,
                status: 'active',
                created_by: 'system',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                participants_count: 0,
                submissions_count: 0
            },
            {
                title: 'Website Design Review',
                description: 'Review our website design and provide detailed feedback on UX/UI improvements.',
                category: 'design',
                difficulty: 'intermediate',
                rewards: {
                    honors: 250,
                    usd: 15.00
                },
                requirements: [
                    'Complete website review',
                    'Provide detailed feedback',
                    'Suggest specific improvements',
                    'Submit as PDF document'
                ],
                deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
                max_participants: 5,
                status: 'active',
                created_by: 'system',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                participants_count: 0,
                submissions_count: 0
            },
            {
                title: 'Data Analysis Report',
                description: 'Analyze user engagement data and create a comprehensive report with insights.',
                category: 'analytics',
                difficulty: 'advanced',
                rewards: {
                    honors: 500,
                    usd: 50.00
                },
                requirements: [
                    'Analyze provided dataset',
                    'Create visualizations',
                    'Write detailed report',
                    'Include actionable recommendations'
                ],
                deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days from now
                max_participants: 3,
                status: 'active',
                created_by: 'system',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                participants_count: 0,
                submissions_count: 0
            },
            {
                title: 'Mobile App Testing',
                description: 'Test our mobile app on different devices and report bugs and usability issues.',
                category: 'testing',
                difficulty: 'beginner',
                rewards: {
                    honors: 150,
                    usd: 10.00
                },
                requirements: [
                    'Test on at least 2 devices',
                    'Document all bugs found',
                    'Test core user flows',
                    'Submit detailed test report'
                ],
                deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
                max_participants: 15,
                status: 'active',
                created_by: 'system',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                participants_count: 0,
                submissions_count: 0
            },
            {
                title: 'Video Content Creation',
                description: 'Create a promotional video for our product launch. 2-3 minutes duration.',
                category: 'content',
                difficulty: 'intermediate',
                rewards: {
                    honors: 400,
                    usd: 30.00
                },
                requirements: [
                    'Create 2-3 minute video',
                    'Include product features',
                    'Professional quality',
                    'Submit as MP4 file'
                ],
                deadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(), // 18 days from now
                max_participants: 8,
                status: 'active',
                created_by: 'system',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                participants_count: 0,
                submissions_count: 0
            }
        ];
        // Add missions to Firestore
        for (const mission of sampleMissions) {
            const docRef = await db.collection('missions').add(mission);
            console.log(`✅ Added mission: ${mission.title} (ID: ${docRef.id})`);
        }
        console.log('🎉 Sample data seeding completed!');
        console.log(`📊 Added ${sampleMissions.length} sample missions`);
    }
    catch (error) {
        console.error('❌ Error seeding sample data:', error);
        throw error;
    }
}
// Run if called directly
if (require.main === module) {
    seedSampleData()
        .then(() => {
        console.log('✅ Seeding completed successfully');
        process.exit(0);
    })
        .catch((error) => {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    });
}
