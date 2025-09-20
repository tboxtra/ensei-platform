/**
 * Optimized Firebase Security Rules
 * Industry Standard: Simplified, performant rules with server-side validation backup
 */

// Helper functions for common validations
function isAuthenticated() {
    return request.auth != null;
}

function isOwner(userId) {
    return request.auth.uid == userId;
}

function isValidUuid(uuid) {
    return uuid is string && uuid.matches('^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');
}

function isValidTimestamp(timestamp) {
    return timestamp is string && timestamp.matches('^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}Z$');
}

function isValidUrl(url) {
    return url is string && url.matches('^https?://[^\\s]+$');
}

function isValidTaskType(taskType) {
    return taskType in ['like', 'comment', 'quote', 'retweet', 'follow'];
}

function isValidStatus(status) {
    return status in ['pending', 'verified', 'flagged'];
}

function isValidMissionStatus(status) {
    return status in ['active', 'paused', 'completed', 'cancelled'];
}

// Users collection rules
match / users / { userId } {
  allow read: if isAuthenticated() && isOwner(userId);
  allow create: if isAuthenticated() && isOwner(userId) &&
        isValidUuid(userId) &&
        resource.data.keys().hasAll(['id', 'email', 'name', 'createdAt', 'updatedAt']) &&
        resource.data.id == userId &&
        resource.data.email is string &&
            resource.data.name is string &&
                isValidTimestamp(resource.data.createdAt) &&
                isValidTimestamp(resource.data.updatedAt);
  
  allow update: if isAuthenticated() && isOwner(userId) &&
        isValidTimestamp(resource.data.updatedAt) &&
        resource.data.updatedAt > resource.data.createdAt;
  
  allow delete: if false; // Users cannot delete their accounts
}

// Missions collection rules
match / missions / { missionId } {
  allow read: if isAuthenticated();
  allow create: if isAuthenticated() &&
        isValidUuid(missionId) &&
        resource.data.keys().hasAll(['id', 'title', 'description', 'tasks', 'rewards_per_user', 'total_cost_usd', 'created_by', 'created_at', 'updated_at', 'status', 'participants_count']) &&
        resource.data.id == missionId &&
        resource.data.title is string &&
            resource.data.description is string &&
                resource.data.tasks is list &&
                    resource.data.rewards_per_user is number &&
                        resource.data.total_cost_usd is number &&
                            resource.data.created_by == request.auth.uid &&
                            isValidTimestamp(resource.data.created_at) &&
                            isValidTimestamp(resource.data.updated_at) &&
                            isValidMissionStatus(resource.data.status) &&
                            resource.data.participants_count == 0;
  
  allow update: if isAuthenticated() && resource.data.created_by == request.auth.uid &&
        isValidTimestamp(resource.data.updated_at) &&
        resource.data.updated_at > resource.data.created_at;
  
  allow delete: if isAuthenticated() && resource.data.created_by == request.auth.uid;
}

// Task completions collection rules
match / taskCompletions / { completionId } {
  allow read: if isAuthenticated() && (
        resource.data.userId == request.auth.uid ||
        resource.data.missionId in get(/databases/$(database) / documents / missions / $(resource.data.missionId)).data.created_by
    );
  
  allow create: if isAuthenticated() &&
        isValidUuid(completionId) &&
        resource.data.keys().hasAll(['id', 'userId', 'missionId', 'taskId', 'completionType', 'status', 'submittedAt']) &&
        resource.data.id == completionId &&
        resource.data.userId == request.auth.uid &&
        isValidUuid(resource.data.missionId) &&
        resource.data.taskId is string &&
            resource.data.completionType in ['direct', 'link_submission'] &&
            isValidStatus(resource.data.status) &&
            isValidTimestamp(resource.data.submittedAt);
  
  allow update: if isAuthenticated() && (
        // User can update their own completions
        (resource.data.userId == request.auth.uid &&
            resource.data.status in ['pending', 'verified'] &&
            isValidTimestamp(resource.data.updated_at)) ||
        // Mission creator can verify/flag completions
        (resource.data.missionId in get(/databases/$(database) / documents / missions / $(resource.data.missionId)).data.created_by &&
            resource.data.status in ['verified', 'flagged'] &&
            isValidTimestamp(resource.data.updated_at))
    );
  
  allow delete: if false; // Completions cannot be deleted
}

// Reviews collection rules
match / reviews / { reviewId } {
  allow read: if isAuthenticated();
  allow create: if isAuthenticated() &&
        isValidUuid(reviewId) &&
        resource.data.keys().hasAll(['id', 'reviewerId', 'submissionId', 'rating', 'comment', 'submittedAt', 'honorsEarned']) &&
        resource.data.id == reviewId &&
        resource.data.reviewerId == request.auth.uid &&
        isValidUuid(resource.data.submissionId) &&
        resource.data.rating is number &&
            resource.data.rating >= 1 &&
            resource.data.rating <= 5 &&
            resource.data.comment is string &&
                isValidTimestamp(resource.data.submittedAt) &&
                resource.data.honorsEarned is number;
  
  allow update: if false; // Reviews cannot be updated
  allow delete: if false; // Reviews cannot be deleted
}

// Link validations collection rules (for caching)
match / linkValidations / { validationId } {
  allow read: if isAuthenticated();
  allow create: if isAuthenticated() &&
        isValidUuid(validationId) &&
        resource.data.keys().hasAll(['id', 'url', 'result', 'validatedAt']) &&
        resource.data.id == validationId &&
        isValidUrl(resource.data.url) &&
        resource.data.result is map &&
            isValidTimestamp(resource.data.validatedAt);
  
  allow update: if false; // Validations cannot be updated
  allow delete: if false; // Validations cannot be deleted
}

// User sessions collection rules
match / userSessions / { sessionId } {
  allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
  allow create: if isAuthenticated() &&
        resource.data.userId == request.auth.uid &&
        isValidTimestamp(resource.data.createdAt) &&
        isValidTimestamp(resource.data.expiresAt);
  
  allow update: if isAuthenticated() && resource.data.userId == request.auth.uid;
  allow delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
}

// Audit logs collection rules (for compliance)
match / auditLogs / { logId } {
  allow read: if false; // Only server can read audit logs
  allow create: if false; // Only server can create audit logs
  allow update: if false;
  allow delete: if false;
}

// System configuration collection rules
match / systemConfig / { configId } {
  allow read: if isAuthenticated();
  allow create: if false; // Only server can create config
  allow update: if false; // Only server can update config
  allow delete: if false;
}

// Rate limiting collection rules
match / rateLimits / { limitId } {
  allow read: if false; // Only server can read rate limits
  allow create: if false; // Only server can create rate limits
  allow update: if false; // Only server can update rate limits
  allow delete: if false; // Only server can delete rate limits
}

// Cache collection rules
match / cache / { cacheId } {
  allow read: if isAuthenticated();
  allow create: if false; // Only server can create cache entries
  allow update: if false; // Only server can update cache entries
  allow delete: if false; // Only server can delete cache entries
}

// Notification preferences collection rules
match / notificationPreferences / { userId } {
  allow read: if isAuthenticated() && isOwner(userId);
  allow create: if isAuthenticated() && isOwner(userId) &&
        resource.data.keys().hasAll(['userId', 'emailNotifications', 'pushNotifications', 'updatedAt']) &&
        resource.data.userId == userId &&
        resource.data.emailNotifications is bool &&
            resource.data.pushNotifications is bool &&
                isValidTimestamp(resource.data.updatedAt);
  
  allow update: if isAuthenticated() && isOwner(userId) &&
        isValidTimestamp(resource.data.updatedAt) &&
        resource.data.updatedAt > resource.data.createdAt;
  
  allow delete: if false; // Preferences cannot be deleted
}

// User analytics collection rules
match / userAnalytics / { userId } {
  allow read: if isAuthenticated() && isOwner(userId);
  allow create: if false; // Only server can create analytics
  allow update: if false; // Only server can update analytics
  allow delete: if false; // Only server can delete analytics
}

// Mission analytics collection rules
match / missionAnalytics / { missionId } {
  allow read: if isAuthenticated() &&
        resource.data.missionId in get(/databases/$(database) / documents / missions / $(resource.data.missionId)).data.created_by;
  allow create: if false; // Only server can create analytics
  allow update: if false; // Only server can update analytics
  allow delete: if false; // Only server can delete analytics
}

// Error logs collection rules
match / errorLogs / { logId } {
  allow read: if false; // Only server can read error logs
  allow create: if false; // Only server can create error logs
  allow update: if false;
  allow delete: if false;
}

// Performance metrics collection rules
match / performanceMetrics / { metricId } {
  allow read: if false; // Only server can read performance metrics
  allow create: if false; // Only server can create performance metrics
  allow update: if false;
  allow delete: if false;
}

// Security rules for file uploads (if using Firebase Storage)
rules_version = '2';
service firebase.storage {
    match / b / { bucket } / o {
        // User profile images
        match / users / { userId } / profile / { fileName } {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && isOwner(userId) &&
                fileName.matches('^[a-zA-Z0-9_-]+\\.(jpg|jpeg|png|gif)$') &&
                resource.size < 5 * 1024 * 1024; // 5MB limit
        }

        // Mission images
        match / missions / { missionId } / images / { fileName } {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() &&
                resource.data.missionId in get(/databases/$(database) / documents / missions / $(resource.data.missionId)).data.created_by &&
                fileName.matches('^[a-zA-Z0-9_-]+\\.(jpg|jpeg|png|gif)$') &&
                resource.size < 10 * 1024 * 1024; // 10MB limit
        }

        // Task completion proof images
        match / taskCompletions / { completionId } / proof / { fileName } {
      allow read: if isAuthenticated() && (
                resource.data.userId == request.auth.uid ||
                resource.data.missionId in get(/databases/$(database) / documents / missions / $(resource.data.missionId)).data.created_by
            );
      allow write: if isAuthenticated() && resource.data.userId == request.auth.uid &&
                fileName.matches('^[a-zA-Z0-9_-]+\\.(jpg|jpeg|png|gif|pdf)$') &&
                resource.size < 10 * 1024 * 1024; // 10MB limit
        }

        // System files (admin only)
        match / system / { fileName } {
      allow read: if false; // Only server can read system files
      allow write: if false; // Only server can write system files
        }
    }
}

