"use client";

import React from "react";

import { assetLink } from "@cxr/config";
import { useUserInteracted } from "@cxr/instance/coordination/UserInteractionTracker";

import type { ButtonBaseProps } from "./button.types";
import { GHOST_SHELL_CLASSES, SIZE_MAP, VARIANT_CLASSES } from "./button.types";

export interface MuteUnmuteButtonProps extends ButtonBaseProps {
  /** true=muted (show mute icon), false=unmuted (show unmute icon) */
  isMuted: boolean;
  /**
   * When true, applies an animated AI-trace gradient ring around the border.
   * Respects `prefers-reduced-motion`. Defaults to false.
   */
  animatedBorder?: boolean;
}

/**
 * Mute/unmute toggle atom.
 * Renders an icon that toggles between mute and unmute states.
 *
 * @param props.isMuted - true=muted (show mute icon), false=unmuted (show unmute icon)
 * @param props.variant - Visual style: 'ghost' (default) | 'solid' | 'outline'
 * @param props.size - Icon size: 'sm'=14px | 'md'=24px (default) | 'lg'=32px
 * @param props.onClick - Click handler fired when the button is activated
 * @param props.animatedBorder - When true, applies an animated AI-trace gradient ring (reduced-motion aware)
 * @param props.style - Inline styles merged onto the outer button element
 *
 * @remarks
 * The AI-border animation is one-shot (sweeps then fades). Because the class is
 * applied to a persistent element, toggling `animatedBorder` false -> true at runtime
 * does NOT replay the sweep — CSS animations only restart on remount or
 * animation-name change. Remount via a React `key` if a replay is required.
 */
export function MuteUnmuteButton({
  isMuted,
  onClick,
  variant = "ghost",
  size = "md",
  animatedBorder = false,
  style,
}: MuteUnmuteButtonProps): React.JSX.Element {
  // Until the user has interacted with cxr, always show the unmute (sound-on)
  // icon even while actually muted; afterwards the icon respects the real mute
  // state. The label and toggle always use the real `isMuted`, so the first tap
  // genuinely unmutes.
  const interacted = useUserInteracted();
  const displayMuted = interacted ? isMuted : false;
  const src = `${assetLink}reactions/iheartmedia/cxr/${displayMuted ? "mute" : "unmute"}.svg`;
  const label = isMuted ? "Unmute" : "Mute";

  return (
    <button
      data-testid="mute-btn"
      aria-label={label}
      onClick={(e) => {
        // Stop bubbling to the ad-layout onClick (handleAdClick), which would
        // otherwise fire the SDK CTA signal. Mirrors LinkoutButton.
        e.stopPropagation();
        onClick?.();
      }}
      className={`gencl:border-0 gencl:rounded-full gencl:cursor-pointer gencl:flex gencl:items-center gencl:justify-center ${VARIANT_CLASSES[variant]}${variant === "ghost" ? ` ${GHOST_SHELL_CLASSES[size]}` : ""}${isMuted && animatedBorder ? `${" "}cxr-animated-border` : ""}`}
      style={style}>
      <img
        src={src}
        style={{ ...SIZE_MAP[size], ...(animatedBorder ? { position: "relative", zIndex: 2 } : {}) }}
        alt={label}
      />
    </button>
  );
}
