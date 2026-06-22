# SafeSuspense — Dynamic Chunk Failure Resilience

> **TL;DR** — Never render a lazily-loaded component under a bare React
> `<Suspense>`. Use `<SafeSuspense>` instead. It pairs `<Suspense>` with a
> `AppErrorBoundary` so that a failed dynamic `import()` shows a contained
> fallback instead of blanking the entire embed. An ESLint rule enforces this,
> and CI blocks any PR that violates it.

- **Pattern source:** `packages/components/src/molecules/error/safe-suspense.tsx`
- **Boundary source:** `packages/components/src/molecules/error/app-error-boundary.tsx`
- **Lint rule:** `packages/eslint-config/react-internal.js`
- **CI gate:** `.github/workflows/lint.yml`

---

## 1. The original problem

The Web SDK and the shared component library are heavily code-split. Most
non-critical surfaces (the embed root, the player list, side panels, modals,
linkout cards, the swiper carousel, the toaster, etc.) are loaded with
`React.lazy(() => import(...))` so the initial embed bundle stays small.

Code splitting introduces a failure mode that does not exist with static
imports: **the dynamic `import()` can fail at runtime.** This happens for
ordinary, non-exceptional reasons:

- A network hiccup or CDN blip while fetching the chunk.
- An ad-blocker or corporate proxy blocking the request.
- A stale `index.html` / host page pointing at chunk hashes that no longer
  exist after a deploy.

When a `React.lazy` chunk fails to load, the rejected import promise surfaces as
a **thrown error during render**. `<Suspense>` only handles the *pending* state
(it shows the `fallback` while the promise is in flight) — it does **not** catch
a *rejection*. With no error boundary above it, that thrown error unwinds all
the way to the React root.

The consequences in production were severe:

- **Black/blank screen.** The whole embed unmounted because the error reached
  the root with nothing to catch it.
- **Blast radius beyond the failed chunk.** A single failed lazy chunk (say, a
  modal or a linkout card) took down the *entire* embed tree — including the
  video that had already loaded and was playing fine. One non-critical chunk
  failure blanked everything.
- **Cross-feature collapse.** Because the failure propagated to the root,
  sibling features that had nothing to do with the failed chunk also disappeared.

In short: a transient, recoverable network event for one optional chunk caused a
total, unrecoverable UI failure for the user.

---

## 2. The solution

### 2.1 The generic error handler — `AppErrorBoundary`

`AppErrorBoundary` is a generic React error boundary
(`packages/components/src/molecules/error/app-error-boundary.tsx`). It catches
any error thrown while rendering its subtree — a failed dynamic `import()`
(surfaced from React.lazy/Suspense), a render-time exception, or a thrown
effect-setup error. Dynamic-chunk failures are the primary motivating case, but
it is not limited to them.

A React error boundary is the *only* construct that can catch an error thrown
during render. `AppErrorBoundary`:

1. Catches the thrown error via `getDerivedStateFromError` so it never reaches
   the React root.
2. **Contains** the failure to its own subtree — everything outside the boundary
   (other embeds, the rest of the host page, already-rendered siblings) keeps
   working.
3. Logs the failure through `componentDidCatch` (wired to `onError` for
   observability).
4. Renders a graceful, **retryable** fallback — a styled "Unable to load
   content / Try again" card by default, or a custom one.

The retry is the subtle part. React memoises a rejected `import()` promise, so a
plain remount reuses the failed promise and fails again. `AppErrorBoundary`
solves this with an `attempt` counter passed to a render-prop child:

```tsx
<AppErrorBoundary>
  {(attempt) => {
    // Bumping `attempt` recreates the lazy component, forcing React.lazy to
    // re-run the dynamic import instead of reusing the rejected promise.
    const Lazy = useMemo(() => lazy(() => import("./thing")), [attempt]);
    return <Suspense fallback={<Skeleton />}><Lazy /></Suspense>;
  }}
</AppErrorBoundary>
```

When the user clicks "Try again", the boundary clears its error state and
increments `attempt`, which recreates `Lazy`, which genuinely re-fetches the
chunk.

### 2.2 Why `SafeSuspense` instead of bare `<Suspense>`

The boundary + Suspense combination above is correct, but verbose and easy to
get wrong (forget the boundary, forget the retry wiring, etc.). The common case
does **not** need the `attempt`-driven retry render-prop — it just needs
"contain the failure so it doesn't blank the app."

`SafeSuspense` packages that common case into one drop-in component
(`packages/components/src/molecules/error/safe-suspense.tsx`):

```tsx
export function SafeSuspense({ children, fallback = null, errorFallback, onError }) {
  // AppErrorBoundary (catches chunk-load failures) wrapping Suspense
  // (handles the pending state). One component, both responsibilities.
  return (
    <AppErrorBoundary fallback={/* derived from errorFallback */}>
      <Suspense fallback={fallback}>{children}</Suspense>
    </AppErrorBoundary>
  );
}
```

It is a **drop-in replacement for a bare `<Suspense>`** that additionally
contains chunk-load failures. We standardise on it because:

- A bare `<Suspense>` provides **zero** failure containment. It is, in this
  codebase, almost always a latent black-screen bug.
- Repeating the boundary-plus-Suspense boilerplate at every call site is
  error-prone — someone eventually forgets the boundary.
- One sanctioned wrapper means one place to evolve the behaviour (logging,
  fallback styling, telemetry) for every lazy boundary at once.

### 2.3 How `SafeSuspense` isolates failures

Each `SafeSuspense` instance has its **own** `AppErrorBoundary`. Error
boundaries catch errors from their subtree and no further. So when chunk A
(wrapped in its own `SafeSuspense`) fails:

- Its boundary catches the error and renders A's fallback **in A's slot only**.
- Chunk B, chunk C, the playing video, the rest of the page — all outside A's
  boundary — are unaffected and keep rendering.

One failed chunk degrades to a small fallback card in its own region instead of
taking down the whole embed.

### 2.4 The `SafeSuspense` API

```tsx
<SafeSuspense fallback={…} errorFallback={…} onError={…}>
  {children}
</SafeSuspense>
```

| Prop            | Meaning                                                                                       |
| --------------- | --------------------------------------------------------------------------------------------- |
| `fallback`      | Loading UI shown while the chunk resolves (forwarded to `<Suspense>`). Same as before.        |
| `errorFallback` | UI shown when the chunk fails. See the decision rule below.                                   |
| `onError`       | Fired when the boundary catches an error — wire to logging/observability.                     |

**`errorFallback` decision rule:**

- **Primary content** (the embed root, player list, side panel, page-level
  views, the swiper carousel) → **omit `errorFallback`**. The user sees the
  default styled "Try again" retry card — they should be able to recover.
- **Non-critical chrome** (modals, overlays, buttons, menus, toasts, linkout
  cards) → **`errorFallback={null}`** (silent). A failed optional overlay should
  vanish quietly, not show an error card over the content.

---

## 3. Migration guide

### 3.1 What changes

For every site that renders a lazy/dynamic-import component under a bare
`<Suspense>`:

1. Replace `<Suspense>` with `<SafeSuspense>`.
2. Keep the existing `fallback` value verbatim.
3. Add `errorFallback={null}` for non-critical chrome; omit it for primary
   content (see §2.4).
4. Update the import:
   `import { SafeSuspense } from "@genuin/components/molecules/error/safe-suspense";`
5. Remove the now-unused `Suspense` from the `react` import (keep `lazy`,
   `useMemo`, etc.).

### 3.2 Components

**Before — non-critical modal (black-screen risk):**

```tsx
import { lazy, Suspense } from "react";

const AuthenticationModal = lazy(() => import("./auth-modal"));

<Suspense fallback={node}>
  <AuthenticationModal />
</Suspense>
```

**After:**

```tsx
import { lazy } from "react";

import { SafeSuspense } from "@genuin/components/molecules/error/safe-suspense";

const AuthenticationModal = lazy(() => import("./auth-modal"));

<SafeSuspense fallback={node} errorFallback={null}>
  <AuthenticationModal />
</SafeSuspense>
```

**Before — primary content:**

```tsx
<Suspense fallback={<FeedSkeleton />}>
  <PlayerList />
</Suspense>
```

**After (omit `errorFallback` → user gets the retry card):**

```tsx
<SafeSuspense fallback={<FeedSkeleton />}>
  <PlayerList />
</SafeSuspense>
```

### 3.3 Stories

**Storybook stories (`*.stories.tsx` / `*.stories.ts`) are exempt.** They are
never shipped in the SDK bundle, so a failed chunk in a story cannot blank a
production embed. Bare `<Suspense>` is fine in stories; the lint rule does not
apply to them (see §5).

### 3.4 The one intentional exception

`packages/web-sdk/src/sdk/react-utils.tsx` (`LazyEmbedRootSuspense`) keeps a
bare `<Suspense>` **on purpose**. Its parent (`EmbedRootMount`) already wraps it
in a `AppErrorBoundary` that drives the `attempt`-based retry loop. Adding an
inner `SafeSuspense` (i.e. a second `AppErrorBoundary`) would swallow the
failure first and **defeat that retry**. The site carries an explicit
`// eslint-disable-next-line no-restricted-syntax` with that reason.

---

## 4. Future usage

If a developer writes `<Suspense>` (or `<React.Suspense>`) directly in a new
**component**:

- ESLint reports an **error** at that line, pointing them to `<SafeSuspense>`.
- Their editor shows it inline (if ESLint runs in the IDE).
- `pnpm lint` fails locally.
- **CI fails the PR**, and branch protection blocks the merge.

If they write it in a **Storybook story**, nothing happens — stories are
exempt by design.

This makes the safe pattern the path of least resistance: the only way to merge
a bare `<Suspense>` in a component is to consciously add a disable comment with
a justification, which is visible in code review.

---

## 5. Linting enforcement

The rule lives in the shared React ESLint config
(`packages/eslint-config/react-internal.js`), which both `packages/components`
and `packages/web-sdk` extend.

### 5.1 How the rule works

It uses ESLint's built-in `no-restricted-syntax` rule with two AST-selector
entries:

```js
"no-restricted-syntax": [
  "error",
  {
    selector: "JSXOpeningElement[name.name='Suspense']",
    message: "Use <SafeSuspense> …, not bare <Suspense>. …",
  },
  {
    selector: "JSXMemberExpression[property.name='Suspense']",
    message: "Use <SafeSuspense>, not React.Suspense.",
  },
],
```

### 5.2 How it detects direct `Suspense` usage

- The first selector matches the JSX element `<Suspense …>`.
- The second matches the namespaced form `<React.Suspense …>`.

We deliberately target the **JSX element**, not the import. An earlier draft
also banned `import { Suspense } from "react"` via `no-restricted-imports`, but
that **false-positives on `import * as React from "react"`** (the namespace
import "could" access `Suspense` even when the file never uses it). Matching the
rendered element instead:

- catches the actual usage regardless of how `Suspense` was imported (named,
  namespaced, aliased, re-exported), and
- never trips on a namespace import that doesn't use Suspense.

### 5.3 Intentional exceptions

Two override blocks at the end of `react-internal.js` turn the rule off where a
bare `<Suspense>` is legitimate:

```js
{
  // The SafeSuspense wrapper itself must render the real <Suspense>.
  // Stories are never shipped, so they can't blank a production embed.
  files: ["**/molecules/error/safe-suspense.tsx", "**/*.stories.tsx", "**/*.stories.ts"],
  rules: { "no-restricted-syntax": "off" },
},
```

For a **one-off** intentional bare `<Suspense>` in a component (like the
`react-utils.tsx` retry case in §3.4), do **not** edit the config — add a
per-line disable with a reason, so the exception is documented at the code:

```tsx
// eslint-disable-next-line no-restricted-syntax -- parent AppErrorBoundary drives the retry loop
<Suspense fallback={fallbackSkeleton}>…</Suspense>
```

Prefer per-line disables over config exemptions: they keep the "why" next to the
code and are visible in review.

---

## 6. Complete CI / lint execution flow

How a `<Suspense>` in a new component gets caught, end to end:

1. **`pnpm lint`** (root `package.json`) runs
   `turbo run lint --filter=!./apps/legacy-webapp`.
2. **Turbo** fans out the `lint` task to each package, including
   `@genuin/components` and `@genuin/web-sdk`. Each package's `lint` script runs
   `eslint .`.
3. **ESLint loads its flat config** for the package. The package config extends
   the shared `react-internal.js` from `@genuin/eslint-config`, which contributes
   the `no-restricted-syntax` rule and the story/wrapper override blocks.
4. **ESLint parses each file** into an AST (one traversal) and fires the
   `no-restricted-syntax` selector listeners on every matching node. A
   `<Suspense>` / `<React.Suspense>` element in a non-exempt file produces an
   **error**; `eslint .` exits non-zero.
5. **The CI workflow** (`.github/workflows/lint.yml`) runs on every PR and push
   to `master`: checkout → setup pnpm/Node → `pnpm install` → **`pnpm lint`**. A
   lint error fails the job.
6. **Branch protection** (configured in GitHub repo settings → Branches) marks
   the **Lint** check as *required*, so a PR with a violation **cannot merge**.

```
Developer writes <Suspense> in a component
        │
        ▼
  pnpm lint  ──►  turbo run lint  ──►  eslint .  (per package)
        │                                  │
        │                          loads react-internal.js
        │                          (no-restricted-syntax rule)
        │                                  │
        │                          AST walk → selector matches <Suspense>
        │                                  │
        │                              ❌ error, exit 1
        ▼
  lint.yml CI job fails  ──►  required status check fails  ──►  merge blocked
```

This chain is what turns the rule from a suggestion into a guarantee. All three
layers are needed:

| Layer                        | Without it…                                                    |
| ---------------------------- | -------------------------------------------------------------- |
| ESLint rule                  | Nothing defines what's wrong.                                  |
| `lint.yml` (CI runs lint)    | The rule only runs if a dev chooses to; merges aren't checked. |
| Required-check protection    | CI may be red, but a PR can still be merged anyway.            |

The result: future code follows the `SafeSuspense` pattern by default, and the
black-screen failure mode that motivated this work cannot silently return.
