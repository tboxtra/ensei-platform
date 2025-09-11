"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const router = express_1.default.Router();
exports.authRoutes = router;
// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';
// Mock user storage (replace with Firestore in production)
const mockUsers = new Map();
// Initialize admin user
async function initializeAdminUser() {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@ensei.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    if (!mockUsers.has(adminEmail)) {
        const hashedPassword = await bcryptjs_1.default.hash(adminPassword, 12);
        mockUsers.set(adminEmail, {
            id: 'admin_1',
            username: 'admin',
            email: adminEmail,
            password: hashedPassword,
            role: 'admin',
            createdAt: new Date().toISOString()
        });
        console.log('Admin user created:', adminEmail);
    }
}
// Initialize admin user on startup
initializeAdminUser();
// Login endpoint
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        const user = mockUsers.get(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        // Generate JWT tokens
        const accessToken = jsonwebtoken_1.default.sign({
            userId: user.id,
            email: user.email,
            role: user.role
        }, JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jsonwebtoken_1.default.sign({
            userId: user.id,
            tokenVersion: 1
        }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
        res.json({
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
                joinedAt: user.createdAt
            },
            accessToken,
            refreshToken
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Register endpoint
router.post('/register', async (req, res) => {
    try {
        const { email, password, username } = req.body;
        if (!email || !password || !username) {
            return res.status(400).json({ error: 'Email, password, and username are required' });
        }
        if (mockUsers.has(email)) {
            return res.status(409).json({ error: 'User already exists' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        const userId = `user_${Date.now()}`;
        const user = {
            id: userId,
            username,
            email,
            password: hashedPassword,
            role: 'user',
            createdAt: new Date().toISOString()
        };
        mockUsers.set(email, user);
        // Generate tokens
        const accessToken = jsonwebtoken_1.default.sign({
            userId: user.id,
            email: user.email,
            role: user.role
        }, JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jsonwebtoken_1.default.sign({
            userId: user.id,
            tokenVersion: 1
        }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
        res.status(201).json({
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
                joinedAt: user.createdAt
            },
            accessToken,
            refreshToken
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Refresh token endpoint
router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ error: 'Refresh token is required' });
        }
        const decoded = jsonwebtoken_1.default.verify(refreshToken, JWT_REFRESH_SECRET);
        const user = Array.from(mockUsers.values()).find(u => u.id === decoded.userId);
        if (!user) {
            return res.status(401).json({ error: 'Invalid refresh token' });
        }
        // Generate new access token
        const accessToken = jsonwebtoken_1.default.sign({
            userId: user.id,
            email: user.email,
            role: user.role
        }, JWT_SECRET, { expiresIn: '15m' });
        res.json({ accessToken });
    }
    catch (error) {
        console.error('Refresh token error:', error);
        res.status(401).json({ error: 'Invalid refresh token' });
    }
});
// Me endpoint
router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Access token required' });
        }
        const token = authHeader.substring(7);
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const user = Array.from(mockUsers.values()).find(u => u.id === decoded.userId);
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }
        res.json({
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
            joinedAt: user.createdAt
        });
    }
    catch (error) {
        console.error('Me endpoint error:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
});
//# sourceMappingURL=auth.js.map