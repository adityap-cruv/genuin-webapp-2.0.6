"use client";
import { type CSSProperties, type ReactElement } from "react";

import { IconCircleButton } from "./icon-circle-button";
import { type PlayerControlSize } from "./player-control-size";

export interface ExpandCollapseButtonProps {
  /** Icon for the current state — consumer injects its expand or collapse glyph. */
  icon: ReactElement<{ style?: CSSProperties }>;
  /** Toggle handler. */
  onClick?: () => void;
  /** Double-circle size token. @default "lg" */
  size?: PlayerControlSize;
  /** Accessible label. */
  ariaLabel?: string;
  /** Optional test id applied to the button. */
  testId?: string;
}

/**
 * Context-free expand/collapse control. Renders a semantic `<button>` (keyboard-
 * and focus-accessible) wrapping the presentational `IconCircleButton`; stops
 * click bubbling so it never triggers an underlying player/CTA tap.
 */
export function ExpandCollapseButton({
  icon,
  onClick,
  size = "lg",
  ariaLabel,
  testId,
}: ExpandCollapseButtonProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      data-testid={testId}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className="gencl:border-0 gencl:p-0 gencl:bg-transparent gencl:rounded-full gencl:cursor-pointer">
      <IconCircleButton size={size} icon={icon} />
    </button>
  );
}
