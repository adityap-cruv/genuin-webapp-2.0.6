"use client";

import React from "react";

import { assetLink } from "@cxr/config";

import type { ButtonBaseProps } from "./button.types";
import { GHOST_SHELL_CLASSES, SIZE_MAP, VARIANT_CLASSES } from "./button.types";

export interface PlayPauseButtonProps extends Omit<ButtonBaseProps, "onClick"> {
  /** true=playing (show pause icon), false=paused (show play icon) */
  isPlay?: boolean;
  onClick?: () => void;
}

/**
 * Play/pause toggle atom.
 * Renders an icon that toggles between play and pause states.
 *
 * @param props.isPlay - true=playing (show pause icon), false=paused (show play icon)
 * @param props.variant - Visual style: 'ghost' (default) | 'solid' | 'outline'
 * @param props.size - Icon size: 'sm'=14px | 'md'=24px (default) | 'lg'=32px
 * @param props.onClick - Click handler fired when the button is activated
 * @param props.style - Inline styles merged onto the outer button element
 */
export function PlayPauseButton({
  isPlay,
  onClick = () => undefined,
  variant = "ghost",
  size = "md",
  style,
}: PlayPauseButtonProps): React.JSX.Element {
  const src = `${assetLink}reactions/iheartmedia/cxr/${isPlay ? "pause" : "play"}.svg`;
  const label = isPlay ? "Pause" : "Play";

  return (
    <button
      data-testid="play-pause-btn"
      aria-label={label}
      onClick={(e) => {
        // Stop bubbling to the ad-layout onClick (handleAdClick), which would
        // otherwise fire the SDK CTA signal. Mirrors LinkoutButton.
        e.stopPropagation();
        onClick();
      }}
      className={`gencl:border-0 gencl:rounded-full gencl:cursor-pointer gencl:flex gencl:items-center gencl:justify-center ${VARIANT_CLASSES[variant]}${variant === "ghost" ? ` ${GHOST_SHELL_CLASSES[size]}` : ""}`}
      style={style}>
      <img src={src} style={SIZE_MAP[size]} alt={label} />
    </button>
  );
}
