# Simple Participant Filters - Modular Structure

This folder contains the refactored `SimpleParticipantFilters` component, split
into smaller, focused components for better maintainability and reusability.

## 📁 Folder Structure

```
simple-filters/
├── index.ts                           # Main exports
├── types.ts                          # TypeScript interfaces and types
├── utils.ts                          # Utility functions for filter generation
├── simple-participant-filters.tsx    # Main component (orchestrator)
├── search-filter.tsx                 # Search input with debouncing
├── quick-filters.tsx                 # Quick filter dropdowns
├── more-filters-popover.tsx          # Advanced filters popover
├── active-filter-badges.tsx          # Active filter badges with animations
└── sections/                         # Popover content sections
    ├── organization-location-section.tsx
    ├── enterprise-business-section.tsx
    ├── skills-education-section.tsx
    ├── demographics-section.tsx
    └── employment-section.tsx
```

## 🧩 Component Breakdown

### Core Components

#### 1. **SimpleParticipantFilters** (Main Component)

- **Purpose**: Orchestrates all filter components
- **Responsibilities**:
  - Manages filter groups generation
  - Coordinates between child components
  - Handles active filter count

#### 2. **SearchFilter**

- **Purpose**: Handles participant search functionality
- **Features**:
  - Debounced search (300ms)
  - Jotai state integration
  - Clean UI with search icon

#### 3. **QuickFilters**

- **Purpose**: Displays frequently used filters
- **Features**:
  - Dynamic filter generation based on data
  - Gender, Age, Employment Type, VSLA status
  - Responsive labels and dropdowns

#### 4. **MoreFiltersPopover**

- **Purpose**: Contains advanced filters in a popover
- **Features**:
  - Organized sections for different filter types
  - Active filter count badge
  - Smooth animations

#### 5. **ActiveFilterBadges**

- **Purpose**: Shows active filters with remove functionality
- **Features**:
  - Framer Motion animations
  - Individual filter removal
  - Clear all functionality
  - Staggered entrance animations

### Section Components

#### 1. **OrganizationLocationSection**

- Projects, Organizations, Districts, Sub Counties

#### 2. **EnterpriseBusinessSection**

- Enterprise ownership, sectors, business scale, income sources

#### 3. **SkillsEducationSection**

- General skills status and specific skill selection
- Async loading of unique skills from database

#### 4. **DemographicsSection**

- Education, marital status, population segments, PWD status

#### 5. **EmploymentSection**

- Employment type and sector filters

## 🔧 Utilities

### **utils.ts**

- `generateDynamicFilterOptions()`: Creates filter options from participant data
- `capitalizeFirst()`: String formatting utility
- Dynamic option generation with fallbacks

### **types.ts**

- Shared TypeScript interfaces
- Filter option and group type definitions
- Component prop interfaces

## ✨ Key Features

### 🎬 Animations

- **Entrance/Exit**: Smooth fade and slide animations for active filters
- **Individual Badges**: Scale and slide animations with staggered timing
- **Interactive Elements**: Hover and tap feedback on buttons

### 🔄 State Management

- **Jotai Integration**: All filter state managed through Jotai atoms
- **Debounced Search**: 300ms debouncing for optimal performance
- **Persistent State**: Filter values persist across component re-renders

### 📱 Responsive Design

- **Adaptive Grid**: Responsive grid layouts for different screen sizes
- **Touch Friendly**: Proper touch targets for mobile devices
- **Flexible Layout**: Components adapt to available space

### 🎯 Performance

- **Memoized Calculations**: Filter options generated only when data changes
- **Lazy Loading**: Skills loaded asynchronously
- **Efficient Rendering**: Minimal re-renders through proper state management

## 🚀 Usage

```tsx
import { SimpleParticipantFilters } from "./simple-filters";

<SimpleParticipantFilters
  projects={projects}
  organizations={organizations}
  districts={districts}
  subCounties={subCounties}
  participants={participants}
/>;
```

## 🔄 Migration

The original `simple-participant-filters.tsx` file now re-exports the modular
version for backward compatibility:

```tsx
// Backward compatibility maintained
export { SimpleParticipantFilters } from "./simple-filters";
export type { SimpleParticipantFiltersProps } from "./simple-filters/types";
```

## 🏗️ Architecture Benefits

1. **Single Responsibility**: Each component has a clear, focused purpose
2. **Reusability**: Components can be reused in other filter contexts
3. **Maintainability**: Easier to locate and modify specific functionality
4. **Testability**: Smaller components are easier to unit test
5. **Performance**: Better code splitting and lazy loading opportunities
6. **Developer Experience**: Clearer code organization and navigation
