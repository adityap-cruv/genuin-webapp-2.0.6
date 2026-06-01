# Next.js 15 App Router

Server Components, Client Components, Server Actions, forms, and error boundaries.

> Default to Server Components. Add `'use client'` only when you need interactivity. Keep data
> fetching on the server where possible. Validate with Zod and return `{ data, error }` from actions.

## Server Component with Data Fetching

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

## Client Component (only when needed)

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

## Server Actions for Forms

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

## React 19 Form with useFormStatus

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

## Error Boundary

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
