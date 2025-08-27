# Participants Data Table Components

This folder contains the modular components that make up the participant data
table functionality.

## Component Structure

### `participants-data-table.tsx`

The main component that orchestrates all the sub-components. This is the
component that should be imported and used in other parts of the application.

### `action-buttons.tsx`

Contains all the action buttons for the table:

- Add Participant button
- Export button
- Import button (ImportParticipants component)
- Fix Organizations button
- Bulk Delete button

### `pagination-controls.tsx`

Handles the pagination UI including:

- Rows per page selector
- Page navigation buttons (first, previous, next, last)
- Current page indicator
- Selected rows count

### `table-content.tsx`

Wraps the base DataTable component with participant-specific configurations:

- Column definitions
- Search functionality
- Loading states
- Action button integration

### `use-table-state.ts`

Custom hook that manages the table's internal state:

- Search value
- Selected rows
- Row selection state
- State update handlers

### `index.ts`

Barrel export file for easy importing of components.

## Usage

```tsx
import { ParticipantsDataTable } from "@/features/participants/components/data-table";

// Use the component with all required props
<ParticipantsDataTable
  data={participants}
  pagination={paginationData}
  // ... other props
/>;
```

## Benefits of This Structure

1. **Separation of Concerns**: Each component has a single responsibility
2. **Reusability**: Components can be reused independently if needed
3. **Maintainability**: Easier to locate and modify specific functionality
4. **Testing**: Each component can be tested in isolation
5. **Code Organization**: Cleaner, more organized codebase

### Additional Components Moved from table/ folder:

### `columns.tsx`

Defines the table column configuration:

- Column definitions for participant data
- Sort and filter configurations
- Cell renderers and formatters

### `action-cell.tsx`

Individual action cell component used within table rows:

- Edit, delete, view actions for each participant
- Dropdown menu with action options

### `bulk-delete-button.tsx`

Component for bulk operations:

- Delete multiple selected participants
- Confirmation dialogs
- Selection management

### `location-name-cell.tsx`

Specialized cell component for location data rendering

## Note

All table-related components have been consolidated into this data-table folder
for better organization.
