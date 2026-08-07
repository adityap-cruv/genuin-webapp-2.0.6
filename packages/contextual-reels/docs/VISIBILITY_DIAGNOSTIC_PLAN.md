# Visibility diagnostic beacon (audible-but-invisible ad — native-hidden WebView)

> **Design record** for the `VISIBILITY_DIAGNOSTIC` beacon: why it exists, what it captures, and how
> to read the field data to pick the fix. Companion to the audio investigation
> ([AUDIO_DIAGNOSTIC_PLAN.md](AUDIO_DIAGNOSTIC_PLAN.md)) — same shape of problem (native state the DOM
> can't see), different axis (visibility, not audio).

## Context

Field + on-device investigation (Aug 2026) established that our unit is served into the game
`com.wood.block.sudoku.puzzle.bm` as one demand source in an **AppLovin MAX mediation** stack, and can
be **loaded/preloaded into a natively-hidden WebView while autoplaying audibly** — the user hears the
ad but sees nothing. On-device proof: `mitmproxy` over USB confirmed the CXR boot sequence
(`api`/`aapi`/`media`/`aetr.begenuin.com` + RudderStack), and `uiautomator`/`dumpsys` read the native
view geometry that the DOM is blind to.

The unit that reports the symptom is the 320×480 L5 tag
[`6a6892e52ca77d200369fb9e`](../src/strategies/strategyConfig.ts) (`servedStatically`,
`initialVolume: 0.2`), which autoplays audibly on mount via L1's full-player path and has **no
viewability gate on playback**.

### Why `unit_visible` reads `true` for a hidden unit

`unit_visible` ([useFeedVisibilityGate.ts](../src/app/useFeedVisibilityGate.ts) →
[useInView.ts](../src/monitoring/useInView.ts)) is `IntersectionObserver` v1 `isIntersecting` **AND**
CSS `visibility !== "hidden"`. Both live entirely inside the DOM. When a host hides the unit at the
**native layer** (off-screen / 0-size / `View.INVISIBLE` Android WebView, or a preloaded-but-unshown
interstitial), the document still lays out at full size with the element dead-centre, so both halves
read "visible". IO v1 cannot see native compositing, and neither can anything else purely in the DOM,
directly. Confirmed in the field: `unit_visible_source: "measured"`, `unit_visible_cross_origin:
false` (we are the **top document** of the WebView — IO's root _is_ that WebView's viewport).

## What the beacon does

One snapshot per fill, fired **alongside `AUDIO_DIAGNOSTIC`** from
[genAdSdk.ts](../src/ads/genAdSdk.ts) (same `slot`, same `forced_fill`/`visit_id` so audio + visibility
correlate per impression). Implemented in
[monitoring/visibilityDiagnostic.ts](../src/monitoring/visibilityDiagnostic.ts).

It captures **every candidate signal side-by-side** — the ones that _might_ reflect real on-screen
state where IO v1 cannot — so field data can pick the one that flips to "hidden" against a
known-hidden ground truth **before** we change the `unit_visible` definition. It does not decide
anything itself.

### Fields

| Family                        | Fields                                                                                                           | What a "hidden" reading looks like                                                  |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| **IO v1** (today's basis)     | `io_v1_intersecting`, `io_v1_ratio`, `io_v1_root_bounds_null`                                                    | stays `true` even when hidden — the bug                                             |
| **IO v2** (`trackVisibility`) | `io_v2_supported`, `io_v2_is_visible`, `io_v2_ratio`                                                             | `is_visible: false` — browser can't guarantee it's painted                          |
| **rAF liveness**              | `raf_supported`, `raf_frames`, `raf_window_ms`, `raf_fps`, `raf_first_frame_ms`                                  | `fps ≈ 0` — surface not being composited                                            |
| **Page Visibility**           | `document_visibility_state`, `document_hidden`, `document_has_focus`, `document_prerendering`                    | `hidden`/`prerender` — WebView backgrounded or preloading                           |
| **MRAID / OMID**              | `mraid_present`, `mraid_state`, `mraid_is_viewable`, `mraid_exposure`, `mraid_placement_type`, `omid_present`    | `is_viewable: false` — the native ad SDK's own verdict (authoritative when present) |
| **Geometry / CSS**            | `rect_x/y/width/height`, `computed_display/visibility/opacity`, `in_viewport`                                    | zero-size / off-screen rect                                                         |
| **Viewport / device**         | `viewport_inner_width/height`, `visual_viewport_width/height/scale`, `screen_width/height`, `device_pixel_ratio` | tiny inner dimensions (0/1px native size)                                           |
| **Frame context**             | `is_top_window`, `is_webview`                                                                                    | corroborators                                                                       |

Async, ~500ms window (IO v2 `delay:100` + rAF need time to report).

## Reading the data — decision tree

Filter to the reproduction (`forced_fill = true` isolates the device-targeted test handset; see
[debugDevices.ts](../src/strategies/debugDevices.ts)), then compare each signal against IO v1:

- **`io_v2_is_visible: false`** while `io_v1_intersecting: true` → IO v2 is the drop-in fix; adopt it
  as the `unit_visible` source.
- **`raf_fps ≈ 0`** while playing → the surface isn't drawn; strong "not visible" proxy, works even
  when IO v2 is unsupported.
- **`mraid_is_viewable: false`** (when `mraid_present`) → the native SDK already knows; prefer this,
  it's the only signal computed with real native geometry.
- **`document_visibility_state: "hidden"/"prerender"`** → a preload/background case Page Visibility
  already catches; the cheapest possible fix.
- If **all** candidates read "visible" too → the hiding is below everything JS can observe (as with
  the audio axis), and the fix is a policy/partner ask, not a client signal.

## Intended fix (not in this change)

This change is **data-collection only** (see below). Once the data names the winning signal:

1. Fold it into `unit_visible` in [useInView.ts](../src/monitoring/useInView.ts) (keep IO v1 for
   scroll intersection; stop treating `isIntersecting` alone as "visible").
2. Consider gating **audible autoplay** for the L1/L5 full-player path on real viewability, so a
   preloaded/hidden interstitial doesn't play audio before it's shown.

## Safety

Purely additive and fail-safe — **no change to ad selection, playback, volume, layout, rendering, or
any existing event.** The sampler only reads (`getBoundingClientRect`, `getComputedStyle`, IO
`observe`, an rAF counter, global probes), disconnects everything, and emits one beacon. Every probe
is `try/catch`-wrapped with a safe default; the sampler always resolves (never rejects), `null` on any
internal failure; the emit site adds `.catch(() => undefined)`; and the rAF loop has a hard stop so it
always terminates. Nothing can surface as an error in a publisher's page. Fires for every
audible-start fill (parity with `AUDIO_DIAGNOSTIC`), carrying `forced_fill` so the test device is
filterable.
