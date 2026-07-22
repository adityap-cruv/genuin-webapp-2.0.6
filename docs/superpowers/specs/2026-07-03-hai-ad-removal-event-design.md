# CXR Heavy-Ad-Intervention Removal Event — Design

**Date:** 2026-07-03
**Package:** `@genuin/contextual-reels`
**Status:** Approved for implementation

## Problem

When Chrome's Heavy Ad Intervention (HAI) unloads our ad frame (transferred bytes > 4 MB,
peak main-thread CPU > 15 s in any 30 s window, or total CPU > 60 s), we currently learn
nothing at runtime. The build-time `ad-resource-budget` harness and the passive
`ResourceMonitor` (`resource:threshold` warn/breach) tell us when a frame *trends* toward
removal, but there is no signal that Chrome *actually removed* it — nor a record of **why**.

## Goal

Fire one rich diagnostic event the moment Chrome performs an HAI removal, carrying enough
detail to explain the cause without a repro: the browser's own intervention report, our
last resource snapshot, and widget context.

## Scope

**In:** the authoritative Chrome HAI removal only — the `ReportingObserver` report of type
`"intervention"` whose body identifies Heavy Ad Intervention.

**Out (explicitly declined):** predictive breach-only firing, ad-load failures, policy
passbacks. Those are separate signals with their own events (`resource:threshold`,
`Ad Request Failed`, `Ad Passback`).

## Detection

`ReportingObserver` with `{ types: ["intervention"], buffered: true }`.

- **Feature-detect** `ReportingObserver`; absent (Safari/Firefox) → no-op, never throws.
- `buffered: true` catches a report queued before the observer attaches.
- Filter to HAI reports: `report.type === "intervention"` **and** the body identifies heavy
  ads (`report.body.id === "HeavyAdIntervention"`, with a message-substring fallback since
  the `id`/`message` shape is not a frozen web standard).

## The "why" payload (full bundle)

```
interface AdRemovedPayload {
  reason: "heavy-ad-intervention";
  limit: "network" | "cpu-peak" | "cpu-total" | "unknown";  // parsed from report message,
                                                            // cross-checked vs resource snapshot
  report: {
    message: string;
    sourceFile: string | null;
    lineNumber: number | null;
  };
  resources: ResourceSnapshot | null;   // ResourceMonitor.snapshot(): 3 metrics, each
                                         // { current, threshold, utilizationPercent, breached }
  context: {
    tagId: string;
    instanceId: string;
    activeIndex: number | null;
    activeReelId: string | number | null;
    adLayout: string | null;
    adSource: string | null;            // provider/ad_source if known at removal time
    isMuted: boolean | null;
    msSinceMount: number;
  };
}
```

`limit` derivation: parse Chrome's report message (it names the exceeded resource); when
ambiguous, fall back to the highest-`utilizationPercent` metric in the resource snapshot;
else `"unknown"`.

## Emission — both channels

1. **Analytics:** new `EVENT.AD_REMOVED = "Ad Removed"`; `sendEvent(EVENT.AD_REMOVED, payload)`
   → RudderStack (aggregated, queryable across production traffic — the primary "get to know").
2. **Client bus + `window.cxr`:** `bus.emit("ad:removed", payload)`, mirrored via
   `window.cxr._emit(instanceId, "ad:removed")` beside the existing `ad:fill`/`ad:nofill`
   wiring in `AppRegistrar` (live host-page + dev-console visibility).

Fire **once per removal** (a per-instance `firedRef` guard) — an HAI removal is terminal for
the frame; never emit duplicates.

## Placement

`AppRegistrar` (`src/app/App.tsx`) — already owns `instanceId`, `bus`, and the monitor's
`getSnapshot`, and sits inside the Analytics / Feed / Strategy providers, so `sendEvent`,
`tagId`, and reel context are all reachable. Wire the new hook there, next to
`useResourceMonitor`.

## Files

- `src/analytics/analytics.ts` — add `AD_REMOVED: "Ad Removed"`.
- `src/monitoring/heavyAdReporter.ts` (new) — pure helpers: `isHeavyAdInterventionReport(report)`
  and `parseInterventionLimit(message, snapshot)`. Pure → fully unit-testable.
- `src/monitoring/useHeavyAdReporter.ts` (new) — the hook: attaches the `ReportingObserver`,
  assembles the payload from injected getters (snapshot, context, sendEvent, bus), fires once.
- `src/app/App.tsx` — wire the hook in `AppRegistrar`; add the `ad:removed` → `window.cxr._emit`
  mirror to the existing subscription list.
- Colocated tests: `heavyAdReporter.test.ts` (pure helpers), `useHeavyAdReporter.test.tsx`
  (observer wiring via an injectable observer/report double + fired-once guard).

## Testing

- `isHeavyAdInterventionReport`: true for HAI-id reports, false for other intervention reports
  and non-intervention reports.
- `parseInterventionLimit`: message → `network`/`cpu-peak`/`cpu-total`; ambiguous message
  falls back to the snapshot's top-utilization metric; empty/none → `unknown`.
- Hook: on an injected HAI report, fires `sendEvent(AD_REMOVED, …)` **and** `bus.emit("ad:removed", …)`
  exactly once, with the assembled payload; a second report does not re-fire; no
  `ReportingObserver` in env → mounts clean, no throw, no event.

## Caveats

- **Best-effort:** if Chrome tears the frame down before the callback runs, the report may not
  fire. The declined breach-prediction path would have covered that gap; the accepted scope
  accepts occasional misses in exchange for zero false positives.
- **Chromium-only:** ReportingObserver + HAI are Chromium features; other browsers no-op.
- **Message parsing is heuristic:** the report message format is not a stable API — hence the
  resource-snapshot cross-check and the `"unknown"` fallback.
