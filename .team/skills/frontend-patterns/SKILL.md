---
name: frontend-patterns
description: Frontend development patterns for this repo — React 19, Next.js 15 App Router, TypeScript strict mode, Tailwind v4, TanStack Query v5, and atomic design.
origin: ECC (adapted for Genuin webapp)
---

# Frontend Development Patterns

Patterns for React 19, Next.js 15 App Router, TypeScript strict, Tailwind v4, and TanStack Query v5.

> **Project rules:** No `React.FC`. All `useRef` initialized (`useRef<T>(null)`). Server Components by default — `'use client'` only when interactivity is needed. Use TanStack Query v5 for server state (not custom fetch hooks). React Compiler handles most memoization automatically.

## When to Activate

- Building React components (composition, props, rendering)
- Managing state (useState, useReducer, Context)
- Implementing data fetching (TanStack Query, Server Components)
- Optimizing performance (memoization, code splitting)
- Working with forms (Server Actions, useFormStatus, Zod validation)
- Building accessible, responsive UI patterns

## Component Patterns

### Composition Over Inheritance

```typescript
interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'outlined';
}

export function Card({ children, variant = 'default' }: CardProps) {
  return <div className={`card card-${variant}`}>{children}</div>;
}

export function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="card-header">{children}</div>;
}

export function CardBody({ children }: { children: React.ReactNode }) {
  return <div className="card-body">{children}</div>;
}

// Usage
<Card>
  <CardHeader>Title</CardHeader>
  <CardBody>Content</CardBody>
</Card>
```

### Compound Components

```typescript
interface TabsContextValue {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

export function Tabs({ children, defaultTab }: {
  children: React.ReactNode;
  defaultTab: string;
}) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabsContext.Provider>
  );
}

export function Tab({ id, children }: { id: string; children: React.ReactNode }) {
  const context = useContext(TabsContext);
  if (!context) throw new Error('Tab must be used within Tabs');

  return (
    <button
      className={context.activeTab === id ? 'active' : ''}
      onClick={() => context.setActiveTab(id)}
    >
      {children}
    </button>
  );
}
```

## Custom Hooks Patterns

### State Management Hook

```typescript
export function useToggle(initialValue = false): [boolean, () => void] {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue((v) => !v);
  }, []);

  return [value, toggle];
}
```

### Debounce Hook

```typescript
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// Usage with TanStack Query
const [searchQuery, setSearchQuery] = useState("");
const debouncedQuery = useDebounce(searchQuery, 500);

const { data } = useQuery({
  queryKey: ["search", debouncedQuery],
  queryFn: () => searchApi(debouncedQuery),
  enabled: debouncedQuery.length > 0,
  staleTime: 30_000,
});
```

## State Management Patterns

### Context + Reducer Pattern

```typescript
interface State {
  items: Item[];
  selectedItem: Item | null;
  loading: boolean;
}

type Action =
  | { type: 'SET_ITEMS'; payload: Item[] }
  | { type: 'SELECT_ITEM'; payload: Item }
  | { type: 'SET_LOADING'; payload: boolean };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_ITEMS':
      return { ...state, items: action.payload };
    case 'SELECT_ITEM':
      return { ...state, selectedItem: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}

const FeatureContext = createContext<{
  state: State;
  dispatch: Dispatch<Action>;
} | undefined>(undefined);

export function FeatureProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    items: [],
    selectedItem: null,
    loading: false,
  });

  return (
    <FeatureContext.Provider value={{ state, dispatch }}>
      {children}
    </FeatureContext.Provider>
  );
}

export function useFeature() {
  const context = useContext(FeatureContext);
  if (!context) throw new Error('useFeature must be used within FeatureProvider');
  return context;
}
```

### TanStack Query v5 (Server State)

```typescript
// Query with staleTime
const { data, isPending, error } = useQuery({
  queryKey: ["items", filters],
  queryFn: () => fetchItems(filters),
  staleTime: 60_000, // 1 minute
});

// Mutation
const { mutate, isPending: isCreating } = useMutation({
  mutationFn: createItem,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["items"] });
  },
});
```

## Next.js 15 App Router Patterns

### Server Component with Data Fetching

```typescript
// app/items/page.tsx — Server Component (no 'use client')
import { fetchItems } from '@/services/items';

export default async function ItemsPage() {
  const items = await fetchItems();

  return (
    <main>
      <ItemList items={items} />
    </main>
  );
}
```

### Client Component (only when needed)

```typescript
'use client';

import { useState } from 'react';

interface FilterBarProps {
  onFilterChange: (filter: string) => void;
}

export function FilterBar({ onFilterChange }: FilterBarProps) {
  const [value, setValue] = useState('');

  return (
    <input
      value={value}
      onChange={e => {
        setValue(e.target.value);
        onFilterChange(e.target.value);
      }}
    />
  );
}
```

### Server Actions for Forms

```typescript
// app/items/actions.ts
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

const CreateItemSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1),
});

export async function createItemAction(formData: FormData) {
  const result = CreateItemSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
  });

  if (!result.success) {
    return { data: null, error: result.error.flatten() };
  }

  const item = await createItem(result.data);
  revalidatePath("/items");
  return { data: item, error: null };
}
```

## Performance Optimization

> **Note:** React Compiler (Babel plugin) handles most memoization automatically. Only add manual memoization where you measure a real problem.

### Code Splitting & Lazy Loading

```typescript
import { lazy, Suspense } from 'react';

const HeavyChart = lazy(() => import('./HeavyChart'));

export function Dashboard() {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      <HeavyChart data={data} />
    </Suspense>
  );
}
```

### Virtualization for Long Lists

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

export function VirtualList({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    overscan: 5,
  });

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map(virtualRow => (
          <div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <ItemCard item={items[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Form Handling Patterns

### React 19 Form with useFormStatus

```typescript
'use client';

import { useFormStatus } from 'react-dom';
import { createItemAction } from './actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Creating...' : 'Create'}
    </button>
  );
}

export function CreateItemForm() {
  return (
    <form action={createItemAction}>
      <label htmlFor="name">Name</label>
      <input id="name" name="name" required maxLength={200} />

      <label htmlFor="description">Description</label>
      <textarea id="description" name="description" required />

      <SubmitButton />
    </form>
  );
}
```

## Error Boundary Pattern

```typescript
import { Component, type ErrorInfo } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Use structured logger — not console.error in production
    logger.error('ErrorBoundary caught:', { error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="error-fallback">
          <h2>Something went wrong</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

## Tailwind v4 Patterns

```typescript
// Color with opacity
<div className="bg-primary/[0.5]" />  // NOT bg-primary/50

// Renamed utilities
<div className="shadow-xs" />    // was shadow-sm
<div className="shadow-sm" />    // was shadow
<div className="rounded-xs" />   // was rounded-sm
<div className="rounded-sm" />   // was rounded
<div className="outline-hidden" /> // was outline-none
<div className="ring-3" />       // was ring

// Custom utilities use @utility not @layer utilities
```

## Accessibility Patterns

### Keyboard Navigation

```typescript
export function Dropdown({ options, onSelect }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(i => Math.min(i + 1, options.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        onSelect(options[activeIndex]);
        setIsOpen(false);
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  return (
    <div role="combobox" aria-expanded={isOpen} aria-haspopup="listbox" onKeyDown={handleKeyDown}>
      {/* Dropdown implementation */}
    </div>
  );
}
```

### Focus Management

```typescript
export function Modal({ isOpen, onClose, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      modalRef.current?.focus();
    } else {
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);

  return isOpen ? (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      onKeyDown={e => e.key === 'Escape' && onClose()}
    >
      {children}
    </div>
  ) : null;
}
```

**Remember:** Server Components by default. `'use client'` only when you need interactivity. TanStack Query for server state. React Context for global UI state. Zod for validation at all trust boundaries.
