# Firebase UID Migration Guide

This document outlines the comprehensive solution to ensure Firebase user data handling uses `uid` as the primary key and prevents data loss when profile display names change.

## Overview

The migration ensures that:
1. All Firestore collections and queries use Firebase Auth `uid` as the **primary key**
2. Display names are stored as regular fields, never used as document IDs
3. User data remains accessible and intact when display names change
4. All user-related data (missions, submissions, reviews, etc.) stays linked to the same `uid`

## Problem Statement

Previously, there was a risk that:
- Documents might be keyed by `displayName` instead of `uid`
- Changing display names could cause data loss or broken references
- User statistics, missions, and other data could become inaccessible
- Data integrity could be compromised during profile updates

## Solution Architecture

### 1. Firebase Functions Updates

**Files Modified:**
- `functions/src/index.ts` - Updated profile and mission endpoints
- `functions/src/utils/user-data-integrity.ts` - New integrity utilities
- `functions/src/migration/uid-migration.ts` - Migration script

**Key Changes:**
- Profile updates use `updateUserProfileSafely()` function
- Mission creation uses `createMissionWithUidReferences()` function
- All operations validate UID format before proceeding
- Added data integrity verification endpoint

### 2. Firestore Security Rules

**File:** `firestore.rules`

**Updates:**
- Added `isValidUid()` helper function
- Enforced UID format validation in user document creation
- Ensured all user-related documents use UID references

### 3. Client-Side Utilities

**File:** `apps/web/src/utils/user-data-integrity.ts`

**Features:**
- Safe profile update with integrity checks
- UID-based data fetching
- React hooks for data integrity
- Display name change verification

### 4. Migration Script

**File:** `scripts/run-uid-migration.ts`

**Purpose:**
- One-time migration to re-key any documents using displayName
- Validates and fixes data structure issues
- Provides detailed migration report

## Implementation Details

### Firebase Functions

#### Profile Update Endpoint
```typescript
app.put('/v1/user/profile', verifyFirebaseToken, async (req: any, res) => {
  const result = await updateUserProfileSafely(userId, {
    ...updateData,
    email: req.user.email,
    displayName: updateData.displayName || updateData.name || req.user.displayName || '',
    avatar: updateData.avatar || req.user.picture || ''
  });
  
  if (!result.success) {
    res.status(400).json({ error: result.error });
    return;
  }
  
  res.json(result.updatedUser);
});
```

#### Mission Creation Endpoint
```typescript
app.post('/v1/missions', verifyFirebaseToken, async (req: any, res) => {
  const result = await createMissionWithUidReferences(userId, missionData);
  
  if (!result.success) {
    res.status(400).json({ error: result.error });
    return;
  }
  
  res.status(201).json(result.mission);
});
```

#### Data Integrity Verification
```typescript
app.post('/v1/user/verify-data-integrity', verifyFirebaseToken, async (req: any, res) => {
  const result = await verifyDataIntegrityAfterDisplayNameChange(
    userId,
    oldDisplayName || '',
    newDisplayName || ''
  );
  
  res.json({
    verified: result.verified,
    issues: result.issues,
    dataCounts: result.dataCounts
  });
});
```

### Firestore Security Rules

```javascript
// Helper function to validate Firebase UID format
function isValidUid(uid) {
  return uid is string && uid.size() == 28 && uid.matches('[a-zA-Z0-9]{28}');
}

// Users collection with UID validation
match /users/{userId} {
  allow read, write: if request.auth != null && 
    request.auth.uid == userId && 
    isValidUid(userId);
  allow create: if request.auth != null && 
    request.auth.uid == userId && 
    isValidUid(userId) &&
    request.resource.data.uid == userId;
}

// Missions with UID-based created_by validation
match /missions/{missionId} {
  allow create: if request.auth != null && 
    (request.auth.token.role == 'admin' || request.auth.token.role == 'moderator' || 
     (request.auth.uid == request.resource.data.created_by && 
      isValidUid(request.resource.data.created_by)));
}
```

### Client-Side Usage

#### Safe Profile Update
```typescript
import { useSafeProfileUpdate } from '../utils/user-data-integrity';

function ProfilePage() {
  const { updateProfile, loading, error, integrityCheck } = useSafeProfileUpdate();
  
  const handleUpdateProfile = async (profileData) => {
    const result = await updateProfile(profileData);
    
    if (result && integrityCheck) {
      if (!integrityCheck.verified) {
        console.warn('Data integrity issues:', integrityCheck.issues);
      }
    }
  };
  
  return (
    // Profile form UI
  );
}
```

#### UID-Based Data Fetching
```typescript
import { useUidBasedUserData } from '../utils/user-data-integrity';

function Dashboard() {
  const { userData, loading, error, refetch } = useUidBasedUserData();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <h1>Welcome, {userData?.user?.displayName}</h1>
      <p>Missions: {userData?.missions?.length}</p>
      <p>Submissions: {userData?.submissions?.length}</p>
    </div>
  );
}
```

## Migration Process

### 1. Run the Migration Script

```bash
# Set environment variables
export FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
export FIREBASE_PROJECT_ID='your-project-id'

# Run migration
npm run migrate:uid
```

### 2. Migration Steps

The migration script will:
1. **Audit Users Collection**: Check for documents with non-UID keys
2. **Migrate Users**: Re-key documents to use UID as primary key
3. **Audit Missions**: Check for missions using displayName in `created_by`
4. **Migrate Missions**: Update `created_by` to use UID
5. **Audit Submissions**: Check for submissions using displayName in `user_id`
6. **Migrate Submissions**: Update `user_id` to use UID
7. **Audit Reviews**: Check for reviews using displayName in user references
8. **Migrate Reviews**: Update user references to use UID
9. **Audit Honors Ledger**: Check for ledger entries using displayName
10. **Migrate Honors Ledger**: Update user references to use UID

### 3. Verification

After migration, verify:
- All user documents use UID as document ID
- All missions have UID in `created_by` field
- All submissions have UID in `user_id` field
- All reviews have UID in `user_id` and `reviewer_id` fields
- All honors ledger entries have UID in `user_id` field

## Testing

### Unit Tests

Run the comprehensive test suite:

```bash
cd functions
npm test -- --testPathPattern=user-data-integrity
```

### Integration Tests

Test the complete workflow:

1. **Create User Profile**
2. **Create Mission**
3. **Create Submission**
4. **Change Display Name**
5. **Verify Data Integrity**
6. **Confirm All Data Accessible**

### Manual Testing

1. Create a user account
2. Create missions and submissions
3. Change the display name multiple times
4. Verify all data remains accessible
5. Check that statistics are preserved

## Data Structure

### Before Migration (Problematic)
```javascript
// Users collection - document ID could be displayName
/users/John Doe {
  name: "John Doe",
  email: "john@example.com"
}

// Missions collection - created_by could be displayName
/missions/mission123 {
  created_by: "John Doe", // ❌ Problematic
  title: "Test Mission"
}
```

### After Migration (Correct)
```javascript
// Users collection - document ID is always UID
/users/abc123def456ghi789jkl012mno345 {
  uid: "abc123def456ghi789jkl012mno345",
  displayName: "John Doe", // ✅ Stored as field
  email: "john@example.com"
}

// Missions collection - created_by is always UID
/missions/mission123 {
  created_by: "abc123def456ghi789jkl012mno345", // ✅ UID reference
  title: "Test Mission"
}
```

## Benefits

1. **Data Integrity**: Display name changes don't affect data accessibility
2. **Consistent References**: All user references use stable UID
3. **Security**: Firestore rules enforce UID-based access
4. **Performance**: Queries are more efficient with UID-based keys
5. **Scalability**: System can handle any display name format
6. **Reliability**: No data loss during profile updates

## Monitoring

### Key Metrics to Monitor

1. **Migration Success Rate**: Percentage of documents successfully migrated
2. **Data Integrity Issues**: Number of integrity violations detected
3. **Profile Update Failures**: Failed profile updates due to UID issues
4. **Query Performance**: Response times for UID-based queries

### Alerts to Set Up

1. **Migration Failures**: Alert when migration script fails
2. **Data Integrity Violations**: Alert when integrity checks fail
3. **Invalid UID Usage**: Alert when non-UID keys are detected
4. **Profile Update Errors**: Alert when profile updates fail

## Troubleshooting

### Common Issues

1. **Invalid UID Format**
   - **Cause**: Document ID doesn't match Firebase UID format
   - **Solution**: Run migration script to re-key documents

2. **Missing UID Field**
   - **Cause**: User document missing `uid` field
   - **Solution**: Update user creation logic to include UID

3. **Display Name References**
   - **Cause**: Other documents still reference displayName
   - **Solution**: Run migration script to update references

4. **Security Rule Violations**
   - **Cause**: Firestore rules rejecting invalid UID format
   - **Solution**: Update client code to use proper UID format

### Debug Commands

```bash
# Check Firestore rules
firebase firestore:rules:get

# Deploy updated rules
firebase deploy --only firestore:rules

# Check function logs
firebase functions:log

# Run migration in dry-run mode (add --dry-run flag)
npm run migrate:uid -- --dry-run
```

## Future Considerations

1. **Automated Monitoring**: Set up automated checks for data integrity
2. **Performance Optimization**: Monitor and optimize UID-based queries
3. **Backup Strategy**: Ensure regular backups before major changes
4. **Documentation Updates**: Keep documentation current with any changes
5. **Team Training**: Ensure all developers understand UID-based architecture

## Conclusion

This migration ensures that the Ensei platform maintains data integrity and prevents data loss when users change their display names. The solution is comprehensive, tested, and follows Firebase best practices for user data management.

The key principle is: **Always use Firebase Auth UID as the primary key for user-related data, and store display names as regular fields that can be updated without affecting data accessibility.**
