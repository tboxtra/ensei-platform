import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import {
    fundMission,
    getFundingStatus,
    requestWithdrawal,
    getWithdrawalStatus,
    getUserWithdrawalHistory,
    convertHonorsToUsd,
    convertUsdToHonors
} from './controllers/payments';

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Payment routes
app.post('/v1/fund-mission', fundMission);
app.get('/v1/fund-mission/:receiptId', getFundingStatus);
app.post('/v1/withdrawals', requestWithdrawal);
app.get('/v1/withdrawals/:withdrawalId', getWithdrawalStatus);
app.get('/v1/withdrawals/user/:userId', getUserWithdrawalHistory);

// Conversion routes
app.post('/v1/convert/honors-to-usd', convertHonorsToUsd);
app.post('/v1/convert/usd-to-honors', convertUsdToHonors);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Payment Service running on port ${PORT}`);
});
