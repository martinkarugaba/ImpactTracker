# Activities Calendar Integration

## Overview

The activities calendar now displays real activities from the database instead
of sample data. Activities created in the activities table are automatically
displayed on the calendar tab.

## Changes Made

### 1. Updated `activities-calendar.tsx`

- **Removed**: Hardcoded sample data function `getSampleActivityEvents()`
- **Added**: Real-time data fetching using `useActivities` hook
- **Added**: CRUD operations integration:
  - `handleEventAdd`: Creates new activities in the database
  - `handleEventUpdate`: Updates existing activities
  - `handleEventDelete`: Deletes activities from the database

### 2. Key Features

- **Data Sync**: Calendar automatically reflects all activities from the
  database
- **Color Coding**: Activity types are color-coded:
  - Training: Blue
  - Meeting: Emerald
  - Workshop: Violet
  - Field Work: Orange
  - Reporting: Rose
- **Filtering**: Events can be filtered by color using the calendar sidebar
- **Toast Notifications**: User feedback for all CRUD operations

### 3. Data Mapping

The `calendar-mapping.ts` utility handles conversion between:

- **Activity → CalendarEvent**: `mapActivityToCalendarEvent()`
- **EventColor → ActivityType**: `getActivityTypeFromColor()`

### 4. Props Added

- `clusterId?: string` - Filters activities by cluster when provided

### 5. Loading States

- Displays loading message while fetching activities
- Graceful handling of empty states

## Usage

### Creating Activities from Calendar

1. Click on the calendar to add a new event
2. Fill in event details (title, description, time, location)
3. Event is automatically saved to the database
4. Color determines the activity type

### Editing Activities

1. Click on an existing event
2. Modify details in the edit dialog
3. Changes are synced to the database

### Deleting Activities

1. Click on an event
2. Use the delete option
3. Activity is removed from database

## Important Notes

### First Activity Creation

- Creating activities from the calendar requires an existing activity to inherit
  cluster and organization information
- If no activities exist, users should create the first activity from the
  Activities tab
- This ensures proper cluster/organization assignment

### Data Flow

```
Database (activities table)
    ↓ (useActivities hook)
Calendar Component
    ↓ (mapActivityToCalendarEvent)
CalendarEvent Display
    ↓ (User interaction)
CRUD Operations
    ↓ (mutations)
Database (activities table)
```

## Related Files

- `/src/features/activities/components/calendar/activities-calendar.tsx` - Main
  calendar component
- `/src/features/activities/utils/calendar-mapping.ts` - Data transformation
  utilities
- `/src/features/activities/hooks/use-activities.ts` - Data fetching hooks
- `/src/features/activities/actions/index.ts` - Server actions for CRUD
  operations

## Future Enhancements

1. **Smart Defaults**: Auto-detect cluster/organization from user session
2. **Bulk Operations**: Support for bulk event creation/editing
3. **Recurring Events**: Support for recurring activity patterns
4. **Drag & Drop**: Reschedule activities by dragging events
5. **Multi-Day Activities**: Better visualization for multi-day events
