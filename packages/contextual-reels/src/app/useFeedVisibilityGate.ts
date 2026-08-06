/**
 * useFeedVisibilityGate — top-level viewport visibility gate for the
 * `visibilityGate` strategy (see `strategies.ts`). Turns {@link useInView}'s raw
 * on-screen signal into the render/passback/teardown state machine described in
 * the design spec (`docs/superpowers/specs/2026-08-06-cxr-feed-visibility-gate-design.md`):
 *
 *   flag off             → shouldRender = true, no observer, no timer
 *   flag on, not visible → shouldRender = false; arm a hidden-timeout on mount
 *     visible before it fires  → cancel (guarded at fire time), latch, render
 *     timeout fires             → onUnitFail("unit_hidden") — passback + destroy
 *   flag on, visible on mount → shouldRender = true immediately, timer never arms
 *   after a first visibility  → later hidden → destroy only when the
 *                                {@link Strategies.destroyOnHide} strategy is on
 *                                (defaults off — the unit stays up)
 *
 * Once the unit has been visible at least once, `unit_hidden` can never fire
 * again — `hasBeenVisibleRef` is the single guard for that.
 *
 * Also stamps `unit_visible` (boolean) via
 * {@link AnalyticsContextValue.setLiveEventContext} — a point-in-time snapshot,
 * not the flush-time-retroactive `setBaseEventContext` — so every event fired
 * from this point on reports whether the unit was on screen AT THAT MOMENT,
 * independent of the destroy-on-hide/`hasBeenVisibleRef` latch. Skipped while
 * `isVisible` is `null` (not yet measured) rather than treated as hidden — an
 * above-the-fold unit's very first events shouldn't read as a false negative
 * before the observer's first callback arrives.
 *
 * **Measurement is decoupled from the gate.** The observer runs and
 * `unit_visible` is stamped on EVERY tag, regardless of `visibilityGate`. Only
 * the render/passback/teardown decisions below are flag-gated. This lets us
 * collect real on-screen data across all traffic (gate off) before turning the
 * revenue-touching gate on for any tag. Each stamp also carries
 * `unit_visible_source` ({@link VisibilitySource}) so the analysis can drop
 * fail-open readings — a `unit_visible: true` from a runtime with no
 * `IntersectionObserver` must not inflate the measured visibility rate — and,
 * once known, `unit_visible_cross_origin` (from the observer's nulled
 * `rootBounds`) so the rate can be segmented by frame context: the cross-origin
 * iframe path is where the measurement is most fragile.
 *
 * Must be called from a component mounted inside StrategyProvider + AdProvider +
 * AnalyticsProvider + EventBusProvider (InstanceProvider). Unlike its previous
 * revision, this hook owns its own DOM target: attach the returned `overlayRef`
 * callback ref to the element to observe — one that renders unconditionally,
 * not one gated by this hook's own `shouldRender` — so the observer has a
 * stable target for the whole widget lifetime, and re-wires itself correctly
 * even if that element mounts after this hook's first render.
 */
import { useCallback, useEffect, useRef, useState } from "react";

import { useEventBus, useInstanceId } from "@cxr/instance/InstanceContext";
import { getInstanceRegistry } from "@cxr/instance/registry/InstanceRegistry";
import { useInView } from "@cxr/monitoring/useInView";
import { useAdWaterfall, type PassbackReason } from "@cxr/providers/AdProvider";
import { useAnalytics } from "@cxr/providers/AnalyticsProvider";
import { useStrategy } from "@cxr/strategies/StrategyProvider";
import { createLogger } from "@cxr/utils/logger";

const logger = createLogger("cxr/useFeedVisibilityGate");

/** Return value of {@link useFeedVisibilityGate}. */
export interface FeedVisibilityGateResult {
  /** Whether the feed body should render. `false` means show the loading skeleton. */
  shouldRender: boolean;
  /**
   * Callback ref — attach to the element to observe (see the module doc
   * comment for why it must render unconditionally).
   */
  overlayRef: (element: HTMLElement | null) => void;
}

/**
 * Gate feed rendering on the visibility of the element attached to the
 * returned `overlayRef`. See the module doc comment for the full state
 * machine.
 */
export function useFeedVisibilityGate(): FeedVisibilityGateResult {
  const { visibilityGate, visibilityGateTimeoutMs, destroyOnHide } = useStrategy();
  const { onUnitFail } = useAdWaterfall();
  const { setLiveEventContext } = useAnalytics();
  const bus = useEventBus();
  const instanceId = useInstanceId();

  // Observe on EVERY tag, not just gated ones — `unit_visible` is measured for
  // all traffic (see the module doc). The flag only gates what we DO with the
  // reading (render/passback/teardown), not whether we take it. `source` rides
  // alongside so the analytics consumer can exclude fail-open readings, and
  // `crossOriginRoot` lets it segment the fragile cross-origin-iframe path.
  const { ref: overlayRef, isVisible, source, crossOriginRoot } = useInView({});

  const [shouldRender, setShouldRender] = useState<boolean>(() => !visibilityGate);
  const hasBeenVisibleRef = useRef(false);
  const destroyedRef = useRef(false);

  // onUnitFail is read from a ref inside the timeout below so a re-resolved
  // AdProvider context (its identity is normally stable per mount, but nothing
  // guarantees that forever) never fires a stale closure.
  const onUnitFailRef = useRef(onUnitFail);
  useEffect(() => {
    onUnitFailRef.current = onUnitFail;
  }, [onUnitFail]);

  /** Ad-slot teardown with no passback — the post-render "went hidden" path. */
  const destroyOnly = useCallback((): void => {
    if (destroyedRef.current) return;
    destroyedRef.current = true;
    setShouldRender(false);
    bus.emit("genad:destroy", {});
    getInstanceRegistry().get(instanceId)?.destroy?.();
  }, [bus, instanceId]);

  // Arm the hidden-timeout once per mount, only when the gate is on. Guarded at
  // fire time rather than explicitly cleared on visibility — becoming visible
  // sets hasBeenVisibleRef, which makes the fire a no-op; functionally identical
  // to cancelling, and avoids a second ref just to hold the timer id.
  useEffect(() => {
    if (!visibilityGate) return;

    const timerId = window.setTimeout(() => {
      if (hasBeenVisibleRef.current || destroyedRef.current) return;
      // onUnitFail (AdProvider.firePassback) already performs the full
      // teardown (bus.emit("genad:destroy") + registry destroy) — mark
      // destroyed so a later visibility flicker can't run destroyOnly's
      // teardown a second time, but don't call destroyOnly itself here.
      destroyedRef.current = true;
      logger.warn(`unit_hidden passback — instance ${instanceId} stayed hidden for ${visibilityGateTimeoutMs}ms`);
      onUnitFailRef.current("unit_hidden" satisfies PassbackReason);
    }, visibilityGateTimeoutMs);

    return () => window.clearTimeout(timerId);
  }, [visibilityGate, visibilityGateTimeoutMs, instanceId]);

  // React to visibility transitions.
  useEffect(() => {
    if (!visibilityGate || destroyedRef.current) return;

    if (isVisible === true) {
      if (!hasBeenVisibleRef.current) {
        hasBeenVisibleRef.current = true;
        setShouldRender(true);
      }
      return;
    }

    if (isVisible === false && hasBeenVisibleRef.current && destroyOnHide) {
      destroyOnly();
    }
  }, [isVisible, visibilityGate, destroyOnHide, destroyOnly]);

  // Stamp the live visibility onto every subsequent analytics event. Deliberately
  // independent of visibilityGate AND of hasBeenVisibleRef/destroyedRef/
  // destroyOnHide — this reports what was true at the moment each event fires
  // (on every tag, gate on or off), not the gate's own decisions. Skipped only
  // while `null` (not yet measured), never treated as a false hidden.
  //
  // `unit_visible_source` rides alongside so the data consumer can exclude
  // fail-open readings ("unsupported"/"error") from any visibility rate — a
  // fail-open `true` must never be counted as a genuinely-measured visible unit,
  // or the aggregate skews high and the gate looks safer than it is.
  //
  // `unit_visible_cross_origin` is stamped only once known (not null) so the
  // rate can be segmented by frame context — cross-origin iframes (the dominant
  // embed path) are where IntersectionObserver's cross-frame behaviour is most
  // fragile, so their measured readings warrant separate scrutiny.
  useEffect(() => {
    if (isVisible === null) return;
    setLiveEventContext({
      unit_visible: isVisible,
      unit_visible_source: source,
      ...(crossOriginRoot !== null ? { unit_visible_cross_origin: crossOriginRoot } : {}),
    });
  }, [isVisible, source, crossOriginRoot, setLiveEventContext]);

  return { shouldRender, overlayRef };
}
