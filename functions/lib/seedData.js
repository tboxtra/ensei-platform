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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const firebaseAdmin = __importStar(require("firebase-admin"));
// Initialize Firebase Admin
firebaseAdmin.initializeApp({
    projectId: 'ensei-6c8e0'
});
const db = firebaseAdmin.firestore();
const sampleMissions = [
    {
        title: "AI Model Training Dataset Collection",
        description: "Help us collect and annotate training data for our new AI model. This mission involves gathering images, text, and other data types to improve machine learning accuracy.",
        category: "AI/ML",
        difficulty: "intermediate",
        total_cost_honors: 500,
        model: "GPT-4",
        duration_hours: 24,
        participants: 0,
        cap: 50,
        status: "active",
        requirements: [
            "Basic understanding of data annotation",
            "Access to computer with internet",
            "Attention to detail"
        ],
        deliverables: [
            "Annotated dataset of 1000+ items",
            "Quality report",
            "Documentation of annotation process"
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: "system",
        participants_count: 0,
        submissions_count: 0
    },
    {
        title: "Blockchain Smart Contract Audit",
        description: "Conduct a comprehensive security audit of our DeFi smart contract. Identify vulnerabilities and provide recommendations for improvements.",
        category: "Blockchain",
        difficulty: "expert",
        total_cost_honors: 2000,
        model: "Claude-3",
        duration_hours: 72,
        participants: 0,
        cap: 5,
        status: "active",
        requirements: [
            "Expert knowledge of Solidity",
            "Experience with smart contract security",
            "Certified auditor preferred"
        ],
        deliverables: [
            "Detailed security audit report",
            "Vulnerability assessment",
            "Recommendations for fixes"
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: "system",
        participants_count: 0,
        submissions_count: 0
    },
    {
        title: "Mobile App UI/UX Design",
        description: "Design a modern, user-friendly interface for our new mobile application. Focus on accessibility and user experience.",
        category: "Design",
        difficulty: "intermediate",
        total_cost_honors: 800,
        model: "DALL-E-3",
        duration_hours: 48,
        participants: 0,
        cap: 10,
        status: "active",
        requirements: [
            "Proficiency in Figma or similar tools",
            "Portfolio of mobile app designs",
            "Understanding of iOS/Android guidelines"
        ],
        deliverables: [
            "Complete UI/UX design system",
            "Interactive prototypes",
            "Design documentation"
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: "system",
        participants_count: 0,
        submissions_count: 0
    },
    {
        title: "Content Writing for Tech Blog",
        description: "Write engaging, informative articles about AI, blockchain, and emerging technologies for our company blog.",
        category: "Writing",
        difficulty: "beginner",
        total_cost_honors: 300,
        model: "GPT-4",
        duration_hours: 16,
        participants: 0,
        cap: 20,
        status: "active",
        requirements: [
            "Strong writing skills",
            "Knowledge of tech topics",
            "SEO writing experience preferred"
        ],
        deliverables: [
            "5 high-quality blog posts (1000+ words each)",
            "SEO-optimized content",
            "Engaging social media snippets"
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: "system",
        participants_count: 0,
        submissions_count: 0
    },
    {
        title: "Data Analysis and Visualization",
        description: "Analyze our user engagement data and create compelling visualizations to help us understand user behavior patterns.",
        category: "Analytics",
        difficulty: "intermediate",
        total_cost_honors: 600,
        model: "GPT-4",
        duration_hours: 32,
        participants: 0,
        cap: 8,
        status: "active",
        requirements: [
            "Proficiency in Python/R",
            "Experience with data visualization tools",
            "Statistical analysis skills"
        ],
        deliverables: [
            "Comprehensive data analysis report",
            "Interactive dashboards",
            "Actionable insights and recommendations"
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: "system",
        participants_count: 0,
        submissions_count: 0
    }
];
async function seedMissions() {
    try {
        console.log('Starting to seed missions...');
        for (const mission of sampleMissions) {
            const docRef = await db.collection('missions').add(mission);
            console.log(`Added mission: ${mission.title} with ID: ${docRef.id}`);
        }
        console.log('Successfully seeded all missions!');
    }
    catch (error) {
        console.error('Error seeding missions:', error);
    }
}
// Run the seed function
seedMissions().then(() => {
    console.log('Seeding completed');
    process.exit(0);
}).catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
});
//# sourceMappingURL=seedData.js.map