# CXR Fullscreen Support Detection + Redirect Fallback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a single `isFullScreenSupported` identifier to `FullScreenProvider` and
centralize the enter-fullscreen decision logic so webviews and API-less iframes
redirect instead of expanding.

**Architecture:** A new pure `isWebView(ua?)` UA-heuristic detector lands in
`platform/device.ts` (same style as `detectDevice`). `FullScreenProvider` gains a
`hasFullscreenApi()` helper and a `redirectToFullScreen()` stub, and `enterFullScreen()`
is rewritten as a single decision tree: webview → redirect; iframe without the
Fullscreen API → redirect; iframe with the API → native fullscreen (catch → redirect);
everything else → existing manual (React-state) fullscreen. `isFullScreenSupported`
(`= !isWebView()`) is exposed on context for the button to read.

**Tech Stack:** TypeScript (strict), React 19, Vitest + raw `react-dom` (no
`@testing-library`), colocated tests.

## Global Constraints

- TS strict mode, no `any` without a justified comment, no `React.FC`.
- No `console.log` — use `@cxr/utils/logger`.
- 2-space indent, single quotes/double quotes as file already uses, semicolons.
- Named exports only, no barrel files.
- `platform/device.ts` requires **100%** coverage; `providers/` requires **95/90/95/95**
  (per-file, `vitest.config.ts`).
- Follow existing patterns: `detectDevice(ua?, hasTouch?)` style for new detector;
  existing `VendorElement`/`VendorDocument` casts for vendor-prefixed APIs.
- Spec is `docs/superpowers/specs/2026-07-23-cxr-fullscreen-support-redirect-design.md`
  — decision rule: `isFullScreenSupported = !isWebView()`; `enterFullScreen()` branches
  webview → redirect, iframe-no-API → redirect, iframe-with-API → native (catch →
  redirect), else → manual (unchanged).

---

## File Structure

- **Modify:** `packages/contextual-reels/src/platform/device.ts` — add `isWebView(ua?)`.
- **Modify:** `packages/contextual-reels/src/platform/device.test.ts` — add tests for
  `isWebView`.
- **Modify:** `packages/contextual-reels/src/providers/FullScreenProvider.tsx` — add
  `hasFullscreenApi()`, `redirectToFullScreen()`, rewrite `enterFullScreen()`, extend
  `FullScreenContextValue`.
- **Modify:** `packages/contextual-reels/src/providers/FullScreenProvider.test.tsx` —
  update the three tests whose expected behaviour changes (iframe-no-API,
  iframe-rejection, iframe-no-permission-and-no-method, cross-origin-treated-as-iframe)
  and add new webview / `isFullScreenSupported` tests.

---

### Task 1: `isWebView()` detector in `platform/device.ts`

**Files:**

- Modify: `packages/contextual-reels/src/platform/device.ts`
- Test: `packages/contextual-reels/src/platform/device.test.ts`

**Interfaces:**

- Consumes: nothing new (uses `navigator.userAgent` like `readNavigatorUa`).
- Produces: `export function isWebView(ua?: string): boolean` — used by Task 2.

- [ ] **Step 1: Write the failing tests**

Add to `packages/contextual-reels/src/platform/device.test.ts`, after the existing
`detectDevice` UA constants (after line 42, before the `describe("detectDevice", ...)`
block), add new UA constants:

```ts
// ─── isWebView UA fixtures ─────────────────────────────────────────────────────

const IOS_WKWEBVIEW =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 " + "(KHTML, like Gecko) Mobile/15E148";

const ANDROID_WEBVIEW_WV =
  "Mozilla/5.0 (Linux; Android 13; Pixel 7; wv) AppleWebKit/537.36 (KHTML, like Gecko) " +
  "Version/4.0 Chrome/120.0.0.0 Mobile Safari/537.36";

const ANDROID_WEBVIEW_LEGACY =
  "Mozilla/5.0 (Linux; U; Android 9; Pixel 3 Build/PQ3A.190801.002) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Version/4.0 Chrome/71.0.3578.99 Mobile Safari/537.36";

const FACEBOOK_IAB =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 " +
  "(KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBAV/450.0.0.0;]";

const INSTAGRAM_IAB =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 " +
  "(KHTML, like Gecko) Mobile/15E148 Instagram 300.0.0.0.0";

const WECHAT_IAB =
  "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) " +
  "Version/4.0 Chrome/120.0.0.0 Mobile Safari/537.36 MicroMessenger/8.0.40";

const TIKTOK_IAB =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 " +
  "(KHTML, like Gecko) Mobile/15E148 musical_ly_2023800030";

const LINKEDIN_IAB =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 " +
  "(KHTML, like Gecko) Mobile/15E148 LinkedInApp";
```

Then add a new `describe` block at the end of the file (after the last existing
`describe`, before end of file):

```ts
// ─── isWebView ──────────────────────────────────────────────────────────────────

describe("isWebView", () => {
  it("detects iOS WKWebView (no Safari token)", () => {
    expect(isWebView(IOS_WKWEBVIEW)).toBe(true);
  });

  it("does not flag real Mobile Safari on iOS", () => {
    expect(isWebView(IPHONE_SAFARI)).toBe(false);
  });

  it("detects Android WebView via the 'wv' token", () => {
    expect(isWebView(ANDROID_WEBVIEW_WV)).toBe(true);
  });

  it("detects legacy Android WebView UA shape", () => {
    expect(isWebView(ANDROID_WEBVIEW_LEGACY)).toBe(true);
  });

  it("does not flag real Android Chrome mobile", () => {
    expect(isWebView(ANDROID_PHONE)).toBe(false);
  });

  it("detects the Facebook in-app browser", () => {
    expect(isWebView(FACEBOOK_IAB)).toBe(true);
  });

  it("detects the Instagram in-app browser", () => {
    expect(isWebView(INSTAGRAM_IAB)).toBe(true);
  });

  it("detects the WeChat in-app browser", () => {
    expect(isWebView(WECHAT_IAB)).toBe(true);
  });

  it("detects the TikTok in-app browser", () => {
    expect(isWebView(TIKTOK_IAB)).toBe(true);
  });

  it("detects the LinkedIn in-app browser", () => {
    expect(isWebView(LINKEDIN_IAB)).toBe(true);
  });

  it("does not flag desktop Chrome, Firefox, or Mac Chrome", () => {
    expect(isWebView(WIN_CHROME)).toBe(false);
    expect(isWebView(LINUX_FIREFOX)).toBe(false);
    expect(isWebView(MAC_CHROME)).toBe(false);
  });

  it("does not flag iPadOS 13+ (Mac UA + touch), matching detectDevice's own carve-out", () => {
    expect(isWebView(IPAD_OS13_MAC_UA)).toBe(false);
  });

  it("returns false for an empty/undefined UA", () => {
    expect(isWebView("")).toBe(false);
    expect(isWebView(undefined)).toBe(false);
  });
});
```

Update the import at the top of the test file to include `isWebView`:

```ts
import {
  detectDevice,
  enrichDeviceDetailsWithGeoIp,
  getDeviceDetailsSnapshot,
  isWebView,
  resolveClientIp,
} from "@cxr/platform/device";
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd packages/contextual-reels && npx vitest run src/platform/device.test.ts`
Expected: FAIL — `isWebView` is not exported from `@cxr/platform/device`.

- [ ] **Step 3: Implement `isWebView` in `device.ts`**

In `packages/contextual-reels/src/platform/device.ts`, add near the other UA regexes
(after `LINUX_RE` at line 29):

```ts
const IOS_UA_RE = /iPhone|iPod|iPad/i;
const SAFARI_TOKEN_RE = /Safari/i;
const ANDROID_WV_RE = /; ?wv\)/i;
const ANDROID_LEGACY_WV_RE = /Version\/\d+\.\d+.*Chrome\/\d+\.\d+/i;
const IN_APP_BROWSER_RE =
  /FBAN|FBAV|FB_IAB|Instagram|Twitter|Line\/|MicroMessenger|musical_ly|TikTok|Snapchat|LinkedInApp|Pinterest|GSA\//i;
```

Then add the exported function, right after `detectDevice` (after line 82, before the
`// ─── Device details shape ───` section header):

```ts
/**
 * Best-effort webview / in-app-browser detection. Heuristic — there is no single
 * reliable signal across platforms. Errs toward covering the common real-world
 * webviews (iOS WKWebView, Android WebView, named in-app browsers) rather than
 * minimizing false positives.
 *
 * @param ua User-agent string. Defaults to `navigator.userAgent`.
 */
export function isWebView(ua?: string): boolean {
  const agent = ua ?? readNavigatorUa();
  if (!agent) return false;

  if (IN_APP_BROWSER_RE.test(agent)) return true;

  // iOS WKWebView drops the Safari token that real Mobile Safari always keeps.
  if (IOS_UA_RE.test(agent) && !SAFARI_TOKEN_RE.test(agent)) return true;

  if (ANDROID_RE.test(agent) && (ANDROID_WV_RE.test(agent) || ANDROID_LEGACY_WV_RE.test(agent))) {
    return true;
  }

  return false;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd packages/contextual-reels && npx vitest run src/platform/device.test.ts`
Expected: PASS, all `isWebView` tests green.

- [ ] **Step 5: Run coverage check for this file**

Run: `cd packages/contextual-reels && npx vitest run src/platform/device.test.ts --coverage`
Expected: `platform/device.ts` at 100% lines/branches/functions/statements. If any
branch is uncovered (e.g. the legacy Android regex path), add a targeted test case.

- [ ] **Step 6: Commit**

```bash
git add packages/contextual-reels/src/platform/device.ts packages/contextual-reels/src/platform/device.test.ts
git commit -m "feat(cxr): add isWebView UA-heuristic detector"
```

---

### Task 2: `hasFullscreenApi()` + `redirectToFullScreen()` + context flag in `FullScreenProvider`

**Files:**

- Modify: `packages/contextual-reels/src/providers/FullScreenProvider.tsx`
- Test: `packages/contextual-reels/src/providers/FullScreenProvider.test.tsx`

**Interfaces:**

- Consumes: `isWebView` from `@cxr/platform/device` (Task 1); `logger` from
  `@cxr/utils/logger` (existing).
- Produces: `FullScreenContextValue.isFullScreenSupported: boolean`; internal
  `hasFullscreenApi(): boolean` and `redirectToFullScreen(): void` (not exported,
  used only inside the provider) — Task 3 relies on `isFullScreenSupported` being on
  context and on `enterFullScreen` branching through `redirectToFullScreen`.

- [ ] **Step 1: Write the failing test for the new context flag**

Add to `packages/contextual-reels/src/providers/FullScreenProvider.test.tsx`, inside
the top-level `describe("FullScreenProvider", ...)` block, right after the
`"starts in normal state"` test:

```ts
it("exposes isFullScreenSupported: true outside a webview", () => {
  const handle: ContextHandle = { ctx: null };
  const { root, container } = mount(handle);

  expect(handle.ctx?.isFullScreenSupported).toBe(true);

  unmount(root, container);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/contextual-reels && npx vitest run src/providers/FullScreenProvider.test.tsx -t "isFullScreenSupported"`
Expected: FAIL — `isFullScreenSupported` is `undefined`, not `true`.

- [ ] **Step 3: Add the import, flag, and stub functions**

In `packages/contextual-reels/src/providers/FullScreenProvider.tsx`, update the import
at line 4-6:

```ts
import { EVENT } from "@cxr/analytics/analytics";
import { useEventBus } from "@cxr/instance/InstanceContext";
import { isWebView } from "@cxr/platform/device";
import { useAnalytics } from "@cxr/providers/AnalyticsProvider";
import { logger } from "@cxr/utils/logger";
```

Update `FullScreenContextValue` (lines 26-31):

```ts
/** Fullscreen state and controls for the contextual-reels widget. */
export interface FullScreenContextValue {
  isFullScreen: boolean;
  isFullScreenSupported: boolean;
  enterFullScreen: () => void;
  exitFullScreen: () => void;
  toggleFullScreen: () => void;
}
```

Add `hasFullscreenApi` next to `requestFS` (after line 64, before `exitFS`):

```ts
function hasFullscreenApi(): boolean {
  const el = document.documentElement as VendorElement;
  return Boolean(
    el.requestFullscreen ?? el.webkitRequestFullscreen ?? el.mozRequestFullScreen ?? el.msRequestFullscreen
  );
}
```

Inside the `FullScreenProvider` function body, after the `bus` line (after line 81),
add:

```ts
const isFullScreenSupported = useMemo(() => !isWebView(), []);

const redirectToFullScreen = useCallback(() => {
  // TODO(dev): resolve destination URL + window.open / window.location.
  logger.info("[cxr] fullscreen unsupported — redirect stub");
}, []);
```

Add `isFullScreenSupported` to the memoized context value (lines 179-187):

```ts
const value = useMemo<FullScreenContextValue>(
  () => ({
    isFullScreen,
    isFullScreenSupported,
    enterFullScreen,
    exitFullScreen,
    toggleFullScreen,
  }),
  [isFullScreen, isFullScreenSupported, enterFullScreen, exitFullScreen, toggleFullScreen]
);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/contextual-reels && npx vitest run src/providers/FullScreenProvider.test.tsx -t "isFullScreenSupported"`
Expected: PASS.

- [ ] **Step 5: Run the full provider test file to check nothing else broke**

Run: `cd packages/contextual-reels && npx vitest run src/providers/FullScreenProvider.test.tsx`
Expected: All tests PASS (this task doesn't change `enterFullScreen` behaviour yet —
that's Task 3).

- [ ] **Step 6: Commit**

```bash
git add packages/contextual-reels/src/providers/FullScreenProvider.tsx packages/contextual-reels/src/providers/FullScreenProvider.test.tsx
git commit -m "feat(cxr): expose isFullScreenSupported on FullScreenContext"
```

---

### Task 3: Rewrite `enterFullScreen()` decision tree (webview + iframe-no-API redirect)

**Files:**

- Modify: `packages/contextual-reels/src/providers/FullScreenProvider.tsx`
- Test: `packages/contextual-reels/src/providers/FullScreenProvider.test.tsx`

**Interfaces:**

- Consumes: `isWebView`, `hasFullscreenApi`, `redirectToFullScreen`,
  `enterManualFullScreen`, `inIframe`, `requestFS` — all already present after
  Tasks 1-2.
- Produces: final `enterFullScreen` behaviour relied on by any UI component that
  later reads `isFullScreenSupported` / calls `enterFullScreen`.

This task changes existing behaviour, so three existing tests must be updated to
match the new spec (iframe-without-API now redirects instead of going manual;
native-FS-rejection inside an iframe now redirects instead of going manual), and new
tests are added for the webview path and the "no manual fallback in iframe" cases.

- [ ] **Step 1: Update the existing iframe tests that now expect redirect instead of manual, and write new failing tests**

In `packages/contextual-reels/src/providers/FullScreenProvider.test.tsx`:

**3a.** Add a `redirect` spy hoisted mock for `logger` near the top of the file
(after the `vi.mock("@cxr/providers/AnalyticsProvider", ...)` block, after line 14):

```ts
const { loggerInfoMock } = vi.hoisted(() => ({ loggerInfoMock: vi.fn() }));
vi.mock("@cxr/utils/logger", () => ({
  logger: { debug: vi.fn(), info: loggerInfoMock, warn: vi.fn(), error: vi.fn() },
}));
```

**3b.** Add `loggerInfoMock.mockClear()` to the top-level `beforeEach` (line 61-65):

```ts
beforeEach(() => {
  sendEventMock.mockClear();
  setBaseEventContextMock.mockClear();
  loggerInfoMock.mockClear();
  document.body.className = "";
});
```

**3c.** Find the test named `"falls back to manual fullscreen when no requestFullscreen method exists"`
(inside `describe("enterFullScreen — in iframe", ...)`) and replace its full `it(...)`
block. Per the design, "no FS API" always redirects regardless of `fullscreenEnabled`,
since `hasFullscreenApi()` checks for the method, not the permission flag. Replace it
with:

```ts
it("redirects when no requestFullscreen method exists on the element", async () => {
  stubRequest(undefined);
  stubFullscreenEnabled(true);

  const handle: ContextHandle = { ctx: null };
  const { root, container } = mount(handle);

  await act(async () => {
    await handle.ctx?.enterFullScreen();
  });

  expect(handle.ctx?.isFullScreen).toBe(false);
  expect(loggerInfoMock).toHaveBeenCalled();

  unmount(root, container);
});
```

**3d.** Find the test named `"falls back to manual fullscreen when the iframe lacks the Fullscreen permission and requestFullscreen rejects"`
and replace its full `it(...)` block with:

```ts
it("redirects when requestFullscreen rejects, regardless of the fullscreenEnabled permission flag", async () => {
  const requestSpy = vi.fn().mockRejectedValue(new Error("gesture required"));
  stubRequest(requestSpy);
  stubFullscreenEnabled(false);

  const handle: ContextHandle = { ctx: null };
  const { root, container } = mount(handle);

  await act(async () => {
    await handle.ctx?.enterFullScreen();
  });

  expect(handle.ctx?.isFullScreen).toBe(false);
  expect(loggerInfoMock).toHaveBeenCalled();

  unmount(root, container);
});
```

**3e.** Find the test named `"falls back to manual fullscreen when no requestFullscreen method exists and the permission is denied"`
and replace its full `it(...)` block with:

```ts
it("redirects when no requestFullscreen method exists and the permission is denied", async () => {
  stubRequest(undefined);
  stubFullscreenEnabled(false);

  const handle: ContextHandle = { ctx: null };
  const { root, container } = mount(handle);

  await act(async () => {
    await handle.ctx?.enterFullScreen();
  });

  expect(handle.ctx?.isFullScreen).toBe(false);
  expect(loggerInfoMock).toHaveBeenCalled();

  unmount(root, container);
});
```

**3f.** Find the test named `"falls back to manual fullscreen when requestFullscreen rejects"`
(inside `describe("enterFullScreen — in iframe", ...)`) and replace its full `it(...)`
block — this one now also redirects (rejection always redirects per the new branch,
manual is desktop-only):

```ts
it("redirects when requestFullscreen rejects", async () => {
  const requestSpy = vi.fn().mockRejectedValue(new Error("gesture required"));
  stubRequest(requestSpy);
  stubFullscreenEnabled(true);

  const handle: ContextHandle = { ctx: null };
  const { root, container } = mount(handle);

  await act(async () => {
    await handle.ctx?.enterFullScreen();
  });

  expect(handle.ctx?.isFullScreen).toBe(false);
  expect(loggerInfoMock).toHaveBeenCalled();

  unmount(root, container);
});
```

**3g.** Find the test named `"treats a cross-origin parent (window.top access throwing) as an iframe, falling back to manual fullscreen"`
in the `describe("vendor fallbacks", ...)` block and replace its full `it(...)` block —
cross-origin is still "in iframe", and with no `requestFullscreen` available, this now
redirects instead of going manual:

```ts
it("treats a cross-origin parent (window.top access throwing) as an iframe, redirecting when no requestFullscreen exists", async () => {
  // Force inIframe()'s try/catch to take the catch path: accessing window.top throws,
  // exactly like a cross-origin embed. With inIframe() === true and no native
  // requestFullscreen available, enterFullScreen redirects.
  const topDescriptor = Object.getOwnPropertyDescriptor(window, "top");
  Object.defineProperty(window, "top", {
    configurable: true,
    get: () => {
      throw new Error("cross-origin");
    },
  });

  const originalRequest = document.documentElement.requestFullscreen;
  Object.defineProperty(document.documentElement, "requestFullscreen", {
    configurable: true,
    value: undefined,
    writable: true,
  });

  const handle: ContextHandle = { ctx: null };
  const { root, container } = mount(handle);

  await act(async () => {
    await handle.ctx?.enterFullScreen();
  });

  expect(handle.ctx?.isFullScreen).toBe(false);
  expect(loggerInfoMock).toHaveBeenCalled();

  Object.defineProperty(document.documentElement, "requestFullscreen", {
    configurable: true,
    value: originalRequest,
    writable: true,
  });
  if (topDescriptor) {
    Object.defineProperty(window, "top", topDescriptor);
  } else {
    Object.defineProperty(window, "top", { configurable: true, get: () => window });
  }
  unmount(root, container);
});
```

**3h.** Add a new `describe("enterFullScreen — webview", ...)` block right after the
`describe("enterFullScreen — in iframe", ...)` block closes, before the
`// --- Vendor-prefixed exit fallback` section comment.

This uses a real webview UA string (via `navigator.userAgent` stubbing) rather than
mocking `@cxr/platform/device`, since `isWebView()` is a pure UA function — no need to
mock the module, and it avoids `vi.resetModules()` interfering with the file's other
top-level `vi.mock` calls:

```ts
describe("enterFullScreen — webview", () => {
  let originalUserAgent: string;

  beforeEach(() => {
    originalUserAgent = navigator.userAgent;
  });

  afterEach(() => {
    Object.defineProperty(navigator, "userAgent", {
      configurable: true,
      value: originalUserAgent,
    });
  });

  function stubWebviewUserAgent(): void {
    Object.defineProperty(navigator, "userAgent", {
      configurable: true,
      value:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 " +
        "(KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBAV/450.0.0.0;]",
    });
  }

  it("reports isFullScreenSupported: false in a webview", () => {
    stubWebviewUserAgent();

    const handle: ContextHandle = { ctx: null };
    const { root, container } = mount(handle);

    expect(handle.ctx?.isFullScreenSupported).toBe(false);

    unmount(root, container);
  });

  it("redirects immediately in a webview without attempting native or manual fullscreen", async () => {
    stubWebviewUserAgent();
    const requestSpy = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(document.documentElement, "requestFullscreen", {
      configurable: true,
      value: requestSpy,
      writable: true,
    });

    const handle: ContextHandle = { ctx: null };
    const { root, container } = mount(handle);

    await act(async () => {
      await handle.ctx?.enterFullScreen();
    });

    expect(requestSpy).not.toHaveBeenCalled();
    expect(handle.ctx?.isFullScreen).toBe(false);
    expect(loggerInfoMock).toHaveBeenCalled();

    unmount(root, container);
  });
});
```

- [ ] **Step 2: Run the full test file to verify the updated/new tests fail against current code**

Run: `cd packages/contextual-reels && npx vitest run src/providers/FullScreenProvider.test.tsx`
Expected: FAIL — the renamed "redirects when..." tests still assert `isFullScreen ===
false` but current code sets it to `true` (manual fallback); the webview test fails
because `isWebView` isn't wired into `enterFullScreen` yet.

- [ ] **Step 3: Rewrite `enterFullScreen` in `FullScreenProvider.tsx`**

Replace the current `enterFullScreen` (lines 88-101):

```ts
const enterFullScreen = useCallback(async () => {
  const promise = inIframe() ? requestFS(document.documentElement) : undefined;
  if (promise == null) {
    enterManualFullScreen();
    return;
  }

  try {
    await promise;
    // isFullScreen updates via the fullscreenchange listener below.
  } catch {
    enterManualFullScreen();
  }
}, [enterManualFullScreen]);
```

with:

```ts
const enterFullScreen = useCallback(async () => {
  if (isWebView()) {
    redirectToFullScreen();
    return;
  }

  if (!inIframe()) {
    enterManualFullScreen();
    return;
  }

  if (!hasFullscreenApi()) {
    redirectToFullScreen();
    return;
  }

  try {
    await requestFS(document.documentElement);
    // isFullScreen updates via the fullscreenchange listener below.
  } catch {
    redirectToFullScreen();
  }
}, [enterManualFullScreen, redirectToFullScreen]);
```

Note: `requestFS` is now only called when `hasFullscreenApi()` already confirmed a
method exists, so the `promise == null` branch inside the old code (the "no method"
case) is now handled up-front by `hasFullscreenApi()`. `requestFS(...)` can still be
awaited directly since a method is guaranteed present.

- [ ] **Step 4: Run the full test file to verify everything passes**

Run: `cd packages/contextual-reels && npx vitest run src/providers/FullScreenProvider.test.tsx`
Expected: All tests PASS, including the updated redirect-based iframe tests, the
webview test, and every untouched pre-existing test (manual/native/analytics/keydown
paths).

- [ ] **Step 5: Run coverage check for this file**

Run: `cd packages/contextual-reels && npx vitest run src/providers/FullScreenProvider.test.tsx --coverage`
Expected: `providers/FullScreenProvider.tsx` meets 95/90/95/95. If `redirectToFullScreen`'s
body or a branch is uncovered, the existing redirect-path tests should already cover it
(they assert `loggerInfoMock` was called) — if not, add an assertion rather than a new
test.

- [ ] **Step 6: Run the whole package test suite to catch any consumer breakage**

Run: `cd packages/contextual-reels && npx vitest run`
Expected: PASS. No other file references `FullScreenContextValue` shape directly in a
way that would break (check with a quick grep if failures appear:
`grep -rn "FullScreenContextValue\|useFullScreen(" src --include="*.tsx" --include="*.ts"`).

- [ ] **Step 7: Typecheck**

Run: `cd packages/contextual-reels && npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 8: Commit**

```bash
git add packages/contextual-reels/src/providers/FullScreenProvider.tsx packages/contextual-reels/src/providers/FullScreenProvider.test.tsx
git commit -m "feat(cxr): redirect fullscreen in webviews and API-less iframes"
```

---

## Post-Plan Notes

- `redirectToFullScreen()` is intentionally a stub (`logger.info` only) — wiring the
  real destination URL is out of scope per the spec.
- No UI component changes are included — this plan only produces the context flag and
  branching logic. A follow-up task should wire the expand button to read
  `isFullScreenSupported` and swap its label/icon/click-target when consuming this.
