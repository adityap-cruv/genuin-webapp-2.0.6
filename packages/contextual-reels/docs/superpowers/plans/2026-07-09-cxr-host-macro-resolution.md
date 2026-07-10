# CXR Host Macro Resolution Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Capture the host-resolved macros passed on the CXR loader `<script src>` (appn, ifa, country, gdpr, us_privacy, tagId, …) and propagate them to ad-URL macro substitution and analytics events.

**Architecture:** A new `hostMacros.ts` module parses the existing `window.__CXR_SCRIPT_PARAMS__` bag once into a cleaned map (empty and unresolved `{brace}` literals dropped). The ad-URL resolver (`adUrlMacros.ts`) gains a generic host-macro token pass alongside `[PAGE_URL]`. The analytics assembler (`analytics.ts`) merges macros into `device_details` / `user_details` / `event_details` by meaning. `index.jsx` prefers a loader-src `tagId` over `data-tag-id`.

**Tech Stack:** TypeScript (strict), Vitest + jsdom, Vite. Package: `packages/contextual-reels`.

**Working directory for all commands:** `packages/contextual-reels`. Run tests with `npx vitest run <path>`.

**Two deferred maps** (spec §Deferred): the ad-URL placeholder token map and the exact analytics field names need backend/ad-ops and analytics-consumer confirmation. This plan uses documented, explicitly-labelled default maps in one constants block each so a single edit updates them once confirmed. Building them now does not block.

---

### Task 1: `hostMacros` capture module

**Files:**
- Create: `src/hostMacros.ts`
- Test: `src/hostMacros.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/hostMacros.test.ts
import { afterEach, describe, expect, it, vi } from "vitest";

const SCRIPT_PARAMS = "__CXR_SCRIPT_PARAMS__";

/** Load the module fresh so its once-captured singleton re-reads the window. */
async function loadFresh() {
  vi.resetModules();
  return import("./hostMacros");
}

afterEach(() => {
  delete (window as Record<string, unknown>)[SCRIPT_PARAMS];
  vi.resetModules();
});

describe("hostMacros", () => {
  it("parses populated params into a map", async () => {
    (window as Record<string, unknown>)[SCRIPT_PARAMS] =
      "tagId=abc&appn=My%20App&ifa=123&country=USA";
    const { parseHostMacros } = await loadFresh();
    expect(parseHostMacros()).toEqual({
      tagId: "abc",
      appn: "My App",
      ifa: "123",
      country: "USA",
    });
  });

  it("drops empty values", async () => {
    (window as Record<string, unknown>)[SCRIPT_PARAMS] = "appn=Foo&appv=&gdpr_consent=";
    const { parseHostMacros } = await loadFresh();
    expect(parseHostMacros()).toEqual({ appn: "Foo" });
  });

  it("drops unresolved braced literals", async () => {
    (window as Record<string, unknown>)[SCRIPT_PARAMS] = "appv=%7Bappv%7D&appn=Real";
    const { parseHostMacros } = await loadFresh();
    // %7Bappv%7D decodes to {appv} — treated as absent.
    expect(parseHostMacros()).toEqual({ appn: "Real" });
  });

  it("returns an empty map when the param bag is absent", async () => {
    const { parseHostMacros } = await loadFresh();
    expect(parseHostMacros()).toEqual({});
  });

  it("getHostMacro reads a single cleaned value", async () => {
    (window as Record<string, unknown>)[SCRIPT_PARAMS] = "ifa=xyz&appv=";
    const { getHostMacro } = await loadFresh();
    expect(getHostMacro("ifa")).toBe("xyz");
    expect(getHostMacro("appv")).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/hostMacros.test.ts`
Expected: FAIL — `Failed to resolve import "./hostMacros"`.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/hostMacros.ts
/**
 * Host macro capture.
 *
 * CXR runs inside an app webview and cannot resolve app / user / geo / privacy
 * context itself. The host resolves these values and passes them on the loader
 * `<script src>` query string, which the loader merges into
 * `window.__CXR_SCRIPT_PARAMS__`. This module parses that bag once into a
 * cleaned, typed map consumed by ad-URL substitution and analytics.
 */

/** Cleaned host macro map — every value is a non-empty, resolved string. */
export interface HostMacros {
  readonly [key: string]: string;
}

/** True for an unresolved host placeholder the host never substituted, e.g. `{appv}`. */
function isUnresolved(value: string): boolean {
  return /^\{.*\}$/.test(value.trim());
}

/**
 * Parse `window.__CXR_SCRIPT_PARAMS__` into a cleaned macro map. Empty values
 * and unresolved braced literals (`{appv}`) are dropped so downstream payloads
 * never carry placeholder noise. Exported for tests; production reads the
 * {@link hostMacros} singleton.
 */
export function parseHostMacros(): HostMacros {
  if (typeof window === "undefined") return {};
  const raw = (window as { __CXR_SCRIPT_PARAMS__?: string }).__CXR_SCRIPT_PARAMS__;
  if (!raw) return {};

  const out: Record<string, string> = {};
  for (const [key, value] of new URLSearchParams(raw)) {
    if (!value || isUnresolved(value)) continue;
    out[key] = value;
  }
  return out;
}

/**
 * Captured once at module load. Mirrors the singleton pattern used by
 * `userId` / `windowLink`.
 */
export const hostMacros: HostMacros = parseHostMacros();

/**
 * Read a single cleaned host macro.
 *
 * @param name The macro name as it appears on the loader URL (e.g. `ifa`).
 * @returns The cleaned value, or `undefined` when absent / empty / unresolved.
 */
export function getHostMacro(name: string): string | undefined {
  return hostMacros[name];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/hostMacros.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/hostMacros.ts src/hostMacros.test.ts
git commit -m "feat(cxr): capture host macros from loader script params"
```

---

### Task 2: Host-macro token substitution in ad URLs

**Files:**
- Modify: `src/ads/adUrlMacros.ts`
- Test: `src/ads/adUrlMacros.test.ts` (append)

Extends the existing `[PAGE_URL]` substitution with a generic host-macro token pass. `resolveAdUrlMacros` gains an optional `macros` argument (defaults to the `hostMacros` singleton) so tests inject a fixed map and production picks it up automatically. `resolveVideoAdMacros` forwards the same map.

- [ ] **Step 1: Write the failing test**

Append to `src/ads/adUrlMacros.test.ts`:

```ts
import { HOST_URL_MACRO_TOKENS } from "./adUrlMacros";

describe("resolveAdUrlMacros — host macro tokens", () => {
  const MACROS = { ifa: "abc-123", us_privacy: "1---", gdpr: "0", country: "USA" };

  it("substitutes a host token with the URL-encoded macro value", () => {
    const url = "https://ads.example.com/vast?ifa=[IFA]&priv=[US_PRIVACY]";
    const result = resolveAdUrlMacros(url, "https://p.com/a", MACROS);
    expect(result).toBe("https://ads.example.com/vast?ifa=abc-123&priv=1---");
  });

  it("substitutes multiple occurrences of the same token", () => {
    const url = "https://ads.example.com?a=[IFA]&b=[IFA]";
    const result = resolveAdUrlMacros(url, "", MACROS);
    expect(result).toBe("https://ads.example.com?a=abc-123&b=abc-123");
  });

  it("leaves a token whose macro is absent untouched", () => {
    const url = "https://ads.example.com?loc=[APP_LOC]";
    const result = resolveAdUrlMacros(url, "", MACROS);
    expect(result).toBe("https://ads.example.com?loc=[APP_LOC]");
  });

  it("resolves [PAGE_URL] and host tokens together", () => {
    const url = "https://ads.example.com?u=[PAGE_URL]&ifa=[IFA]";
    const result = resolveAdUrlMacros(url, "https://p.com/a", MACROS);
    expect(result).toBe(
      `https://ads.example.com?u=${encodeURIComponent("https://p.com/a")}&ifa=abc-123`
    );
  });

  it("exposes the documented token map keyed by ad-URL token", () => {
    // Guards the deferred token map: token -> macro name.
    expect(HOST_URL_MACRO_TOKENS["[IFA]"]).toBe("ifa");
    expect(HOST_URL_MACRO_TOKENS["[US_PRIVACY]"]).toBe("us_privacy");
  });

  it("forwards host macros through resolveVideoAdMacros object.url", () => {
    const result = resolveVideoAdMacros(
      { url: "https://ads.com?ifa=[IFA]" },
      "https://p.com/a",
      MACROS
    );
    expect((result as { url: string }).url).toBe("https://ads.com?ifa=abc-123");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/ads/adUrlMacros.test.ts`
Expected: FAIL — `HOST_URL_MACRO_TOKENS` is not exported / `resolveAdUrlMacros` ignores the third arg.

- [ ] **Step 3: Write minimal implementation**

In `src/ads/adUrlMacros.ts`, add the import at the top (after the file's doc comment):

```ts
import { hostMacros, type HostMacros } from "@cxr/hostMacros";
```

Add the token map above `resolveAdUrlMacros`:

```ts
/**
 * Ad-URL placeholder token → host macro name.
 *
 * DEFERRED (see design spec §Deferred): the exact tokens the feed's ad URLs use
 * must be confirmed with backend / ad-ops. Update THIS map when confirmed — it
 * is the single source of truth for host-macro substitution in ad URLs.
 */
export const HOST_URL_MACRO_TOKENS: Readonly<Record<string, string>> = {
  "[IFA]": "ifa",
  "[APP_BUNDLE]": "appb",
  "[APP_NAME]": "appn",
  "[APP_STORE_URL]": "appsu",
  "[APP_ID]": "appsi",
  "[APP_CAT]": "appc",
  "[COUNTRY]": "country",
  "[APP_LOC]": "loc",
  "[LAT]": "loclat",
  "[LON]": "loclong",
  "[DNT]": "dnt",
  "[GDPR]": "gdpr",
  "[GDPR_CONSENT]": "gdpr_consent",
  "[US_PRIVACY]": "us_privacy",
};

/** Escape a token for safe use in a `RegExp` (tokens contain `[` and `]`). */
function escapeRegExp(token: string): string {
  return token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Replace host-macro tokens (e.g. `[IFA]`) with their URL-encoded macro values.
 * Tokens whose macro is absent are left untouched so an unfilled token is never
 * silently blanked.
 */
function resolveHostMacroTokens(url: string, macros: HostMacros): string {
  let result = url;
  for (const [token, macroName] of Object.entries(HOST_URL_MACRO_TOKENS)) {
    const value = macros[macroName];
    if (value === undefined) continue;
    if (!result.includes(token)) continue;
    result = result.replace(new RegExp(escapeRegExp(token), "g"), encodeURIComponent(value));
  }
  return result;
}
```

Replace the existing `resolveAdUrlMacros` with (keeps `[PAGE_URL]` behavior, adds the host pass, adds the defaulted `macros` param):

```ts
export function resolveAdUrlMacros(url: string, pageUrl: string, macros: HostMacros = hostMacros): string {
  let result = url;
  if (result.includes("[PAGE_URL]")) {
    result = result.replaceAll("[PAGE_URL]", encodeURIComponent(pageUrl));
  }
  result = resolveHostMacroTokens(result, macros);
  return result;
}
```

Update `resolveVideoAdMacros` to accept and forward `macros`. Replace its signature and the three internal calls:

```ts
export function resolveVideoAdMacros(
  videoAd: unknown,
  pageUrl: string,
  macros: HostMacros = hostMacros
): unknown {
  if (!videoAd) return videoAd;

  if (typeof videoAd === "string") {
    return resolveAdUrlMacros(videoAd, pageUrl, macros);
  }

  if (Array.isArray(videoAd)) {
    return videoAd.map((entry) => resolveVideoAdMacros(entry, pageUrl, macros));
  }

  if (typeof videoAd === "object") {
    const ad = videoAd as Record<string, unknown>;
    const patched: Record<string, unknown> = { ...ad };
    for (const key of ["url", "ads_url", "vastUrl"] as const) {
      if (typeof ad[key] === "string") {
        patched[key] = resolveAdUrlMacros(ad[key] as string, pageUrl, macros);
      }
    }
    return patched;
  }

  return videoAd;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/ads/adUrlMacros.test.ts`
Expected: PASS (all existing tests + 6 new). Existing 2-arg calls still compile (third arg defaults to `hostMacros`).

- [ ] **Step 5: Commit**

```bash
git add src/ads/adUrlMacros.ts src/ads/adUrlMacros.test.ts
git commit -m "feat(cxr): substitute host macro tokens in ad URLs"
```

---

### Task 3: Merge host macros into analytics payloads

**Files:**
- Modify: `src/analytics/analytics.ts`
- Test: `src/analytics/analytics.test.ts` (append)

`sendEventLog` is the single assembler for every event's `device_details` / `user_details` / `event_details`. Merging host macros here means every event picks them up without touching call sites. Macros are read from a defaulted dependency so tests inject a fixed map.

- [ ] **Step 1: Write the failing test**

Append to `src/analytics/analytics.test.ts`:

```ts
import { buildHostMacroBlocks } from "./analytics";

describe("buildHostMacroBlocks", () => {
  it("splits macros into device / user / consent blocks by meaning", () => {
    const macros = {
      appn: "My App",
      appv: "1.1",
      appb: "com.x.y",
      ifa: "abc",
      deviceid: "dev-1",
      appsi: "999",
      country: "USA",
      loc: "New York",
      loclat: "40.7",
      loclong: "-73.9",
      gdpr: "0",
      gdpr_consent: "",
      us_privacy: "1---",
      dnt: "0",
    };
    const blocks = buildHostMacroBlocks(macros);
    expect(blocks.device).toEqual({
      app_name: "My App",
      app_version: "1.1",
      app_bundle: "com.x.y",
      app_country: "USA",
      app_loc: "New York",
      app_lat: "40.7",
      app_long: "-73.9",
    });
    expect(blocks.user).toEqual({ ifa: "abc", deviceid: "dev-1", app_store_id: "999" });
    expect(blocks.event).toEqual({ gdpr: "0", us_privacy: "1---", dnt: "0" });
  });

  it("omits keys whose macro is absent", () => {
    const blocks = buildHostMacroBlocks({ ifa: "abc" });
    expect(blocks.device).toEqual({});
    expect(blocks.user).toEqual({ ifa: "abc" });
    expect(blocks.event).toEqual({});
  });
});

describe("sendEventLog — host macros", () => {
  it("stamps host macro blocks onto the tracked payload", () => {
    const tracked: Array<{ name: string; payload: Record<string, unknown> }> = [];
    const rudder = { track: (name: string, payload: Record<string, unknown>) => tracked.push({ name, payload }) };

    sendEventLog(
      { eventName: "Ad Requested" },
      {
        rudderanalytics: rudder,
        deviceDetails: { device_type: "mobile", os_type: "ios", geoip: {}, user_agent: "ua" },
        userId: "u1",
        windowLink: "https://p.com",
        offsite: {},
        hostMacros: { appn: "My App", ifa: "abc", us_privacy: "1---" },
      }
    );

    const payload = tracked[0].payload;
    expect((payload.device_details as Record<string, unknown>).app_name).toBe("My App");
    expect((payload.user_details as Record<string, unknown>).ifa).toBe("abc");
    expect((payload.event_details as Record<string, unknown>).us_privacy).toBe("1---");
    // IP-based geoip is left untouched (kept separate from host geo).
    expect((payload.device_details as Record<string, unknown>).geoip).toEqual({});
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/analytics/analytics.test.ts`
Expected: FAIL — `buildHostMacroBlocks` not exported; `SendEventLogDeps` has no `hostMacros`.

- [ ] **Step 3: Write minimal implementation**

In `src/analytics/analytics.ts`, add the import at the top:

```ts
import { hostMacros as defaultHostMacros, type HostMacros } from "@cxr/hostMacros";
```

Add the builder above `sendEventLog`:

```ts
/** Host macros split into the three analytics blocks they belong in. */
export interface HostMacroBlocks {
  device: Record<string, string>;
  user: Record<string, string>;
  event: Record<string, string>;
}

/**
 * Split captured host macros into analytics blocks by meaning.
 *
 * DEFERRED (see design spec §Deferred): the exact target field names must be
 * confirmed with the analytics consumers. Update THIS function when confirmed —
 * it is the single source of truth for host-macro analytics placement. Host geo
 * (country/loc/lat/long) lands in its OWN device fields and never overwrites the
 * IP-based `geoip` block.
 */
export function buildHostMacroBlocks(macros: HostMacros): HostMacroBlocks {
  const pick = (target: Record<string, string>, field: string, macro: string): void => {
    const value = macros[macro];
    if (value !== undefined) target[field] = value;
  };

  const device: Record<string, string> = {};
  pick(device, "app_name", "appn");
  pick(device, "app_version", "appv");
  pick(device, "app_bundle", "appb");
  pick(device, "app_country", "country");
  pick(device, "app_loc", "loc");
  pick(device, "app_lat", "loclat");
  pick(device, "app_long", "loclong");

  const user: Record<string, string> = {};
  pick(user, "ifa", "ifa");
  pick(user, "deviceid", "deviceid");
  pick(user, "app_store_id", "appsi");

  const event: Record<string, string> = {};
  pick(event, "gdpr", "gdpr");
  pick(event, "gdpr_consent", "gdpr_consent");
  pick(event, "us_privacy", "us_privacy");
  pick(event, "dnt", "dnt");

  return { device, user, event };
}
```

Add `hostMacros` to `SendEventLogDeps` (optional so existing callers/tests keep compiling):

```ts
export interface SendEventLogDeps {
  rudderanalytics: RudderstackLike | undefined;
  deviceDetails: DeviceDetails;
  userId: string;
  windowLink: string | undefined;
  offsite: OffsitePropertiesConfig;
  /** Captured host macros. Defaults to the module singleton. */
  hostMacros?: HostMacros;
}
```

In `sendEventLog`, after `const { deviceDetails, userId, windowLink, offsite } = deps;` compute the blocks and fold them in. Replace the block-building section so host blocks merge FIRST (offsite still wins last, matching current precedence):

```ts
  const macroBlocks = buildHostMacroBlocks(deps.hostMacros ?? defaultHostMacros);

  const updatedEventDetails: Record<string, unknown> = {
    ...macroBlocks.event,
    ...eventDetails,
    page: windowLink,
    ...(tagDetails.tag_id !== undefined ? { tag_id: tagDetails.tag_id } : {}),
    ...(videoDetails.video?.slug ? { video_share_string: videoDetails.video.slug } : {}),
    loop_share_string: videoDetails.loop?.share_string ?? "",
    ...(videoDetails.video?.id ? { video_id: videoDetails.video.id } : {}),
  };

  const mergedEventDetails = deepMergeOverwrite(
    updatedEventDetails,
    offsite.event_details ?? offsite.eventDetails ?? {}
  );

  const mergedDeviceDetails = deepMergeOverwrite(
    { ...(deviceDetails as unknown as Record<string, unknown>), ...macroBlocks.device },
    offsite.device_details ?? offsite.deviceDetails ?? {}
  );

  const mergedUserDetails = deepMergeOverwrite(
    { user_id: userId, ...macroBlocks.user },
    offsite.user_details ?? offsite.userDetails ?? {}
  );
```

Then update the two `window`-reading callers so they pass the singleton. In `sendEventLogFromGlobals`, add `hostMacros: defaultHostMacros` to the `sendEventLog(args, {...})` deps object.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/analytics/analytics.test.ts`
Expected: PASS (existing + new). If a snapshot in `__snapshots__/rudderstack.test.ts.snap` covers a payload with no host macros present, it is unaffected (empty blocks add no keys).

- [ ] **Step 5: Run the analytics + rudderstack suites to confirm no snapshot drift**

Run: `npx vitest run src/analytics`
Expected: PASS. If a snapshot fails ONLY because empty host blocks changed nothing, there is a real bug — investigate; do not blindly update snapshots.

- [ ] **Step 6: Commit**

```bash
git add src/analytics/analytics.ts src/analytics/analytics.test.ts
git commit -m "feat(cxr): merge host macros into analytics payload blocks"
```

---

### Task 4: Wire `AnalyticsProvider` buffered flush to pass the singleton

**Files:**
- Modify: `src/providers/AnalyticsProvider.tsx:121-137`
- Test: `src/providers/AnalyticsProvider.test.tsx` (verify existing pass)

The provider's buffered flush calls `sendEventLog` with an explicit deps object that does NOT yet include `hostMacros`. Because the field is optional and `sendEventLog` falls back to the singleton, this still works — but wire it explicitly for clarity and testability.

- [ ] **Step 1: Add the import**

At the top of `src/providers/AnalyticsProvider.tsx`, add:

```ts
import { hostMacros } from "@cxr/hostMacros";
```

- [ ] **Step 2: Pass it in the flush deps**

In the `bufferRef.current.flush(...)` callback's `sendEventLog` deps object (currently ending with `offsite: readOffsite(),`), add:

```ts
            offsite: readOffsite(),
            hostMacros,
```

- [ ] **Step 3: Run the provider test to confirm no regression**

Run: `npx vitest run src/providers/AnalyticsProvider.test.tsx`
Expected: PASS (unchanged behavior — `hostMacros` is empty in jsdom without `__CXR_SCRIPT_PARAMS__`).

- [ ] **Step 4: Commit**

```bash
git add src/providers/AnalyticsProvider.tsx
git commit -m "chore(cxr): pass host macros singleton through analytics flush"
```

---

### Task 5: Prefer loader-src `tagId` over `data-tag-id`

**Files:**
- Modify: `src/index.jsx:145`
- Test: none (entry point is E2E-only per vitest.config coverage excludes); verified by build + manual reasoning.

Assume single widget per page (design decision): if the loader src carries `tagId`, it is the tag source of truth; else fall back to `data-tag-id`.

- [ ] **Step 1: Add the import**

At the top of `src/index.jsx`, add to the existing `@cxr/config` import or as a new import. The loader-src param is already captured; read it via `getHostMacro`:

```jsx
import { getHostMacro } from "@cxr/hostMacros";
```

- [ ] **Step 2: Change the tagId resolution**

Replace the line:

```jsx
    const tagId = node.getAttribute("data-tag-id");
```

with:

```jsx
    // Single widget per page (see host-macro design): the loader-src `tagId`
    // wins when present; otherwise fall back to the per-div data-tag-id.
    const tagId = getHostMacro("tagId") ?? node.getAttribute("data-tag-id");
```

- [ ] **Step 3: Build to confirm it compiles**

Run: `npm run build`
Expected: build succeeds (no type errors from the new import).

- [ ] **Step 4: Commit**

```bash
git add src/index.jsx
git commit -m "feat(cxr): prefer loader-src tagId over data-tag-id"
```

---

### Task 6: Full verification pass

**Files:** none (verification only).

- [ ] **Step 1: Run the full package test suite**

Run: `npx vitest run`
Expected: PASS — all suites green.

- [ ] **Step 2: Typecheck**

Run: `npm run build` (Rollup/Vite build typechecks the TS entry)
Expected: no type errors.

- [ ] **Step 3: Lint the changed files**

Run: `npx eslint src/hostMacros.ts src/ads/adUrlMacros.ts src/analytics/analytics.ts src/providers/AnalyticsProvider.tsx src/index.jsx`
Expected: no errors.

- [ ] **Step 4: Update the design spec's deferred section if either map got confirmed**

If backend/ad-ops confirmed the ad-URL token map or analytics confirmed field names during implementation, update `HOST_URL_MACRO_TOKENS` (Task 2) and/or `buildHostMacroBlocks` (Task 3), and note the confirmation in the design spec's Deferred section.

- [ ] **Step 5: Final commit if any verification fixes were made**

```bash
git add -A
git commit -m "chore(cxr): verification fixes for host macro resolution"
```

---

## Self-Review Notes

- **Spec coverage:** capture (Task 1), ad-URL substitution (Task 2), analytics split incl. geo-kept-separate (Task 3+4), tagId precedence (Task 5), deferred maps isolated to single constants (Tasks 2/3). All spec sections mapped.
- **Type consistency:** `HostMacros` (Task 1) used verbatim in Tasks 2–3; `HOST_URL_MACRO_TOKENS` and `buildHostMacroBlocks`/`HostMacroBlocks` names consistent across their tasks and tests; `hostMacros` singleton import consistent in Tasks 2,3,4,5.
- **No override of existing resolution:** `device_details.geoip`, `userId`, `[PAGE_URL]`, `gen_variant`, `purl` untouched — verified against conflict analysis in the spec.
