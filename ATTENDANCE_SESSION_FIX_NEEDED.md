# Session-Specific Attendance Issue

## Problem

Currently, when you add participants to a specific session, they appear in ALL
sessions. This is because the `SessionWithAttendanceCard` component is using the
wrong data source.

### Root Cause

**File:** `src/features/activities/components/details/attendance-tab.tsx`  
**Line:** ~369

```tsx
// INCORRECT: Filters by activity_id (all participants have the same activity_id)
const sessionAttendance = participants.filter(
  p => p.activity_id === session.activity_id
);
```

The `participants` prop contains **activity-level participants** from the
`activity_participants` table, not **session-specific attendance** from the
`daily_attendance` table.

### Database Schema

1. **`activity_participants`** table:
   - Links participants to activities (activity-level)
   - One entry per participant per activity
   - Used for: "Who is registered for this activity?"

2. **`daily_attendance`** table:
   - Links participants to specific sessions (session-level)
   - One entry per participant per session
   - Used for: "Who attended/was invited to THIS specific session?"
   - Has `session_id` foreign key

### The Fix Required

The `AttendanceTab` component needs to:

1. **Fetch session-specific attendance** using the `getSessionAttendance` action
2. **Pass session-specific data** to each `SessionWithAttendanceCard`
3. **Display only participants** who have `daily_attendance` records for that
   session

### Implementation Steps

#### Step 1: Add session attendance query hook

```tsx
// In attendance-tab.tsx
const {
  data: sessionAttendanceResponse,
  isLoading: isLoadingSessionAttendance,
  refetch: refetchSessionAttendance,
} = useQuery({
  queryKey: ["session-attendance", session.id],
  queryFn: () => getSessionAttendance(session.id),
  enabled: !!session.id,
});
```

#### Step 2: Update SessionWithAttendanceCard props

```tsx
interface SessionWithAttendanceCardProps {
  session: ActivitySession;
  sessionAttendance: DailyAttendance[]; // Change from ActivityParticipant[]
  // ... rest of props
}
```

#### Step 3: Pass correct data

```tsx
<SessionWithAttendanceCard
  session={session}
  sessionAttendance={sessionAttendanceData} // Session-specific attendance
  // ... rest of props
/>
```

#### Step 4: Update component logic

```tsx
function SessionWithAttendanceCard({ session, sessionAttendance, ... }) {
  // No filter needed - sessionAttendance already contains only this session's data

  const attendedCount = sessionAttendance.filter(
    p => p.attendance_status === "attended"
  ).length;

  // ... rest of logic
}
```

### Action Verification

The actions are already correct:

✅ `addActivityParticipantsToSession()` - Adds participants to specific session
via `markAttendance()`  
✅ `getSessionAttendance(sessionId)` - Queries `daily_attendance` filtered by
`session_id`  
✅ `markAttendance()` - Creates/updates `daily_attendance` records

### Current Behavior

- ❌ Adding participant to Session 1 shows them in all sessions
- ❌ Session attendance count is inaccurate (shows all activity participants)
- ❌ Cannot have different participants in different sessions

### Expected Behavior After Fix

- ✅ Adding participant to Session 1 only shows them in Session 1
- ✅ Each session displays only its own attendance records
- ✅ Sessions can have different sets of participants
- ✅ Attendance counts are per-session accurate

### Files to Modify

1. `src/features/activities/components/details/attendance-tab.tsx` (main
   changes)
2. `src/features/activities/hooks/use-activities.ts` (add session attendance
   hook if needed)
3. Possibly create `src/features/activities/hooks/use-session-attendance.ts`

### Testing After Fix

1. Create an activity with 3 sessions
2. Add Participant A to Session 1 only
3. Add Participant B to Session 2 only
4. Verify:
   - Session 1 shows only Participant A
   - Session 2 shows only Participant B
   - Session 3 shows no participants
5. Add Participant C to both Session 1 and 2
6. Verify Participant C appears in both sessions

---

**Priority:** High  
**Impact:** Core functionality broken  
**Effort:** Medium (refactor data flow in AttendanceTab component)
