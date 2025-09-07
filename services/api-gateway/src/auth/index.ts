import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import admin from 'firebase-admin';

// Validation schemas
const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
});

const registerSchema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8),
    agreeToTerms: z.boolean().refine(val => val === true, {
        message: 'You must agree to the terms and conditions'
    }),
    agreeToMarketing: z.boolean().optional()
});

// In-memory user storage (replace with database in production)
const users = new Map<string, any>();

// Helper function to hash password (in production, use bcrypt)
function hashPassword(password: string): string {
    return Buffer.from(password).toString('base64'); // Simple hash for demo
}

// Helper function to verify password
function verifyPassword(password: string, hashedPassword: string): boolean {
    return hashPassword(password) === hashedPassword;
}

// Helper function to generate user avatar
function generateAvatar(email: string): string {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`;
}

// Simple token generation (replace with JWT in production)
function generateToken(): string {
    return `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export async function authRoutes(fastify: FastifyInstance) {
    // Initialize Firebase Admin if credentials present
    if (!admin.apps.length) {
        const creds = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
        if (creds) {
            try {
                admin.initializeApp({
                    credential: admin.credential.cert(JSON.parse(creds))
                });
            } catch (e) {
                fastify.log.warn('Failed to init Firebase Admin. Check FIREBASE_SERVICE_ACCOUNT_JSON');
            }
        }
    }

    // Google sign-in with ID token
    fastify.post('/v1/auth/google', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const body = (request.body as any) || {};
            const idToken = body.idToken;
            if (!idToken) return reply.status(400).send({ error: 'Missing idToken' });

            if (!admin.apps.length) return reply.status(500).send({ error: 'Auth not configured' });

            const decoded = await admin.auth().verifyIdToken(idToken);
            const { uid, email, name, picture } = decoded as any;

            const userRecord = {
                id: uid,
                email: email,
                firstName: name?.split(' ')?.[0] || 'User',
                lastName: name?.split(' ')?.slice(1).join(' ') || '',
                avatar: picture || generateAvatar(email || uid),
                joinedAt: new Date().toISOString(),
                preferences: { marketing: false }
            };
            users.set(email || uid, userRecord);

            const token = generateToken();
            return {
                user: {
                    id: userRecord.id,
                    email: userRecord.email,
                    name: `${userRecord.firstName} ${userRecord.lastName}`.trim(),
                    firstName: userRecord.firstName,
                    lastName: userRecord.lastName,
                    avatar: userRecord.avatar,
                    joinedAt: userRecord.joinedAt
                },
                token
            };
        } catch (e) {
            return reply.status(401).send({ error: 'Invalid Google token' });
        }
    });
    // Login endpoint
    fastify.post('/v1/auth/login', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { email, password } = loginSchema.parse(request.body);

            // Check if user exists
            const user = users.get(email);
            if (!user || !verifyPassword(password, user.password)) {
                return reply.status(401).send({
                    error: 'Invalid email or password'
                });
            }

            // Generate simple token
            const token = generateToken();

            // Return user data and token
            return {
                user: {
                    id: user.id,
                    email: user.email,
                    name: `${user.firstName} ${user.lastName}`,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    avatar: user.avatar,
                    joinedAt: user.joinedAt
                },
                token
            };
        } catch (error) {
            if (error instanceof z.ZodError) {
                return reply.status(400).send({
                    error: 'Validation error',
                    details: error.errors
                });
            }
            return reply.status(500).send({
                error: 'Internal server error'
            });
        }
    });

    // Register endpoint
    fastify.post('/v1/auth/register', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userData = registerSchema.parse(request.body);

            // Check if user already exists
            if (users.has(userData.email)) {
                return reply.status(409).send({
                    error: 'User with this email already exists'
                });
            }

            // Create new user
            const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const newUser = {
                id: userId,
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                password: hashPassword(userData.password),
                avatar: generateAvatar(userData.email),
                joinedAt: new Date().toISOString(),
                preferences: {
                    marketing: userData.agreeToMarketing || false
                }
            };

            // Store user
            users.set(userData.email, newUser);

            // Generate simple token
            const token = generateToken();

            // Return user data and token
            return {
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    name: `${newUser.firstName} ${newUser.lastName}`,
                    firstName: newUser.firstName,
                    lastName: newUser.lastName,
                    avatar: newUser.avatar,
                    joinedAt: newUser.joinedAt
                },
                token
            };
        } catch (error) {
            if (error instanceof z.ZodError) {
                return reply.status(400).send({
                    error: 'Validation error',
                    details: error.errors
                });
            }
            return reply.status(500).send({
                error: 'Internal server error'
            });
        }
    });

    // Logout endpoint
    fastify.post('/v1/auth/logout', async (request: FastifyRequest, reply: FastifyReply) => {
        // In a real application, you might want to blacklist the token
        // For now, we'll just return success since the client will clear the token
        return { message: 'Logged out successfully' };
    });

    // Get current user endpoint
    fastify.get('/v1/auth/me', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            // For demo purposes, return a demo user
            // In production, this would verify the token and return the actual user
            const demoUser = {
                id: 'user_1',
                email: 'demo@ensei.com',
                name: 'Demo User',
                firstName: 'Demo',
                lastName: 'User',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
                joinedAt: new Date(Date.now() - 86400000 * 30).toISOString(),
                preferences: {
                    marketing: false
                }
            };

            return {
                user: demoUser
            };
        } catch (error) {
            return reply.status(401).send({
                error: 'Invalid token'
            });
        }
    });

    // Add some demo users for testing
    const demoUsers = [
        {
            email: 'demo@ensei.com',
            firstName: 'Demo',
            lastName: 'User',
            password: 'demo123'
        },
        {
            email: 'test@ensei.com',
            firstName: 'Test',
            lastName: 'User',
            password: 'test123'
        }
    ];

    // Initialize demo users
    demoUsers.forEach(demoUser => {
        if (!users.has(demoUser.email)) {
            const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            users.set(demoUser.email, {
                id: userId,
                email: demoUser.email,
                firstName: demoUser.firstName,
                lastName: demoUser.lastName,
                password: hashPassword(demoUser.password),
                avatar: generateAvatar(demoUser.email),
                joinedAt: new Date().toISOString(),
                preferences: {
                    marketing: false
                }
            });
        }
    });
}
