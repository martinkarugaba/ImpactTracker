# Advanced Assignment Components

This folder contains the modular components for the advanced organization
assignment feature, which allows users to assign multiple subcounties to an
organization at once.

## Architecture

The component follows the project's modular architecture patterns:

- **Jotai atoms** for state management (avoiding prop drilling)
- **Custom hooks** for business logic
- **Small, focused components** with single responsibilities
- **TypeScript interfaces** for type safety
- **Barrel exports** for clean imports

## Component Structure

### Core Files

- `advanced-assignment-dialog.tsx` - Main dialog component that orchestrates all
  sub-components
- `hooks.ts` - Custom hook containing all business logic and state management
- `atoms.ts` - Jotai atoms for state management
- `types.ts` - TypeScript interfaces and types
- `index.ts` - Barrel exports for easy importing

### Sub-Components

- `organization-selector.tsx` - Organization selection dropdown
- `selected-subcounties-display.tsx` - Display selected subcounties as badges
  with remove buttons
- `subcounty-selector.tsx` - Grid of checkboxes for subcounty selection with
  Select All functionality
- `assignment-preview.tsx` - Preview section showing what will be assigned
- `assignment-results.tsx` - Success/error display after assignment completion
- `dialog-actions.tsx` - Footer buttons (Close/Assign)

## State Management

Uses Jotai atoms for state management:

- `selectedSubCountiesAtom` - Array of selected subcounty names
- `selectedOrganizationAtom` - Selected organization ID
- Action atoms for state updates (toggle, remove, select all, clear)

## Key Features

- **Multiple subcounty selection** with checkboxes
- **Select All/Deselect All** functionality
- **Visual preview** of assignment before execution
- **Real-time feedback** during assignment process
- **Detailed results** showing breakdown by subcounty
- **Error handling** with user-friendly messages
- **Form validation** ensuring required selections

## Usage

```tsx
import { AdvancedAssignmentDialog } from "./advanced-assignment";

<AdvancedAssignmentDialog
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  subCounties={subCounties}
  organizations={organizations}
/>;
```

## Benefits of Modular Structure

1. **Single Responsibility** - Each component has one clear purpose
2. **Reusability** - Components can be reused in other contexts
3. **Testability** - Smaller components are easier to unit test
4. **Maintainability** - Changes are isolated to specific components
5. **Code Organization** - Related code is grouped together
6. **State Management** - Jotai atoms prevent prop drilling
7. **Type Safety** - Strong TypeScript interfaces

## File Organization

```
advanced-assignment/
├── index.ts                           # Barrel exports
├── advanced-assignment-dialog.tsx     # Main orchestrator component
├── hooks.ts                          # Business logic and state management
├── atoms.ts                          # Jotai atoms for state
├── types.ts                          # TypeScript interfaces
├── organization-selector.tsx         # Organization dropdown
├── selected-subcounties-display.tsx  # Selected items display
├── subcounty-selector.tsx           # Subcounty selection grid
├── assignment-preview.tsx           # Preview section
├── assignment-results.tsx           # Results display
├── dialog-actions.tsx               # Footer actions
└── README.md                         # This documentation
```

This modular approach follows the established patterns in the codebase, similar
to other feature modules like `fix-duplicates/` and `data-table/`.
