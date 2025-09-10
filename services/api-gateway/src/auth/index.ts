import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/database';
import { 
  hashPassword, 
  verifyPassword, 
  generateAccessToken, 
  generateRefreshToken,
  generateAvatar 
} from '../lib/auth';

// Validation schemas
const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
});

const registerSchema = z.object({
    username: z.string().min(3).max(50),
    email: z.string().email(),
    password: z.string().min(8),
    agreeToTerms: z.boolean().refine(val => val === true, {
        message: 'You must agree to the terms and conditions'
    }),
    agreeToMarketing: z.boolean().optional()
});

// User roles
enum UserRole {
  ADMIN = 'admin',
  MODERATOR = 'moderator', 
  USER = 'user',
  REVIEWER = 'reviewer'
}

// Mock user storage (will be replaced with database)
const mockUsers = new Map<string, any>();

// Initialize admin user if it doesn't exist
async function initializeAdminUser() {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@ensei.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    if (!mockUsers.has(adminEmail)) {
        const hashedPassword = await hashPassword(adminPassword);
        
        mockUsers.set(adminEmail, {
            id: 'admin_1',
            username: 'admin',
            email: adminEmail,
            password: hashedPassword,
            walletAddress: null,
            honorsBalance: 0,
            role: UserRole.ADMIN,
            createdAt: new Date()
        });
        
        console.log('Admin user created:', adminEmail);
    }
}

export async function authRoutes(fastify: FastifyInstance) {
    // Initialize admin user if it doesn't exist
    await initializeAdminUser();

    // Login endpoint
    fastify.post('/v1/auth/login', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { email, password } = loginSchema.parse(request.body);

            // Find user in mock storage
            const user = mockUsers.get(email);

            if (!user) {
                return reply.status(401).send({
                    error: 'Invalid email or password'
                });
            }

            // Verify password
            const isValidPassword = await verifyPassword(password, user.password);
            
            if (!isValidPassword) {
                return reply.status(401).send({
                    error: 'Invalid email or password'
                });
            }

            // Generate tokens
            const accessToken = generateAccessToken({
                userId: user.id,
                email: user.email,
                role: user.role
            });

            const refreshToken = generateRefreshToken({
                userId: user.id,
                tokenVersion: 1
            });

            // Return user data and tokens
            return {
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    role: user.role,
                    avatar: generateAvatar(user.email),
                    joinedAt: user.createdAt
                },
                accessToken,
                refreshToken
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
            const existingUser = Array.from(mockUsers.values()).find(u => 
                u.email === userData.email || u.username === userData.username
            );

            if (existingUser) {
                return reply.status(409).send({
                    error: 'User with this email or username already exists'
                });
            }

            // Hash password
            const hashedPassword = await hashPassword(userData.password);

            // Create new user
            const newUser = {
                id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                username: userData.username,
                email: userData.email,
                password: hashedPassword,
                walletAddress: null,
                honorsBalance: 0,
                role: UserRole.USER,
                createdAt: new Date()
            };

            mockUsers.set(userData.email, newUser);

            // Generate tokens
            const accessToken = generateAccessToken({
                userId: newUser.id,
                email: newUser.email,
                role: newUser.role
            });

            const refreshToken = generateRefreshToken({
                userId: newUser.id,
                tokenVersion: 1
            });

            // Return user data and tokens
            return {
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    username: newUser.username,
                    role: UserRole.USER,
                    avatar: generateAvatar(newUser.email),
                    joinedAt: newUser.createdAt
                },
                accessToken,
                refreshToken
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

    // Refresh token endpoint
    fastify.post('/v1/auth/refresh', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { refreshToken } = request.body as { refreshToken: string };

            if (!refreshToken) {
                return reply.status(400).send({ error: 'Refresh token required' });
            }

            // Verify refresh token
            const { verifyRefreshToken } = await import('../lib/auth');
            const payload = verifyRefreshToken(refreshToken);

            // Get user from mock storage
            const user = Array.from(mockUsers.values()).find(u => u.id === payload.userId);

            if (!user) {
                return reply.status(401).send({ error: 'User not found' });
            }

            // Generate new tokens
            const newAccessToken = generateAccessToken({
                userId: user.id,
                email: user.email,
                role: user.role
            });

            const newRefreshToken = generateRefreshToken({
                userId: user.id,
                tokenVersion: payload.tokenVersion + 1
            });

            return {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            };
        } catch (error) {
            return reply.status(401).send({ error: 'Invalid refresh token' });
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
                username: 'demo_user',
                name: 'Demo User',
                role: UserRole.USER,
                avatar: generateAvatar('demo@ensei.com'),
                joinedAt: new Date(Date.now() - 86400000 * 30).toISOString()
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
}