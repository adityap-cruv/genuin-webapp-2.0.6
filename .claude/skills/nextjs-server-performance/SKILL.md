---
name: nextjs-server-performance
description: Eliminate Server Component data waterfalls and RSC-boundary footguns in this Next.js 15 App Router app — parallel fetching, Suspense streaming, shared promises via use(), prop serialization, module-state leaks, after(), and bundle-analyzable imports. Use when writing or reviewing Server Components, Server Actions, Route Handlers, or data fetching that feels slow or serial. Do NOT use for client render performance / manual memoization (React Compiler handles that — use the performance skill) or general component building (use frontend-patterns).
metadata:
  author: Genuin (adapted from vercel-labs/agent-skills react-best-practices)
  version: 1.0.0
---

# Next.js Server Performance (RSC & data waterfalls)

Server-side performance rules for Next.js 15 App Router + React 19, focused on the things
`frontend-patterns` and `performance` don't cover: data-fetch waterfalls and the RSC→client boundary.

> **Scope note for this repo:** We use **TanStack Query v5** for client data fetching (not SWR) and
> run the **React Compiler** (manual render memoization is rarely needed). These rules are about
> *network/data ordering and the server boundary* — not `useMemo`/`useCallback`.

Rules are ordered by impact. Read top-down; fix CRITICAL first.

---

## CRITICAL — Eliminate waterfalls

### Parallelize independent async work

Independent awaits run serially and stack their latencies. Start them together.

```typescript
// ❌ Incorrect — sequential: total = user + posts + teams
const user = await getUser(id);
const posts = await getPosts(id);
const teams = await getTeams(id);

// ✅ Correct — parallel: total = max(user, posts, teams)
const [user, posts, teams] = await Promise.all([
  getUser(id),
  getPosts(id),
  getTeams(id),
]);
```

### Parallelize sibling Server Components via composition

Server Components in a tree render top-down; a parent that `await`s before rendering children makes
the children's fetches wait. Restructure so sibling async components fetch in parallel.

```tsx
// ❌ Incorrect — parent awaits, then children start fetching (waterfall)
export default async function Page({ id }: { id: string }) {
  const user = await getUser(id);
  return <Profile user={user}><Posts userId={id} /></Profile>;
}

// ✅ Correct — render both async components as siblings so they fetch in parallel
export default function Page({ id }: { id: string }) {
  return (
    <ProfileSection id={id} />   // awaits getUser internally
    /* and */
    <PostsSection id={id} />     // awaits getPosts internally — runs concurrently
  );
}
```

### Stream with Suspense; share one promise with `use()`

Don't `await` everything before returning JSX — paint the shell first and stream data in. When two
components need the same data, create the promise once and pass it; read it with React 19 `use()`.

```tsx
// ✅ Shell paints immediately; slow data streams into the boundary
export default function Page({ id }: { id: string }) {
  const userPromise = getUser(id); // start once, don't await here
  return (
    <Suspense fallback={<Skeleton />}>
      <Profile userPromise={userPromise} />
      <Sidebar userPromise={userPromise} /> {/* same promise, no double fetch */}
    </Suspense>
  );
}

function Profile({ userPromise }: { userPromise: Promise<User> }) {
  const user = use(userPromise);
  return <h1>{user.name}</h1>;
}
```

### Route Handlers: start promises early, await late

```typescript
// ❌ Incorrect
export async function GET() {
  const a = await slowA();
  const b = await slowB();
  return Response.json({ a, b });
}

// ✅ Correct — kick off both, await once both are in flight
export async function GET() {
  const aPromise = slowA();
  const bPromise = slowB();
  return Response.json({ a: await aPromise, b: await bPromise });
}
```

---

## HIGH — RSC → client boundary

### Serialize only what the client needs

Every prop passed from a Server Component to a Client Component is serialized into the payload sent
to the browser. Passing whole records bloats the HTML/RSC payload and can leak data.

```tsx
// ❌ Incorrect — ships the entire user object (and any secrets on it) to the client
<ClientAvatar user={user} />

// ✅ Correct — pass only the fields the client renders
<ClientAvatar name={user.name} avatarUrl={user.avatarUrl} />
```

### Never keep mutable request state at module scope

Module-level mutable state in Server Components / SSR is shared across requests and leaks data
between users. Keep request-scoped state inside the request; hoist only truly static, immutable I/O
(fonts, logos, config) to module scope.

```typescript
// ❌ Incorrect — shared across every request (cross-user leak)
let currentUser: User | null = null;
export async function loadUser(id: string) { currentUser = await getUser(id); }

// ✅ Correct — request-scoped; dedup with React.cache (see below)
export const loadUser = cache(async (id: string) => getUser(id));
```

### Avoid barrel imports; keep import paths statically analyzable

Barrel files (and our `CLAUDE.md` already bans them) defeat tree-shaking and pull whole modules into
the bundle. Import directly from the source file. Use `next/dynamic` for genuinely heavy,
client-only components (`ssr: false` for things like editors/charts).

```typescript
// ❌ import { Button } from '@/components';        // barrel — pulls everything
// ✅ import { Button } from '@/components/button/button';

const HeavyChart = dynamic(() => import('./heavy-chart'), { ssr: false });
```

---

## MEDIUM — Server work hygiene

### `React.cache()` for per-request dedup of non-fetch work

`fetch()` is auto-memoized by Next.js. For DB queries, auth lookups, or other non-`fetch` work
called from multiple components in one request, wrap with `cache()` and pass primitive args
(arguments are compared by shallow `Object.is`).

```typescript
import { cache } from 'react';
export const getCurrentUser = cache(async (id: string) => db.user.find(id));
```

### `after()` for non-blocking post-response work

Run analytics, logging, and cache invalidation *after* the response is sent so they don't delay it.
Works in Server Actions, Route Handlers, and Server Components.

```typescript
import { after } from 'next/server';

export async function POST(req: Request) {
  const result = await doWork(req);
  after(() => logAnalytics(result)); // does not block the response
  return Response.json(result);
}
```

---

> Source: adapted from Vercel Labs `react-best-practices` (server/async/bundle rules), rewritten for
> this repo's React Compiler + TanStack Query v5 conventions. The omitted `rerender-*`/`js-*` manual
> memoization rules conflict with React Compiler — don't reintroduce them.
