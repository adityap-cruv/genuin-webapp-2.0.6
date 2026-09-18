import type { ComponentProps } from "react";

import { DARK_OVERLAY_20, DARK_OVERLAY_40 } from "./player-control-size";

/** Chevron pointing direction for navigation arrows. */
export type NavChevronDirection = "up" | "down" | "left" | "right";

/**
 * SVG path per direction (16×16 viewBox). `up`/`down` come straight from the
 * Figma V2 spec; `left`/`right` are the same chevron with x/y swapped.
 */
const CHEVRON_PATHS: Record<NavChevronDirection, string> = {
  up: "M3.33335 10.6665L8.00002 5.99984L12.6667 10.6665",
  down: "M3.33335 5.3335L8.00002 10.0002L12.6667 5.3335",
  left: "M10.6665 3.33335L5.99984 8.00002L10.6665 12.6667",
  right: "M5.3335 3.33335L10.0002 8.00002L5.3335 12.6667",
};

type NavChevronProps = ComponentProps<"svg"> & {
  direction: NavChevronDirection;
  /** Stroke colour. @default "white" */
  color?: string;
};

/**
 * Design System V2 navigation chevron (1.25 stroke). Rendered inside a
 * `PlayerControlButton`, which sizes it to the token's glyph dimension.
 */
export function NavChevron({ direction, color = "white", ...props }: NavChevronProps) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}>
      <path
        d={CHEVRON_PATHS[direction]}
        stroke={color}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Double-circle fill + glyph colours for the nav arrows. Per Figma (node
 * 16128-196014) both circles use the Dark Overlay tokens (outer 20% / inner
 * 40%) with a white chevron — both themes share these values (design is the
 * same on light/dark video). The group-level outer ring that wraps a pair of
 * nav buttons (see `NavigationButtonsV2`) reuses `DARK_OVERLAY_20` directly.
 */
export const NAV_BUTTON_COLORS = {
  light: { outer: DARK_OVERLAY_20, inner: DARK_OVERLAY_40, glyph: "#FFFFFF" },
  dark: { outer: DARK_OVERLAY_20, inner: DARK_OVERLAY_40, glyph: "#FFFFFF" },
} as const;
