"use client";

import {
  NAV_BUTTON_COLORS,
  NavChevron,
  IconCircleButton,
  type NavChevronDirection,
  type PlayerControlSize,
} from "@genuin/ui/player-controls";
import React from "react";

export interface NavArrowButtonProps {
  /** Chevron direction — up/down for vertical feeds, left/right for carousels. */
  direction: NavChevronDirection;
  /** Disables the button (start/end of feed). */
  disabled?: boolean;
  /** Navigation handler. */
  onClick: () => void;
  /** V2 double-circle size token. @default "lg" */
  size?: PlayerControlSize;
  /** Solid-fill colour theme — "dark" = white circle on dark video. @default "dark" */
  theme?: "light" | "dark";
}

/** CXR V2 nav arrow. IconCircleButton + NavChevron with solid-fill colors for dark video backdrop. */
export function NavArrowButton({
  direction,
  disabled = false,
  onClick,
  size = "lg",
  theme = "dark",
}: NavArrowButtonProps): React.JSX.Element {
  const colors = NAV_BUTTON_COLORS[theme];
  const label = direction === "up" || direction === "left" ? "Previous" : "Next";

  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      data-testid={`nav-${direction}`}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onClick();
      }}
      className={`gencl:border-0 gencl:p-0 gencl:bg-transparent gencl:rounded-full gencl:transition-opacity gencl:duration-200${
        disabled ? " gencl:opacity-40 gencl:cursor-not-allowed" : " gencl:cursor-pointer"
      }`}>
      <IconCircleButton
        size={size}
        outerBg={colors.outer}
        innerBg={colors.inner}
        icon={<NavChevron direction={direction} color={colors.glyph} />}
      />
    </button>
  );
}
