"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeInput = exports.generateVerificationId = exports.validateReviewSubmission = exports.getTimeRemaining = exports.isSubmissionExpired = exports.shouldApproveSubmission = exports.calculateAverageRating = exports.assignReviewersByExpertise = exports.calculateExpertiseMatch = exports.validateUsernameMatch = exports.validateXLink = exports.validateXUsername = void 0;
/**
 * Validates X (Twitter) username format
 */
const validateXUsername = (username) => {
    const cleanUsername = username.replace('@', '').trim();
    if (!cleanUsername) {
        return { isValid: false, error: 'Username cannot be empty' };
    }
    if (cleanUsername.length < 1 || cleanUsername.length > 15) {
        return { isValid: false, error: 'Username must be 1-15 characters long' };
    }
    if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
        return { isValid: false, error: 'Username can only contain letters, numbers, and underscores' };
    }
    return { isValid: true };
};
exports.validateXUsername = validateXUsername;
/**
 * Validates X (Twitter) link format and extracts username
 */
const validateXLink = async (link) => {
    try {
        // Basic URL validation
        const url = new URL(link);
        // Check if it's an X/Twitter link
        const isXLink = url.hostname === 'twitter.com' || url.hostname === 'x.com';
        if (!isXLink) {
            return {
                isValidUrl: true,
                isXLink: false,
                isAccessible: false,
                error: 'Link must be from X (Twitter)'
            };
        }
        // Extract username from path
        const pathParts = url.pathname.split('/').filter(part => part);
        let username;
        if (pathParts.length >= 1) {
            username = pathParts[0];
        }
        if (!username) {
            return {
                isValidUrl: true,
                isXLink: true,
                isAccessible: false,
                error: 'Could not extract username from link'
            };
        }
        // Validate username format
        const usernameValidation = (0, exports.validateXUsername)(username);
        if (!usernameValidation.isValid) {
            return {
                isValidUrl: true,
                isXLink: true,
                isAccessible: false,
                username,
                error: usernameValidation.error
            };
        }
        // TODO: In production, check if link is accessible
        // For now, we'll simulate accessibility check
        const isAccessible = await checkLinkAccessibility(link);
        return {
            isValidUrl: true,
            isXLink: true,
            username,
            isAccessible
        };
    }
    catch (error) {
        return {
            isValidUrl: false,
            isXLink: false,
            isAccessible: false,
            error: 'Invalid URL format'
        };
    }
};
exports.validateXLink = validateXLink;
/**
 * Simulates link accessibility check
 * In production, this would make an HTTP request to verify the link
 */
const checkLinkAccessibility = async (link) => {
    try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 100));
        // Mock accessibility check
        // In production, use fetch or axios to check if link is accessible
        return link.length > 20; // Simple mock validation
    }
    catch (error) {
        return false;
    }
};
/**
 * Validates that submission link contains the user's X username
 */
const validateUsernameMatch = async (submissionLink, userXUsername) => {
    const linkValidation = await (0, exports.validateXLink)(submissionLink);
    if (!linkValidation.isValidUrl || !linkValidation.isXLink) {
        return { isValid: false, error: 'Invalid X link format' };
    }
    if (!linkValidation.username) {
        return { isValid: false, error: 'Could not extract username from submission link' };
    }
    if (linkValidation.username.toLowerCase() !== userXUsername.toLowerCase()) {
        return {
            isValid: false,
            error: `Submission link username (@${linkValidation.username}) doesn't match your linked X account (@${userXUsername})`
        };
    }
    return { isValid: true };
};
exports.validateUsernameMatch = validateUsernameMatch;
/**
 * Calculates expertise match score for review assignment
 */
const calculateExpertiseMatch = (reviewer, submission) => {
    let matchScore = 0;
    const specialties = [];
    // Platform match (highest weight)
    if (reviewer.platform === submission.platform) {
        matchScore += 40;
        specialties.push('platform');
    }
    // Mission type match
    if (reviewer.specialties.includes(submission.missionType)) {
        matchScore += 30;
        specialties.push('mission_type');
    }
    // Task type match
    if (reviewer.specialties.includes(submission.taskType)) {
        matchScore += 20;
        specialties.push('task_type');
    }
    // Experience level bonus
    switch (reviewer.level) {
        case 'expert':
            matchScore += 10;
            break;
        case 'advanced':
            matchScore += 7;
            break;
        case 'intermediate':
            matchScore += 4;
            break;
        case 'beginner':
            matchScore += 1;
            break;
    }
    // Review quality bonus
    if (reviewer.averageRating >= 4.5) {
        matchScore += 5;
    }
    else if (reviewer.averageRating >= 4.0) {
        matchScore += 3;
    }
    return {
        reviewerId: reviewer.userId,
        expertise: reviewer,
        matchScore,
        specialties
    };
};
exports.calculateExpertiseMatch = calculateExpertiseMatch;
/**
 * Assigns reviewers based on expertise matching
 */
const assignReviewersByExpertise = (availableReviewers, submission, requiredReviews = 5) => {
    // Calculate match scores for all reviewers
    const matches = availableReviewers
        .map(reviewer => (0, exports.calculateExpertiseMatch)(reviewer, submission))
        .sort((a, b) => b.matchScore - a.matchScore); // Sort by highest match score
    // Select top reviewers
    const selectedReviewers = matches.slice(0, requiredReviews);
    // Create review assignments
    return selectedReviewers.map((match, index) => ({
        id: `assignment_${Date.now()}_${index}`,
        submissionId: 'submission_id', // Will be set by caller
        reviewerId: match.reviewerId,
        expertise: match.expertise.platform,
        assignedAt: new Date(),
        status: 'assigned',
        priority: match.matchScore
    }));
};
exports.assignReviewersByExpertise = assignReviewersByExpertise;
/**
 * Calculates average rating from reviews
 */
const calculateAverageRating = (reviews) => {
    if (reviews.length === 0)
        return 0;
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10; // Round to 1 decimal place
};
exports.calculateAverageRating = calculateAverageRating;
/**
 * Determines if submission should be approved based on reviews
 */
const shouldApproveSubmission = (reviews) => {
    if (reviews.length < 5)
        return false;
    const averageRating = (0, exports.calculateAverageRating)(reviews);
    return averageRating >= 3.0; // Minimum threshold for approval
};
exports.shouldApproveSubmission = shouldApproveSubmission;
/**
 * Checks if submission has expired (24 hours)
 */
const isSubmissionExpired = (createdAt) => {
    const now = new Date();
    const expirationTime = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000); // 24 hours
    return now > expirationTime;
};
exports.isSubmissionExpired = isSubmissionExpired;
/**
 * Gets time remaining until expiration
 */
const getTimeRemaining = (createdAt) => {
    const now = new Date();
    const expirationTime = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);
    const timeLeft = expirationTime.getTime() - now.getTime();
    if (timeLeft <= 0) {
        return { hours: 0, minutes: 0, expired: true };
    }
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    return { hours, minutes, expired: false };
};
exports.getTimeRemaining = getTimeRemaining;
/**
 * Validates review submission
 */
const validateReviewSubmission = async (review) => {
    if (review.rating < 1 || review.rating > 5) {
        return { isValid: false, error: 'Rating must be between 1 and 5' };
    }
    if (!review.reviewerCommentLink.trim()) {
        return { isValid: false, error: 'Reviewer comment link is required' };
    }
    // Validate reviewer comment link
    const linkValidation = await (0, exports.validateXLink)(review.reviewerCommentLink);
    if (!linkValidation.isValidUrl || !linkValidation.isXLink) {
        return { isValid: false, error: 'Reviewer comment link must be a valid X (Twitter) link' };
    }
    return { isValid: true };
};
exports.validateReviewSubmission = validateReviewSubmission;
/**
 * Generates unique IDs for verification system
 */
const generateVerificationId = (prefix) => {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
exports.generateVerificationId = generateVerificationId;
/**
 * Sanitizes user input for security
 */
const sanitizeInput = (input) => {
    return input
        .trim()
        .replace(/[<>]/g, '') // Remove potential HTML tags
        .substring(0, 1000); // Limit length
};
exports.sanitizeInput = sanitizeInput;
