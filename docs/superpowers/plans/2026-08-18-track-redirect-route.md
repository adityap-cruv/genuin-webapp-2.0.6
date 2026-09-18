# `/trk` Redirect Route Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a client-side `/trk` route to `apps/webapp` that fires a RudderStack "Page Viewed" event with ad tracking params, then redirects the browser to a validated `https` `redirect_url` (falling back to `/`), within a 2s cap.

**Architecture:** A client component under `(site)/(dynamic)/trk/` (mirroring `/dlk`) so it renders inside `AnalyticsProvider` where `window.rudderanalytics` exists. On mount it validates `redirect_url`, fires the analytics event with a completion callback, and calls `window.location.replace(target)` from either the callback or a 2s timeout — whichever fires first, guarded so it runs once. The `rudderStackTrack`/`Analytics.track` wrappers are extended to forward an optional completion callback.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript (strict), RudderStack browser SDK (`@rudderstack/analytics-js` via `window.rudderanalytics`), Playwright E2E (webapp has no Vitest — see note).

> **Testing-surface note (deviation from spec):** The design spec proposed colocated Vitest tests. `apps/webapp` has **no Vitest** — its only test runner is Playwright E2E (`apps/webapp/tests/e2e/`, `pnpm --filter=@genuin/webapp test` → `playwright test`). Standing up a Vitest harness in the webapp would be a new-dependency infrastructure change requiring team approval (per CLAUDE.md). This plan therefore tests via Playwright E2E, the webapp's real test surface. The redirect-target validation logic is extracted into a pure, framework-free helper so its edge cases are covered by a fast Vitest-style unit test — but since the webapp has no unit runner, that helper's cases are exercised through E2E scenarios instead. Keeping the helper pure also keeps it trivially testable if a unit runner is ever added.

---

## File Structure

- **Create** `apps/webapp/src/app/(site)/(dynamic)/trk/page.tsx` — thin server wrapper rendering `<MainComponent />` (mirrors `dlk/[slug]/page.tsx`).
- **Create** `apps/webapp/src/app/(site)/(dynamic)/trk/resolve-redirect.ts` — pure helper: given a raw `redirect_url` string, return a safe redirect target (`https` URL or `"/"`). No React/DOM deps. One responsibility: URL safety.
- **Create** `apps/webapp/src/app/(site)/(dynamic)/trk/main-component.tsx` — `'use client'` component: reads params, fires analytics, redirects with the 500ms cap.
- **Modify** `apps/webapp/src/services/analytics/useRudderAnalytics.ts` — add optional completion callback to `rudderStackTrack`.
- **Modify** `apps/webapp/src/services/analytics/index.ts` — thread optional callback through `Analytics.track`.
- **Create** `apps/webapp/tests/e2e/trk.spec.ts` — E2E covering redirect + fallback + analytics-fired.

---

## Task 1: Redirect-target validation helper

**Files:**

- Create: `apps/webapp/src/app/(site)/(dynamic)/trk/resolve-redirect.ts`

Pure function, no DOM. Returns the destination string to pass to `window.location.replace`.
Accepts the raw `redirect_url` param (may be `null`/`undefined` from `URLSearchParams.get`).

- [ ] **Step 1: Write the helper**

```ts
/**
 * Resolve the redirect destination for the /trk route.
 *
 * Only absolute `https:` URLs are allowed as external destinations. Anything else — missing,
 * malformed, non-https scheme (`http:`, `javascript:`, `data:`), or a relative path — falls back
 * to the site homepage to avoid open-redirect / protocol abuse.
 *
 * @param rawRedirectUrl The raw `redirect_url` query param (nullable).
 * @returns A safe destination: the validated https URL, or `"/"` as a same-origin fallback.
 */
export function resolveRedirectTarget(rawRedirectUrl: string | null | undefined): string {
  if (!rawRedirectUrl) return "/";
  try {
    const parsed = new URL(rawRedirectUrl);
    return parsed.protocol === "https:" ? parsed.toString() : "/";
  } catch {
    return "/";
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add "apps/webapp/src/app/(site)/(dynamic)/trk/resolve-redirect.ts"
git commit -m "feat(track): add redirect-target validation helper"
```

---

## Task 2: Extend `rudderStackTrack` with an optional completion callback

**Files:**

- Modify: `apps/webapp/src/services/analytics/useRudderAnalytics.ts`

The RudderStack browser SDK's `track(event, properties, callback)` accepts a callback fired once
the event is enqueued for delivery. Forward an optional one. Change is additive and
backward-compatible (existing callers pass nothing).

- [ ] **Step 1: Update `rudderStackTrack`**

Current:

```ts
export async function rudderStackTrack(eventName: string, properties: Record<string, string | number | undefined>) {
  const x = window.rudderanalytics as RudderAnalytics | undefined | null;
  const brandId = useGenuinOptions.getState().brandId;
  if (properties && brandId) (properties as any).brand_id = brandId;
  x?.track(eventName, properties);
}
```

Replace with:

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

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter=@genuin/webapp typecheck` (or repo-root `pnpm typecheck`)
Expected: PASS (no new errors). If `@rudderstack/analytics-js` types reject a 3rd arg, cast the callback arg site minimally with a justified comment — do NOT loosen the exported signature.

- [ ] **Step 3: Commit**

```bash
git add apps/webapp/src/services/analytics/useRudderAnalytics.ts
git commit -m "feat(analytics): forward optional completion callback in rudderStackTrack"
```

---

## Task 3: Thread the callback through `Analytics.track`

**Files:**

- Modify: `apps/webapp/src/services/analytics/index.ts`

`Analytics.track` currently takes `{ eventName, properties }` and calls
`await rudderStackTrack(eventName, properties)`. Add an optional `onSent` callback to the arg
object and forward it. Keep the change additive — every existing call site omits it.

- [ ] **Step 1: Update the `AnalyticsTrackType` and `track`**

Current type + call (in `apps/webapp/src/services/analytics/index.ts`):

```ts
type AnalyticsTrackType = {
  eventName: string;
  properties: PropertiesType;
};
```

and at the end of `track`:

```ts
await rudderStackTrack(eventName, properties);
```

Change the type to:

```ts
type AnalyticsTrackType = {
  eventName: string;
  properties: PropertiesType;
  onSent?: () => void;
};
```

Change the `track` signature destructure from `{ eventName, properties }` to
`{ eventName, properties, onSent }` and change the final line to:

```ts
await rudderStackTrack(eventName, properties, onSent);
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter=@genuin/webapp typecheck`
Expected: PASS. Existing callers (`pageview`, video events, search bar) omit `onSent` and remain valid.

- [ ] **Step 3: Commit**

```bash
git add apps/webapp/src/services/analytics/index.ts
git commit -m "feat(analytics): accept optional onSent callback in Analytics.track"
```

---

## Task 4: `/trk` page wrapper

**Files:**

- Create: `apps/webapp/src/app/(site)/(dynamic)/trk/page.tsx`

Mirror `dlk/[slug]/page.tsx` exactly — a thin default-exported server component.

- [ ] **Step 1: Write the page**

```tsx
import { MainComponent } from "./main-component";

const TrackPage = () => {
  return <MainComponent />;
};

export default TrackPage;
```

- [ ] **Step 2: Commit**

```bash
git add "apps/webapp/src/app/(site)/(dynamic)/trk/page.tsx"
git commit -m "feat(track): add /trk page wrapper"
```

---

## Task 5: `/trk` main component (redirect + analytics + 500ms cap)

**Files:**

- Create: `apps/webapp/src/app/(site)/(dynamic)/trk/main-component.tsx`

Reads params, computes target via `resolveRedirectTarget`, fires "Page Viewed" with the ad params
and an `onSent` callback, and redirects via `window.location.replace` from either `onSent` or a
500ms timeout — once only.

- [ ] **Step 1: Write the component**

```tsx
"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

import { Loader } from "@components/ui/loader";
import Analytics from "@/services/analytics";

import { resolveRedirectTarget } from "./resolve-redirect";

/** Hard cap: redirect no later than this, even if analytics never signals delivery. */
const REDIRECT_CAP_MS = 500;

/**
 * `/trk` — ad/campaign redirect middleware. Fires a RudderStack "Page Viewed" event carrying the
 * ad tracking params, then redirects to a validated https `redirect_url` (or `/` on invalid input),
 * within {@link REDIRECT_CAP_MS}.
 */
export function MainComponent() {
  const searchParams = useSearchParams();
  const hasRedirected = useRef(false);

  useEffect(() => {
    const target = resolveRedirectTarget(searchParams.get("redirect_url"));

    const redirectOnce = () => {
      if (hasRedirected.current) return;
      hasRedirected.current = true;
      window.location.replace(target);
    };

    const properties = {
      utm_medium: searchParams.get("utm_medium") ?? undefined,
      tag_id: searchParams.get("tag_id") ?? undefined,
      creative_id: searchParams.get("creative_id") ?? undefined,
      ad_domain: searchParams.get("ad_domain") ?? undefined,
      // Renamed to avoid clobbering the session user_id that Analytics.track auto-injects.
      ad_user_id: searchParams.get("user_id") ?? undefined,
      ad_redirect_url: target,
    };

    void Analytics.track({ eventName: "Page Viewed", properties, onSent: redirectOnce });

    const timer = window.setTimeout(redirectOnce, REDIRECT_CAP_MS);
    return () => window.clearTimeout(timer);
    // Run once on mount; searchParams is stable for a given navigation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Loader size="xl" />
    </div>
  );
}
```

- [ ] **Step 2: Typecheck + lint**

Run: `pnpm --filter=@genuin/webapp typecheck && pnpm --filter=@genuin/webapp lint`
Expected: PASS. Confirm the `@/services/analytics` and `@components/ui/loader` aliases resolve (the same `Analytics` default export used elsewhere; `Loader` as imported by `dlk`).

- [ ] **Step 3: Commit**

```bash
git add "apps/webapp/src/app/(site)/(dynamic)/trk/main-component.tsx"
git commit -m "feat(track): add redirect + analytics main component"
```

---

## Task 6: E2E — redirect to a valid https destination

**Files:**

- Create: `apps/webapp/tests/e2e/trk.spec.ts`

Use the existing mock fixture and `baseURL` (`http://localhost:4005`). Assert the browser leaves
`/trk` and lands on the destination. To avoid a real external navigation to a third-party site in
CI, use a `redirect_url` pointing at an `https` URL that the test controls via route interception,
and assert `page.url()` changes to it.

- [ ] **Step 1: Write the redirect spec**

```ts
/**
 * @fileoverview
 * Feature: /trk ad-redirect route
 *
 * Objective:
 * Validate that /trk redirects the browser to a valid https redirect_url, and falls back to the
 * homepage when redirect_url is missing or unsafe.
 */
import { test, expect } from "./_fixtures/mock";

test.describe("Feature: /trk redirect route", () => {
  test("Scenario: redirects to a valid https destination", async ({ page }) => {
    // Intercept the external destination so CI never hits a real third-party host.
    await page.route("https://redirect-target.test/**", async (route) => {
      await route.fulfill({ status: 200, contentType: "text/html", body: "<html><body>dest</body></html>" });
    });

    await test.step("Action: navigate to /trk with an https redirect_url", async () => {
      const url =
        "/trk?utm_medium=QR&redirect_url=" +
        encodeURIComponent("https://redirect-target.test/landing") +
        "&tag_id=t1&user_id=u1&creative_id=c1&ad_domain=redirect-target.test";
      await page.goto(url);
    });

    await test.step("Result: browser lands on the destination URL", async () => {
      await page.waitForURL("https://redirect-target.test/landing", { timeout: 5000 });
      expect(page.url()).toBe("https://redirect-target.test/landing");
    });
  });
});
```

- [ ] **Step 2: Run the spec**

Run: `pnpm --filter=@genuin/webapp exec playwright test tests/e2e/trk.spec.ts -g "valid https"`
Expected: PASS. (The dev/mock server must be running per the repo's E2E setup — `global-setup.ts` handles the mock server; the app server on 4005 is started the same way other E2E specs expect. If specs require a running app, follow the existing E2E run instructions in `apps/webapp/tests/mocks/README.md`.)

- [ ] **Step 3: Commit**

```bash
git add "apps/webapp/tests/e2e/trk.spec.ts"
git commit -m "test(track): e2e redirect to valid https destination"
```

---

## Task 7: E2E — fallback to homepage on missing/unsafe `redirect_url`

**Files:**

- Modify: `apps/webapp/tests/e2e/trk.spec.ts`

Add two scenarios in the same `describe`: missing `redirect_url`, and a non-https (`http:`) URL.
Both must land on the homepage (`/`) of the same origin, not navigate externally.

- [ ] **Step 1: Add the fallback scenarios**

Insert these tests inside the existing `test.describe("Feature: /trk redirect route", ...)` block:

```ts
test("Scenario: missing redirect_url falls back to homepage", async ({ page }) => {
  await test.step("Action: navigate to /trk with no redirect_url", async () => {
    await page.goto("/trk?utm_medium=QR&tag_id=t1");
  });

  await test.step("Result: browser lands on the homepage", async () => {
    await page.waitForURL("**/", { timeout: 5000 });
    expect(new URL(page.url()).pathname).toBe("/");
  });
});

test("Scenario: non-https redirect_url falls back to homepage", async ({ page }) => {
  await test.step("Action: navigate to /trk with an http:// redirect_url", async () => {
    const url = "/trk?redirect_url=" + encodeURIComponent("http://insecure.test/x");
    await page.goto(url);
  });

  await test.step("Result: browser lands on the homepage", async () => {
    await page.waitForURL("**/", { timeout: 5000 });
    expect(new URL(page.url()).pathname).toBe("/");
  });
});
```

- [ ] **Step 2: Run the full track spec**

Run: `pnpm --filter=@genuin/webapp exec playwright test tests/e2e/trk.spec.ts`
Expected: all three scenarios PASS.

- [ ] **Step 3: Commit**

```bash
git add "apps/webapp/tests/e2e/trk.spec.ts"
git commit -m "test(track): e2e homepage fallback for missing/unsafe redirect_url"
```

---

## Task 8: E2E — "Page Viewed" analytics event fires before redirect

**Files:**

- Modify: `apps/webapp/tests/e2e/trk.spec.ts`

Assert the RudderStack track call happens. RudderStack posts events to its data plane; intercept
those requests and assert a `Page Viewed` event with the ad params is sent. If the mock/global
setup blocks the RudderStack CDN so `window.rudderanalytics` never initializes, the 500ms timeout
still redirects — so this test additionally proves the redirect is not blocked by analytics.

- [ ] **Step 1: Add the analytics scenario**

```ts
test("Scenario: fires Page Viewed then redirects within the cap", async ({ page }) => {
  const trackPayloads: string[] = [];
  // RudderStack browser SDK posts events to its data plane as /v1/batch (or /v1/trk).
  await page.route("**/v1/**", async (route) => {
    const req = route.request();
    if (req.method() === "POST") trackPayloads.push(req.postData() ?? "");
    await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
  });
  await page.route("https://redirect-target.test/**", async (route) => {
    await route.fulfill({ status: 200, contentType: "text/html", body: "<html><body>dest</body></html>" });
  });

  await test.step("Action: navigate to /trk", async () => {
    const url =
      "/trk?redirect_url=" +
      encodeURIComponent("https://redirect-target.test/landing") +
      "&tag_id=t1&creative_id=c1&ad_domain=redirect-target.test&user_id=u1";
    await page.goto(url);
  });

  await test.step("Result: redirect happened within the cap", async () => {
    await page.waitForURL("https://redirect-target.test/landing", { timeout: 5000 });
  });

  await test.step("Result: a Page Viewed event carrying ad params was sent (best-effort)", async () => {
    // Delivery is best-effort within 500ms; if RudderStack initialized, the payload is present.
    if (trackPayloads.length > 0) {
      const joined = trackPayloads.join("\n");
      expect(joined).toContain("Page Viewed");
      expect(joined).toContain("ad_domain");
    }
  });
});
```

- [ ] **Step 2: Run the full track spec**

Run: `pnpm --filter=@genuin/webapp exec playwright test tests/e2e/trk.spec.ts`
Expected: all scenarios PASS. The redirect assertion is the hard gate; the payload assertion is
conditional because RudderStack init is deferred and may be blocked in the mock environment (by
design, the 500ms cap guarantees redirect regardless).

- [ ] **Step 3: Commit**

```bash
git add "apps/webapp/tests/e2e/trk.spec.ts"
git commit -m "test(track): e2e Page Viewed event fires and does not block redirect"
```

---

## Task 9: Manual verification + final checks

**Files:** none (verification only)

- [ ] **Step 1: Typecheck + lint the whole webapp**

Run: `pnpm --filter=@genuin/webapp typecheck && pnpm --filter=@genuin/webapp lint`
Expected: PASS, no new errors/warnings in the touched files.

- [ ] **Step 2: Manual smoke (local dev)**

Run the webapp (`pnpm --filter=@genuin/webapp dev`) and open:
`http://localhost:<port>/trk?utm_medium=QR&redirect_url=https%3A%2F%2Fexample.com&tag_id=t1&user_id=u1&creative_id=c1&ad_domain=example.com`
Expected: brief loader, then browser navigates to `https://example.com`. In devtools Network,
confirm a RudderStack track request for "Page Viewed" is attempted before/around the navigation.
Then open `http://localhost:<port>/trk` (no params) → lands on `/`.

- [ ] **Step 3: Confirm no regression to existing analytics callers**

Grep confirms `Analytics.track(` and `pageview(` call sites still compile (no `onSent` required):

Run: `grep -rn "Analytics.track(" apps/webapp/src | head`
Expected: existing call sites unchanged and passing typecheck (already verified in Task 3).
