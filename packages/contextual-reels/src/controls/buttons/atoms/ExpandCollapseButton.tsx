"use client";

import React from "react";

import { assetLink } from "@cxr/config";

import type { ButtonBaseProps } from "./button.types";
import { GHOST_SHELL_CLASSES, SIZE_MAP, VARIANT_CLASSES } from "./button.types";

export interface ExpandCollapseButtonProps extends ButtonBaseProps {
  /** true=fullscreen (show shrink/collapse icon), false=show expand icon */
  isFullScreen: boolean;
}

/**
 * Expand/collapse toggle atom.
 *
 * data-testid flips between "topbar-expand" and "topbar-collapse" to match
 * existing test IDs in DefaultTopBar tests.
 *
 * @param props.isFullScreen - true=fullscreen (show shrink/collapse icon)
 * @param props.variant - Visual style: 'ghost' (default) | 'solid' | 'outline'
 * @param props.size - Icon size: 'sm'=14px | 'md'=24px (default) | 'lg'=32px
 * @param props.onClick - Click handler
 * @param props.style - Optional inline styles
 */
export function ExpandCollapseButton({
  isFullScreen,
  onClick,
  variant = "ghost",
  size = "md",
  style,
}: ExpandCollapseButtonProps): React.JSX.Element {
  const src = `${assetLink}reactions/iheartmedia/cxr/${isFullScreen ? "shrink" : "expand"}.svg`;
  const label = isFullScreen ? "Collapse" : "Expand";

  return (
    <button
      data-testid={isFullScreen ? "topbar-collapse" : "topbar-expand"}
      aria-label={label}
      onClick={(e) => {
        // Stop bubbling to the ad-layout onClick (handleAdClick), which would
        // otherwise fire the SDK CTA signal. Mirrors LinkoutButton.
        e.stopPropagation();
        onClick?.();
      }}
      className={`gencl:border-0 gencl:rounded-full gencl:cursor-pointer gencl:flex gencl:items-center gencl:justify-center ${VARIANT_CLASSES[variant]}${variant === 'ghost' ? ` ${GHOST_SHELL_CLASSES[size]}` : ''}`}
      style={style}>
      <img src={src} style={SIZE_MAP[size]} alt={label} />
    </button>
  );
}
