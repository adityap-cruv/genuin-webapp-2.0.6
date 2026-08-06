# CXR feed visibility gate — design

**Date:** 2026-08-06
**Package:** `packages/contextual-reels` (`@genuin/contextual-reels`)
**Status:** implemented (PR #501) — the gate ships **off** by default; see
[Implementation notes](#implementation-notes--divergences-from-this-design) for where
the shipped behaviour intentionally diverges from the original design below.

---

## Problem

A CXR widget currently renders, requests an ad, and plays regardless of whether its
`.gen-ext` slot is actually in the viewport. Two consequences:

1. **Hidden units burn a real ad impression.** A host page that hides the slot
   (`display:none`, zero-size container, permanently below the fold) still gets a
   filled ad it can never show. The impression is wasted and unmeasurable.
2. **Off-screen units keep consuming resources.** A widget scrolled out of view holds
   an ad iframe, an HLS buffer, and a player, counting against Chrome's Heavy Ad
   Intervention budget for the page.

This design adds a top-level visibility gate: hold render until the unit is visible,
pass the impression back if it never becomes visible, and tear down if it stops being
visible after render.

## Requirements

Verbatim from the request, restated as the authoritative behaviour:

**Initial state: not visible**

- Do not render the ad. Wait for visibility.
- Not visible within **30 seconds** of initialization → trigger passback with
  `passback_reason: "unit_hidden"`, then destroy the ad instance.
- Visible before the 30s timeout → cancel the timeout, render the ad.

**After render**

- Keep monitoring visibility.
- Later becomes not visible → destroy the ad instance immediately. **Do not** trigger
  the passback.
- Once the unit has been visible at least once, `unit_hidden` must never fire again,
  regardless of any subsequent visibility change.

## Decisions

| Decision             | Choice                                                         | Rationale                                                                                                                                                                                                                                                                                                                            |
| -------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Rollout              | Strategy flag `visibilityGate`, default **off**                | Every other revenue-touching behaviour in this package is flagged (`mutePassback`, `gateOnUnmute`, `singleHitWaterfall`). A mis-measured host element would pass back live traffic; a flag is the kill switch.                                                                                                                       |
| "Visible"            | `IntersectionObserver` `threshold: 0` — any intersecting pixel | Catches the real `unit_hidden` cases (`display:none`, `visibility:hidden`, `0×0` host, fully off-screen) without destroying a unit the user can partly see. Rejected: `0.5` (IAB-style) as too aggressive post-render; tab-foreground as an additional condition, since a 30s tab switch would then pass back a perfectly good unit. |
| Post-render teardown | Full widget teardown                                           | `bus.emit("genad:destroy")` + `InstanceRegistry.destroy()` — the same teardown `firePassback` already performs, minus the passback event and host callbacks. Terminal: scrolling back into view does not restore the widget.                                                                                                         |
| Hide grace period    | **0 ms** (destroy immediately)                                 | Literal to spec. See [Risks](#risks).                                                                                                                                                                                                                                                                                                |
| Held render scope    | Whole feed body → `FeedSkeleton`                               | Nothing should request or play while the unit is hidden. The flagged tags are ad-only feeds, so "hold the feed" and "hold the ad" are the same thing there.                                                                                                                                                                          |

## Architecture

### New files

| File                               | Responsibility                                                                                                                                              | Depends on                                                                                       |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `src/monitoring/useInView.ts`      | Generic `useInView(ref, { threshold }) → boolean \| null`. Thin `IntersectionObserver` wrapper with no CXR domain knowledge. `null` means not yet measured. | React only                                                                                       |
| `src/app/useFeedVisibilityGate.ts` | The state machine: 30s timer, `hasBeenVisible` latch, both teardown calls. Returns `shouldRender: boolean`.                                                 | `useInView`, `useStrategy`, `useAdWaterfall`, `useEventBus`, `useInstanceId`, `InstanceRegistry` |

Signature — the hook owns the observer wiring, so the caller passes only the ref:

```ts
export function useFeedVisibilityGate(ref: React.RefObject<HTMLElement | null>): {
  shouldRender: boolean;
};
```

`useInView` lives in `monitoring/` alongside the other runtime-condition observers
(`useResourceMonitor`, `useHeavyAdReporter`). The gate lives in `app/` because it is a
top-level, whole-widget decision, not an ad-slot one.

### Touched files

| File                               | Change                                                                                                                                           |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/strategies/strategies.ts`     | Add `visibilityGate: boolean` (default `false`) and `visibilityGateTimeoutMs: number` (default `30_000`) to `Strategies` + `DEFAULT_STRATEGIES`. |
| `src/strategies/strategyConfig.ts` | Add `visibilityGate: { visibilityGate: true }` to `STRATEGY_PRESETS`. **No tag opts in as part of this change.**                                 |
| `src/providers/AdProvider.tsx`     | `firePassback` accepts an optional `reason`; expose `onUnitFail(reason)` on the context.                                                         |
| `src/app/FeedTree.tsx`             | Attach a ref to the existing overlay div, call `useFeedVisibilityGate`, gate the `body` render on `shouldRender`.                                |

### Fail-open on a missing observer

`useInView` returns `true` immediately when `IntersectionObserver` is absent from the
runtime. A missing observer must never cost an impression — the gate degrades to
today's unconditional-render behaviour.

## The observed element

The gate observes the overlay div `NativeFeedShim` already renders
(`id="overlay-${instanceId}"`), **not** the `.gen-ext` host.

That div is `h-full w-full` inside the shadow root, so `display:none`,
`visibility:hidden`, a `0×0` box, or an off-screen position on the host all collapse
its box too. Observing it needs no host-element plumbing through `shadowConfig`, and
it is rendered in every state including the held-render skeleton — so the observer has
a stable target for the whole widget lifetime.

## Why `onUnitFail`, not `onAdFail`

`onAdFail` routes through `singleHitWaterfall`, which defers the passback until every
ad slot has reported no-fill **and** the feed has reached its last entry. `unit_hidden`
is a _unit-level_ failure: render was held, so no slot ever requested and no slot will
ever report. Routing it through `onAdFail` would silently never fire on a single-hit
tag.

```ts
/**
 * Unit-level waterfall failure — the whole placement is unusable, independent of
 * any individual ad slot. Fires the passback immediately, bypassing the
 * singleHitWaterfall deferral. Idempotent.
 */
onUnitFail: (reason: PassbackReason) => void;
```

`firePassback(reason?)` adds `passback_reason` to the `AD_PASSBACK` payload only when a
reason is supplied, so existing passback paths keep their current event shape. The
`EVENT` strings are untouched — the partner analytics contract holds and the new field
is purely additive.

`PassbackReason` is exported from `providers/AdProvider.tsx` next to
`AdWaterfallContextValue` — it is waterfall vocabulary, and putting it in
`analytics/analytics.ts` would imply the other passback paths already emit one, which
they do not:

```ts
/** Why a passback fired. Emitted as `passback_reason` on `AD_PASSBACK`. */
export type PassbackReason = "unit_hidden";
```

## State machine

```
flag off ──────────────────────────────────────► shouldRender = true
                                                 (no observer, no timer)

flag on, mount
  │
  ├─ isVisible true  ──► RENDERED   latch hasBeenVisible; no timer ever armed
  │
  └─ isVisible false ──► WAITING    skeleton; arm visibilityGateTimeoutMs timer
                           │
                           ├─ visible before fire ──► clear timer, latch, RENDERED
                           │
                           └─ timer fires ──────────► PASSED_BACK (terminal)
                                                      onUnitFail("unit_hidden")
                                                        → notifyAdNoFill()
                                                        → setAdPassback()
                                                        → AD_PASSBACK { passback_reason }
                                                        → genad:destroy
                                                        → registry.destroy()

RENDERED ─ isVisible false ──────────────────────► DESTROYED (terminal)
                                                      genad:destroy
                                                      registry.destroy()
                                                      no passback, no analytics
```

### When the 30s clock starts

"Within 30 seconds of initialization" resolves to **`useFeedVisibilityGate`'s first
effect commit**, i.e. `NativeFeedShim` mount. That is after `TagDetailsGate` has
resolved the tag config, so it excludes the script-load and `/ad_creative` latency —
the window measures _hidden time for a widget that is otherwise ready to render_, not
boot time. This mirrors `useMutePassbackGuard`, which deliberately arms on first
`player:play` rather than on mount for the same reason.

The timer is armed unconditionally on that commit whenever the flag is on and the unit
is not already visible, including while `isVisible` is still `null` — it is not waiting
for a `false` reading first.

`isVisible === null` (observer attached, first callback not yet delivered) is treated
as _not yet visible_ for render gating. The initial callback arrives within a frame of
`observe()`, and the 30s timer covers the case where it never does.

`hasBeenVisibleRef` is the single guard that satisfies "`unit_hidden` never fires once
visible". `AdProvider.passbackFiredRef` already makes the passback idempotent, so the
two together mean no ordering of visibility changes can produce a second terminal
event.

## Data flow

```
overlay div ref
  → useInView(ref, { threshold: 0 })          → isVisible: boolean | null
    → useFeedVisibilityGate({ isVisible })    → shouldRender: boolean
      → NativeFeedShim body: <Feed> | <FeedSkeleton>
```

## Error handling

- `IntersectionObserver` absent → `useInView` returns `true` (fail open, see above).
- `observe()` throwing on a detached node → caught; treated as fail-open `true`.
- `InstanceRegistry.destroy` is optional (`destroy?`) and registered by the loader —
  both teardown paths use `?.()`, matching `firePassback`'s existing call.
- The passback is idempotent via `passbackFiredRef`; the destroy path is idempotent via
  the loader's `destroyed` flag in `index.jsx`.

## Testing

Vitest + jsdom, colocated, raw `react-dom` (no `@testing-library`), `globals: false`.

| File                                | Covers                                                                                                                                                                                                                                                         |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `monitoring/useInView.test.ts`      | Stubbed `IntersectionObserver`: `observe` on mount, `disconnect` on unmount, threshold passthrough, `null` → `true` → `false` transitions, unsupported-runtime fail-open.                                                                                      |
| `app/useFeedVisibilityGate.test.ts` | Fake timers. All five spec flows: flag off; visible on mount; hidden → visible before 30s; hidden → 30s timeout → passback + destroy; rendered → hidden → destroy without passback. Plus: `unit_hidden` never fires after a first visibility, in either order. |
| `providers/AdProvider.test.tsx`     | `onUnitFail("unit_hidden")` fires `AD_PASSBACK` with `passback_reason`, bypasses `singleHitWaterfall`, is idempotent.                                                                                                                                          |
| `app/FeedTree.test.tsx`             | One wiring test: flag on and hidden → skeleton rendered, `Feed` not rendered.                                                                                                                                                                                  |
| `strategies/strategies.test.ts`     | `visibilityGate` defaults `false`, `visibilityGateTimeoutMs` defaults `30_000`.                                                                                                                                                                                |

`app/`, `monitoring/`, and `strategies/` sit on the global per-file coverage gate
(85/75/85/85). A new source file with no test fails the gate.

## Risks

**Iframe embeds — needs real-device confirmation.** Per the `IntersectionObserver`
spec, the implicit root clips through ancestor frames, so a cross-origin Infolinks
iframe scrolled below the fold should report `isIntersecting: false`. This is the
mechanism ad-viewability libraries depend on. Iframe embeds are the dominant path
here, so confirm on a real device before enabling the flag on a live tag rather than
trusting the spec read.

**Hide-flicker destroys a live unit.** With a 0 ms grace period, a transient zero-rect
— a layout thrash, an Octo `reInit`, a host animating the slot — destroys a filled,
playing unit unrecoverably. Building to spec (0 ms) for now; a
`visibilityGateHideGraceMs` of 200–500 ms is one constant away if telemetry shows
spurious teardowns.

**Terminal teardown.** Post-render destroy removes the `.gen-ext` node. A unit that
scrolls off and back on does not return. This is intended per the requirements, but it
means the gate is only appropriate for tags where a single visible impression is the
whole objective.

## Out of scope

- Backfilling `passback_reason` onto the existing passback paths (no-fill,
  mute-timeout, pixel-failure). The field is additive; those paths keep their current
  shape.
- ~~Any viewability _measurement_ or reporting event.~~ **Superseded** — see the
  `unit_visible` measurement below. It is still a gate, not an MRC/IAB-compliant
  viewability beacon, but it does now emit a per-event visibility snapshot.
- Re-mounting a destroyed widget when it returns to view.

## Implementation notes — divergences from this design

The gate shipped in PR #501. Three deliberate changes from the design above; the
canonical description now lives in
[`STRATEGIES.md` → Visibility gate](../../../packages/contextual-reels/docs/STRATEGIES.md#visibility-gate-visibilitygate).

1. **Measurement is decoupled from the gate.** The design gated everything — including
   whether to observe — on `visibilityGate`. As shipped, `useInView` observes on
   **every** tag and `useFeedVisibilityGate` stamps `unit_visible` on every analytics
   event regardless of the flag. Only render-hold / passback / teardown stay flag-gated.
   Rationale: collect real on-screen data across all traffic (gate off) before enabling
   the revenue-touching gate on any tag. This supersedes the "no viewability
   measurement" out-of-scope item.

2. **`unit_visible_source` accompanies every `unit_visible`.** Because `useInView` fails
   open (`true`) when it cannot measure, a raw boolean would let fail-open readings
   inflate the visibility rate. Each stamp now carries provenance
   (`measured` / `unsupported` / `error` / `pending`) so analysis can exclude
   non-measured rows. See the `VisibilitySource` table in STRATEGIES.md.

3. **Post-render teardown is opt-in via `destroyOnHide` (default off).** The design made
   post-render "went hidden → destroy" unconditional. As shipped it is behind a separate
   `destroyOnHide` strategy, default `false` — once visible, the unit stays up unless a
   tag explicitly opts in. Narrows the design's terminal-teardown risk.

The hook signature also changed: it takes no `ref` argument and instead returns its own
`overlayRef` callback ref (a callback ref re-wires correctly when the observed element
mounts later or is replaced — see the `useInView` module doc). `visibilityGate` defaults
**`false`** as the design required (the kill-switch premise); no tag opts in yet.
