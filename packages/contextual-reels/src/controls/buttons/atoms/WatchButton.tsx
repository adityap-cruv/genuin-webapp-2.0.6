"use client";

import React from "react";

import { assetLink } from "@cxr/config";

export interface WatchButtonProps {
  /** true=playing (show pause icon), false=paused (show play icon) */
  isPlay: boolean;
  /** Click handler fired when the button is activated */
  onClick?: () => void;
  /**
   * Visual style variant.
   * 'pill' — rounded-full with white border outline (original WatchButton style).
   * 'rect' — rounded-lg with solid black background (WatchButtonNew style).
   * Defaults to 'rect'.
   */
  variant?: "pill" | "rect";
  /** When true, button expands to fill available width. Defaults to false. */
  fullWidth?: boolean;
  /**
   * When true, applies a subtle heartbeat pulse to draw attention.
   * Respects `prefers-reduced-motion`. Defaults to false.
   */
  pulse?: boolean;
  /** Inline styles merged onto the outer button element. */
  style?: React.CSSProperties;
}

const ICON_SIZE = { width: "16px", height: "16px" } as const;

/**
 * Watch CTA button atom.
 *
 * Consolidates two historical button styles: WatchButton (pill, outline) and
 * WatchButtonNew (rect, solid). Use variant prop to choose the style.
 *
 * @param props.isPlay - true=playing (show pause icon), false=paused (show play icon)
 * @param props.onClick - Click handler fired when the button is activated
 * @param props.variant - Visual style: 'pill' (outline) | 'rect' (solid, default)
 * @param props.fullWidth - When true, expands to fill available width
 * @param props.pulse - When true, applies a heartbeat pulse (reduced-motion aware)
 * @param props.style - Inline styles merged onto the outer button element
 */
export function WatchButton({
  isPlay,
  onClick,
  variant = "rect",
  fullWidth = false,
  pulse = false,
  style,
}: WatchButtonProps): React.JSX.Element {
  const iconSrc = `${assetLink}reactions/iheartmedia/cxr/${isPlay ? "pause" : "play"}.svg`;
  const label = isPlay ? "Pause" : "Play";

  const variantClasses =
    variant === "pill"
      ? "gencl:rounded-full gencl:bg-transparent gencl:border gencl:border-white"
      : "gencl:rounded-lg gencl:bg-black";

  return (
    <button
      data-testid="watch-btn"
      aria-label={label}
      onClick={(e) => {
        // Stop bubbling to the ad-layout onClick (handleAdClick), which would
        // otherwise fire the SDK CTA signal. Mirrors LinkoutButton.
        e.stopPropagation();
        onClick?.();
      }}
      className={`gencl:flex gencl:items-center gencl:justify-center gencl:gap-1 gencl:px-[6px] gencl:pr-[10px] gencl:py-[6px] gencl:cursor-pointer gencl:text-[12px] gencl:text-white gencl:font-medium ${variantClasses} ${fullWidth ? "gencl:w-full" : "gencl:w-fit"}${pulse ? " cxr-heartbeat" : ""}`}
      style={style}>
      <img src={iconSrc} style={ICON_SIZE} alt={label} />
      Watch
    </button>
  );
}
