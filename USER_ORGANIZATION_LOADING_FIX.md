# User Organization/Cluster Loading Fix

## Problem

The application was failing to load with the error:

```
Failed query: select "id", "name", "email", "password", "role", "created_at", "updated_at"
from "users" "users" where "users"."id" = $1 limit $2
params: 8wOBlN6tCktLA2S9M1cQl,1
```

## Root Cause

The JWT session contained a user ID (`8wOBlN6tCktLA2S9M1cQl`) that no longer
exists in the database. This caused database queries to fail when trying to:

1. Verify the user exists
2. Load the user's organization membership
3. Load the user's cluster assignment

This can happen when:

- A user is deleted from the database but their session cookie remains valid
- A session was created with an invalid/test user ID
- There's a database migration that removed user records without invalidating
  sessions

## Solution

### 1. Enhanced Error Handling in `getOrganizationId()` (`src/features/auth/actions.ts`)

- Added try-catch blocks around database queries
- Better error logging with detailed information
- Returns `null` instead of crashing when user doesn't exist
- Added user-friendly console warnings

### 2. User Verification in Dashboard Layout (`src/app/dashboard/layout.tsx`)

- Added database check to verify user exists before loading dashboard
- Redirects to login page with error message if user is missing
- Handles database errors gracefully
- Prevents app crash when session is stale

### 3. Error Messages on Login Page (`src/app/auth/login/page.tsx`)

- Added support for error query parameters
- Shows user-friendly error messages for:
  - `session_expired`: When user's session is stale
  - `database_error`: When database verification fails
  - Generic errors for other authentication issues
- Uses Alert component to display errors prominently

## How It Works

1. **User accesses dashboard** → Dashboard layout checks session
2. **Session exists** → Verify user exists in database
3. **User not found** → Redirect to `/auth/login?error=session_expired`
4. **Login page** → Shows error message: "Your session has expired. Please log
   in again."
5. **User logs in** → New valid session is created

## User Action Required

If you're seeing this error:

1. **Clear your browser cookies** for this application
2. **Log out** if the logout button is accessible
3. **Log back in** with your credentials
4. A new valid session will be created

## For Developers

To prevent this issue:

- When deleting users from the database, also invalidate their sessions
- Consider adding a background job to clean up stale sessions
- Monitor logs for "User not found in database" warnings
- Add session expiry/refresh logic if needed

## Testing

To test the fix:

1. Start the application: `pnpm dev`
2. Navigate to the dashboard while logged in
3. If you see the error, you'll be redirected to login with an error message
4. Log in again to create a new valid session
5. Dashboard should now load successfully

## Related Files Modified

- `src/features/auth/actions.ts` - Enhanced error handling
- `src/app/dashboard/layout.tsx` - Added user verification
- `src/app/auth/login/page.tsx` - Added error message display
