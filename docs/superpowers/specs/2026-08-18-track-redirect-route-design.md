# `/trk` Redirect Route — Design

Date: 2026-08-18
Status: Approved for planning

## Summary

Add a `/trk` route to `apps/webapp` that acts as a redirect middleware for ad/campaign
links. It fires a RudderStack "Page Viewed" analytics event, then redirects the browser to a
caller-supplied `redirect_url`. It parallels the existing `/dlk` QR-scan route in structure, but
its job is a pure logged redirect rather than app-store deep-linking.

### Sample URL

```
https://tmobile.begenuin.com/trk?utm_medium=QR&redirect_url=https%3A%2F%2Fsplitero.com&tag_id=6734hjksahdf9234&user_id=124-e35345-234324&creative_id=IAbsadg-sdfdsg&ad_domain=splitero.com
```

Query params:

- `redirect_url` — **required**. The destination to redirect to.
- `utm_medium`, `tag_id`, `user_id`, `creative_id`, `ad_domain` — tracking metadata, logged as
  analytics event properties.

## Decisions (locked)

| Topic                          | Decision                                                                                                                                                                                                 |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Redirect behavior              | Redirect only — no params appended to the destination, no separate tracking API call.                                                                                                                    |
| Missing/invalid `redirect_url` | Fall back to the homepage `/` on the current origin (same subdomain).                                                                                                                                    |
| URL safety                     | Validate scheme: `redirect_url` must parse as an absolute URL with scheme `https:`. Any https host is allowed. Anything else (missing, malformed, `http:`, `javascript:`, `data:`, relative) → fallback. |
| Path shape                     | Query-only `/trk`. No dynamic `[slug]` segment.                                                                                                                                                          |
| Implementation surface         | **Client** component under the site tree (forced by client-only RudderStack — see below).                                                                                                                |
| Redirect status                | Client-side `window.location.replace(target)` (no history entry for `/trk`).                                                                                                                             |
| Analytics                      | Fire the existing `"Page Viewed"` event via the webapp `Analytics` wrapper.                                                                                                                              |
| Event/redirect timing          | Await analytics delivery (SDK completion callback) before redirecting, **capped at 2s total** — redirect regardless once the cap elapses.                                                                |
| Callback wiring                | Extend `rudderStackTrack` / `Analytics.track` to forward an optional completion callback.                                                                                                                |

## Why client-side (not a server Route Handler)

RudderStack in this repo is **client-only**: the browser SDK is loaded from a CDN and driven
through `window.rudderanalytics`, mounted by `AnalyticsProvider`
(`packages/components/src/context/analytics/provider.tsx`) in
`apps/webapp/src/components/providers/site-providers.tsx`. There is no server-side RudderStack
SDK. A pure server Route Handler therefore cannot fire the pageview.

So `/trk` must render inside the site provider tree so `window.rudderanalytics` exists, exactly
like `/dlk`. The redirect is a client-side `window.location.replace`.

## Structure (mirrors `/dlk`)

```
apps/webapp/src/app/(site)/(dynamic)/trk/
├── page.tsx              # thin server wrapper -> <MainComponent />
├── main-component.tsx    # 'use client' — all logic
└── main-component.test.tsx  # Vitest
```

Placed under `(site)/(dynamic)` — same route group as `dlk` — so `AnalyticsProvider` and the
genuin-options config are mounted.

## Flow (client, on mount)

1. Read params with `useSearchParams()`: `redirect_url`, `utm_medium`, `tag_id`, `user_id`,
   `creative_id`, `ad_domain`.
2. Compute redirect target:
   - Parse `redirect_url` as an absolute URL.
   - Valid + scheme `https:` → target = `redirect_url`.
   - Otherwise → target = `/` (homepage, same origin).
3. Fire the analytics event (see property mapping) with a completion callback.
4. Redirect via `window.location.replace(target)`:
   - from the analytics completion callback (fires once the event is enqueued/delivery-attempted), **or**
   - from a hard 2s timeout — whichever comes first. Guard with a "already redirected" flag so
     it only fires once.
5. Render `<Loader size="xl" />` (identical to `/dlk`) while the above runs.

### Delivery gating detail

- `AnalyticsProvider` init is deferred (`requestIdleCallback`). On a cold `/trk` load,
  `window.rudderanalytics` may not exist yet. Briefly poll for readiness, but the **total** budget
  (readiness wait + event callback) is 2s; the hard timeout at 2s wins unconditionally.
- Delivery gating is best-effort: RudderStack's browser callback signals the event was
  enqueued/attempted, not a network ack. Within a 2s cap this maximizes capture without ever
  trapping the user.

## Analytics property mapping

Event name: `"Page Viewed"` (existing).

Extra properties passed by `/trk`:

| Property          | Source                                                                                      |
| ----------------- | ------------------------------------------------------------------------------------------- |
| `utm_medium`      | query param                                                                                 |
| `tag_id`          | query param                                                                                 |
| `creative_id`     | query param                                                                                 |
| `ad_domain`       | query param                                                                                 |
| `ad_user_id`      | the incoming `user_id` query param, renamed to avoid clobbering the auto-injected `user_id` |
| `ad_redirect_url` | the resolved destination (or fallback)                                                      |

`Analytics.track` already injects defaults: `user_id`/`gen_user_id` (session user), `brand_id`,
`channel`, `environment`, plus the service-level `url`/`path`/`query_params`/device fields.

## Shared change: callback-capable track

`apps/webapp/src/services/analytics/useRudderAnalytics.ts` — `rudderStackTrack(eventName,
properties)` currently calls `window.rudderanalytics?.track(eventName, properties)` with no
callback. Add an optional trailing callback and forward it:

```ts
export async function rudderStackTrack(
  eventName: string,
  properties: Record<string, string | number | undefined>,
  callback?: () => void
) {
  const x = window.rudderanalytics as RudderAnalytics | undefined | null;
  const brandId = useGenuinOptions.getState().brandId;
  if (properties && brandId) (properties as any).brand_id = brandId;
  x?.track(eventName, properties, callback);
}
```

Thread the optional callback through `Analytics.track` in
`apps/webapp/src/services/analytics/index.ts` so callers can opt in. This is additive and
backward-compatible — existing callers pass no callback and are unaffected.

> `packages/` change note: `useRudderAnalytics.ts` and `index.ts` live in `apps/webapp`, not
> `packages/`, so no shared-package approval is required. `packages/components` analytics is not
> touched.

## Error handling

- No throwing. Invalid input degrades to the homepage fallback.
- If `window.rudderanalytics` never becomes available, the 2s timeout still redirects.
- Never redirect to a non-https or non-absolute URL — those route to the fallback.

## Testing (Vitest, colocated)

`main-component.test.tsx` covers:

1. Valid `https` `redirect_url` → `window.location.replace` called with that URL.
2. Missing `redirect_url` → replace called with `/`.
3. Non-https scheme (`http:`, `javascript:`) → replace called with `/`.
4. Malformed `redirect_url` → replace called with `/`.
5. Analytics event fired once with `"Page Viewed"` and the expected extra properties.
6. Redirect happens exactly once even if both callback and timeout fire.
7. Redirect still happens (to the correct target) when the analytics callback never fires (timeout path).

Mock `window.rudderanalytics` / the `Analytics` wrapper and `window.location.replace`; use fake
timers for the 2s cap.

## Out of scope (YAGNI)

- No server-side tracking API call.
- No host allowlist (scheme validation only).
- No `/trk/[slug]` variant.
- No appending tracking params onto the destination URL.
- No device detection / app-store logic (that is `/dlk`'s job).
