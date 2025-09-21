# My Missions Submissions Page Fix

## Problem
The My Missions submissions page was not showing submissions for missions the user created. The issue was that:

1. **Data Mismatch**: Discover & Earn was writing to `mission_participations` collection, but My Missions was trying to read from a different source
2. **Wrong Query Logic**: The submissions page was looking for missions the user participated in, instead of missions the user created
3. **Missing Index**: Firestore was missing the proper index for efficient queries

## Solution

### 1. Fixed Collection Consistency ✅
- **Confirmed**: All code now uses `mission_participations` collection consistently
- **Discover & Earn writes**: `mission_participations` ✅
- **My Missions reads**: `mission_participations` ✅
- **No lingering `taskCompletions` collection references** (except in migration scripts)

### 2. Updated Submissions Page Logic ✅
- **Reverted** to using `useMyMissions()` hook (gets missions user created)
- **Removed** the `useMyParticipatedMissions` approach
- **Fixed** the page to show all submissions for missions the user created

### 3. Enhanced Mission Completions Query ✅
- **Updated** `getMissionTaskCompletions()` to include `orderBy('created_at', 'desc')`
- **Added** proper Firestore index for `mission_participations`:
  ```json
  {
    "collectionGroup": "mission_participations",
    "queryScope": "COLLECTION",
    "fields": [
      {
        "fieldPath": "mission_id",
        "order": "ASCENDING"
      },
      {
        "fieldPath": "created_at",
        "order": "DESCENDING"
      }
    ]
  }
  ```

### 4. Fixed TypeScript Errors ✅
- **Fixed** Set spread operator issue in `useMyParticipatedMissions.ts`
- **Build successful** with no TypeScript errors

## How It Works Now

### Data Flow
1. **User completes task on Discover & Earn** → Writes to `mission_participations` collection
2. **User goes to My Missions submissions** → Shows missions they created
3. **Selects a mission** → `useMissionTaskCompletions(missionId)` queries all submissions for that mission
4. **Shows all submissions** → From all users who participated in that mission

### Query Structure
```typescript
// My Missions submissions page
const { data: missions } = useMyMissions(); // Gets missions user created
const { data: submissions } = useMissionTaskCompletions(selectedMission?.id); // Gets all submissions for that mission
```

### Firestore Query
```typescript
// In getMissionTaskCompletions()
const q = query(
    collection(db, 'mission_participations'),
    where('mission_id', '==', missionId),
    orderBy('created_at', 'desc')
);
```

## Files Modified
- `apps/web/src/app/missions/my/submissions/page.tsx` - Fixed to use correct hook
- `apps/web/src/lib/task-completion.ts` - Added orderBy to query
- `firestore.indexes.json` - Added proper index
- `apps/web/src/hooks/useMyParticipatedMissions.ts` - Fixed TypeScript error

## Verification
- ✅ Build successful
- ✅ No TypeScript errors
- ✅ All collection references consistent
- ✅ Proper Firestore index added
- ✅ Changes committed and pushed

## Next Steps
1. **Deploy Firestore indexes** to production
2. **Test the flow**: Create mission → Complete tasks → Check My Missions submissions
3. **Verify**: All submissions show up for missions you created