# User Cluster Assignment Fix

## Issue

Participants page was showing "No cluster assigned" message even when the user
had already been assigned to a cluster through the `clusterUsers` table.

## Root Cause

The `getUserClusterId()` function in `/src/features/auth/actions.ts` had flawed
logic:

1. **For cluster managers**: It only checked for users with
   `role = "cluster_manager"` in the `clusterUsers` table
2. **For other users**: It completely skipped checking the `clusterUsers` table
   and only looked for cluster assignment through organization membership

This meant that users who were:

- Assigned to a cluster with a role other than "cluster_manager" (e.g., "user",
  "organization_admin", etc.)
- Assigned directly to a cluster but not through an organization

...would see the "No cluster assigned" error even though they had valid cluster
assignments.

## Solution

### Before (Flawed Logic)

```typescript
// Cluster managers can access clusters they manage
if (user.role === "cluster_manager") {
  const userCluster = await db.query.clusterUsers.findFirst({
    where: and(
      eq(clusterUsers.user_id, session.user.id),
      eq(clusterUsers.role, "cluster_manager")
    ),
    columns: { cluster_id: true },
  });
  return userCluster?.cluster_id || null;
}

// For regular users, get cluster through organization membership
const organizationId = await getOrganizationId();
// ... rest of code
```

### After (Fixed Logic)

```typescript
// Check if user is directly assigned to any cluster via clusterUsers table
// This covers cluster_managers and other users directly assigned to clusters
const userCluster = await db.query.clusterUsers.findFirst({
  where: eq(clusterUsers.user_id, session.user.id),
  columns: { cluster_id: true },
});

if (userCluster?.cluster_id) {
  return userCluster.cluster_id;
}

// For users not directly assigned to a cluster, get cluster through organization membership
const organizationId = await getOrganizationId();
// ... rest of code
```

## What Changed

1. **Removed role-specific check**: The function now checks for ANY cluster
   assignment in the `clusterUsers` table, regardless of the user's role
2. **Unified logic**: All users (except super_admins) are now checked for direct
   cluster assignment first
3. **Fallback to organization**: If no direct cluster assignment exists, the
   function falls back to checking cluster assignment through organization
   membership

## Impact

- ✅ Users assigned to clusters via `clusterUsers` table with any role can now
  access the participants page
- ✅ Cluster managers continue to work as before
- ✅ Users assigned through organization membership continue to work as before
- ✅ Super admins continue to have access to any cluster
- ✅ The fix maintains backward compatibility while fixing the bug

## User Assignment Hierarchy

The function now properly checks cluster assignment in this order:

1. **Super Admins**: Get the first available cluster (can access any cluster)
2. **Direct Cluster Assignment**: Check `clusterUsers` table for any direct
   assignment
3. **Organization Membership**: If no direct assignment, check if user's
   organization belongs to a cluster

## Files Modified

- `/src/features/auth/actions.ts` - Fixed `getUserClusterId()` function

## Testing Recommendations

Test the following scenarios to ensure the fix works correctly:

1. User assigned as cluster_manager → Should see participants
2. User assigned to cluster with role "user" → Should see participants
3. User assigned to cluster with role "organization_admin" → Should see
   participants
4. User with organization membership (organization has cluster_id) → Should see
   participants
5. User with no cluster assignment → Should see "No cluster assigned" message
6. Super admin → Should see participants from first available cluster

## Related Tables

- `clusterUsers` - Direct user-to-cluster assignments with roles
- `organizations` - Organizations have a `cluster_id` field
- `organizationMembers` - Users can be members of organizations
