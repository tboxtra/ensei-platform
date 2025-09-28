# Mission Visibility Fix

## Problem
1. **Mission Visibility**: Newly created missions were not appearing on the "Discover & Earn" page despite showing a success message during creation.
2. **Date Display**: The creation date wasn't showing on the "My Missions" page for newly created missions.
3. **Submissions Dropdown**: Submissions weren't showing in the dropdown on the "My Missions" page for newly created missions.
4. **Submission Timestamps**: The date and time of submissions weren't showing in the submission section for new missions and some other missions.

## Root Cause

### Issue 1: Mission Visibility
1. **GET `/v1/missions` endpoint** only returns missions with `status: 'active'`
2. **Mission creation function** (`createMissionWithUidReferences`) was not setting a default `status` field
3. **Frontend mission creation** was not including a `status` field in the mission data

This meant newly created missions had no `status` field, so they were filtered out by the GET endpoint.

### Issue 2: Date Display
1. **Firestore Timestamps**: When missions are created with `created_at: new Date()`, Firestore stores them as Timestamp objects
2. **API Serialization**: The API was returning Firestore Timestamps as objects with `_seconds` and `_nanoseconds` properties
3. **Frontend Parsing**: The frontend was trying to parse these as strings with `new Date(mission.created_at)`, which failed

### Issue 3: Submissions Dropdown
1. **Dual Collection System**: The app uses both `taskCompletions` (new) and `mission_participations` (legacy) collections
2. **API Limitation**: The `taskCompletions` endpoint was only checking the new collection
3. **Missing Submissions**: New missions using the legacy collection weren't showing submissions in the dropdown

### Issue 4: Submission Timestamps
1. **Firestore Timestamps in Submissions**: Submission data contained Firestore Timestamp objects
2. **API Serialization**: The `toSubmission` function wasn't converting Firestore Timestamps to ISO strings
3. **Frontend Parsing**: The frontend couldn't parse Firestore Timestamp objects for display

## Solution

### Fix 1: Mission Visibility
Updated the `createMissionWithUidReferences` function in both TypeScript and JavaScript versions to:

1. **Set default status**: `status: missionData.status || 'active'`
2. **Ensure created_at timestamp**: `created_at: new Date()`

### Fix 2: Date Display
Updated the API endpoints (`GET /v1/missions` and `GET /v1/missions/:id`) to properly serialize Firestore timestamps:

1. **Convert Firestore Timestamps**: `data.created_at?.toDate?.()?.toISOString() || data.created_at`
2. **Return ISO strings**: Ensures frontend can parse dates correctly with `new Date(mission.created_at)`

### Fix 3: Submissions Dropdown
Updated the `GET /v1/missions/:missionId/taskCompletions` endpoint to check both collections:

1. **Check New Collection**: First tries `taskCompletions` collection with `missionId` field
2. **Check Legacy Collection**: Falls back to `mission_participations` collection with `mission_id` field
3. **Format Conversion**: Converts legacy format to new format for consistent frontend display
4. **URL Fallback**: Still supports URL-based lookup for backward compatibility

### Fix 4: Submission Timestamps
Updated the `toSubmission` function and legacy format conversion to properly serialize timestamps:

1. **Timestamp Conversion**: Added `toIsoString` helper function to convert Firestore Timestamps to ISO strings
2. **New Collection**: Updated `toSubmission` function to convert `created_at`, `completedAt`, etc. to ISO strings
3. **Legacy Collection**: Updated legacy format conversion to convert all timestamp fields to ISO strings
4. **Consistent Format**: Ensures all submission timestamps are returned as ISO strings for frontend parsing

### Files Modified
- `functions/src/utils/user-data-integrity.ts` - Mission creation fix
- `functions/lib/functions/src/utils/user-data-integrity.js` - Compiled version
- `functions/src/index.ts` - API timestamp serialization + submissions endpoint + submission timestamp fixes
- `functions/lib/functions/src/index.js` - Compiled version
- `functions/src/tests/user-data-integrity.test.ts` - Added tests
- `functions/lib/functions/src/tests/user-data-integrity.test.js` - Compiled tests

### Tests Added
- Test that default status is set to 'active' when not specified
- Test that custom status is preserved when specified
- Test that created_at timestamp is set

## Database Cleanup
Created a script to fix any existing missions missing the status field:

```bash
node scripts/fix-mission-status.js
```

This script will:
- Find all missions missing the `status` field
- Set their status to 'active'
- Update their `updated_at` timestamp
- Provide a summary of fixes applied

## Verification
After deploying the fix:
1. **Mission Visibility**: Create a new mission from the "Create Mission" page and check that it appears on the "Discover & Earn" page
2. **Date Display**: Check that the creation date shows correctly on the "My Missions" page
3. **Submissions Dropdown**: Check that submissions appear in the dropdown when someone participates in the mission
4. **Submission Timestamps**: Check that the date and time show correctly in the submission section
5. **Cleanup**: Run the cleanup script to fix any existing missions (optional)

## Impact
- ✅ **Mission Visibility**: New missions will now appear immediately after creation on the Discover & Earn page
- ✅ **Date Display**: Creation dates will show correctly on the My Missions page
- ✅ **Submissions Display**: Submissions will appear in the dropdown for both new and legacy missions
- ✅ **Submission Timestamps**: Date and time will display correctly for all submissions
- ✅ **Backward Compatibility**: No breaking changes to existing functionality
- ✅ **Data Integrity**: Existing missions without status will be fixed by the cleanup script
- ✅ **Future-Proof**: All new missions will have proper status and timestamp fields
- ✅ **Dual System Support**: Works with both new and legacy submission storage systems
- ✅ **Consistent Timestamps**: All timestamps are properly serialized as ISO strings
