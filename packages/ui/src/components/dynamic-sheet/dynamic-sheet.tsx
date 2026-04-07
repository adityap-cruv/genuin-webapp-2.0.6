"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";

import { cn } from "@genuin/ui/lib/utils";

import { useDynamicSheet } from "./use-dynamic-sheet";
import {
  DynamicSheetOverlay,
  DynamicSheetDragIndicator,
} from "./dynamic-sheet-parts";
import {
  DEFAULT_HEIGHTS,
  DYNAMIC_SHEET_STATES,
  type DynamicSheetProps,
  type DynamicSheetState,
} from "./types";
import { XIcon } from "@genuin/ui/icons";

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
 *   sheet falls back to measuring its own parent element.
 *
 * `isOpen` drives the open/close animation.
 * `onDismissed` fires after the close animation ends so the parent can unmount.
 */
function DynamicSheet({
  isOpen,
  onDismissed,
  config = {},
  controlledState,
  renderMode = "fixed",
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
  const [containerHeight, setContainerHeight] = useState(() => {
    if (isFixedMode) return window.innerHeight;
    return containerRef?.current?.clientHeight ?? window.innerHeight;
  });

  useEffect(() => {
    if (isFixedMode) {
      const onResize = () => setContainerHeight(window.innerHeight);
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }

    if (isInlineMode) {
      // Prefer explicit containerRef; otherwise observe the sheet's own parent.
      const el =
        containerRef?.current ?? selfRef.current?.parentElement ?? null;
      if (!el) return;
      const observer = new ResizeObserver(() =>
        setContainerHeight(el.clientHeight),
      );
      observer.observe(el);
      setContainerHeight(el.clientHeight);
      return () => observer.disconnect();
    }

    // "container" mode
    const element = containerRef?.current;
    if (!element) return;
    const observer = new ResizeObserver(() =>
      setContainerHeight(element.clientHeight),
    );
    observer.observe(element);
    setContainerHeight(element.clientHeight);
    return () => observer.disconnect();
  }, [isFixedMode, isInlineMode, containerRef]);

  // Track previous open state to detect when sheet is opening
  const prevIsOpenRef = useRef(isOpen);

  // ── Open / close animation state ───────────────────────────────────────
  const [isVisible, setIsVisible] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const startClose = useCallback(() => {
    config.onClose?.();
    if (config.preventCloseCollapse) return; // caller handles state reset; don't collapse
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setIsVisible(false);
    closeTimerRef.current = setTimeout(
      () => onDismissed?.(),
      CLOSE_ANIMATION_MS + 20,
    );
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
      closeTimerRef.current = setTimeout(
        () => onDismissed?.(),
        CLOSE_ANIMATION_MS + 20,
      );
    }

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, [isOpen]);

  // ── Merge config with defaults ─────────────────────────────────────────
  const heights = useMemo(
    () => ({ ...DEFAULT_HEIGHTS, ...(config.heights || {}) }),
    [config.heights],
  );

  const enabledStates = useMemo(
    () =>
      config.enabledStates ??
      ([...DYNAMIC_SHEET_STATES] as DynamicSheetState[]),
    [config.enabledStates],
  );

  // ── Draggable hook ─────────────────────────────────────────────────────
  const {
    currentState,
    isDragging,
    transientHeightPx,
    handleDragStart,
    stateToPx,
    transitionTo,
  } = useDynamicSheet({
    enabledStates,
    heights,
    initialState: config.initialState ?? "default",
    containerHeight,
    onStateChange: config.onStateChange,
    onRequestClose: startClose,
    stepByStepSwipeDown: config.stepByStepSwipeDown ?? true,
    disableDragAndSwipe: config.disableDragAndSwipe ?? false,
    autoAdvance: config.autoAdvance,
  });

  // ── Reset to initial/controlled state when sheet opens ──────────────────
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      // Sheet is opening - use controlled state if provided, otherwise initial state
      const desiredState = controlledState ?? config.initialState ?? "default";
      const targetState = enabledStates.includes(desiredState)
        ? desiredState
        : enabledStates[0];
      transitionTo(targetState ?? "default");
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, config.initialState, controlledState, enabledStates, transitionTo]);

  // ── Sync with controlled state changes while open ─────────────────────────
  useEffect(() => {
    if (isOpen && controlledState && enabledStates.includes(controlledState)) {
      transitionTo(controlledState);
    }
  }, [isOpen, controlledState, enabledStates, transitionTo]);

  // ── Notify parent when dragging state changes ─────────────────────────
  useEffect(() => {
    onDragging?.(isDragging);
    // Keep swiper disabled while the sheet is being dragged
    // When dragging ends, only re-enable swiper if not in panel-view or full-view
    if (isDragging) {
      onSwiperToggle?.(true);
    } else if (currentState !== "panel-view" && currentState !== "full-view") {
      onSwiperToggle?.(false);
    }
  }, [isDragging, onDragging, onSwiperToggle, currentState]);

  // ── Sheet-level pointer handlers (disable swiper on any touch/click) ───
  const disableDragAndSwipe = config.disableDragAndSwipe ?? false;

  // Helper to safely re-enable swiper only when not in expanded states
  const safeEnableSwiper = useCallback(() => {
    if (currentState !== "panel-view" && currentState !== "full-view") {
      onSwiperToggle?.(false);
    }
  }, [currentState, onSwiperToggle]);

  const handleSheetPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (disableDragAndSwipe) return;
      onSwiperToggle?.(true);
      handleDragStart(e);
    },
    [disableDragAndSwipe, onSwiperToggle, handleDragStart],
  );

  const handleSheetPointerUp = useCallback(() => {
    if (disableDragAndSwipe) return;
    safeEnableSwiper();
  }, [disableDragAndSwipe, safeEnableSwiper]);

  // ── Content pull-to-close gesture ─────────────────────────────────────
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
      safeEnableSwiper();
    }, 150);
  }, [onSwiperToggle, safeEnableSwiper]);

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
    [disableDragAndSwipe, onSwiperToggle],
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
    [startClose],
  );

  const handleContentPointerUp = useCallback(() => {
    contentGesture.current = null;
    if (disableDragAndSwipe) return;
    safeEnableSwiper();
  }, [disableDragAndSwipe, safeEnableSwiper]);

  // ── Computed height & transitions ──────────────────────────────────────
  const snappedHeight =
    isDragging && transientHeightPx !== null
      ? transientHeightPx
      : stateToPx(currentState);

  // In "inline" mode: open = snappedHeight, closed = 0 (no translateY).
  // In "fixed"/"container": always show snappedHeight, use translateY for
  // the open/close animation.
  const computedHeight = isInlineMode
    ? isVisible || isDragging
      ? snappedHeight
      : 0
    : snappedHeight;

  const heightTransition =
    isDragging || config.disableAnimation
      ? "none"
      : `height 320ms cubic-bezier(0.32, 0.72, 0, 1)`;

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
    !isInlineMode &&
    config.showOverlay &&
    (currentState === "panel-view" || currentState === "full-view");

  // ── Sheet panel style ──────────────────────────────────────────────────
  const panelPositionStyle: React.CSSProperties = isInlineMode
    ? {
        // No position — parent controls placement.
        height: computedHeight,
        transition: heightTransition,
      }
    : {
        position: isFixedMode ? "fixed" : "absolute",
        height: computedHeight,
        transform: `translateY(${translateY})`,
        transition: [heightTransition, translateTransition].join(", "),
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
        onClick={(e) => e.stopPropagation()}
        className={cn(
          // Positioned modes pin to bottom edge of their containing block.
          !isInlineMode && "gencl:bottom-0 gencl:left-0 gencl:right-0",
          "gencl:z-50 gencl:select-none",
          isContainerMode && "gencl:z-[999]",
          "gencl:flex gencl:flex-col gencl:overflow-hidden gencl:pointer-events-auto",
          "gencl:rounded-2xl gencl:will-change-[transform,height]",
          !disableDragAndSwipe &&
            "gencl:cursor-grab gencl:active:cursor-grabbing",
          isDarkTheme
            ? "gencl:bg-black/50 gencl:backdrop-blur-sm"
            : "gencl:bg-white",
          className,
        )}
        style={panelPositionStyle}
        {...rest}
      >
        {/* Drag indicator */}
        {!disableDragAndSwipe &&
          config.showIndicator !== false &&
          currentState !== "default" && (
            <DynamicSheetDragIndicator
              theme={config.theme}
              isDragging={isDragging}
              onPointerDown={handleSheetPointerDown}
            />
          )}

        {/* Header */}
        {header ? (
          <div
            data-slot="dynamic-sheet-header"
            onPointerDown={disableDragAndSwipe ? undefined : handleDragStart}
            onClick={(e) => {
              e.stopPropagation();
            }}
            className={cn(
              "gencl:border-b gencl:z-50",
              isDarkTheme
                ? "gencl:border-white/10"
                : "gencl:border-secondary-150",
              headerClassName,
            )}
          >
            {header}
          </div>
        ) : config.navTitle || config.showClose ? (
          <div
            data-slot="dynamic-sheet-header"
            onPointerDown={disableDragAndSwipe ? undefined : handleDragStart}
            onClick={(e) => {
              e.stopPropagation();
            }}
            className={cn(
              "gencl:w-full gencl:shrink-0 gencl:flex gencl:items-center gencl:justify-between gencl:relative",
              "gencl:p-3 gencl:border-b",
              "gencl:cursor-grab gencl:touch-none",
              isDarkTheme
                ? "gencl:border-white/10"
                : "gencl:border-secondary-150",
              headerClassName,
            )}
          >
            {/* <span className="gencl:flex-1" /> */}

            {config.navTitle && (
              <span
                className={cn(
                  "gencl:flex-1 gencl:min-w-0 gencl:truncate",
                  isDarkTheme ? "gencl:text-white" : "gencl:text-black",
                )}
              >
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
                    : "hover:gencl:bg-black/5 hover:gencl:opacity-70",
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  startClose();
                }}
                onPointerDown={(e) => e.stopPropagation()}
                aria-label="Close"
                type="button"
              >
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
              contentClassName,
            )}
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {children}
          </div>
        )}

        {/* Footer */}
        {footer && config.showFooter && (
          <div
            data-slot="dynamic-sheet-footer"
            className={cn(
              "gencl:shrink-0 gencl:p-2 gencl:border-t",
              isDarkTheme
                ? "gencl:border-white/10 gencl:text-white"
                : "gencl:border-secondary-150 gencl:text-black",
              footerClassName,
            )}
          >
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
