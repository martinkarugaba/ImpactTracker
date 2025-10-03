# VSLA Members - Participant Linking Implementation

## Overview

This implementation adds the ability to link VSLA members to participant records
in the database, enabling:

- Single source of truth for participant information
- Reuse of existing participant data when adding VSLA members
- Automatic participant creation when importing VSLA members from Excel
- Access to full participant profiles (demographics, skills, employment) for
  VSLA members

## Database Changes

### Migration Applied

- **File**: `migrations/add-participant-link-to-vsla-members.sql`
- **Changes**:
  - Added `participant_id` column to `vsla_members` table (UUID, nullable,
    foreign key to `participants.id`)
  - Created index on `participant_id` for query performance
  - Added unique constraint to prevent duplicate participant-VSLA memberships
  - Cascade delete: When a participant is deleted, their VSLA memberships are
    also removed

### Schema Updates

- **File**: `src/lib/db/schema.ts`
- Added `participant_id` field to `vslaMembers` table definition
- Added `participant` relation in `vslaMembersRelations`

## Excel Import Feature

### Import Configuration

**File**: `src/features/vslas/config/vsla-members-import-config.ts`

**Excel Template Columns**:

- Name (Required) - Participant full name
- Phone (Required) - Participant contact number
- Email (Optional)
- VSLA Name (Required) - Must match existing VSLA
- Role (Optional) - chairperson, secretary, treasurer, or member (default)
- Joined Date (Optional) - When they joined the VSLA
- Savings (Optional) - Initial savings amount
- Loans (Optional) - Initial loans amount
- Notes (Optional)

### Import Logic

**File**: `src/features/vslas/actions/import-vsla-members.ts`

**Process Flow**:

1. **Find VSLA**: Match by name (case-insensitive)
2. **Find/Create Participant**:
   - Parse name into first name and last name
   - Search for existing participant by: first name + last name + phone
   - If found: Link to existing participant
   - If not found: Create new participant with:
     - Basic info from Excel
     - Location copied from VSLA
     - Organization, Cluster, Project IDs from VSLA
     - Default values for required fields
3. **Check Duplicate**: Verify participant isn't already in this VSLA
4. **Create VSLA Member**: Insert record with `participant_id` link

**Smart Features**:

- Case-insensitive participant matching
- Automatic participant creation with sensible defaults
- Duplicate membership prevention
- Comprehensive logging for debugging
- Error handling continues processing other rows

### UI Integration

**File**:
`src/features/vslas/components/members/vsla-members-management/vsla-members-management.tsx`

- Replaced placeholder "Import" button with functional `ExcelImportDialog`
- Import button appears in VSLA member management page
- Uses existing multi-step import UI (upload → preview → import)
- Shows import progress and errors
- Refreshes member list after successful import

## Benefits

### 1. Data Integrity

- No duplicate participant data across tables
- Referential integrity enforced by foreign key
- Cascade deletes prevent orphaned records

### 2. Rich Member Profiles

- Access full participant demographics, skills, employment data
- Track same person across multiple VSLAs
- Link VSLA activities to participant outcomes

### 3. Efficient Imports

- Automatically reuses existing participant records
- Creates new participants only when needed
- Batch import from Excel with validation

### 4. Query Flexibility

```typescript
// Get VSLA members with full participant data
const members = await db.query.vslaMembers.findMany({
  where: eq(vslaMembers.vsla_id, vslaId),
  with: {
    participant: true, // Include full participant profile
  },
});

// Get all VSLAs for a participant
const participantVSLAs = await db.query.vslaMembers.findMany({
  where: eq(vslaMembers.participant_id, participantId),
  with: {
    vsla: true, // Include VSLA details
  },
});
```

## Usage Instructions

### To Import VSLA Members:

1. Navigate to VSLA details page
2. Go to Members tab
3. Click "Import" button
4. **Step 1 - Upload**:
   - Download template (optional)
   - Upload your Excel file
   - Select sheet if multiple sheets exist
5. **Step 2 - Preview**:
   - Review parsed data (shows 100 rows)
   - Check for validation errors (shown in red)
   - Click "Back" to change file, or "Import" to proceed
6. **Step 3 - Importing**:
   - System processes data
   - Links to existing participants or creates new ones
   - Shows success/error summary

### To Create VSLA Member Manually:

- Existing behavior unchanged
- Can still create members directly via "New Member" button
- `participant_id` field is optional for backwards compatibility

## Backwards Compatibility

- Existing VSLA members without `participant_id` continue to work
- Legacy fields (`first_name`, `last_name`, `phone`) retained
- New imports populate both `participant_id` and legacy fields
- No data migration required for existing records

## Future Enhancements

1. **Bulk Link Existing Members**: Tool to link existing `vsla_members` to
   `participants` based on name+phone matching
2. **Participant Selection UI**: When manually adding members, search and select
   from existing participants
3. **Member Profile View**: Show full participant profile within VSLA member
   management
4. **Cross-VSLA Reports**: Analytics on participants across multiple VSLAs
5. **Make Legacy Fields Optional**: Once all records have `participant_id`,
   could remove redundant fields

## Testing

### Manual Testing Checklist:

- [ ] Import Excel with new participants (should create participants)
- [ ] Import Excel with existing participants (should link, not duplicate)
- [ ] Import same member to same VSLA (should error)
- [ ] Import with missing required fields (should show validation errors)
- [ ] Import with invalid VSLA name (should show error)
- [ ] Verify participants created with correct organization/cluster/project
- [ ] Check participant link in database query
- [ ] Verify member list refreshes after import
- [ ] Test with multi-sheet Excel file

## Files Modified/Created

### Created:

- `migrations/add-participant-link-to-vsla-members.sql`
- `src/features/vslas/config/vsla-members-import-config.ts`
- `src/features/vslas/actions/import-vsla-members.ts`
- `docs/VSLA_MEMBERS_PARTICIPANT_LINKING.md` (this file)

### Modified:

- `src/lib/db/schema.ts` (added participant_id field and relation)
- `src/features/vslas/components/members/vsla-members-management/vsla-members-management.tsx`
  (added import button)

## Support

For issues or questions about this feature, check:

- Console logs (browser F12) show detailed import process
- Error messages in import dialog show specific validation failures
- Database logs show SQL operations if needed
