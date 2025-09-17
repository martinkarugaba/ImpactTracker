# Jotai Migration Guide for Participants Feature

## Benefits of Migrating to Jotai

### Current Problems

- **State Fragmentation**: 8+ useState hooks across multiple files
- **Prop Drilling**: Complex state passing through component hierarchy
- **No Persistence**: Filters reset on page reload
- **Hard to Debug**: State scattered across files
- **Complex Sync**: Manual state synchronization between components
- **Testing Difficulty**: Mocking multiple useState hooks

### Jotai Advantages

- **Atomic State**: Each piece of state is an independent atom
- **Global Access**: Any component can access any atom
- **Built-in Persistence**: `atomWithStorage` for filters/preferences
- **Derived State**: Computed atoms for complex logic
- **Better Performance**: Only components using changed atoms re-render
- **DevTools**: Excellent debugging with Jotai DevTools
- **Easy Testing**: Mock individual atoms

## Migration Steps

### 1. Install Jotai

```bash
npm install jotai
```

### 2. Create Atoms Structure

```
src/features/participants/
├── atoms/
│   └── participants-atoms.ts      # Core state atoms
├── state/
│   ├── use-participant-state.ts  # Main state hook
│   ├── use-participant-table.ts  # Table state hook
│   └── use-participant-container-jotai.ts # Container hook
├── hooks/
│   └── [other non-jotai hooks]   # Data fetching hooks
```

### 3. Atom Categories

#### **Core State Atoms**

```typescript
// Persistent user preferences
export const participantFiltersAtom = atomWithStorage<ParticipantFilters>(
  "participant-filters",
  defaultFilters
);
export const columnVisibilityAtom = atomWithStorage(
  "participants-columns",
  defaultColumns
);
export const activeTabAtom = atomWithStorage(
  "participants-active-tab",
  "participants"
);

// Session state
export const participantPaginationAtom = atom({ page: 1, pageSize: 20 });
export const participantSearchAtom = atom("");
```

#### **Dialog State Atoms**

```typescript
export const createDialogAtom = atom(false);
export const importDialogAtom = atom(false);
export const editingParticipantAtom = atom<Participant | null>(null);
export const deletingParticipantAtom = atom<Participant | null>(null);
```

#### **Derived State Atoms**

```typescript
export const hasActiveFiltersAtom = atom(get => {
  const filters = get(participantFiltersAtom);
  return Object.values(filters).some(value => value !== "" && value !== "all");
});

export const selectedParticipantsAtom = atom(get => {
  const selection = get(tableRowSelectionAtom);
  return Object.keys(selection).filter(key => selection[key]);
});
```

#### **Action Atoms (Write-Only)**

```typescript
export const clearFiltersAtom = atom(null, (get, set) => {
  set(participantFiltersAtom, defaultFilters);
  set(participantPaginationAtom, prev => ({ ...prev, page: 1 }));
});

export const updateFilterAtom = atom(
  null,
  (
    get,
    set,
    { key, value }: { key: keyof ParticipantFilters; value: string }
  ) => {
    set(participantFiltersAtom, prev => ({ ...prev, [key]: value }));
    set(participantPaginationAtom, prev => ({ ...prev, page: 1 }));
  }
);
```

### 4. Component Refactoring

#### **Before (useState)**

```typescript
function ParticipantsTab({ filters, onFiltersChange, ...props }) {
  const [columnVisibility, setColumnVisibility] = useState({...});
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleFilterChange = (newFilters) => {
    onFiltersChange(newFilters);
    // Reset pagination manually
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  return (
    <div>
      <ParticipantFilters
        filters={filters}
        onFiltersChange={handleFilterChange}
      />
      <ParticipantsTable
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}
      />
    </div>
  );
}
```

#### **After (Jotai)**

```typescript
function ParticipantsTab() {
  // No props needed! Direct atom access
  const { handleFilterUpdate, clearFilters } = useParticipantState();
  const { columnVisibility, toggleColumnVisibility } = useParticipantTable();

  return (
    <div>
      <JotaiParticipantFilters />
      <JotaiParticipantsTable />
    </div>
  );
}
```

### 5. Hook Simplification

#### **Before: Complex Container Hook**

```typescript
function useParticipantContainerState({ clusterId }) {
  const [filters, setFilters] = useState(defaultFilters);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20 });
  const [searchValue, setSearchValue] = useState("");
  // ... 8+ more useState hooks

  const handlePaginationChange = (page, pageSize) => {
    setPagination({ page, pageSize });
  };

  // Complex useEffect for filter synchronization
  useEffect(
    () => {
      setPagination(prev => ({ ...prev, page: 1 }));
    },
    [
      /* 20+ dependencies */
    ]
  );

  return {
    filters,
    setFilters,
    pagination,
    setPagination,
    // ... 30+ return values
  };
}
```

#### **After: Clean Atomic Hooks**

```typescript
function useParticipantState() {
  const [filters, setFilters] = useAtom(participantFiltersAtom);
  const updateFilter = useSetAtom(updateFilterAtom);
  const clearFilters = useSetAtom(clearFiltersAtom);

  // Automatic pagination reset via action atom
  const handleFilterUpdate = (key: string, value: string) => {
    updateFilter({ key, value }); // Automatically resets pagination
  };

  return { filters, handleFilterUpdate, clearFilters };
}
```

### 6. Performance Benefits

#### **Before: Unnecessary Re-renders**

```typescript
// Changing filters re-renders entire container + all children
function ParticipantsContainer() {
  const [filters, setFilters] = useState(bigFilterObject);

  return (
    <div>
      <Filters filters={filters} onChange={setFilters} />
      <Table filters={filters} />
      <Pagination filters={filters} />
      <Analytics filters={filters} />
    </div>
  );
}
```

#### **After: Surgical Re-renders**

```typescript
// Only components using changed atoms re-render
function ParticipantsContainer() {
  return (
    <div>
      <JotaiFilters />     {/* Only re-renders if filter atoms change */}
      <JotaiTable />       {/* Only re-renders if table atoms change */}
      <JotaiPagination />  {/* Only re-renders if pagination atoms change */}
      <JotaiAnalytics />   {/* Only re-renders if needed atoms change */}
    </div>
  );
}
```

### 7. Testing Improvements

#### **Before: Complex Mocking**

```typescript
test('should update filters', () => {
  const mockSetFilters = jest.fn();
  const mockSetPagination = jest.fn();

  render(
    <ParticipantsTab
      filters={mockFilters}
      onFiltersChange={mockSetFilters}
      pagination={mockPagination}
      onPaginationChange={mockSetPagination}
    />
  );

  // Complex assertions on multiple mock functions
});
```

#### **After: Simple Atom Testing**

```typescript
test('should update filters', () => {
  const store = createStore();

  render(
    <Provider store={store}>
      <JotaiParticipantsTab />
    </Provider>
  );

  // Test atom values directly
  expect(store.get(participantFiltersAtom)).toEqual(expectedFilters);
});
```

### 8. DevTools Integration

```typescript
// Add to your app root
import { DevTools } from 'jotai-devtools';

function App() {
  return (
    <Provider>
      <YourApp />
      {process.env.NODE_ENV === 'development' && <DevTools />}
    </Provider>
  );
}
```

## Implementation Priority

1. **Phase 1**: Create atoms and basic hooks
2. **Phase 2**: Migrate filter components
3. **Phase 3**: Migrate table components
4. **Phase 4**: Migrate dialog components
5. **Phase 5**: Remove old useState hooks
6. **Phase 6**: Add DevTools and testing

## Migration Benefits Summary

- ✅ **Reduced Complexity**: 5 focused hooks vs 1 massive hook
- ✅ **Better Performance**: Atomic updates vs full re-renders
- ✅ **Persistence**: User preferences automatically saved
- ✅ **Debugging**: Clear atom-level state inspection
- ✅ **Testing**: Isolated atom testing vs complex mocking
- ✅ **Maintainability**: Single source of truth per state piece
- ✅ **Type Safety**: Full TypeScript support with atoms
