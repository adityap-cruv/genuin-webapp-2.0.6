---
name: performance
description: Audit and fix performance issues in React components and the Next.js webapp — unnecessary re-renders, memoization (React Compiler-aware), code splitting, bundle size, image/LCP, TanStack Query caching. Use when something is slow, janky, the bundle is too large, or a render is expensive. Do NOT use for general component building (use frontend-patterns) or accessibility (use accessibility).
---

# Skill: Performance

Use this skill when auditing, diagnosing, or fixing performance issues in React
components, server responses, or the Next.js webapp.

---

## Measurement first — always

Before any optimisation:

1. **Profile** — identify the actual bottleneck (React DevTools Profiler, Lighthouse, network waterfall, `EXPLAIN ANALYZE` for DB queries)
2. **Establish a baseline** — record the current measurement
3. **Optimise** — change one thing at a time
4. **Measure again** — confirm improvement is real

Optimisation without measurement is guessing. Most code does not need to be optimised —
find the 20% that causes 80% of the problem.

---

## React performance

### React Compiler (automatic)

This project uses the React Compiler (Babel plugin). It handles many memoization
decisions automatically. Before manually adding `useMemo`, `useCallback`, or
`React.memo`, check if the Compiler already handles it — profiling first will tell you.

### Re-render audit

Use React DevTools Profiler to confirm a component is actually re-rendering
unnecessarily — do not guess.

**Common causes of unnecessary re-renders:**

| Cause                                        | Fix                                       |
| -------------------------------------------- | ----------------------------------------- |
| New object/array created on every render     | Move outside component or use `useMemo`   |
| Inline function passed as prop               | `useCallback` or define outside component |
| Context value changes on every render        | Split context or memoize the value        |
| Parent re-renders for unrelated state change | `React.memo` on the child                 |

**`useMemo`:** Use only for expensive derived values (sorting/filtering large lists) or stable
object/array references passed to memoized children. Skip if React Compiler handles it or the
computation is cheap.

**`useCallback`:** Use when passing a function to a memoized child or as a `useEffect`
dependency that should not re-run.

### List rendering

- Always provide stable, unique `key` props — never use array index if items can be
  reordered, filtered, or removed
- For very long lists (1000+ items), use `@tanstack/react-virtual` (already in the stack)

---

## Next.js 15 performance patterns

### Server Components first

Default to Server Components. Client Components ship JavaScript to the browser —
Server Components do not. Every unnecessary `'use client'` inflates the bundle.

**Audit `'use client'` usage:**

- Is `useState` or `useEffect` actually used? If not, remove `'use client'`
- Can state be lifted to a smaller child to keep the parent as a Server Component?

### Data fetching

- **Server Components**: fetch directly, use `React.cache()` for deduplication across a request
- **Client Components**: use TanStack Query v5 — configure `staleTime` to avoid unnecessary refetches:

  ```ts
  // Prevent refetch on every mount for stable data
  useQuery({ queryKey: ["user"], queryFn: fetchUser, staleTime: 5 * 60 * 1000 });
  ```

- **Parallel fetching**: fetch independent data in parallel, not sequentially:

  ```ts
  // Bad — sequential: total time = A + B
  const user = await fetchUser();
  const feed = await fetchFeed();

  // Good — parallel: total time = max(A, B)
  const [user, feed] = await Promise.all([fetchUser(), fetchFeed()]);
  ```

### Partial Prerendering (PPR)

This project implements PPR for hybrid static/dynamic pages. Static shell renders
immediately; dynamic parts stream in. Keep dynamic content isolated in suspense
boundaries to maximise the static shell.

### Image optimisation

- Always use `next/image` — never `<img>` for content images
- Specify `width` and `height` to prevent layout shift (CLS)
- Use `loading="lazy"` for below-the-fold images
- Use `priority` for the largest above-the-fold image (LCP element)

---

## Bundle size

```bash
# Build with bundle analysis (from repo root)
pnpm --filter @genuin/webapp build --analyze

# Check for duplicate packages across the monorepo
pnpm why <package-name>
```

- Use dynamic imports for large dependencies loaded on interaction:

  ```tsx
  const HeavyComponent = lazy(() => import("./HeavyComponent"));
  ```

- Prefer named imports — tree-shaking only works on named imports:

  ```ts
  // Bad — imports the entire library
  import _ from "lodash";

  // Good — imports only what is needed
  import debounce from "lodash/debounce";
  ```

- `next.config` already uses `optimizePackageImports` — add any large libraries there
  to enable automatic tree-shaking.

---

## Animation performance (GSAP + motion)

This project uses both GSAP and the `motion` library. Animation performance rules:

- Animate only `transform` and `opacity` — these are GPU-composited and do not trigger layout
- Never animate `width`, `height`, `top`, `left`, `margin`, or `padding` — they trigger layout recalculation
- For scroll-triggered animations, use `IntersectionObserver` or GSAP ScrollTrigger — never `scroll` event listeners
- Wrap GSAP animations in `useGSAP` from `@gsap/react` to ensure proper cleanup

---

## API & server performance

### N+1 query detection

An N+1 query fetches N items then makes 1 query per item — the most common backend perf issue.

```ts
// Bad — N+1
const posts = await db.query("SELECT * FROM posts");
for (const post of posts) {
  post.author = await db.query("SELECT * FROM users WHERE id = $1", [post.user_id]);
}

// Good — single JOIN
const posts = await db.query(`
  SELECT posts.*, row_to_json(users.*) as author
  FROM posts
  LEFT JOIN users ON users.id = posts.user_id
`);
```

### Database query checklist

- [ ] Columns in `WHERE`, `JOIN ON`, and `ORDER BY` are indexed
- [ ] `SELECT *` replaced with explicit column lists
- [ ] All list queries are paginated — no unbounded result sets
- [ ] Expensive aggregations use materialised views or background jobs

### Response size

- Endpoints return only the fields the client uses — audit with the network tab
- Enable gzip/brotli on the server
- Paginate all list responses with a maximum page size

---

## Audit output format

**Finding:**

- Location: `apps/webapp/src/components/FeedList.tsx`
- Issue: Component re-renders on every keystroke in parent search input
- Impact: Measured — 340ms render on a list of 200 items
- Fix: Wrap with `React.memo`, move sort logic into `useMemo`

**Severity:**

- 🔴 Critical — visible jank, >100ms render blocking the main thread
- 🟡 Medium — measurable slowdown, not yet visible to most users
- 🟢 Low — theoretical inefficiency, not measurable in practice