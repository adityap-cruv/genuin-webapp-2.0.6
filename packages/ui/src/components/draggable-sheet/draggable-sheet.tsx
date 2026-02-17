"use client";

import { useMemo } from "react";

import { cn, getGenclStyles } from "@genuin/ui/lib/utils";
import { XIcon } from "@genuin/ui/icons";

import { normalizeHeight } from "./helpers";
import {
  DRAGGABLE_SHEET_STATES,
  type DraggableSheetProps,
  type DraggableSheetConfig,
  DEFAULT_CONFIG,
  DEFAULT_HEIGHTS,
} from "./types";
import { DragIndicator } from "./draggable-sheet-drag-indicator";
import { Overlay } from "./draggable-sheet-overlay";
import { useDraggableSheet } from "./use-draggable-sheet";
import { Skeleton } from "../skeleton";

function ContentShimmer({ theme = "light" }: { theme?: "light" | "dark" }) {
  return (
    <div className="gencl:flex-1 gencl:px-4 gencl:py-3 gencl:space-y-3">
      <Skeleton
        className={cn(
          "gencl:h-4 gencl:w-full gencl:rounded-md",
          theme === "dark" ? "gencl:bg-white/20" : "gencl:bg-secondary-200",
        )}
      />
      <Skeleton
        className={cn(
          "gencl:h-4 gencl:w-1/2 gencl:rounded-md",
          theme === "dark" ? "gencl:bg-white/20" : "gencl:bg-secondary-200",
        )}
      />
    </div>
  );
}

function FooterShimmer({ theme = "light" }: { theme?: "light" | "dark" }) {
  return (
    <div className="gencl:w-full gencl:flex-shrink-0">
      <Skeleton
        className={cn(
          "gencl:h-4 gencl:w-full gencl:rounded-md",
          theme === "dark" ? "gencl:bg-white/20" : "gencl:bg-secondary-200",
        )}
      />
    </div>
  );
}

function HeaderShimmer({ theme = "light" }: { theme?: "light" | "dark" }) {
  return (
    <div className="gencl:w-full gencl:flex gencl:items-center gencl:justify-between">
      <Skeleton
        className={cn(
          "gencl:h-5 gencl:w-32 gencl:rounded-md",
          theme === "dark" ? "gencl:bg-white/20" : "gencl:bg-secondary-200",
        )}
      />
      <Skeleton
        className={cn(
          "gencl:size-6 gencl:rounded-xs",
          theme === "dark" ? "gencl:bg-white/20" : "gencl:bg-secondary-200",
        )}
      />
    </div>
  );
}

// Main component with integrated structure
function DraggableSheet({
  config: userConfig,
  className,
  style,
  children,
  header,
  footer,
  headerClassName,
  contentClassName,
  footerClassName,
  ...rest
}: DraggableSheetProps) {
  const config = useMemo<DraggableSheetConfig>(
    () => ({
      ...DEFAULT_CONFIG,
      ...userConfig,
      heights: { ...DEFAULT_HEIGHTS, ...(userConfig?.heights || {}) },
    }),
    [userConfig],
  );

  const heights = config.heights ?? DEFAULT_HEIGHTS;

  const {
    currentState,
    isDragging,
    transientHeightPx,
    handleDragStart,
    handleHoverOrTouch,
    handleTapOrClick,
    closeSheet,
  } = useDraggableSheet({
    config,
    enabledStates: config.enabledStates ?? [...DRAGGABLE_SHEET_STATES],
    initialState: config.initialState ?? "default",
    onStateChange: config.onStateChange,
    onClose: config.onClose,
  });

  if (config.visible === false) return null;

  const isDarkTheme = config.theme === "dark";
  const shouldShowOverlay =
    config.showOverlay &&
    (currentState === "panel-view" || currentState === "full-view");

  const computedSheetHeight =
    isDragging && transientHeightPx !== null
      ? `${transientHeightPx}px`
      : normalizeHeight(heights[currentState] ?? DEFAULT_HEIGHTS[currentState]);

  const heightTransition = isDragging
    ? "none"
    : `height ${config.transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;

  return (
    <>
      {shouldShowOverlay && (
        <Overlay
          theme={config.theme}
          className={config.overlayClassName}
          onClick={closeSheet}
        />
      )}

      <div
        data-slot="draggable-sheet"
        data-state={currentState}
        data-theme={config.theme}
        className={cn(
          "gencl:w-full gencl:h-auto gencl:pointer-events-auto gencl:flex gencl:flex-col gencl:overflow-hidden gencl:relative",
          isDarkTheme
            ? "gencl:bg-black/50 gencl:backdrop-blur-sm"
            : "gencl:bg-white",
          "gencl:rounded-xl",
          className,
        )}
        style={{
          ...style,
          ...getGenclStyles(),
          height: computedSheetHeight,
          transition: heightTransition,
        }}
        onMouseEnter={handleHoverOrTouch}
        onTouchStart={handleHoverOrTouch}
        onPointerDown={handleDragStart}
        onClick={handleTapOrClick}
        {...rest}
      >
        {/* Drag Indicator */}
        {config.showIndicator && currentState !== "default" && (
          <DragIndicator theme={config.theme} onPointerDown={handleDragStart} />
        )}

        {/* Header Section */}
        {header ? (
          <div
            data-slot="draggable-sheet-header"
            className={cn(
              "gencl:w-full gencl:flex-shrink-0 gencl:flex gencl:justify-between gencl:px-4 gencl:py-3 gencl:border-b",
              isDarkTheme
                ? "gencl:border-white/10"
                : "gencl:border-secondary-300",
              headerClassName,
            )}
          >
            {config.loading ? <HeaderShimmer theme={config.theme} /> : header}
          </div>
        ) : (
          config.showHeader && (
            <div
              data-slot="draggable-sheet-header"
              className={cn(
                "gencl:w-full gencl:flex-shrink-0 gencl:flex gencl:justify-between gencl:items-center gencl:px-4 gencl:py-3 gencl:border-b",
                isDarkTheme
                  ? "gencl:border-white/10"
                  : "gencl:border-secondary-300",
                headerClassName,
              )}
            >
              {config.navTitle ? (
                <p
                  className={cn(
                    "gencl:flex-1 gencl:min-w-0 gencl:text-body-0-semi-bold gencl:truncate",
                    isDarkTheme ? "gencl:text-white" : "gencl:text-black",
                  )}
                >
                  {config.navTitle}
                </p>
              ) : (
                <span className="gencl:flex-1" />
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
                    closeSheet();
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                  aria-label="Close"
                  type="button"
                >
                  {config.closeIcon ?? <XIcon theme={config.theme} size="md" />}
                </button>
              )}
            </div>
          )
        )}

        {/* Content Section */}
        <div
          data-slot="draggable-sheet-content"
          className={cn(
            "gencl:flex-1 gencl:min-h-0 gencl:overflow-y-auto gencl:overflow-x-hidden gencl:w-full gencl:touch-pan-y",
            isDarkTheme ? "gencl:text-white" : "gencl:text-black",
            contentClassName,
          )}
        >
          {config.loading ? <ContentShimmer theme={config.theme} /> : children}
        </div>

        {/* Footer Section */}
        {footer &&
          config.showFooter &&
          currentState !== "default-active" &&
          currentState !== "default" && (
            <div
              data-slot="draggable-sheet-footer"
              className={cn(
                "gencl:w-full gencl:flex-shrink-0 gencl:px-4 gencl:py-3.5 gencl:border-t",
                isDarkTheme
                  ? "gencl:border-white/10 gencl:text-white"
                  : "gencl:border-secondary-300 gencl:text-black",
                footerClassName,
              )}
            >
              {config.loading ? <FooterShimmer theme={config.theme} /> : footer}
            </div>
          )}
      </div>
    </>
  );
}

export { DraggableSheet };
