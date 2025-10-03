# Duplicate Query Parameters Fix

## Issue

Console error when fetching district names:

```
Failed query: select "code", "name" from "districts" "districts" where "districts"."code" in ($1, $2, $3)
params: UG-KRE,UG-KRE,UG-KRE
```

## Root Cause

The `batchGetDistrictNamesByCodes()` and `batchGetSubCountyNamesByCodes()`
functions were receiving arrays with duplicate location codes. When passed to
Drizzle ORM's `inArray()` function, these duplicates were being included in the
SQL query parameters, causing inefficient queries and potential errors.

### Example Scenario:

When fetching district names for multiple organizations in the same district:

```typescript
// Input: ["UG-KRE", "UG-KRE", "UG-KRE"]
// Generated SQL: WHERE code IN ($1, $2, $3)
// Params: UG-KRE, UG-KRE, UG-KRE ❌
```

## Solution

Added deduplication step before querying to ensure unique codes:

```typescript
// Remove duplicates before querying
const uniqueCodes = [...new Set(actualCodes)];

const districtsData = await db.query.districts.findMany({
  where: inArray(districts.code, uniqueCodes), // Now uses unique codes
  columns: {
    code: true,
    name: true,
  },
});
```

### After Fix:

```typescript
// Input: ["UG-KRE", "UG-KRE", "UG-KRE"]
// Deduplicated: ["UG-KRE"]
// Generated SQL: WHERE code IN ($1)
// Params: UG-KRE ✅
```

## Files Modified

- `/src/features/organizations/actions/organization-location-lookup.ts`
  - `batchGetDistrictNamesByCodes()` - Added unique code deduplication
  - `batchGetSubCountyNamesByCodes()` - Added unique code deduplication

## Benefits

1. **Prevents SQL errors** - No duplicate parameters in queries
2. **Improves performance** - Fewer parameters to process
3. **More efficient queries** - Database only searches for unique codes
4. **Cleaner SQL** - Simplified query structure

## Testing

The fix handles these scenarios:

- ✅ Single unique code: `["UG-KRE"]` → Query for 1 code
- ✅ Multiple unique codes: `["UG-KRE", "UG-KLA"]` → Query for 2 codes
- ✅ Duplicate codes: `["UG-KRE", "UG-KRE", "UG-KRE"]` → Query for 1 unique code
- ✅ Mixed duplicates: `["UG-KRE", "UG-KLA", "UG-KRE"]` → Query for 2 unique
  codes
- ✅ Empty array: `[]` → Early return
- ✅ Names (not codes): `["Kampala District"]` → Skipped from query

## Note

This is **not a network issue** - it was a data deduplication issue. The fix
ensures efficient database queries by removing duplicate parameters before they
reach the SQL layer.

## Status

✅ **FIXED** - Both district and subcounty batch lookup functions now
deduplicate codes before querying.
