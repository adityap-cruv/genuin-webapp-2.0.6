# Home feed — the `/home` "backend"

`/home` is **backend-driven**: the page renders whatever a backend sends. Today that "backend"
is **dummy data served from this app's own Next API routes** — but the frontend fetches it over
real HTTP against a stable contract, so swapping in a real backend is a one-line (or one-function)
change. Nothing in the UI knows or cares where the JSON comes from.

## Data flow

```
 packages/components/.../home-dynamic/
   use-home-data.ts ──fetch──►  GET /api/home/layout        once  (the "widget.json")
                     ──fetch──►  GET /api/home/feed?cursor=  paged (the "data.json", infinite scroll)
                        │
                        ▼
 apps/webapp/src/app/api/home/
   layout/route.ts  ──►  getHomeLayout()          ┐  apps/webapp/src/lib/home-feed/
   feed/route.ts    ──►  getHomeFeedPage(cursor)  ┘  layout.ts + pages.ts   ← THE SEAM (dummy today)
                        │
                        ▼
   Shapes typed by  packages/components/.../home-dynamic/contract.ts   ← single source of truth
                        │
                        ▼
   Frontend joins each layout widget to its content by `dataKey`, picks a React component from
   the COMPONENT_REGISTRY, and renders. Infinite scroll appends one `/api/home/feed` page at a time.
```

- **`layout.ts` → `getHomeLayout()`** returns the layout manifest: rows → widgets, which component
  renders each slot, grid template/heights, and the Genuin SDK placement ids (matching `/home`).
- **`pages.ts` → `getHomeFeedPage(cursor)`** returns one content page keyed by `dataKey`, with a
  `nextCursor` for the next page (endless).
- Both are typed by **`contract.ts`** so the dummy and any real backend share ONE shape.

## Integrating a real backend (minimal — the UI never changes)

**Option A — point the app at an external backend that already serves this contract:**
set `NEXT_PUBLIC_HOME_BFF_URL=https://your-backend` (read in `use-home-data.ts`). Requests then go
to `https://your-backend/api/home/layout` etc. instead of these local routes. **Zero code changes.**

**Option B — keep these routes as a thin BFF/adapter:** change ONLY the bodies of `getHomeLayout()`
and `getHomeFeedPage()` to `fetch()` your real API and map its response to `contract.ts`. The routes,
`use-home-data.ts`, and every component stay exactly as they are. CORS/auth stay server-side here.

That's the whole seam: **one env var, or two functions in this folder.**
