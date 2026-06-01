---
name: nextjs-cache
description: Diagnose and reason about Next.js 15 caching, revalidation, and ISR — why a route is dynamic or static, stale data after a mutation, GET Route Handlers no longer cached by default, fetch revalidate, 'use cache'/cacheLife, revalidatePath/Tag, and client router staleTimes. Use when content is stale, a page rebuilds too often/rarely, or you're unsure why a route is dynamic. Do NOT use for render/data-waterfall performance (use nextjs-server-performance) or general component work (use frontend-patterns).
metadata:
  author: Genuin (adapted from vercel-labs/agent-skills vercel-optimize)
  version: 1.0.0
  frameworks: next@>=15.0.0
---

# Next.js 15 Caching & Revalidation

A diagnostic skill for Next.js 15 App Router cache behaviour — the area our other skills don't cover.
For each topic: what to check, the fix, and **when NOT to apply it** (to avoid bad advice).

> **Next.js 15 baseline shift:** caching defaults changed in 15. `fetch` is **no longer cached by
> default**, GET Route Handlers are **dynamic by default**, and client router `staleTimes` default to
> 0. Don't assume the old "cached unless you opt out" model.

---

## 1. "My GET Route Handler isn't cached anymore"

**Check:** Next.js 15 made GET Route Handlers **dynamic by default** (they were static in 14).
**Fix:** opt back into static/ISR explicitly.

```typescript
// app/api/items/route.ts
export const dynamic = 'force-static';     // or:
export const revalidate = 3600;            // ISR: re-generate at most hourly
```

**Do NOT recommend when:** the handler reads cookies/headers/searchParams or returns per-user data —
it *must* stay dynamic. Caching it would serve one user's data to everyone.

## 2. "Page data is stale" / "data doesn't refresh"

**Check:** is the data fetched with a cached `fetch`, or behind `revalidate`? In 15, a bare `fetch`
is dynamic (fresh each request), but a `fetch` with `next: { revalidate }` or a route-level
`revalidate` will serve cached data until the window elapses.

**Fix:** pick the model deliberately.

```typescript
// Always fresh (default in 15):
await fetch(url);                                   // no caching
// Time-based ISR:
await fetch(url, { next: { revalidate: 60 } });     // cache up to 60s
// Tag-based, invalidate on mutation:
await fetch(url, { next: { tags: ['items'] } });
```

After a mutation, invalidate explicitly from the Server Action / Route Handler:

```typescript
import { revalidateTag, revalidatePath } from 'next/cache';
revalidateTag('items');        // everything tagged 'items'
revalidatePath('/items');      // a specific route
```

**Do NOT recommend when:** the staleness is on the **client** after a TanStack Query mutation — that's
a `queryClient.invalidateQueries` problem, not a Next cache problem (see `frontend-patterns`).

## 3. "Should I use `'use cache'`?"

**Check:** Next version. `'use cache'` + `cacheLife`/`cacheTag` are newer and version-gated; behaviour
differs across 15.x and may be behind a flag.

**Fix:** confirm the installed Next version (`pnpm why next` / `package.json`) before recommending
`'use cache'`. If unavailable, use `fetch` `revalidate`/`tags` or route-level `revalidate` instead.

**Do NOT recommend when:** you haven't verified the version supports it — silently wrong cache advice
is worse than none. State the version you assumed.

## 4. "The whole route went dynamic and I don't know why"

**Check:** any use of `cookies()`, `headers()`, `searchParams`, `noStore()`, or an uncached `fetch`
opts the whole route into dynamic rendering. One dynamic API "infects" the route.

**Fix:** isolate the dynamic part behind `<Suspense>` so the static shell can still be prerendered
(Partial Prerendering), or move the dynamic read deeper so less of the tree is forced dynamic.

**Do NOT recommend when:** the page genuinely must be per-request (auth dashboards) — forcing static
there is a correctness bug.

## 5. Client-side router cache (`staleTimes`)

**Check:** back/forward navigation showing stale or over-refetched pages relates to
`experimental.staleTimes` in `next.config`. Default is 0 in 15 (always refetch on nav).

**Fix:** tune `staleTimes.dynamic`/`static` if you want client-side nav caching; leave at 0 if
freshness matters more than nav speed.

**Do NOT recommend when:** the symptom is data freshness within a page — that's `fetch`/TanStack
Query, not router cache.

---

## Verification (always do before claiming a fix)

- Confirm the installed **Next.js version** before quoting version-gated APIs (`'use cache'`, `after`).
- Reproduce static-vs-dynamic with `pnpm build` output (the `○ (Static)` / `ƒ (Dynamic)` legend).
- After a revalidation change, confirm the mutation path actually calls `revalidateTag`/`revalidatePath`.

> Source: adapted from Vercel Labs `vercel-optimize`. Image LCP/preload and font-CLS tuning are
> performance concerns — see the `performance` skill.
