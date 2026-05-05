"use client";

import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@genuin/ui/lib/utils";

// ─── Overlay ──────────────────────────────────────────────────────────────────

const overlayVariants = cva("gencl:inset-0 gencl:pointer-events-auto gencl:z-40", {
  variants: {
    theme: {
      light: "gencl:bg-black/30",
      dark: "gencl:bg-black/55",
    },
  },
  defaultVariants: {
    theme: "light",
  },
});

interface DynamicSheetOverlayProps extends ComponentPropsWithoutRef<"div">, VariantProps<typeof overlayVariants> {
  /** Matches the parent sheet's renderMode */
  position?: "fixed" | "absolute";
  isVisible?: boolean;
  openDurationMs?: number;
  closeDurationMs?: number;
}

export function DynamicSheetOverlay({
  theme,
  position = "fixed",
  isVisible = false,
  openDurationMs = 420,
  closeDurationMs = 380,
  className,
  style,
  ...props
}: DynamicSheetOverlayProps) {
  return (
    <div
      data-slot="dynamic-sheet-overlay"
      className={cn(
        overlayVariants({ theme }),
        isVisible ? "gencl:pointer-events-auto" : "gencl:pointer-events-none",
        className
      )}
      style={{
        position,
        opacity: isVisible ? 1 : 0,
        transition: isVisible ? `opacity ${openDurationMs}ms ease` : `opacity ${closeDurationMs}ms ease`,
        ...style,
      }}
      {...props}
    />
  );
}

// ─── Drag Indicator ───────────────────────────────────────────────────────────

const indicatorPillVariants = cva("gencl:h-1 gencl:rounded-full gencl:transition-all gencl:duration-200", {
  variants: {
    theme: {
      light: "gencl:bg-[#BEC2C7]",
      dark: "gencl:bg-[#BEC2C7]",
    },
    dragging: {
      true: "gencl:w-10 gencl:opacity-55",
      false: "gencl:w-9 gencl:opacity-100",
    },
  },
  defaultVariants: {
    theme: "light",
    dragging: false,
  },
});

interface DynamicSheetDragIndicatorProps extends ComponentPropsWithoutRef<"div"> {
  theme?: "light" | "dark";
  isDragging?: boolean;
}

export function DynamicSheetDragIndicator({
  theme = "light",
  isDragging = false,
  className,
  ...props
}: DynamicSheetDragIndicatorProps) {
  return (
    <div
      data-slot="dynamic-sheet-indicator"
      className={cn(
        "gencl:flex gencl:w-full gencl:items-center gencl:justify-center gencl:shrink-0 gencl:py-2 gencl:touch-none",
        isDragging ? "gencl:cursor-grabbing" : "gencl:cursor-grab",
        className
      )}
      {...props}>
      <div
        className={indicatorPillVariants({
          theme,
          dragging: isDragging,
        })}
      />
    </div>
  );
}
