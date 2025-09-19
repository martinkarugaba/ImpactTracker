# KPI Edge - AI Coding Instructions

## Project Overview

KPI Edge is a Next.js 15 full-stack impact tracking platform for development
organizations in Uganda/East Africa. Built with TypeScript, Drizzle ORM,
PostgreSQL, and shadcn/ui.

## Architecture Patterns

### Feature-Based Structure

- Each feature lives in `src/features/[feature]/` with subfolders:
  `components/`, `actions/`, `atoms/`, `types/`
- Components are modularized: large files split into focused subcomponents in
  dedicated folders
- Example: `participants/components/data-table/` contains 8+ specialized
  components instead of one large file

### State Management with Jotai

- Use Jotai atoms for complex state (filters, dialogs, selections)
- Storage atoms persist to localStorage: `atomWithStorage("key", defaultValue)`
- Action atoms for derived state updates:
  `atom(null, (get, set) => { /* setter logic */ })`
- See `src/features/participants/atoms/participants-atoms.ts` for patterns

### Server Actions Pattern

- All server logic in `[feature]/actions/` files with `"use server"` directive
- Return consistent response objects:
  `{ success: boolean, data?: T, error?: string, message?: string }`
- Use Drizzle ORM with typed schema from `src/lib/db/schema.ts`
- Example pattern in `src/features/participants/actions/get-participant.ts`

### Database Operations

- Drizzle ORM with PostgreSQL, schema in `src/lib/db/schema.ts`
- Use `inArray()` for batch operations instead of SQL `ANY` operator
- Location data seeded via Uganda-specific libraries (`uganda-data-lib`,
  `ug-locale`)
- Scripts: `pnpm db:push`, `pnpm db:generate`, `./scripts/run-seed.sh`

## Component Conventions

### Modular Component Architecture

- Split large components into focused subcomponents in dedicated folders
- Use index.ts barrel exports for clean imports
- Custom hooks extract reusable logic (e.g., `use-table-state.ts`,
  `use-participant-container-state.ts`)

### UI Components

- shadcn/ui components in `src/components/ui/`
- Custom business components in feature folders
- Use `cn()` utility for conditional classes
- Responsive design with Tailwind CSS classes

### Form Handling

- React Hook Form + Zod validation
- Custom form components follow shadcn/ui patterns
- Server actions for form submission

## Development Workflow

### Scripts & Commands

```bash
pnpm dev                    # Development with Turbopack
pnpm fix                   # Lint + format (run before commits)
pnpm db:push               # Apply schema changes
pnpm db:studio            # Database GUI
./scripts/run-seed.sh     # Seed Uganda location data
```

### Code Quality

- ESLint + Prettier with strict rules
- Husky + lint-staged for pre-commit hooks
- TypeScript strict mode enabled
- Use `pnpm fix` before committing

## Key Integration Points

### Authentication

- NextAuth.js + Clerk for dual auth support
- Role-based access: `super_admin`, `cluster_manager`, etc.
- Session checks in server actions

### Data Visualization

- Recharts for analytics charts
- Custom metric cards for dashboard displays
- Location-based data aggregation

### File Operations

- Excel/CSV import via `xlsx` library in dedicated import components
- Export functionality with proper formatting

## Location-Specific Patterns

- Uganda administrative divisions: Country → District → Subcounty → Parish →
  Village
- Use Uganda-specific data libraries for location validation
- Location lookup functions in `actions/location-lookup.ts`

## Common Anti-Patterns to Avoid

- Don't use raw SQL `ANY` operator - use Drizzle's `inArray()`
- Avoid large monolithic components - split into focused subcomponents
- Don't bypass server actions for database operations
- Avoid prop drilling - use Jotai atoms for complex state

## Testing Patterns

- Database connection testing via `scripts/test-db-connection.ts`
- Location data validation scripts in `scripts/test-*.sh`
- Use TypeScript strict mode for compile-time validation
