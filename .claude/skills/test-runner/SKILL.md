---
name: test-runner
description: Running, fixing, and writing unit and integration tests with Vitest and Jest
---

# Skill: Test Runner

Use this skill when asked to run, fix, or write tests in this project.

---

## Test setup

This monorepo has two test runners depending on where you are:

| Location          | Runner(s)       | Command              |
| ----------------- | --------------- | -------------------- |
| `packages/ui`     | Jest + Vitest   | `pnpm test`          |
| All other packages | Vitest only    | `pnpm test`          |
| `apps/webapp`     | No tests yet    | —                    |

**`packages/ui` runs both Jest and Vitest** (`jest && vitest run`) because Jest is needed
for component snapshot tests alongside Vitest for unit tests. Do not remove Jest from
`packages/ui`.

### Useful commands

```bash
# Run all tests (from the package directory)
pnpm test

# Single pass, no watch mode
pnpm test --run

# With coverage
pnpm test:coverage

# Single file (Vitest)
pnpm vitest run src/feature/feature.test.ts
```

Run from the repo root to run all packages at once:
```bash
pnpm test          # runs test in all packages via Turborepo
pnpm turbo clean   # clear cache if tests behave unexpectedly
```

---

## What this skill covers

1. **Running tests** — invoke the correct command and interpret the output.
2. **Fixing failing tests** — read the failure message, find the cause, fix the
   implementation or the test (not both at once).
3. **Writing new tests** — colocate `*.test.ts` next to the source file.
4. **Coverage gaps** — identify untested branches and write tests for them.

---

## Writing conventions

```ts
import { describe, it, expect, vi } from 'vitest';

describe('featureName', () => {
  it('does the expected thing', () => {
    // arrange
    // act
    // assert
  });

  it('handles the error case', () => {
    // ...
  });
});
```

- One `describe` per module.
- Test names read as plain English sentences.
- Use `vi.mock()` to mock external modules; `vi.spyOn()` for methods.
- Each `it` must be independently runnable — no shared mutable state between tests.
- Colocate: `format-date.ts` → `format-date.test.ts`, same directory.

---

## React component tests (`packages/ui`)

Use React Testing Library:

```ts
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders label text', () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });
});
```

Query priority (same logic as Playwright):
1. `getByRole` — preferred
2. `getByLabelText` — for inputs
3. `getByTestId` — when role/label isn't enough
4. Never query by CSS class