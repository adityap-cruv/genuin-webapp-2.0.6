# CXR Fullscreen Support Detection + Redirect Fallback — Design

**Date:** 2026-07-23
**Package:** `@genuin/contextual-reels`
**Files touched:** `src/platform/device.ts`, `src/providers/FullScreenProvider.tsx` (+ colocated tests)

## Problem

The expand button always tries to enter fullscreen. In some environments fullscreen
is impossible:

- **Webviews / in-app browsers** — the native Fullscreen API is often present but
  unreliable or blocked; fullscreen must never be attempted there.
- **Cross-origin iframes without the Fullscreen API** — `requestFullscreen` is
  absent, so expanding cannot work.

In those cases, clicking expand should **redirect** (to a destination wired later)
instead of expanding. We need a single identifier that says whether fullscreen is
supported so the button can swap its behaviour, and the decision logic must live in
`enterFullScreen()`.

## Decision rule

```
isFullScreenSupported = !isWebView()
```

The context flag is the **button-affordance** signal: it is false only in a webview,
where the button should present/behave as a redirect. (Iframe-without-API also
redirects at click time, but that is an iframe-runtime edge handled inside
`enterFullScreen`, not a button-affordance state — see rationale below.)

### `enterFullScreen()` branch (authority for what actually happens)

```
enterFullScreen():
  if (isWebView())                     -> redirectToFullScreen()   // always redirect
  else if (inIframe() && !hasFullscreenApi())
                                       -> redirectToFullScreen()   // iframe, no native FS
  else if (inIframe())                 -> tryNativeFS()            // catch -> redirect
  else                                 -> enterManualFullScreen()  // desktop, unchanged
```

Changes from current behaviour:

- Webview always redirects (new).
- Iframe without FS API redirects instead of falling back to manual state (was
  `enterManualFullScreen`).
- Native FS rejection inside an iframe now falls back to **redirect**, not manual
  state (was manual). Keeps "no fake fullscreen outside desktop."
- Desktop non-iframe manual path is **unchanged**.

## Component 1 — `isWebView()` in `platform/device.ts`

Pure, UA-injectable detector (matches the existing `detectDevice(ua, hasTouch)`
style). Broad heuristic coverage; **no** override hook.

```ts
/**
 * Best-effort webview / in-app-browser detection. Heuristic — there is no single
 * reliable signal. Errs toward covering the common real-world webviews.
 *
 * @param ua User-agent string. Defaults to `navigator.userAgent`.
 */
export function isWebView(ua?: string): boolean;
```

Signals matched:

- **iOS WKWebView:** UA contains `iPhone|iPod|iPad` but **not** `Safari`
  (in-app WKWebView drops the Safari token; real Mobile Safari keeps it).
- **Android WebView:** `; wv)` or a standalone `wv` token; or the legacy
  `Version/x.x ... Chrome/...` shape without a browser vendor token.
- **Named in-app browsers:** `FBAN|FBAV|FB_IAB` (Facebook), `Instagram`,
  `Twitter`, `Line`, `MicroMessenger` (WeChat), `TikTok|musical_ly`,
  `Snapchat`, `LinkedIn`, `Pinterest`, `GSA` (Google app). List kept as a single
  regex, extendable.

Returns `false` when `navigator`/UA is unavailable (SSR safety), consistent with
`readNavigatorUa()`.

### `hasFullscreenApi()` helper

Lives in `FullScreenProvider.tsx` next to the existing `requestFS` helper (or as a
small local). Checks `document.documentElement` for any vendor-prefixed
`requestFullscreen`:

```ts
function hasFullscreenApi(): boolean {
  const el = document.documentElement as VendorElement;
  return Boolean(
    el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen
  );
}
```

## Component 2 — `FullScreenProvider` changes

1. **Context surface** — add `isFullScreenSupported: boolean` to
   `FullScreenContextValue`.
2. **Compute the flag** — `const isFullScreenSupported = useMemo(() => !isWebView(), [])`.
   Stable per mount (UA does not change).
3. **Rewrite `enterFullScreen`** per the branch above.
4. **`redirectToFullScreen()` stub** — a stubbed function, no bus event:

   ```ts
   const redirectToFullScreen = useCallback(() => {
     // TODO(dev): resolve destination URL + window.open / window.location.
     logger.info("[cxr] fullscreen unsupported — redirect stub");
   }, []);
   ```

   Import `logger` from `@cxr/utils/logger` (no `console.log`, per guardrail).

5. **Add `isFullScreenSupported` to the memoized context value** and its deps.
6. Keep `enterManualFullScreen`, `exitFullScreen`, `toggleFullScreen`, the keydown /
   `fullscreenchange` / bus listeners, and the analytics wiring **as-is**.

## Data flow

```
expand click / video:expand bus  ->  enterFullScreen()
  webview? ------------------------> redirectToFullScreen()  (stub)
  iframe & no FS API? -------------> redirectToFullScreen()  (stub)
  iframe & FS API? ----------------> requestFS() --catch--> redirectToFullScreen()
  desktop? ------------------------> enterManualFullScreen() -> setIsFullScreen(true) + bus
```

UI consumers read `isFullScreenSupported` from `useFullScreen()` to decide whether the
expand button behaves as expand or as a redirect affordance.

## Error handling

- `isWebView()` / `hasFullscreenApi()` guard against missing `navigator` / DOM.
- Native FS promise rejection is caught and routed to `redirectToFullScreen()`.
- Redirect stub is a no-op beyond logging until the destination is wired.

## Testing

Colocated Vitest specs; coverage gates apply (`platform/device` = 100%,
`providers/` = 95/90/95/95).

**`device.test.ts` — `isWebView()`:**

- iOS WKWebView UA (no Safari token) → true
- iOS Mobile Safari UA (has Safari) → false
- Android `; wv)` UA → true
- Android Chrome mobile UA → false
- Each named in-app browser UA (FB, Instagram, WeChat, TikTok, etc.) → true
- Desktop Chrome / Firefox / Safari UAs → false
- Empty / undefined UA → false

**`FullScreenProvider.test.tsx`:**

- Webview → `enterFullScreen` calls redirect stub, no `requestFS`, no `setIsFullScreen`.
- Iframe + no FS API → redirect stub.
- Iframe + FS API resolves → native path, no redirect.
- Iframe + FS API rejects → redirect stub (not manual).
- Desktop non-iframe → manual path (`isFullScreen` true, bus `fullscreen:enter`).
- `isFullScreenSupported` is `false` in webview, `true` otherwise.

## Out of scope

- Actual redirect destination / URL resolution (stub only).
- Button component UI changes (this design only exposes the flag + logic).
- Per-tag override hook for webview detection.
