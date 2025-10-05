# Auth Session Database Error Fix

## Problem

The application was experiencing database connection errors during the NextAuth
session callback:

```
Database connection error in session callback: "Failed query: select "id", "name", "email", "password", "role", "created_at", "updated_at" from "users" "users" where "users"."id" = $1 limit $2
```

## Root Cause

The issue occurred because:

1. **Edge Runtime Compatibility**: NextAuth can run in Edge Runtime contexts
   (middleware, some API routes) where the `neon-http` database client doesn't
   work properly
2. **Unnecessary Database Query**: The session callback was attempting to query
   the database on every request to fetch fresh user data
3. **JWT Already Contains Data**: The user's role and other essential data is
   already stored in the JWT token during login

## Solution

Simplified the session callback to rely solely on JWT token data instead of
querying the database:

```typescript
async session({ session, token }) {
  if (!token || !session.user) {
    return session;
  }

  // Always use token data for session - this is more reliable
  session.user.id = token.id as string;
  session.user.role = token.role as string;
  session.accessToken = token.accessToken as string;

  // Note: We rely on JWT token data instead of querying the database
  // This avoids Edge Runtime compatibility issues

  return session;
}
```

## Benefits

1. **No More Database Errors**: Eliminates Edge Runtime compatibility issues
2. **Better Performance**: No database query on every request
3. **Simpler Code**: Removed complex runtime detection and error handling
4. **Still Secure**: JWT tokens are signed and verified by NextAuth

## Trade-offs

- User role changes require the user to log out and log back in to take effect
- If you need real-time user data updates, implement them at the application
  layer (e.g., specific API routes that check the database when needed)

## Alternative Approach (If Real-time Updates Needed)

If you need to sync user data from the database in real-time:

1. **Use a separate API route**: Create a dedicated endpoint that checks user
   status
2. **Client-side polling**: Periodically check for user updates from the client
3. **Server-side checks**: In specific protected routes, validate user data from
   the database
4. **Use Neon Serverless driver**: Switch from `neon-http` to
   `@neondatabase/serverless` with connection pooling for better Edge Runtime
   support

## Related Files

- `/src/features/auth/config/auth.config.ts` - Main fix location
- `/src/lib/db/index.ts` - Database client configuration
- `/src/lib/db/schema.ts` - Users table schema

## Date Fixed

October 5, 2025
