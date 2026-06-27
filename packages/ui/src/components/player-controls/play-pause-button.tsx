"use client";
import {
  memo,
  useEffect,
  useState,
  type ComponentProps,
  type CSSProperties,
  type ReactElement,
} from "react";

import { cn } from "../../lib/utils";

import { AnimatedText } from "./animated-text";
import { IconCircleButton } from "./icon-circle-button";
import { DARK_OVERLAY_20, PLAYER_CONTROL_SIZE, type PlayerControlSize } from "./player-control-size";

type IconNode = ReactElement<{ style?: CSSProperties }>;

export type PlayPauseButtonProps = {
  /** true=playing (show pauseIcon), false=paused/idle (show playIcon). */
  isPlaying: boolean;
  /** Fired when the button is tapped (toggle play/pause). */
  onToggle: () => void;
  /** Icon shown while paused/idle. Auto-sized to the token glyph. */
  playIcon: IconNode;
  /** Icon shown while playing. Auto-sized to the token glyph. */
  pauseIcon: IconNode;
  /** When true and `showAnimatedText`, the "Tap to play" pill cycles. */
  shouldAnimate: boolean;
  /** Whether the "Tap to play" pill should render (typically: paused, not loading). */
  showAnimatedText: boolean;
  /** Show the "Tap to play" pill once per mount instead of cycling. @default false */
  once?: boolean;
  /** Double-circle size token. @default "md" */
  size?: PlayerControlSize;
  /** Collapse the "Tap to play" text — set while the cursor is in the control bar. */
  suppressText?: boolean;
  // Omit the native `onToggle` (details/popover) handler so it can't shadow our play toggle.
} & Omit<ComponentProps<"div">, "onToggle">;

/**
 * Presentational play/pause control (Design System V2). Owns the double-circle
 * shell and the animated "Tap to play" pill — reads NO context. Play state and
 * the toggle callback are injected, and the glyphs are supplied via
 * `playIcon`/`pauseIcon`, so the webapp and CXR can both drive it with their own
 * state and icon assets.
 */
export const PlayPauseButton = memo(function PlayPauseButton({
  className,
  isPlaying,
  onToggle,
  playIcon,
  pauseIcon,
  shouldAnimate,
  showAnimatedText,
  once = false,
  size: sizeProp = "md",
  suppressText = false,
  ...restProps
}: PlayPauseButtonProps) {
  const [stopAnimating, setStopAnimating] = useState(!shouldAnimate);
  // Re-arm when shouldAnimate flips on — reels mount with it false, so the
  // stale `true` would otherwise suppress the hint forever.
  useEffect(() => {
    setStopAnimating(!shouldAnimate);
  }, [shouldAnimate]);
  const token = PLAYER_CONTROL_SIZE[sizeProp];
  // Pill open → wrapper gets the bg; otherwise IconCircleButton's ring would double-stack.
  const showPill = showAnimatedText && !stopAnimating;
  // `once`: stay mounted across pause→resume so the latch survives the whole video.
  const mountText = once ? shouldAnimate : showAnimatedText;
  const textStop = once ? isPlaying || stopAnimating || suppressText : stopAnimating || suppressText;

  return (
    <div
      onClick={(e) => {
        // Stop the tap bubbling to an ancestor click handler (e.g. CXR's
        // ad-layout handleAdClick, which would otherwise fire the SDK CTA
        // signal). MuteButtonView already does this; mirror it here. Webapp
        // consumers stop propagation at their own container, so this is a no-op
        // for them.
        e.stopPropagation();
        onToggle();
        // Legacy mode stops the pill on tap; `once` mode lets its latch gate it.
        if (!once) setStopAnimating(true);
      }}
      className={cn(
        "gencl:group gencl:cursor-pointer gencl:flex gencl:justify-center gencl:items-center gencl:rounded-full gencl:overflow-hidden gencl:transition-all gencl:duration-300 gencl:ease-in-out",
        className
      )}
      {...restProps}
      style={{
        minWidth: token.outer,
        height: token.outer,
        background: showPill ? DARK_OVERLAY_20 : "transparent",
        backdropFilter: `blur(${token.outerBlur}px)`,
        WebkitBackdropFilter: `blur(${token.outerBlur}px)`,
      }}>
      {/* Double-circle + icon — reuses IconCircleButton. */}
      <IconCircleButton
        size={sizeProp}
        outerBg={showPill ? "transparent" : DARK_OVERLAY_20}
        icon={isPlaying ? pauseIcon : playIcon}
        className="gencl:flex-shrink-0"
      />
      {mountText && <AnimatedText text="Tap to play" width={110} once={once} stop={textStop} />}
    </div>
  );
});
