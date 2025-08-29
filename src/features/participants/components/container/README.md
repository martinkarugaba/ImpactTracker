# Participant Container Components

This folder contains the modular components that make up the participant
management container. The original large `participants-container.tsx` has been
split into smaller, focused components for better maintainability and separation
of concerns.

## Components

### 1. `participants-container.tsx`

The main orchestrator component that brings together all the other components.
This is the component that should be imported and used by other parts of the
application.

### 2. `use-participant-container-state.ts`

A custom hook that manages all state logic for the participant container,
including:

- Filter state management
- Pagination state
- Dialog open/close states
- Data fetching (participants, metrics, location names)
- Event handlers for common actions

### 3. `use-filter-options.ts`

A custom hook that generates filter options from participant data:

- Districts (with location name lookup)
- Sub-counties (with location name lookup)
- Enterprises (from participant data)

### 4. `metrics-tab.tsx`

The metrics view tab component that displays:

- Compact participant metrics
- Filter status indicator
- Participant filters
- Visual analytics charts

### 5. `participants-tab.tsx`

The participants table view tab component that displays:

- Participant filters
- Participants data table with pagination
- Handles all table-related actions

### 6. `participant-dialogs.tsx`

All dialog components used in the participant container:

- Create/Edit participant dialog
- Import participants dialog
- Delete confirmation dialog

## Usage

```tsx
import { ParticipantsContainer } from "@/features/participants/components/container";

// Use the main container component
<ParticipantsContainer
  clusterId={clusterId}
  projects={projects}
  clusters={clusters}
  organizations={organizations}
/>;
```

## Benefits of This Structure

1. **Separation of Concerns**: Each component has a single responsibility
2. **Reusability**: Individual components can be reused in other contexts
3. **Testability**: Smaller components are easier to unit test
4. **Maintainability**: Changes to specific functionality are isolated
5. **Code Organization**: Related code is grouped together
6. **Performance**: Components can be optimized independently

## File Structure

```
container/
├── index.ts                           # Barrel exports
├── participants-container.tsx         # Main orchestrator
├── use-participant-container-state.ts # State management hook
├── use-filter-options.ts             # Filter options hook
├── metrics-tab.tsx                   # Metrics view tab
├── participants-tab.tsx              # Participants table tab
├── participant-dialogs.tsx           # All dialogs
└── README.md                         # This documentation
```
