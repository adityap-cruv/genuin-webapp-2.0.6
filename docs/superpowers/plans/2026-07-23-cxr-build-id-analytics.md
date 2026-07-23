# CXR Build ID in Analytics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stamp every CXR build with a `bid` (`<shortCoreHash>.<gitSha>`) and surface it on the `px-lo` beacon, the `px-script-error` pixel, and Rudderstack events, so analytics can distinguish redeployed builds without bumping the stable version.

**Architecture:** The Vite `processLoaderPlugin.writeBundle` hook computes the `bid` once (it is the only place the emitted core content hash is known) and substitutes a `__CR_BUILD_ID__` placeholder in the loader. The loader fires `px-lo` with the baked-in constant, then exposes `window.__CXR_BUILD_ID__` for the core bundle. The core's pixel-reporter and analytics read that global best-effort. `define`/`import.meta.env` cannot carry the composite id into the core because the content hash does not exist at transform time.

**Tech Stack:** Vite (Rollup), TypeScript (strict), plain-JS loader (`loader.jsx`), Vitest + jsdom.

**Spec:** `docs/superpowers/specs/2026-07-23-cxr-build-id-analytics-design.md`

**Field naming:** pixels use query param `bid`; Rudderstack uses property `build_id`.

**Conventions in this package:** 2-space indent, single quotes, semicolons, named exports, no `any` without a justified comment. Tests are colocated `*.test.ts(x)`, Vitest with `globals:false` (import `describe/it/expect` from `vitest`), raw `react-dom` (no @testing-library). Run all commands from `packages/contextual-reels`.

---

## File Structure

- **Modify** `packages/contextual-reels/vite.config.mjs` — compute `BUILD_ID` in `writeBundle`, add `__CR_BUILD_ID__` replacement, add it to the header comment.
- **Modify** `packages/contextual-reels/src/loader.jsx` — add `bid` to the `px-lo` URL, expose `window.__CXR_BUILD_ID__`, add `bid` to `buildSdkLoadPixelUrl`.
- **Modify** `packages/contextual-reels/src/observability/pixel-reporter.ts` — add `bid` param to `buildPixelUrl`, read the global best-effort.
- **Test** `packages/contextual-reels/src/observability/pixel-reporter.test.ts` — assert `bid` present / defaults to `"0"`.
- **Modify** `packages/contextual-reels/src/analytics/analytics.ts` — stamp `build_id` on `event_details` in `sendEventLog`, read the global best-effort.
- **Test** `packages/contextual-reels/src/analytics/analytics.test.ts` — assert `build_id` present / defaults when global absent.

`loader.jsx` and the Vite plugin have no unit tests (E2E-covered / build-time) per `vitest.config.ts` excludes — verified manually via build. Only the two core modules get unit tests.

---

## Task 1: Core pixel-reporter emits `bid`

**Files:**

- Modify: `packages/contextual-reels/src/observability/pixel-reporter.ts`
- Test: `packages/contextual-reels/src/observability/pixel-reporter.test.ts`

- [ ] **Step 1: Read the existing test harness**

Open `pixel-reporter.test.ts`. Note `buildPixelUrl` is NOT exported — tests fire the pixel via `PixelReporter.getInstance().report(...)` and read the resulting URL off a stubbed `globalThis.Image` (`capturedSrc`). The `describe("pixel URL shape", ...)` block (around `pixel-reporter.test.ts:102`) already sets up `capturedSrc` in a `beforeEach` and cleans `__CXR_SCRIPT_PARAMS__` in its `afterEach`. Add the new tests INSIDE that `describe("pixel URL shape")` block so they inherit that setup.

- [ ] **Step 2: Write the failing tests**

Add these two tests inside the `describe("pixel URL shape", ...)` block in `pixel-reporter.test.ts`:

```ts
it("stamps bid from window.__CXR_BUILD_ID__ on the pixel", () => {
  (window as { __CXR_BUILD_ID__?: string }).__CXR_BUILD_ID__ = "Dk3f9Xa2.b1e05db";

  PixelReporter.getInstance().report("instance-1", "init", "initialization_error");

  const url = new URL(capturedSrc);
  expect(url.searchParams.get("bid")).toBe("Dk3f9Xa2.b1e05db");
});

it("defaults bid to 0 when no build id global is present", () => {
  delete (window as { __CXR_BUILD_ID__?: string }).__CXR_BUILD_ID__;

  PixelReporter.getInstance().report("instance-1", "init", "initialization_error");

  const url = new URL(capturedSrc);
  expect(url.searchParams.get("bid")).toBe("0");
});
```

Extend the block's existing `afterEach` (currently deletes `__CXR_SCRIPT_PARAMS__` at `pixel-reporter.test.ts:115-117`) to also clear the build-id global so it can't leak into sibling tests:

```ts
afterEach(() => {
  delete (window as { __CXR_SCRIPT_PARAMS__?: string }).__CXR_SCRIPT_PARAMS__;
  delete (window as { __CXR_BUILD_ID__?: string }).__CXR_BUILD_ID__;
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `pnpm --filter=@genuin/contextual-reels test -- pixel-reporter`
Expected: FAIL — the two new tests fail because `bid` is not in the URL (`Received` string has no `bid=`).

- [ ] **Step 4: Add the best-effort global reader**

In `pixel-reporter.ts`, near the other module-private readers (e.g. just below `readHostMacroBestEffort`), add:

```ts
/**
 * Read the build id the loader stamped on `window.__CXR_BUILD_ID__`. The loader
 * sets it right after the px-lo beacon; the core reads it here so px-script-error
 * carries the same id as px-lo. Best-effort — a missing/locked-down window yields
 * `"0"`, matching how every other unresolved pixel param defaults.
 */
function readBuildIdBestEffort(): string {
  try {
    const id = (window as unknown as { __CXR_BUILD_ID__?: string }).__CXR_BUILD_ID__;
    return id && id.trim() ? id : "0";
  } catch {
    return "0";
  }
}
```

- [ ] **Step 5: Set the `bid` param in `buildPixelUrl`**

In `buildPixelUrl`, immediately after the `params.set('error_stage', stage);` line (currently `pixel-reporter.ts:177`) and before the `reason` block, add:

```ts
params.set("bid", readBuildIdBestEffort());
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `pnpm --filter=@genuin/contextual-reels test -- pixel-reporter`
Expected: PASS — all pixel-reporter tests green, including the two new ones.

- [ ] **Step 7: Commit**

```bash
git add packages/contextual-reels/src/observability/pixel-reporter.ts \
        packages/contextual-reels/src/observability/pixel-reporter.test.ts
git commit -m "feat(cxr): stamp bid on px-script-error pixel"
```

---

## Task 2: Rudderstack events carry `build_id`

**Files:**

- Modify: `packages/contextual-reels/src/analytics/analytics.ts:305-317` (`updatedEventDetails` in `sendEventLog`)
- Test: `packages/contextual-reels/src/analytics/analytics.test.ts`

- [ ] **Step 1: Read the existing sendEventLog tests**

Open `analytics.test.ts`, `describe("analytics/sendEventLog", ...)` block (around `analytics.test.ts:187`). Note the shared helpers: `DEVICE` (a `DeviceDetails`), `USER_ID`, `makeRudder()` (returns `{ track: vi.fn(), load, ready }`). Tests call `sendEventLog({ eventName, ... }, { rudderanalytics: rudder, deviceDetails: DEVICE, userId: USER_ID, windowLink, offsite: {} })` and read `rudder.track.mock.calls[0][1]`.

**Critical:** the test `"emits the canonical payload shape on track()"` (`analytics.test.ts:228`) asserts with `toHaveBeenCalledWith("tag_init", { ... event_details: { page, tag_id, video_share_string, loop_share_string, video_id } ... })` — an EXACT object match. Adding `build_id` to `event_details` will break it. That test must be updated in Step 5.

- [ ] **Step 2: Write the failing tests**

Add these two tests inside the `describe("analytics/sendEventLog", ...)` block:

```ts
it("stamps build_id from window.__CXR_BUILD_ID__ on event_details", () => {
  (window as { __CXR_BUILD_ID__?: string }).__CXR_BUILD_ID__ = "Dk3f9Xa2.b1e05db";
  const rudder = makeRudder();
  sendEventLog(
    { eventName: "tag_init", tagDetails: { tag_id: "t-1" } },
    {
      rudderanalytics: rudder,
      deviceDetails: DEVICE,
      userId: USER_ID,
      windowLink: "https://host.example",
      offsite: {},
    }
  );
  const payload = rudder.track.mock.calls[0]?.[1] as { event_details: Record<string, unknown> };
  expect(payload.event_details.build_id).toBe("Dk3f9Xa2.b1e05db");
});

it("defaults build_id to 0 on event_details when no build id global is present", () => {
  delete (window as { __CXR_BUILD_ID__?: string }).__CXR_BUILD_ID__;
  const rudder = makeRudder();
  sendEventLog(
    { eventName: "tag_init", tagDetails: { tag_id: "t-1" } },
    {
      rudderanalytics: rudder,
      deviceDetails: DEVICE,
      userId: USER_ID,
      windowLink: "https://host.example",
      offsite: {},
    }
  );
  const payload = rudder.track.mock.calls[0]?.[1] as { event_details: Record<string, unknown> };
  expect(payload.event_details.build_id).toBe("0");
});
```

Extend the block's `afterEach` (currently only `vi.restoreAllMocks()` at `analytics.test.ts:192`) to clear the global:

```ts
afterEach(() => {
  vi.restoreAllMocks();
  delete (window as { __CXR_BUILD_ID__?: string }).__CXR_BUILD_ID__;
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `pnpm --filter=@genuin/contextual-reels test -- analytics`
Expected: FAIL — `payload.event_details.build_id` is `undefined`, not the expected string.

- [ ] **Step 4: Add the best-effort reader**

In `analytics.ts`, near the top-level helpers (module scope, above `sendEventLog`), add:

```ts
/**
 * Read the build id the loader stamped on `window.__CXR_BUILD_ID__` so every
 * Rudderstack event is attributable to a specific deployed build (the stable
 * version string never changes between redeploys). Best-effort — defaults to
 * `"0"` when the global is absent (SSR/tests/locked-down window).
 */
function readBuildId(): string {
  try {
    const id = (window as unknown as { __CXR_BUILD_ID__?: string }).__CXR_BUILD_ID__;
    return id && id.trim() ? id : "0";
  } catch {
    return "0";
  }
}
```

- [ ] **Step 4b: Fix the pre-existing canonical-payload test**

The `"emits the canonical payload shape on track()"` test (`analytics.test.ts:228`) does not set the global, so `build_id` will be `"0"` there. Add `build_id: "0"` to its expected `event_details` object so the exact `toHaveBeenCalledWith` still matches. Put it as the first key in that object (matching the source order where `build_id` precedes `page`):

```ts
    expect(rudder.track).toHaveBeenCalledWith("tag_init", {
      event_name: "tag_init",
      event_details: {
        build_id: "0",
        page: "https://host.example",
        tag_id: "t-1",
        video_share_string: undefined,
        loop_share_string: "",
        video_id: undefined,
      },
      device_details: DEVICE,
      user_details: { user_id: USER_ID },
```

Also scan the rest of `analytics.test.ts` for ANY other `toHaveBeenCalledWith`/`toEqual` that asserts a full `event_details` object (grep the file for `event_details:` inside expectations). Each such assertion that omits the global gets `build_id: "0"` added. Assertions that only check individual keys (`payload.event_details.tag_id`) need no change.

- [ ] **Step 5: Stamp `build_id` on `updatedEventDetails`**

In `sendEventLog`, in the `updatedEventDetails` object literal (currently `analytics.ts:305`), add `build_id` as the first own property so caller-supplied `eventDetails` still wins on any collision. It goes right after the `...macroBlocks.event,` spread:

```ts
const updatedEventDetails: Record<string, unknown> = {
  // Host macros go first so caller-supplied eventDetails / offsite still win.
  ...macroBlocks.event,
  build_id: readBuildId(),
  ...eventDetails,
  page,
  ...(tagDetails.tag_id !== undefined ? { tag_id: tagDetails.tag_id } : {}),
  ...(videoDetails.video?.slug ? { video_share_string: videoDetails.video.slug } : {}),
  loop_share_string: videoDetails.loop?.share_string ?? "",
  ...(videoDetails.video?.id ? { video_id: videoDetails.video.id } : {}),
};
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `pnpm --filter=@genuin/contextual-reels test -- analytics`
Expected: PASS — all analytics tests green, including the two new ones.

- [ ] **Step 7: Commit**

```bash
git add packages/contextual-reels/src/analytics/analytics.ts \
        packages/contextual-reels/src/analytics/analytics.test.ts
git commit -m "feat(cxr): stamp build_id on Rudderstack events"
```

---

## Task 3: Loader fires `bid` on px-lo, exposes the global, stamps px-script-error

**Files:**

- Modify: `packages/contextual-reels/src/loader.jsx`

No unit test — `loader.jsx` is excluded from coverage and validated by the build (Task 4) and E2E. Each step is a mechanical edit verified by reading the diff.

- [ ] **Step 1: Add the `__CR_BUILD_ID__` constant**

In `loader.jsx`, alongside the other build-time placeholder constants (near `var CXR_VERSION = "1.0.0";` / `var PIXEL_URL = "__CR_PIXEL_URL__";`), add:

```js
var BUILD_ID = "__CR_BUILD_ID__";
```

Place it directly after the `PIXEL_URL` declaration (`loader.jsx:11`) so it exists before the `px-lo` block that uses it.

- [ ] **Step 2: Add `bid` to the px-lo URL**

In the `px-lo` block (`loader.jsx:29-41`), change the URL construction. Current:

```js
var pxLoUrl = PIXEL_URL + "/1/1/px-lo";
```

Replace with (guard the placeholder so an unreplaced `__CR_BUILD_ID__` never leaks into the URL — fall back to `0`):

```js
var buildId = BUILD_ID && BUILD_ID.indexOf("__CR_") === -1 ? BUILD_ID : "0";
var pxLoUrl = PIXEL_URL + "/1/1/px-lo?bid=" + encodeURIComponent(buildId);
```

- [ ] **Step 3: Expose `window.__CXR_BUILD_ID__` after the px-lo block**

Immediately after the closing of the `px-lo` `try { ... } catch { ... }` block (after `loader.jsx:41`) and before `var CXR_VERSION`, add a wrapped assignment so the core can read it:

```js
// Expose the build id for the core bundle (pixel-reporter + analytics). Set
// AFTER px-lo — px-lo uses the baked-in BUILD_ID constant directly because it
// must be the first statement and this global isn't set yet. Best-effort: a
// failure here must never break bootstrap.
try {
  window.__CXR_BUILD_ID__ = BUILD_ID && BUILD_ID.indexOf("__CR_") === -1 ? BUILD_ID : "0";
} catch {
  // Never let build-id exposure break bootstrap.
}
```

- [ ] **Step 4: Add `bid` to the sdk_load error pixel**

In `buildSdkLoadPixelUrl` (`loader.jsx:146-167`), after the existing `params.set("error_stage", "sdk_load");` line (`loader.jsx:160`), add — using the same placeholder guard:

```js
params.set("bid", BUILD_ID && BUILD_ID.indexOf("__CR_") === -1 ? BUILD_ID : "0");
```

- [ ] **Step 5: Verify the edits read correctly**

Re-read the changed regions of `loader.jsx`. Confirm: (a) `BUILD_ID` is declared before the px-lo block, (b) px-lo URL is `.../px-lo?bid=...`, (c) the global is set after px-lo, (d) `buildSdkLoadPixelUrl` sets `bid`. No test run here — the build in Task 4 exercises the placeholder replacement.

- [ ] **Step 6: Commit**

```bash
git add packages/contextual-reels/src/loader.jsx
git commit -m "feat(cxr): loader fires bid on px-lo and exposes __CXR_BUILD_ID__"
```

---

## Task 4: Vite plugin computes and injects `BUILD_ID`

**Files:**

- Modify: `packages/contextual-reels/vite.config.mjs:31-64` (`processLoaderPlugin`)

- [ ] **Step 1: Confirm the current writeBundle shape**

Open `vite.config.mjs`. Confirm `processLoaderPlugin.writeBundle` resolves `coreFile` (a string like `gen_ext-Dk3f9Xa2.js`), builds `header`, then does the `.replace(...)` chain ending in `__CR_PIXEL_URL__`, and writes `header + loaderCode`.

- [ ] **Step 2: Add the imports for git lookup**

At the top of `vite.config.mjs`, the `execSync` from `child_process` is needed. Add to the existing imports (after `import fs from "fs";`):

```js
import { execSync } from "child_process";
```

- [ ] **Step 3: Compute `BUILD_ID` in writeBundle**

In `writeBundle`, immediately after the `if (!coreFile) { throw ... }` block (`vite.config.mjs:43`), add:

```js
// Short content hash of the emitted core bundle (gen_ext-<hash>.js) — the
// artifact's identity; changes iff the shipped bytes change.
const hashMatch = coreFile.match(/^gen_ext-([A-Za-z0-9_-]+)\.js$/);
const shortCoreHash = (hashMatch ? hashMatch[1] : "unknown").slice(0, 8);

// Short git SHA for source provenance. Guarded: a build with no git
// available still succeeds, tagged `nogit`.
let gitSha = "nogit";
try {
  gitSha = execSync("git rev-parse --short HEAD", { cwd: __dirname }).toString().trim() || "nogit";
} catch {
  gitSha = "nogit";
}

const BUILD_ID = `${shortCoreHash}.${gitSha}`;
```

- [ ] **Step 4: Add `BUILD_ID` to the header and the replacement chain**

Change the `header` line (`vite.config.mjs:52`) to include the build id:

```js
const header = `/** Genuin Contextual Reels loader (env: ${nodeEnv}, build: ${BUILD_ID}) — built ${new Date().toISOString()} */\n`;
```

Add the placeholder replacement to the existing chain (after the `__CR_PIXEL_URL__` replace, `vite.config.mjs:58`):

```js
      .replace(/__CR_BUILD_ID__/g, BUILD_ID);
```

Move the `;` — the chain currently ends `.replace(/__CR_PIXEL_URL__/g, PIXEL_URL);`. Make `__CR_PIXEL_URL__` not the terminal call:

```js
loaderCode = loaderCode
  .replace(/__CR_CORE_FILENAME__/g, coreFile)
  .replace(/__CR_CSS_FILENAME__/g, cssFile ?? "")
  .replace(/__CR_CDN_BASE__/g, CDN_BASE)
  .replace(/__CR_PIXEL_URL__/g, PIXEL_URL)
  .replace(/__CR_BUILD_ID__/g, BUILD_ID);
```

- [ ] **Step 5: Build and verify the placeholder is replaced**

Run: `pnpm --filter=@genuin/contextual-reels build`
Expected: build succeeds.

Then inspect the emitted loader:

Run: `grep -o 'px-lo?bid=[^"]*' packages/contextual-reels/dist/gen_ext.min.js; grep -o '__CXR_BUILD_ID__ = [^;]*' packages/contextual-reels/dist/gen_ext.min.js; grep -c '__CR_BUILD_ID__' packages/contextual-reels/dist/gen_ext.min.js`
Expected: the `px-lo?bid=` line shows a real `<hash>.<sha>` value (not `__CR_BUILD_ID__`, not `0`); the global assignment shows the same id; the `grep -c` for the raw placeholder prints `0` (fully replaced).

Also confirm the header:

Run: `head -1 packages/contextual-reels/dist/gen_ext.min.js`
Expected: contains `build: <hash>.<sha>`.

- [ ] **Step 6: Commit**

```bash
git add packages/contextual-reels/vite.config.mjs
git commit -m "build(cxr): compute and inject BUILD_ID (coreHash.gitSha) into loader"
```

---

## Task 5: Full verification

- [ ] **Step 1: Run the full package test suite**

Run: `pnpm --filter=@genuin/contextual-reels test`
Expected: PASS — full suite green, coverage gates satisfied (the two touched core modules keep 100% per `vitest.config.ts`).

- [ ] **Step 2: Typecheck and lint**

Run: `pnpm --filter=@genuin/contextual-reels typecheck && pnpm --filter=@genuin/contextual-reels lint`
Expected: no errors. (If `typecheck`/`lint` scripts differ, use the package's actual script names from its `package.json`.)

- [ ] **Step 3: Final build sanity**

Run: `pnpm --filter=@genuin/contextual-reels build && grep -o 'px-lo?bid=[^"]*' packages/contextual-reels/dist/gen_ext.min.js`
Expected: build succeeds and prints a real `bid` value.

- [ ] **Step 4: Confirm nothing else regressed**

Run: `git log --oneline -6`
Expected: the four feat/build commits + the spec commit, in order. Working tree clean (`git status`).
