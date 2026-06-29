"use client";

// Snap-point bottom sheet — the reworked DynamicSheet model. See
// docs/plans/dynamic-sheet-snap/DESIGN.md. Generic and decoupled: it knows only
// ordered snap points (px or content-measured), a controlled active id, and an
// onSnap callback. Engine: @use-gesture for the gesture/velocity layer + an
// ease-out tween for the snap (no spring — the PoC showed the wanted feel is a
// fast, non-springy snap). Drag the indicator: release velocity projects to the
// nearest snap (fast flick → extreme), then it eases there.

import { useDrag } from "@use-gesture/react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@genuin/ui/lib/utils";

import { DynamicSheetDragIndicator } from "./dynamic-sheet-parts";

/**
 * A snap target — stable id + height. `"auto"` hugs the rendered content;
 * a `"NN%"` string resolves against the sheet's positioning container; a
 * number is raw px.
 */
export interface SnapPoint {
  id: string;
  height: number | "auto" | `${number}%`;
}

export interface SnapSheetProps {
  /** Snap targets (any order; sorted internally by resolved height). */
  snapPoints: SnapPoint[];
  /** Controlled — the committed snap id. */
  activeId: string;
  /** Fired when a drag/tap resolves to a snap. */
  onSnap: (id: string) => void;
  header?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  theme?: "light" | "dark";
  /** Continuously cross-fade the surface (and publish `--gn-sheet-progress`,
   *  0→1, on the root for content to read) between the two lowest snaps as the
   *  sheet is dragged — instead of flipping `theme` on commit. At the lowest
   *  snap progress is 0 (dark), at the second-lowest it's 1 (light). */
  themeProgress?: boolean;
  /** Disables drag/tap (e.g. a single-state banner-ad slot). */
  disabled?: boolean;
  /** Fired true on drag start, false on release — lets the host pause adjacent
   *  swipers (e.g. the outer feed) while the sheet is being dragged. */
  onDragStateChange?: (dragging: boolean) => void;
  /** Fired with the measured natural height of the *current* `activeId`'s body
   *  (for `"auto"` snaps). Lets a consumer cache each state's height and feed it
   *  back as a definite snap so off-screen auto states stay reachable by drag. */
  onAutoMeasure?: (id: string, px: number) => void;
  /** Show the built-in drag-pill indicator above the header (default true). */
  showIndicator?: boolean;
  /** Tap on the drag zone advances one snap (default true). Set false when the
   *  consumer's header owns tap (e.g. an inline pill). */
  tapToAdvance?: boolean;
  /** Release commits exactly ONE snap in the drag direction (past a small
   *  threshold), instead of velocity-projecting to the nearest snap. Use when
   *  snaps are far apart and "drag = next/previous state" is the intent — it
   *  also can't skip a state. Default false (velocity-projected nearest). */
  stepByStep?: boolean;
  /** Gap (px) between the sheet's bottom edge and its container bottom. */
  bottomInset?: number;
  /** Stable px reference for `"NN%"` snap heights. Pass this when the sheet's
   *  positioning parent is itself resized by the snap state (e.g. a player that
   *  reallocates space as the sheet grows) — otherwise `%` resolves against the
   *  animating parent and the snap targets shift mid-drag. Falls back to the
   *  measured parent height when omitted. */
  containerHeight?: number;
  /** Publish the sheet's live height ABOVE its lowest snap (the "overshoot",
   *  px) as this CSS custom property, set on the nearest `[data-player-frame]`
   *  ancestor. Lets a sibling (e.g. a video) shrink continuously as the sheet
   *  is dragged up, while staying full at the lowest snap (overshoot 0). */
  overshootVar?: string;
  /** Publish the sheet's live RAW height (px) as this CSS custom property on
   *  the same frame. Lets a sibling tile against the absolute height (e.g. a
   *  video sized `100% - height`) for the upper snaps where the sheet pushes
   *  rather than overlays. Set alongside `overshootVar`. */
  heightVar?: string;
  /** Classes for the header wrapper (e.g. border overrides per state). */
  headerClassName?: string;
  /** Classes for the footer wrapper. */
  footerClassName?: string;
  /** ms of release velocity to project the snap target by (fling reach). */
  projectionMs?: number;
  /** Ease-out tween duration (ms) for the snap animation. */
  durationMs?: number;
  className?: string;
}

const EPS = 0.5; // px — "already there", skip the tween
const STEP_THRESHOLD_PX = 24; // step-mode: net drag to commit one step
const STEP_FLICK_VEL = 0.4; // step-mode: |px/ms| flick that commits a step
const easeOut = (p: number) => 1 - Math.pow(1 - p, 3);

export function SnapSheet({
  snapPoints,
  activeId,
  onSnap,
  header,
  footer,
  children,
  theme = "light",
  themeProgress = false,
  disabled = false,
  onDragStateChange,
  onAutoMeasure,
  showIndicator = true,
  tapToAdvance = true,
  stepByStep = false,
  bottomInset,
  containerHeight,
  overshootVar,
  heightVar,
  headerClassName,
  footerClassName,
  projectionMs = 800,
  durationMs = 150,
  className,
}: SnapSheetProps) {
  // Natural height of the content chrome+body, for `"auto"` snaps. Measured
  // from the real nodes (no hidden wells) so it tracks data/late-image reflow.
  // NOTE: a single `"auto"` target is fully supported; multiple auto snaps with
  // different per-state content need the §7 per-state measurement refinement.
  const rootRef = useRef<HTMLDivElement>(null);
  const chromeRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null); // inner (unclamped) content
  const footerRef = useRef<HTMLDivElement>(null);
  const [autoPx, setAutoPx] = useState(0);
  const [containerPx, setContainerPx] = useState(0); // positioning container height, for `"%"`

  // Stable container wins for `%` (see prop doc); else the measured parent.
  const pctBase = containerHeight ?? containerPx;
  const resolve = useCallback(
    (p: SnapPoint): number => {
      // Clamp `auto` to the container: during a state transition the content is
      // briefly the *previous* state's (unclamped) body, which can measure far
      // taller than the viewport and fling the settle tween off-screen.
      if (p.height === "auto") return pctBase > 0 ? Math.min(autoPx, pctBase) : autoPx;
      if (typeof p.height === "string") return (parseFloat(p.height) / 100) * pctBase;
      return p.height;
    },
    [autoPx, pctBase]
  );
  const points = [...snapPoints].sort((a, b) => resolve(a) - resolve(b));
  const min = points.length ? resolve(points[0]!) : 0;
  const max = points.length ? resolve(points[points.length - 1]!) : 0;

  // Publish the live overshoot (height above the lowest snap) to the player
  // frame as `overshootVar`. Refs keep the imperative publishers stable while
  // `min`/`overshootVar` change across renders. Cached frame node lets the
  // unmount cleanup clear the var.
  const minRef = useRef(min);
  minRef.current = min;
  // Second-lowest snap height — the upper bound for the theme cross-fade
  // (e.g. the linkout's `panel` above `expand`). Falls back to `max`.
  const secondRef = useRef(0);
  secondRef.current = points.length > 1 ? resolve(points[1]!) : max;
  const overshootVarRef = useRef(overshootVar);
  overshootVarRef.current = overshootVar;
  const heightVarRef = useRef(heightVar);
  heightVarRef.current = heightVar;
  const themeProgressRef = useRef(themeProgress);
  themeProgressRef.current = themeProgress;
  const frameRef = useRef<HTMLElement | null>(null);
  const publishHeights = useCallback((h: number) => {
    // Theme cross-fade progress (0 at lowest snap → 1 at second-lowest), on the
    // root so the surface + content can color-mix against it as the drag moves.
    if (themeProgressRef.current && rootRef.current) {
      const span = secondRef.current - minRef.current;
      const p = span > 0 ? Math.min(1, Math.max(0, (h - minRef.current) / span)) : h >= secondRef.current ? 1 : 0;
      rootRef.current.style.setProperty("--gn-sheet-progress", `${p.toFixed(4)}`);
    }
    const ov = overshootVarRef.current;
    const hv = heightVarRef.current;
    if (!ov && !hv) return;
    const frame = (frameRef.current ??= rootRef.current?.closest("[data-player-frame]") as HTMLElement | null);
    if (!frame) return;
    if (ov) frame.style.setProperty(ov, `${Math.max(0, Math.round(h - minRef.current))}px`);
    if (hv) frame.style.setProperty(hv, `${Math.round(h)}px`);
  }, []);
  // Flag the active drag on the player frame (`--gn-sheet-dragging`: 1/0) so a
  // coordinating sibling (the video) can drop its CSS transition and track the
  // overshoot instantly, then re-enable it for the release settle.
  const publishDragging = useCallback((active: boolean) => {
    if (!overshootVarRef.current) return;
    const frame = (frameRef.current ??= rootRef.current?.closest("[data-player-frame]") as HTMLElement | null);
    frame?.style.setProperty("--gn-sheet-dragging", active ? "1" : "0");
  }, []);
  useEffect(
    () => () => {
      if (overshootVarRef.current) frameRef.current?.style.removeProperty(overshootVarRef.current);
      if (heightVarRef.current) frameRef.current?.style.removeProperty(heightVarRef.current);
    },
    []
  );
  const heightOf = useCallback(
    (id: string) => {
      const p = snapPoints.find((s) => s.id === id);
      return p ? resolve(p) : min;
    },
    [snapPoints, resolve, min]
  );

  // `height` (React state) holds only the *committed/resting* height. The live
  // drag/tween height is written straight to the DOM via `applyHeight` so the
  // sheet follows the finger at native frame-rate — a `setState` per pointer
  // frame re-renders the tree and lags visibly on a heavy body. React reconciles
  // its way back to `height` once the gesture settles (see the idle effect).
  const [height, setHeight] = useState(() => heightOf(activeId));
  const heightRef = useRef(height);

  const rafRef = useRef<number | null>(null);
  const draggingRef = useRef(false);
  const [dragging, setDragging] = useState(false); // reactive, for the indicator
  const startHeightRef = useRef(height);
  const initializedRef = useRef(false);
  const lastActiveIdRef = useRef(activeId);
  // Latest desired height + a self-reference to the tween, so a settle that
  // finished against a since-changed auto target can re-converge once (without
  // being restarted mid-flight — see the follow effect).
  const targetRef = useRef(0);
  const tweenToRef = useRef<(t: number) => void>(() => {});

  // Write the height to the DOM immediately, no re-render; keep the ref
  // authoritative for the next drag-start / projection read.
  const applyHeight = useCallback(
    (h: number) => {
      heightRef.current = h;
      if (rootRef.current) rootRef.current.style.height = `${h}px`;
      publishHeights(h);
    },
    [publishHeights]
  );

  const stopAnim = useCallback(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }, []);

  // Sync the DOM height from committed state while idle (mount + external
  // activeId changes). Yields to an in-flight drag/tween, which own the style
  // imperatively; the trailing `setHeight(target)` re-runs this to reconcile.
  useLayoutEffect(() => {
    if (draggingRef.current || rafRef.current != null) return;
    heightRef.current = height;
    if (rootRef.current) rootRef.current.style.height = `${height}px`;
    publishHeights(height);
  }, [height, publishHeights]);

  // Ease-out tween height → target. Interruptible: a new drag / tweenTo cancels
  // the in-flight animation. Runs imperatively (no per-frame re-render) and
  // commits to React state on the final frame so the resting value reconciles.
  const tweenTo = useCallback(
    (target: number) => {
      stopAnim();
      const from = heightRef.current;
      if (Math.abs(target - from) < EPS) {
        applyHeight(target);
        setHeight(target);
        return;
      }
      const t0 = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - t0) / durationMs, 1);
        applyHeight(from + (target - from) * easeOut(p));
        if (p >= 1) {
          rafRef.current = null;
          setHeight(target);
          // The auto target may have re-measured while we were settling; if so,
          // converge to the latest value with one more tween (not a restart).
          if (Math.abs(targetRef.current - target) > EPS) tweenToRef.current(targetRef.current);
          return;
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    },
    [stopAnim, durationMs, applyHeight]
  );
  tweenToRef.current = tweenTo;

  // Measure the natural content height for `"auto"` snaps (chrome + body + footer).
  useLayoutEffect(() => {
    const nodes = [chromeRef.current, contentRef.current, footerRef.current];
    const measure = () => {
      const px = nodes.reduce((sum, n) => sum + (n?.offsetHeight ?? 0), 0);
      setAutoPx((prev) => (Math.abs(prev - px) > EPS ? px : prev));
    };
    measure();
    const ro = new ResizeObserver(measure);
    nodes.forEach((n) => n && ro.observe(n));
    return () => ro.disconnect();
  }, [children, header, footer]);

  // Report the live body's measured height for the current state so a consumer
  // can cache it and keep off-screen `"auto"` states reachable as snap targets.
  useEffect(() => {
    if (autoPx > 0) onAutoMeasure?.(activeId, autoPx);
  }, [autoPx, activeId, onAutoMeasure]);

  // Measure the direct parent (the host wrapper, sized to the player frame)
  // for `"%"` snap heights — matches the prior sheet, which resolved
  // percentages against its parent's clientHeight.
  useLayoutEffect(() => {
    const parent = rootRef.current?.parentElement;
    if (!parent) return;
    const measure = () =>
      setContainerPx((prev) => (Math.abs(prev - parent.clientHeight) > EPS ? parent.clientHeight : prev));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(parent);
    return () => ro.disconnect();
  }, []);

  // Follow external (controlled) activeId changes, and auto-height reflow, when
  // not dragging. First resolution snaps without animating (avoids mount flash).
  useEffect(() => {
    if (draggingRef.current) return;
    const activeChanged = lastActiveIdRef.current !== activeId;
    lastActiveIdRef.current = activeId;
    const target = heightOf(activeId);
    targetRef.current = target;
    if (!initializedRef.current) {
      initializedRef.current = true;
      heightRef.current = target;
      setHeight(target);
      return;
    }
    // An auto-height re-measure (activeId unchanged) mid-settle must not restart
    // the in-flight tween — that's what makes the commit bounce repeatedly. Let
    // the settle finish; the next idle re-measure converges it.
    if (!activeChanged && rafRef.current != null) return;
    if (Math.abs(target - heightRef.current) > EPS) tweenTo(target);
  }, [activeId, heightOf, tweenTo]);

  useEffect(() => stopAnim, [stopAnim]);

  // Rubber-band resistance past the extremes.
  const rubber = (h: number) => (h > max ? max + (h - max) * 0.4 : h < min ? min - (min - h) * 0.4 : h);

  const bind = useDrag(
    ({ first, last, movement: [, my], velocity: [, vy], direction: [, dy], tap, event }) => {
      // iOS Safari otherwise scrolls/overscrolls (or the outer feed swiper grabs
      // the touch), throttling the move events so the sheet lags and the drag
      // never crosses the step threshold. Non-passive listener + preventDefault
      // on each move keeps the gesture ours. (No-op for mouse on desktop.)
      if (!tap && !first) event?.preventDefault?.();
      if (tap) {
        // Tap the handle → advance one snap (unless the consumer owns tap,
        // e.g. an inline pill with its own tap-to-advance).
        if (!tapToAdvance) return;
        const i = points.findIndex((p) => p.id === activeId);
        const next = points[Math.min(i + 1, points.length - 1)];
        if (next && next.id !== activeId) onSnap(next.id);
        return;
      }
      if (first) {
        draggingRef.current = true;
        setDragging(true);
        stopAnim();
        startHeightRef.current = heightRef.current; // honour mid-animation grabs
        onDragStateChange?.(true);
        publishDragging(true);
      }
      const raw = startHeightRef.current - my; // drag up (my<0) grows the sheet
      if (!last) {
        applyHeight(rubber(raw)); // imperative — follow the finger, no re-render
        return;
      }
      publishDragging(false);
      // Release → pick the target snap.
      draggingRef.current = false;
      setDragging(false);
      onDragStateChange?.(false);
      const heightVel = -dy * vy; // px/ms, + = growing
      const projected = heightRef.current + heightVel * projectionMs;
      let target: SnapPoint;
      if (stepByStep) {
        // One step in the drag direction past a small threshold; else stay.
        // Base it on how far the SHEET travelled from its current snap
        // (`heightRef`), not raw pointer movement: the height accumulates
        // across iOS gesture restarts and reflects the rubber-banded drag, so a
        // laggy/interrupted drag still commits once the sheet moved far enough.
        const i = points.findIndex((p) => p.id === activeId);
        const cur = points[i] ?? points[0]!;
        const heightDelta = heightRef.current - resolve(cur);
        const committed = Math.abs(heightDelta) >= STEP_THRESHOLD_PX || Math.abs(heightVel) >= STEP_FLICK_VEL;
        const grew = heightDelta > 0; // sheet grew → next snap up
        const ni = !committed ? i : grew ? Math.min(i + 1, points.length - 1) : Math.max(i - 1, 0);
        target = points[ni] ?? cur;
      } else {
        // Velocity-projected nearest snap.
        target = points.reduce((best, p) =>
          Math.abs(resolve(p) - projected) < Math.abs(resolve(best) - projected) ? p : best
        );
      }
      tweenTo(resolve(target));
      if (target.id !== activeId) onSnap(target.id);
    },
    // Default pointer events handle mouse + touch + pen. (Do NOT set
    // `pointer: { touch: true }` — that switches to the Touch API and breaks
    // mouse/trackpad dragging on desktop.) `passive: false` lets the handler
    // `preventDefault` the touch-move so iOS Safari doesn't steal the gesture.
    // `filterTaps` only when the sheet owns taps — otherwise it defers the
    // gesture to disambiguate tap-vs-drag, which on iOS touch swallows the
    // initial movement so the drag never crosses the step threshold.
    { axis: "y", filterTaps: tapToAdvance, enabled: !disabled, eventOptions: { passive: false } }
  );

  const isLight = theme === "light";
  return (
    <div
      ref={rootRef}
      data-slot="snap-sheet"
      // In-flow (no absolute positioning) — the parent places it (the linkout's
      // `flex-col justify-end` wrapper pins it to the bottom and host spacing,
      // e.g. the 8px bottom gap, is respected). `bottomInset` shifts it up via
      // margin. Matches the prior DynamicSheet inline mode.
      // `height` is driven imperatively (applyHeight / idle effect), never via
      // the style prop, so a drag follows the finger without a re-render/frame.
      // `transitionProperty` excludes height/width so a consumer `transition-all`
      // can't animate (lag) the JS-driven height — only cosmetic props ease.
      style={{
        marginBottom: bottomInset,
        transitionProperty: "background-color, backdrop-filter, border-radius",
        // `themeProgress`: continuously mix the dark→light surface against the
        // live `--gn-sheet-progress` (set imperatively each drag frame), instead
        // of the discrete theme class flipping on commit.
        ...(themeProgress
          ? {
              backgroundColor: "color-mix(in srgb, rgba(0,0,0,0.5), white calc(var(--gn-sheet-progress, 0) * 100%))",
              backdropFilter: "blur(calc((1 - var(--gn-sheet-progress, 0)) * 4px))",
              WebkitBackdropFilter: "blur(calc((1 - var(--gn-sheet-progress, 0)) * 4px))",
            }
          : null),
      }}
      // Themed panel surface (light = white, dark = translucent black + blur,
      // rounded-xl). The consumer's `className` layers on top (e.g. banner-ad `w-fit`).
      className={cn(
        "gencl:w-full gencl:z-50 gencl:flex gencl:flex-col gencl:overflow-hidden gencl:rounded-xl",
        // Surface is inline-mixed when themeProgress; else the discrete theme bg.
        !themeProgress && (isLight ? "gencl:bg-white" : "gencl:bg-black/50 gencl:backdrop-blur-sm"),
        className
      )}>
      {/* Chrome (indicator + header) = the drag zone. touch-action:none so the
          browser doesn't claim the vertical gesture as a page scroll. The
          header owns its own padding; we only add the themed border. */}
      <div
        ref={chromeRef}
        {...bind()}
        style={{ touchAction: disabled ? undefined : "none" }}
        className={cn(
          "gencl:shrink-0 gencl:select-none",
          !disabled && "gencl:cursor-grab gencl:active:cursor-grabbing"
        )}>
        {showIndicator && <DynamicSheetDragIndicator theme={theme} isDragging={dragging} draggable={!disabled} />}
        {header && (
          <div
            data-slot="snap-sheet-header"
            className={cn(
              "gencl:border-b gencl:z-50 gencl:transition-colors gencl:duration-300",
              isLight ? "gencl:border-secondary-150" : "gencl:border-white/10",
              headerClassName
            )}>
            {header}
          </div>
        )}
      </div>
      <div className="gencl:min-h-0 gencl:flex-1 gencl:overflow-y-auto" style={{ touchAction: "pan-y" }}>
        {/* Inner wrapper is unclamped, so its offsetHeight is the natural
            content height the `"auto"` measurement needs. The body owns its
            own padding (LinkCard etc.). */}
        <div ref={contentRef}>{children}</div>
      </div>
      {footer && (
        <div
          ref={footerRef}
          data-slot="snap-sheet-footer"
          className={cn(
            "gencl:shrink-0 gencl:p-2 gencl:border-t gencl:transition-colors gencl:duration-300",
            isLight ? "gencl:border-secondary-150" : "gencl:border-white/10",
            footerClassName
          )}>
          {footer}
        </div>
      )}
    </div>
  );
}
