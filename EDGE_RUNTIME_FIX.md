# Edge Runtime Compatibility Fix

## Issue

The application was throwing an error in the Edge Runtime middleware:

```
A Node.js API is used (process.versions at line: 62) which is not supported in the Edge Runtime.
```

## Root Cause

In `src/features/auth/config/auth.config.ts`, the code was attempting to detect
whether it was running in Node.js or Edge Runtime by checking
`process.versions.node`. However, accessing `process.versions` itself is a
Node.js-specific API that throws an error in the Edge Runtime.

### Original Code (Line 60-63)

```typescript
const isNodeRuntime =
  typeof process !== "undefined" && process.versions && process.versions.node;
```

## Solution

Wrapped the `process.versions` check in a try-catch block to safely handle the
Edge Runtime environment where this API doesn't exist.

### Fixed Code (Line 57-69)

```typescript
// Only try database operations if we're not in Edge Runtime
// Edge Runtime detection: check if process.versions exists (Node.js specific)
// We need to safely check for Node.js APIs that don't exist in Edge Runtime
let isNodeRuntime = false;
try {
  isNodeRuntime =
    typeof process !== "undefined" &&
    typeof process.versions !== "undefined" &&
    typeof process.versions.node !== "undefined";
} catch {
  // If accessing process.versions throws, we're in Edge Runtime
  isNodeRuntime = false;
}
```

## Why This Works

1. **Try-Catch Protection**: The try-catch block catches any errors thrown when
   accessing `process.versions` in the Edge Runtime
2. **Type Checking**: Added explicit `typeof` checks for each level of the
   property access chain
3. **Safe Fallback**: If any error occurs, we safely default to
   `isNodeRuntime = false`

## Impact

- ✅ Middleware now runs without errors in Edge Runtime
- ✅ Database operations are properly skipped in Edge Runtime context
- ✅ JWT-based session handling continues to work in both environments
- ✅ No changes needed to other parts of the auth system

## Related Files

- `/src/features/auth/config/auth.config.ts` - Fixed file
- `/src/middleware.ts` - Middleware that uses auth config
- `/src/features/auth/auth.ts` - NextAuth configuration

## Environment Support

- ✅ **Edge Runtime** (Middleware): Uses JWT tokens only, skips database checks
- ✅ **Node.js Runtime** (API Routes, Server Components): Full database
  integration

## Testing

After this fix:

- No more Edge Runtime errors in console
- Sessions work correctly in both environments
- Database lookups only happen in Node.js runtime context
- Users can successfully authenticate and access protected routes

## Notes

- The `process.env` usage elsewhere in the auth config is safe because
  environment variables are accessible in both Edge and Node.js runtimes
- Only `process.versions` and other Node.js-specific APIs need this special
  handling
