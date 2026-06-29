"use client";
import { type CSSProperties, type MouseEvent } from "react";

import { cn } from "../../lib/utils";

import { IconCircleButton } from "./icon-circle-button";
import { NAV_BUTTON_COLORS, NavChevron, type NavChevronDirection } from "./nav-chevron";
import { type PlayerControlSize } from "./player-control-size";

export interface NavArrowButtonProps {
  /** Chevron direction — up/down for vertical feeds, left/right for carousels. */
  direction: NavChevronDirection;
  /** Disables the button (start/end of feed). */
  disabled?: boolean;
  /** Navigation handler. */
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
  /** Double-circle size token. @default "lg" */
  size?: PlayerControlSize;
  /** Solid-fill colour theme — "dark" = white circle on dark video. @default "dark" */
  theme?: "light" | "dark";
  /** Override the default `nav-<direction>` test id. */
  testId?: string;
  /** Override the direction-derived accessible label (e.g. "Previous video (2 of 5)"). */
  ariaLabel?: string;
  /** Extra classes on the button. */
  className?: string;
  /** Inline styles on the button (e.g. Safari transform optimizations). */
  style?: CSSProperties;
  /** Stop click bubbling. @default false */
  stopPropagation?: boolean;
}

/** Context-free V2 nav arrow: IconCircleButton + NavChevron with solid fill for dark video. */
export function NavArrowButton({
  direction,
  disabled = false,
  onClick,
  size = "lg",
  theme = "dark",
  testId,
  ariaLabel,
  className,
  style,
  stopPropagation = false,
}: NavArrowButtonProps) {
  const colors = NAV_BUTTON_COLORS[theme];
  const label = ariaLabel ?? (direction === "up" || direction === "left" ? "Previous" : "Next");
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      data-testid={testId ?? `nav-${direction}`}
      onClick={(e) => {
        if (stopPropagation) e.stopPropagation();
        if (!disabled) onClick(e);
      }}
      style={style}
      className={cn(
        "gencl:border-0 gencl:p-0 gencl:bg-transparent gencl:rounded-full gencl:transition-opacity gencl:duration-200",
        disabled ? "gencl:opacity-40 gencl:cursor-not-allowed" : "gencl:cursor-pointer",
        className
      )}>
      <IconCircleButton
        size={size}
        outerBg={colors.outer}
        innerBg={colors.inner}
        icon={<NavChevron direction={direction} color={colors.glyph} />}
      />
    </button>
  );
}
