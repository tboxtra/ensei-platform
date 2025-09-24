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
exports.getSubmissions = exports.submitReview = exports.submitVerification = exports.linkXAccount = void 0;
const firebaseAdmin = __importStar(require("firebase-admin"));
// Get Firestore instance
const db = firebaseAdmin.firestore();
const verification_1 = require("./types/verification");
const verification_2 = require("./utils/verification");
/**
 * Link X account to user profile
 */
const linkXAccount = async (req, res) => {
    try {
        const { username, userId } = req.body;
        if (!username || !userId) {
            throw new verification_1.XAccountError('Username and userId are required');
        }
        // Validate username format
        const usernameValidation = (0, verification_2.validateXUsername)(username);
        if (!usernameValidation.isValid) {
            throw new verification_1.XAccountError(usernameValidation.error);
        }
        const cleanUsername = username.replace('@', '').trim();
        // Check if user already has an X account linked
        const existingAccountQuery = await db
            .collection('users')
            .doc(userId)
            .collection('linkedAccounts')
            .where('platform', '==', 'x')
            .limit(1)
            .get();
        if (!existingAccountQuery.empty) {
            const existingAccount = existingAccountQuery.docs[0].data();
            if (existingAccount.isImmutable) {
                throw new verification_1.XAccountError('X account cannot be changed once linked');
            }
        }
        // TODO: In production, validate against X API
        // For demo, we'll create a mock account
        const xAccount = {
            id: (0, verification_2.generateVerificationId)('x_account'),
            userId,
            username: cleanUsername,
            displayName: cleanUsername, // Will be fetched from X API
            isVerified: false, // Will be determined by X API
            linkedAt: new Date(),
            isImmutable: true
        };
        // Store in database
        await db
            .collection('users')
            .doc(userId)
            .collection('linkedAccounts')
            .doc(xAccount.id)
            .set({
            ...xAccount,
            platform: 'x',
            createdAt: new Date(),
            updatedAt: new Date()
        });
        const response = {
            success: true,
            account: xAccount
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error linking X account:', error);
        if (error instanceof verification_1.XAccountError) {
            res.status(error.statusCode).json({
                success: false,
                error: error.message
            });
        }
        else {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
};
exports.linkXAccount = linkXAccount;
/**
 * Submit verification for comment/quote tasks
 */
const submitVerification = async (req, res) => {
    try {
        const { userId, missionId, taskId, submissionLink, missionTitle, taskType } = req.body;
        if (!userId || !missionId || !taskId || !submissionLink || !missionTitle || !taskType) {
            throw new verification_1.SubmissionError('All fields are required');
        }
        // Get user's linked X account
        const xAccountQuery = await db
            .collection('users')
            .doc(userId)
            .collection('linkedAccounts')
            .where('platform', '==', 'x')
            .limit(1)
            .get();
        if (xAccountQuery.empty) {
            throw new verification_1.SubmissionError('X account must be linked before submitting verifications');
        }
        const xAccount = xAccountQuery.docs[0].data();
        // Validate submission link
        const linkValidation = await (0, verification_2.validateXLink)(submissionLink);
        if (!linkValidation.isValidUrl || !linkValidation.isXLink) {
            throw new verification_1.SubmissionError(linkValidation.error || 'Invalid X link format');
        }
        // Validate username match
        const usernameValidation = await (0, verification_2.validateUsernameMatch)(submissionLink, xAccount.username);
        if (!usernameValidation.isValid) {
            throw new verification_1.SubmissionError(usernameValidation.error);
        }
        // Create verification submission
        const submission = {
            id: (0, verification_2.generateVerificationId)('submission'),
            userId,
            missionId,
            taskId,
            submissionLink: (0, verification_2.sanitizeInput)(submissionLink),
            username: xAccount.username,
            status: 'pending',
            reviews: [],
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            missionTitle: (0, verification_2.sanitizeInput)(missionTitle),
            taskType: (0, verification_2.sanitizeInput)(taskType),
            totalReviews: 0
        };
        // Store submission
        await db
            .collection('verificationSubmissions')
            .doc(submission.id)
            .set({
            ...submission,
            createdAt: submission.createdAt,
            expiresAt: submission.expiresAt
        });
        // TODO: Assign reviewers based on expertise
        // For demo, we'll skip the assignment process
        const response = {
            success: true,
            submission
        };
        res.status(201).json(response);
    }
    catch (error) {
        console.error('Error submitting verification:', error);
        if (error instanceof verification_1.SubmissionError) {
            res.status(error.statusCode).json({
                success: false,
                error: error.message
            });
        }
        else {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
};
exports.submitVerification = submitVerification;
/**
 * Submit review for verification
 */
const submitReview = async (req, res) => {
    try {
        const { reviewerId, submissionId, rating, reviewerCommentLink } = req.body;
        if (!reviewerId || !submissionId || !rating || !reviewerCommentLink) {
            throw new verification_1.ReviewError('All fields are required');
        }
        // Validate review data
        const reviewValidation = await (0, verification_2.validateReviewSubmission)({ rating, reviewerCommentLink });
        if (!reviewValidation.isValid) {
            throw new verification_1.ReviewError(reviewValidation.error);
        }
        // Get submission
        const submissionDoc = await db
            .collection('verificationSubmissions')
            .doc(submissionId)
            .get();
        if (!submissionDoc.exists) {
            throw new verification_1.ReviewError('Submission not found');
        }
        const submission = submissionDoc.data();
        // Check if submission is expired
        if ((0, verification_2.isSubmissionExpired)(submission.createdAt)) {
            throw new verification_1.ReviewError('Submission has expired');
        }
        // Check if reviewer already reviewed this submission
        const existingReview = submission.reviews.find(review => review.reviewerId === reviewerId);
        if (existingReview) {
            throw new verification_1.ReviewError('You have already reviewed this submission');
        }
        // Check if submission already has 5 reviews
        if (submission.reviews.length >= 5) {
            throw new verification_1.ReviewError('Submission already has maximum reviews');
        }
        // Create review
        const review = {
            id: (0, verification_2.generateVerificationId)('review'),
            reviewerId,
            reviewerUsername: 'reviewer_username', // Will be fetched from user profile
            rating,
            reviewerCommentLink: (0, verification_2.sanitizeInput)(reviewerCommentLink),
            expertise: 'twitter', // Will be determined from user expertise
            createdAt: new Date(),
            submissionId,
            isValid: true
        };
        // Update submission with new review
        const updatedReviews = [...submission.reviews, review];
        const averageRating = (0, verification_2.calculateAverageRating)(updatedReviews);
        const shouldApprove = (0, verification_2.shouldApproveSubmission)(updatedReviews);
        await db
            .collection('verificationSubmissions')
            .doc(submissionId)
            .update({
            reviews: updatedReviews,
            averageRating,
            totalReviews: updatedReviews.length,
            status: shouldApprove ? 'approved' : 'pending',
            updatedAt: new Date()
        });
        // Update user rating if submission is complete
        if (updatedReviews.length === 5) {
            await updateUserRating(submission.userId, averageRating);
        }
        const response = {
            success: true,
            review
        };
        res.status(201).json(response);
    }
    catch (error) {
        console.error('Error submitting review:', error);
        if (error instanceof verification_1.ReviewError) {
            res.status(error.statusCode).json({
                success: false,
                error: error.message
            });
        }
        else {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
};
exports.submitReview = submitReview;
/**
 * Get verification submissions
 */
const getSubmissions = async (req, res) => {
    try {
        const { userId, status, limit = 10, offset = 0 } = req.query;
        let query = db.collection('verificationSubmissions');
        if (userId) {
            query = query.where('userId', '==', userId);
        }
        if (status) {
            query = query.where('status', '==', status);
        }
        query = query
            .orderBy('createdAt', 'desc')
            .limit(Number(limit))
            .offset(Number(offset));
        const snapshot = await query.get();
        const submissions = snapshot.docs.map((doc) => doc.data());
        const response = {
            success: true,
            submissions,
            total: submissions.length
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error getting submissions:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
exports.getSubmissions = getSubmissions;
/**
 * Update user rating after review completion
 */
const updateUserRating = async (userId, newRating) => {
    try {
        const userRatingDoc = await db
            .collection('userRatings')
            .doc(userId)
            .get();
        if (userRatingDoc.exists) {
            const currentRating = userRatingDoc.data();
            const totalSubmissions = currentRating.totalSubmissions + 1;
            const totalRating = ((currentRating.totalRating * currentRating.totalSubmissions) + newRating) / totalSubmissions;
            await db
                .collection('userRatings')
                .doc(userId)
                .update({
                totalRating,
                totalSubmissions,
                lastUpdated: new Date()
            });
        }
        else {
            // Create new user rating
            const newUserRating = {
                userId,
                totalRating: newRating,
                totalSubmissions: 1,
                totalReviews: 0,
                lastUpdated: new Date(),
                ratingHistory: []
            };
            await db
                .collection('userRatings')
                .doc(userId)
                .set(newUserRating);
        }
    }
    catch (error) {
        console.error('Error updating user rating:', error);
    }
};
