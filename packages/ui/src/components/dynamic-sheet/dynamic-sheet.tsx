"use client";

import { useState, useRef, useEffect, useLayoutEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";

import { XIcon } from "@genuin/ui/icons";
import { cn } from "@genuin/ui/lib/utils";

import { DynamicSheetOverlay, DynamicSheetDragIndicator } from "./dynamic-sheet-parts";
import { isAutoHeight } from "./helpers";
import {
  DEFAULT_HEIGHTS,
  DYNAMIC_SHEET_STATES,
  type DynamicSheetProps,
  type DynamicSheetState,
  type HeightValue,
} from "./types";
import { useDynamicSheet } from "./use-dynamic-sheet";

// ─── Animation Timing ─────────────────────────────────────────────────────────

const CLOSE_ANIMATION_MS = 380;
const OPEN_ANIMATION_MS = 420;

// ─── DynamicSheet ─────────────────────────────────────────────────────────────

/**
 * A draggable bottom-sheet component with three render strategies:
 *
 * - **"fixed"** (default) – portal into `document.body`, `position:fixed`,
 *   covers the full viewport.
 *
 * - **"container"** – `position:absolute` inside nearest positioned ancestor.
 *   Pass `containerRef` so the hook can measure the container height.
 *   Slides up via `translateY`.
 *
 * - **"inline"** – **no positioning applied**. The sheet renders as a normal
 *   block element wherever it is placed in the DOM. The parent is fully
 *   responsible for placement (layout, flex, grid, etc.). Height animates
 *   `0 → computed` on open. Pass `containerRef` for %-based heights, or the
 *   sheet falls back to measuring its own parent element. The `containerRef`
 *   may resolve after the first commit (e.g. set in a consumer's layout
 *   effect); the sheet rebinds to it as soon as it populates.
 *
 * `isOpen` drives the open/close animation.
 * `onDismissed` fires after the close animation ends so the parent can unmount.
 */
function DynamicSheet({
  isOpen,
  onDismissed,
  config = {},
  renderMode = "fixed",
  controlledState,
  bottomInset,
  containerRef,
  header,
  footer,
  children,
  className = "",
  headerClassName = "",
  contentClassName = "",
  footerClassName = "",
  onDragging,
  onSwiperToggle,
  autoHeightProvider,
  ...rest
}: DynamicSheetProps) {
  const isFixedMode = renderMode === "fixed";
  const isContainerMode = renderMode === "container";
  const isInlineMode = renderMode === "inline";
  const isDarkTheme = config.theme === "dark";

  // Internal ref used in "inline" mode when no containerRef is provided.
  // Attached to the sheet panel itself so we can walk to its parentElement.
  const selfRef = useRef<HTMLDivElement>(null);

  // ── Container / viewport height measurement ────────────────────────────
  // `window.innerHeight` is only a placeholder for the non-fixed modes — the
  // measurement effect below always overwrites it once the real element
  // resolves, so a wrong initial value cannot get "locked in".
  const [containerHeight, setContainerHeight] = useState(() => {
    if (typeof window === "undefined") return 0;
    if (isFixedMode) return window.innerHeight;
    return containerRef?.current?.clientHeight ?? window.innerHeight;
  });

  // Reactive copy of `containerRef.current`. A `containerRef` may be empty on
  // the first commit (consumers often resolve the element in a layout effect of
  // their own), and a ref's `.current` mutation never re-runs an effect. We
  // mirror it into state so the measurement effect below rebinds its
  // ResizeObserver the moment the element appears.
  const [resolvedContainer, setResolvedContainer] = useState<HTMLElement | null>(() => containerRef?.current ?? null);

  // Runs after every commit (cheap reference compare). When `containerRef.current`
  // transitions null → element (or changes), sync it into state. The reference
  // guard prevents an infinite render loop.
  useLayoutEffect(() => {
    const next = containerRef?.current ?? null;
    setResolvedContainer((prev) => (prev === next ? prev : next));
  });

  useEffect(() => {
    if (isFixedMode) {
      const onResize = () => setContainerHeight(window.innerHeight);
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }

    if (isInlineMode) {
      // Prefer the resolved explicit container; otherwise observe the sheet's
      // own parent. Depending on `resolvedContainer` (not the ref object) means
      // this effect re-runs and rebinds once a deferred container resolves,
      // while a missing/unresolved container still falls back to the parent.
      const el = resolvedContainer ?? selfRef.current?.parentElement ?? null;
      if (!el) return;
      const observer = new ResizeObserver(() => setContainerHeight(el.clientHeight));
      observer.observe(el);
      setContainerHeight(el.clientHeight);
      return () => observer.disconnect();
    }

    // "container" mode
    const element = resolvedContainer;
    if (!element) return;
    const observer = new ResizeObserver(() => setContainerHeight(element.clientHeight));
    observer.observe(element);
    setContainerHeight(element.clientHeight);
    return () => observer.disconnect();
  }, [isFixedMode, isInlineMode, resolvedContainer]);

  // Track previous open state to detect when sheet is opening
  const prevIsOpenRef = useRef(isOpen);

  // ── Open / close animation state ───────────────────────────────────────
  const [isVisible, setIsVisible] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const startClose = useCallback(() => {
    config.onClose?.();
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setIsVisible(false);
    closeTimerRef.current = setTimeout(() => onDismissed?.(), CLOSE_ANIMATION_MS + 20);
  }, [config, onDismissed]);

  useEffect(() => {
    if (isOpen) {
      // Double-rAF ensures CSS transition fires after the element is painted.
      setIsVisible(false);
      animFrameRef.current = requestAnimationFrame(() => {
        animFrameRef.current = requestAnimationFrame(() => setIsVisible(true));
      });
    } else {
      setIsVisible(false);
      closeTimerRef.current = setTimeout(() => onDismissed?.(), CLOSE_ANIMATION_MS + 20);
    }

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, [isOpen]);

  // ── Merge config with defaults ─────────────────────────────────────────
  const heights = useMemo(() => ({ ...DEFAULT_HEIGHTS, ...(config.heights || {}) }), [config.heights]);

  const enabledStates = useMemo(
    () => config.enabledStates ?? ([...DYNAMIC_SHEET_STATES] as DynamicSheetState[]),
    [config.enabledStates]
  );

  // ── Auto-height: measure rendered chrome + content ────────────────────
  // States configured with `height: "auto"` resolve to a measured
  // pixel value at runtime (sum of indicator + header + content
  // scrollHeight + footer). The pixel value flows through `heights`
  // to the snap math, so drag/snap/animation all work with auto
  // sizing — and the panel grows or shrinks in real time as the
  // content changes (e.g. title wrapping to one vs two lines).
  const indicatorRef = useRef<HTMLDivElement>(null);
  const headerWrapRef = useRef<HTMLDivElement>(null);
  const footerWrapRef = useRef<HTMLDivElement>(null);
  // `contentRef` is declared further down for the existing scroll
  // logic; we forward-declare via `useRef` here so the measurement
  // effect can read it. The two refs intentionally point to the
  // same node — see the `ref={contentRef}` assignment below.
  const measureContentRef = useRef<HTMLDivElement>(null);

  const [measuredAutoPx, setMeasuredAutoPx] = useState(0);

  // Per-state auto measurement: populated only when the host supplies
  // `autoHeightProvider`. Lets the engine resolve a *distinct* height
  // for each enabled `"auto"` state even when their bodies differ from
  // the currently-mounted `children`. Without this map, two adjacent
  // `"auto"` states would collide on the active body's measurement
  // (the bug `embed-xs` / `embed-sml` previously worked around with
  // `expand-view: "50vh"`, which over-sized the panel).
  const [autoPxByState, setAutoPxByState] = useState<Partial<Record<DynamicSheetState, number>>>({});

  // Stable map of refs for each enabled `"auto"` state's hidden well.
  // Cleared between renders so stale states don't keep their refs.
  const autoWellRefs = useRef<Map<DynamicSheetState, HTMLDivElement | null>>(new Map());

  // List of states whose configured height is `"auto"` and for which
  // the host provides a body renderer. The wells are only mounted
  // when both conditions hold.
  const autoStates = useMemo<DynamicSheetState[]>(() => {
    if (!autoHeightProvider) return [];
    return enabledStates.filter((state) => {
      const value = heights[state];
      return value !== undefined && isAutoHeight(value);
    });
  }, [autoHeightProvider, enabledStates, heights]);

  const resolvedHeights = useMemo(() => {
    const out: Partial<Record<DynamicSheetState, HeightValue>> = {};
    for (const state of DYNAMIC_SHEET_STATES) {
      const value = heights[state];
      if (value !== undefined && isAutoHeight(value)) {
        // Prefer the per-state measurement when available; fall back
        // to the shared active-body measurement (legacy path).
        const perState = autoPxByState[state];
        const px = typeof perState === "number" && perState > 0 ? perState : measuredAutoPx;
        out[state] = `${px}px`;
      } else {
        out[state] = value;
      }
    }
    return out as Record<DynamicSheetState, HeightValue>;
  }, [heights, measuredAutoPx, autoPxByState]);

  // ── Draggable hook ─────────────────────────────────────────────────────
  const { currentState, isDragging, transientHeightPx, handleDragStart, stateToPx, transitionTo } = useDynamicSheet({
    enabledStates,
    heights: resolvedHeights,
    initialState: config.initialState ?? "default",
    containerHeight,
    onStateChange: config.onStateChange,
    onRequestClose: startClose,
    stepByStepSwipeDown: config.stepByStepSwipeDown ?? true,
    disableDragAndSwipe: config.disableDragAndSwipe ?? false,
    autoAdvance: config.autoAdvance,
  });

  // Auto-height measurement: re-runs whenever the rendered content
  // changes shape — when the host swaps `header` / `footer` /
  // `children`, AND when the dynamic-sheet transitions between
  // states. The content size is read from a dedicated inner
  // wrapper (`measureContentRef`) instead of the scrollable
  // container — `scrollHeight` on the scrollable parent collapses
  // to its `clientHeight` when content fits, which would freeze
  // the panel at its previous size.
  //
  // Skipped entirely when `heights[currentState]` is a fixed value
  // (`100%`, `70vh`, `200px`, …) — the panel uses that value
  // directly via `resolvedHeights`, so the measured-auto pixel
  // count is unread. Avoids attaching a ResizeObserver / running
  // synchronous DOM reads on every parent render for those states.
  useEffect(() => {
    if (!isAutoHeight(heights[currentState] ?? "")) return;

    const recompute = () => {
      const indicator = indicatorRef.current?.offsetHeight ?? 0;
      const headerH = headerWrapRef.current?.offsetHeight ?? 0;
      const content = measureContentRef.current?.offsetHeight ?? 0;
      const footerH = footerWrapRef.current?.offsetHeight ?? 0;
      setMeasuredAutoPx(indicator + headerH + content + footerH);
    };
    recompute();

    const observer = new ResizeObserver(recompute);
    const targets = [indicatorRef.current, headerWrapRef.current, measureContentRef.current, footerWrapRef.current];
    targets.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [heights, header, footer, children, currentState]);

  // Per-state auto measurement. Mounted only when `autoHeightProvider`
  // is supplied (no-op otherwise). One ResizeObserver covers every
  // well in `autoStates`.
  //
  // Contract: when `autoHeightProvider` is set, the host renders the
  // full panel-shaped subtree (header + body + footer) inside each
  // well. The well's `offsetHeight` therefore already accounts for
  // that state's chrome — we must NOT add `headerH` / `footerH` again
  // here or we'd double-count chrome for the active state and
  // resolve oversized panels. The indicator strip lives outside the
  // chrome wrapper in the active panel, so it's still added.
  useEffect(() => {
    if (!autoHeightProvider || autoStates.length === 0) return;

    const recompute = () => {
      const indicator = indicatorRef.current?.offsetHeight ?? 0;
      const next: Partial<Record<DynamicSheetState, number>> = {};
      for (const state of autoStates) {
        const well = autoWellRefs.current.get(state);
        const body = well?.offsetHeight ?? 0;
        if (body > 0) next[state] = indicator + body;
      }
      // Only update when at least one well has a non-zero
      // measurement — otherwise we'd flip the resolved height to a
      // chrome-only value on first paint, briefly collapsing the panel.
      setAutoPxByState((prev) => {
        const same =
          Object.keys(next).every((k) => prev[k as DynamicSheetState] === next[k as DynamicSheetState]) &&
          Object.keys(prev).length === Object.keys(next).length;
        return same ? prev : next;
      });
    };

    recompute();

    const observer = new ResizeObserver(recompute);
    // Observe every mounted well plus the shared chrome refs — chrome
    // changes (e.g. header text wrapping) should update every state's
    // resolved height together.
    autoWellRefs.current.forEach((el) => el && observer.observe(el));
    [indicatorRef.current, headerWrapRef.current, footerWrapRef.current].forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [autoHeightProvider, autoStates, header, footer]);

  // True when the current state has a *fixed* (non-auto) height —
  // e.g. `100%`, `70vh`, `200px`. In that case the inner measurement
  // wrapper gets `height: 100%` so the children can fill the panel
  // (otherwise `h-full` inside resolves against the wrapper's auto
  // height = the children's natural size = circular). For auto
  // states we keep the wrapper auto so its `offsetHeight` reads the
  // children's natural size for `measuredAutoPx`.
  const isFixedHeightState = !isAutoHeight(heights[currentState] ?? "");

  // ── Reset to initial state when sheet opens ────────────────────────────
  // Also re-transition while open if `config.initialState` changes —
  // hosts (e.g. parent React state machines) can use this to push a
  // new "starting state" after mount, which is otherwise impossible
  // because `useDynamicSheet`'s `useState` only takes the initial
  // value on first render.
  const prevInitialStateRef = useRef(config.initialState);
  useEffect(() => {
    const opening = isOpen && !prevIsOpenRef.current;
    const initialStateChanged = isOpen && prevInitialStateRef.current !== config.initialState;

    if (opening || initialStateChanged) {
      // When the host controls state externally, open directly into the
      // controlled target — otherwise we'd land on `config.initialState`
      // ("default") and the controlled-state effect below would be blocked
      // by the 100ms pending-transition lock this call sets.
      const desired = controlledState ?? config.initialState ?? "default";
      const targetState = enabledStates.includes(desired) ? desired : enabledStates[0];
      transitionTo(targetState ?? "default");
    }
    prevIsOpenRef.current = isOpen;
    prevInitialStateRef.current = config.initialState;
  }, [isOpen, config.initialState, controlledState, enabledStates, transitionTo]);

  // ── Externally-controlled state ────────────────────────────────────────
  // When the host drives the sheet via `controlledState` (the octo flow),
  // transition to it whenever it changes. `config.initialState` is fixed at
  // "default" for these hosts, so the open/initial effect above only ever
  // lands on "default" — without this the parent's target states
  // (default-active, expand-view, panel-view, full-view) are unreachable
  // unless the user manually drags/clicks. `transitionTo` no-ops when the
  // target isn't enabled or already current, so this is safe to fire on
  // every change.
  useEffect(() => {
    if (controlledState === undefined) return;
    transitionTo(controlledState);
  }, [controlledState, transitionTo]);

  // ── Notify parent when dragging state changes ─────────────────────────
  useEffect(() => {
    onDragging?.(isDragging);
    // Keep swiper disabled while the sheet is being dragged
    onSwiperToggle?.(isDragging);
  }, [isDragging, onDragging, onSwiperToggle]);

  // ── Sheet-level pointer handlers (disable swiper on any touch/click) ───
  const disableDragAndSwipe = config.disableDragAndSwipe ?? false;

  const handleSheetPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (disableDragAndSwipe) return;
      onSwiperToggle?.(true);
      handleDragStart(e);
    },
    [disableDragAndSwipe, onSwiperToggle, handleDragStart]
  );

  const handleSheetPointerUp = useCallback(() => {
    if (disableDragAndSwipe) return;
    onSwiperToggle?.(false);
  }, [disableDragAndSwipe, onSwiperToggle]);

  // ── Content pull-to-close gesture ─────────────────────────────────────
  // We need our own mini-gesture detector on the content area so that:
  //   • We ALWAYS block the sheet drag handler from the content (prevents
  //     setPointerCapture stealing native scroll at every touch).
  //   • When the user is at scrollTop === 0 and swipes DOWN, we hand off
  //     to the sheet's close/lower-state logic (Instagram-like behaviour).
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contentGesture = useRef<{
    startY: number;
    pointerId: number;
    active: boolean;
  } | null>(null);

  const handleContentScroll = useCallback(() => {
    onSwiperToggle?.(true);
    if (scrollEndTimerRef.current) clearTimeout(scrollEndTimerRef.current);
    scrollEndTimerRef.current = setTimeout(() => {
      onSwiperToggle?.(false);
    }, 150);
  }, [onSwiperToggle]);

  const handleContentPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      // Always stop propagation so the sheet's handleDragStart is NEVER
      // triggered from points inside the scrollable content area.
      e.stopPropagation();
      if (disableDragAndSwipe) return;
      onSwiperToggle?.(true);

      const el = e.currentTarget;
      if (el.scrollTop === 0 && e.button === 0) {
        // At the very top — start tracking for a potential pull-to-close.
        contentGesture.current = {
          startY: e.clientY,
          pointerId: e.pointerId,
          active: true,
        };
        el.setPointerCapture(e.pointerId);
      }
    },
    [disableDragAndSwipe, onSwiperToggle]
  );

  const handleContentPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (disableDragAndSwipe) return;
      const gesture = contentGesture.current;
      if (!gesture?.active) return;

      const el = e.currentTarget;

      // If the content has scrolled since the gesture started, bail out —
      // the user is scrolling content, not pulling the sheet.
      if (el.scrollTop > 0) {
        contentGesture.current = null;
        el.releasePointerCapture(gesture.pointerId);
        return;
      }

      const deltaY = e.clientY - gesture.startY;

      // Require at least 8 px downward movement before acting.
      if (deltaY > 70) {
        contentGesture.current = null;
        el.releasePointerCapture(gesture.pointerId);
        // Delegate to the sheet's own close / step-down logic.
        startClose();
      }
    },
    [startClose]
  );

  const handleContentPointerUp = useCallback(() => {
    contentGesture.current = null;
    if (disableDragAndSwipe) return;
    onSwiperToggle?.(false);
  }, [disableDragAndSwipe, onSwiperToggle]);

  // ── Computed height & transitions ──────────────────────────────────────
  // `"auto"` / `"fit-content"` heights are resolved to a measured
  // pixel value (see `resolvedHeights` above), so by the time we get
  // here every height is a real number. Snap math and CSS just deal
  // with pixels.
  const snappedHeight = isDragging && transientHeightPx !== null ? transientHeightPx : stateToPx(currentState);

  // In "inline" mode: open = snappedHeight, closed = 0 (no translateY).
  // In "fixed"/"container": always show snappedHeight, use translateY for
  // the open/close animation.
  const computedHeight: number = isInlineMode ? (isVisible || isDragging ? snappedHeight : 0) : snappedHeight;

  const heightTransition =
    isDragging || config.disableAnimation ? "none" : `height 320ms cubic-bezier(0.32, 0.72, 0, 1)`;

  // translateY is only used for fixed/container render modes.
  const translateY = !isInlineMode && (isVisible || isDragging) ? "0%" : "100%";

  const translateTransition =
    isInlineMode || isDragging || config.disableAnimation
      ? "none"
      : isVisible
        ? `transform ${OPEN_ANIMATION_MS}ms cubic-bezier(0.32, 0.72, 0, 1)`
        : `transform ${CLOSE_ANIMATION_MS}ms cubic-bezier(0.32, 0.72, 0, 1)`;

  // ── Overlay ────────────────────────────────────────────────────────────
  // Overlay is only meaningful for fixed/container modes.
  const showOverlay =
    !isInlineMode && config.showOverlay && (currentState === "panel-view" || currentState === "full-view");

  // ── Sheet panel style ──────────────────────────────────────────────────
  // Opt-in bottom inset for bottom-anchored sheets (e.g. shift above the iOS
  // keyboard). Applied only when a number is supplied so consumers that omit it
  // keep byte-identical behaviour. `bottom` is intentionally NOT transitioned
  // so it tracks the keyboard instantly without lagging the height animation.
  const bottomInsetStyle: React.CSSProperties = typeof bottomInset === "number" ? { bottom: `${bottomInset}px` } : {};

  const panelPositionStyle: React.CSSProperties = isInlineMode
    ? {
        // No position — parent controls placement. `bottom` only has an effect
        // when the parent/className positions the panel (e.g. octo forces
        // `position: fixed` via className for its expanded states).
        height: computedHeight,
        transition: heightTransition,
        ...bottomInsetStyle,
      }
    : {
        position: isFixedMode ? "fixed" : "absolute",
        height: computedHeight,
        transform: `translateY(${translateY})`,
        transition: [heightTransition, translateTransition].join(", "),
        ...bottomInsetStyle,
      };

  // ── JSX ────────────────────────────────────────────────────────────────
  const sheetJSX = (
    <>
      {/* Overlay (fixed / container only) */}
      {showOverlay && (
        <DynamicSheetOverlay
          theme={config.theme}
          position="fixed"
          isVisible={isVisible}
          openDurationMs={OPEN_ANIMATION_MS}
          closeDurationMs={CLOSE_ANIMATION_MS}
          onClick={startClose}
        />
      )}

      {/* Sheet panel */}
      <div
        ref={isInlineMode ? selfRef : undefined}
        data-slot="dynamic-sheet"
        data-state={currentState}
        data-render-mode={renderMode}
        onPointerDown={handleSheetPointerDown}
        onPointerUp={handleSheetPointerUp}
        onPointerCancel={handleSheetPointerUp}
        className={cn(
          // Positioned modes pin to bottom edge of their containing block.
          !isInlineMode && "gencl:bottom-0 gencl:left-0 gencl:right-0",
          "gencl:z-50 gencl:select-none",
          isContainerMode && "gencl:z-[999]",
          "gencl:flex gencl:flex-col gencl:overflow-hidden gencl:pointer-events-auto",
          "gencl:rounded-xl gencl:will-change-[transform,height]",
          !disableDragAndSwipe && "gencl:cursor-grab gencl:active:cursor-grabbing",
          isDarkTheme ? "gencl:bg-black/50 gencl:backdrop-blur-sm" : "gencl:bg-white",
          className
        )}
        style={panelPositionStyle}
        {...rest}>
        {/* Drag indicator — purely visual chrome (Figma drawer pill).
            We don't gate on `!disableDragAndSwipe`: even surfaces that
            don't actually drag still render the pill for design
            consistency. Hidden in `default` because the resting state
            has no chrome above the body (Figma 8244-20303). Also
            hidden in the `pl-xs` / `pl-sml` chip states (embed-xs /
            embed-sml linkouts) since the chip owns its own surface
            and has no sheet to drag — the indicator only appears
            once the auto-advance lands on `default-active`. */}
        {config.showIndicator !== false &&
          currentState !== "default" &&
          currentState !== "pl-xs" &&
          currentState !== "pl-sml" && (
            <DynamicSheetDragIndicator
              ref={indicatorRef}
              theme={config.theme}
              isDragging={isDragging}
              draggable={!disableDragAndSwipe}
              onPointerDown={disableDragAndSwipe ? undefined : handleSheetPointerDown}
            />
          )}

        {/* Header */}
        {header ? (
          <div
            ref={headerWrapRef}
            data-slot="dynamic-sheet-header"
            onPointerDown={disableDragAndSwipe ? undefined : handleDragStart}
            onClick={(e) => {
              e.stopPropagation();
            }}
            className={cn(
              "gencl:border-b gencl:z-50",
              isDarkTheme ? "gencl:border-white/10" : "gencl:border-secondary-150",
              headerClassName
            )}>
            {header}
          </div>
        ) : config.navTitle || config.showClose ? (
          <div
            ref={headerWrapRef}
            data-slot="dynamic-sheet-header"
            onPointerDown={disableDragAndSwipe ? undefined : handleDragStart}
            onClick={(e) => {
              e.stopPropagation();
            }}
            className={cn(
              "gencl:w-full gencl:shrink-0 gencl:flex gencl:items-center gencl:justify-between gencl:relative",
              "gencl:p-3 gencl:border-b",
              // Cursor lies about draggability if we always set
              // `cursor-grab` — single-state scenarios pass
              // `disableDragAndSwipe: true` and have no pointer
              // handler attached, so the grab affordance shouldn't
              // appear.
              !disableDragAndSwipe && "gencl:cursor-grab gencl:touch-none",
              isDarkTheme ? "gencl:border-white/10" : "gencl:border-secondary-150",
              headerClassName
            )}>
            {config.navTitle && (
              <span
                className={cn(
                  "gencl:flex-1 gencl:min-w-0 gencl:truncate",
                  isDarkTheme ? "gencl:text-white" : "gencl:text-black"
                )}>
                {config.navTitle}
              </span>
            )}

            {config.showClose && (
              <button
                data-slot="draggable-sheet-close"
                className={cn(
                  "gencl:shrink-0 gencl:size-6 gencl:flex gencl:items-center gencl:justify-center",
                  "gencl:rounded-xs gencl:transition-all",
                  isDarkTheme
                    ? "hover:gencl:bg-white/10 hover:gencl:opacity-70"
                    : "hover:gencl:bg-black/5 hover:gencl:opacity-70"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  startClose();
                }}
                onPointerDown={(e) => e.stopPropagation()}
                aria-label="Close"
                type="button">
                <XIcon theme={config.theme} size="md" />
              </button>
            )}
          </div>
        ) : null}

        {/* Scrollable content */}
        {children && (
          <div
            ref={contentRef}
            data-slot="dynamic-sheet-content"
            onPointerDown={handleContentPointerDown}
            onPointerMove={handleContentPointerMove}
            onPointerUp={handleContentPointerUp}
            onPointerCancel={handleContentPointerUp}
            onScroll={handleContentScroll}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "gencl:flex-1 gencl:min-h-0 gencl:overflow-y-auto gencl:overflow-x-hidden",
              "gencl:touch-pan-y gencl:cursor-auto",
              isDarkTheme ? "gencl:text-white" : "gencl:text-black",
              contentClassName
            )}
            style={{ WebkitOverflowScrolling: "touch" }}>
            {/* Inner measurement wrapper: takes its natural height
                from the rendered children (no flex / overflow), so
                its `offsetHeight` reflects the actual content size.
                Reading scrollHeight on the scrollable parent
                returns the parent's clientHeight when content
                fits — useless for shrinking the panel. */}
            <div ref={measureContentRef} className={isFixedHeightState ? "gencl:h-full" : undefined}>
              {children}
            </div>
          </div>
        )}

        {/* Hidden per-state measurement wells. Mounted only when the
            host supplies `autoHeightProvider` and the state's
            configured height is `"auto"`. The wrapper is taken out of
            layout (`position: absolute`, `visibility: hidden`,
            `pointer-events: none`) and marked inert / aria-hidden so
            assistive tech, focus, and pointer events all skip it.
            Width matches the panel so the well's `offsetHeight`
            reflects the body's actual rendered height at the panel's
            own width. */}
        {autoHeightProvider && autoStates.length > 0 && (
          <div
            aria-hidden="true"
            // `inert` is a valid HTMLAttribute in React 19 — opts
            // every descendant out of tab order, focus, and the
            // accessibility tree.
            inert
            data-slot="dynamic-sheet-auto-measure"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              visibility: "hidden",
              pointerEvents: "none",
              overflow: "hidden",
              height: 0,
            }}>
            {autoStates.map((state) => (
              <div
                key={state}
                ref={(el) => {
                  if (el) autoWellRefs.current.set(state, el);
                  else autoWellRefs.current.delete(state);
                }}
                data-auto-measure-state={state}
                // `contain: layout` isolates each well's internal
                // layout calculations from the rest of the panel
                // subtree. Without this, a hidden well that mounts
                // its own widget (e.g. a Swiper instance, or any
                // ResizeObserver-driven layout) inside a 0-height
                // container can pollute shared rendering state — the
                // observed regression was `embed-default`'s panel-view
                // thumb collapsing to 0×0 because the extra `default`
                // well's body shared a layout context with the visible
                // body's Swiper slide chain.
                style={{ width: "100%", contain: "layout" }}>
                {autoHeightProvider(state)}
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        {footer && config.showFooter && (
          <div
            ref={footerWrapRef}
            data-slot="dynamic-sheet-footer"
            className={cn(
              "gencl:shrink-0 gencl:p-2 gencl:border-t",
              isDarkTheme ? "gencl:border-white/10 gencl:text-white" : "gencl:border-secondary-150 gencl:text-black",
              footerClassName
            )}>
            {footer}
          </div>
        )}
      </div>
    </>
  );

  // ── Render strategy ────────────────────────────────────────────────────
  if (isFixedMode) {
    return createPortal(sheetJSX, document.body);
  }

  // "container" and "inline" both render inline in the tree.
  return sheetJSX;
}

export { DynamicSheet };
