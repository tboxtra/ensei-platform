import { Request, Response } from 'express';
import { db } from './firebase';
import { 
  XAccount, 
  VerificationSubmission, 
  Review, 
  UserRating,
  LinkXAccountRequest,
  LinkXAccountResponse,
  SubmitVerificationRequest,
  SubmitVerificationResponse,
  SubmitReviewRequest,
  SubmitReviewResponse,
  GetSubmissionsRequest,
  GetSubmissionsResponse,
  XAccountError,
  SubmissionError,
  ReviewError
} from './types/verification';
import {
  validateXUsername,
  validateXLink,
  validateUsernameMatch,
  assignReviewersByExpertise,
  calculateAverageRating,
  shouldApproveSubmission,
  isSubmissionExpired,
  validateReviewSubmission,
  generateVerificationId,
  sanitizeInput
} from './utils/verification';

/**
 * Link X account to user profile
 */
export const linkXAccount = async (req: Request, res: Response) => {
  try {
    const { username, userId }: LinkXAccountRequest = req.body;
    
    if (!username || !userId) {
      throw new XAccountError('Username and userId are required');
    }
    
    // Validate username format
    const usernameValidation = validateXUsername(username);
    if (!usernameValidation.isValid) {
      throw new XAccountError(usernameValidation.error!);
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
      const existingAccount = existingAccountQuery.docs[0].data() as XAccount;
      if (existingAccount.isImmutable) {
        throw new XAccountError('X account cannot be changed once linked');
      }
    }
    
    // TODO: In production, validate against X API
    // For demo, we'll create a mock account
    const xAccount: XAccount = {
      id: generateVerificationId('x_account'),
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
    
    const response: LinkXAccountResponse = {
      success: true,
      account: xAccount
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Error linking X account:', error);
    
    if (error instanceof XAccountError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
};

/**
 * Submit verification for comment/quote tasks
 */
export const submitVerification = async (req: Request, res: Response) => {
  try {
    const {
      userId,
      missionId,
      taskId,
      submissionLink,
      missionTitle,
      taskType
    }: SubmitVerificationRequest = req.body;
    
    if (!userId || !missionId || !taskId || !submissionLink || !missionTitle || !taskType) {
      throw new SubmissionError('All fields are required');
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
      throw new SubmissionError('X account must be linked before submitting verifications');
    }
    
    const xAccount = xAccountQuery.docs[0].data() as XAccount;
    
    // Validate submission link
    const linkValidation = await validateXLink(submissionLink);
    if (!linkValidation.isValidUrl || !linkValidation.isXLink) {
      throw new SubmissionError(linkValidation.error || 'Invalid X link format');
    }
    
    // Validate username match
    const usernameValidation = validateUsernameMatch(submissionLink, xAccount.username);
    if (!usernameValidation.isValid) {
      throw new SubmissionError(usernameValidation.error!);
    }
    
    // Create verification submission
    const submission: VerificationSubmission = {
      id: generateVerificationId('submission'),
      userId,
      missionId,
      taskId,
      submissionLink: sanitizeInput(submissionLink),
      username: xAccount.username,
      status: 'pending',
      reviews: [],
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      missionTitle: sanitizeInput(missionTitle),
      taskType: sanitizeInput(taskType),
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
    
    const response: SubmitVerificationResponse = {
      success: true,
      submission
    };
    
    res.status(201).json(response);
  } catch (error) {
    console.error('Error submitting verification:', error);
    
    if (error instanceof SubmissionError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
};

/**
 * Submit review for verification
 */
export const submitReview = async (req: Request, res: Response) => {
  try {
    const {
      reviewerId,
      submissionId,
      rating,
      reviewerCommentLink
    }: SubmitReviewRequest = req.body;
    
    if (!reviewerId || !submissionId || !rating || !reviewerCommentLink) {
      throw new ReviewError('All fields are required');
    }
    
    // Validate review data
    const reviewValidation = validateReviewSubmission({ rating, reviewerCommentLink });
    if (!reviewValidation.isValid) {
      throw new ReviewError(reviewValidation.error!);
    }
    
    // Get submission
    const submissionDoc = await db
      .collection('verificationSubmissions')
      .doc(submissionId)
      .get();
    
    if (!submissionDoc.exists) {
      throw new ReviewError('Submission not found');
    }
    
    const submission = submissionDoc.data() as VerificationSubmission;
    
    // Check if submission is expired
    if (isSubmissionExpired(submission.createdAt)) {
      throw new ReviewError('Submission has expired');
    }
    
    // Check if reviewer already reviewed this submission
    const existingReview = submission.reviews.find(review => review.reviewerId === reviewerId);
    if (existingReview) {
      throw new ReviewError('You have already reviewed this submission');
    }
    
    // Check if submission already has 5 reviews
    if (submission.reviews.length >= 5) {
      throw new ReviewError('Submission already has maximum reviews');
    }
    
    // Create review
    const review: Review = {
      id: generateVerificationId('review'),
      reviewerId,
      reviewerUsername: 'reviewer_username', // Will be fetched from user profile
      rating,
      reviewerCommentLink: sanitizeInput(reviewerCommentLink),
      expertise: 'twitter', // Will be determined from user expertise
      createdAt: new Date(),
      submissionId,
      isValid: true
    };
    
    // Update submission with new review
    const updatedReviews = [...submission.reviews, review];
    const averageRating = calculateAverageRating(updatedReviews);
    const shouldApprove = shouldApproveSubmission(updatedReviews);
    
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
    
    const response: SubmitReviewResponse = {
      success: true,
      review
    };
    
    res.status(201).json(response);
  } catch (error) {
    console.error('Error submitting review:', error);
    
    if (error instanceof ReviewError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
};

/**
 * Get verification submissions
 */
export const getSubmissions = async (req: Request, res: Response) => {
  try {
    const { userId, status, limit = 10, offset = 0 }: GetSubmissionsRequest = req.query;
    
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
    const submissions = snapshot.docs.map(doc => doc.data() as VerificationSubmission);
    
    const response: GetSubmissionsResponse = {
      success: true,
      submissions,
      total: submissions.length
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Error getting submissions:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Update user rating after review completion
 */
const updateUserRating = async (userId: string, newRating: number) => {
  try {
    const userRatingDoc = await db
      .collection('userRatings')
      .doc(userId)
      .get();
    
    if (userRatingDoc.exists) {
      const currentRating = userRatingDoc.data() as UserRating;
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
    } else {
      // Create new user rating
      const newUserRating: UserRating = {
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
  } catch (error) {
    console.error('Error updating user rating:', error);
  }
};
