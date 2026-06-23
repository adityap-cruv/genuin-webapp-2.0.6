"use client";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
} from "react";

import { cn } from "../../lib/utils";

import { AnimatedText } from "./animated-text";
import { IconCircleButton } from "./icon-circle-button";
import {
  DARK_OVERLAY_20,
  DARK_OVERLAY_40,
  PLAYER_CONTROL_SIZE,
  VOLUME_SLIDER_WIDTH,
  type PlayerControlSize,
} from "./player-control-size";

const TRANSITION_MS = 300;
/** "Tap to unmute" label width. Caps the text and sizes the outer shell. */
const TAP_TEXT_WIDTH = 124;

type IconNode = ReactElement<{ style?: CSSProperties }>;

export type MuteButtonViewProps = {
  /** true=muted (show muteIcon + volume ring at 0), false=unmuted. */
  muted: boolean;
  /** Current volume, 0–100. Drives the ring fill and slider position. */
  volume: number;
  /** Fired when the speaker button is tapped (toggle mute). */
  onToggleMuted: () => void;
  /** Fired with the new 0–100 value as the slider drags. */
  onVolumeChange: (volume: number) => void;
  /** Icon shown while muted. Auto-sized to the token glyph. */
  muteIcon: IconNode;
  /** Icon shown while unmuted. Auto-sized to the token glyph. */
  unmuteIcon: IconNode;
  /** When true, the "Tap to unmute" pill cycles while muted. */
  shouldAnimate: boolean;
  /** Show the "Tap to unmute" pill once per mount instead of cycling. @default false */
  once?: boolean;
  /** When true (and not mobile), hovering reveals the inline volume slider. @default true */
  enableVolumeSlider?: boolean;
  /** Mobile gates off the hover slider entirely. */
  isMobile: boolean;
  /** Double-circle size token. @default "md" */
  size?: PlayerControlSize;
  /** Collapse the "Tap to unmute" text — set while the cursor is in the control bar. */
  suppressText?: boolean;
  /** Extra classes on the outer pill (e.g. CXR's `cxr-animated-border`). */
  className?: string;
  /** Optional test id applied to the outer pill. */
  testId?: string;
  /** Optional accessible label applied to the outer pill. */
  ariaLabel?: string;
};

/**
 * V2 mute control — double-circle shell, volume ring, hover slider, "Tap to unmute" pill.
 * Context-free: state + icons injected by the caller (webapp or CXR).
 */
export function MuteButtonView({
  muted,
  volume,
  onToggleMuted,
  onVolumeChange,
  muteIcon,
  unmuteIcon,
  shouldAnimate,
  once = false,
  enableVolumeSlider = true,
  isMobile,
  size: sizeProp = "md",
  suppressText = false,
  className,
  testId,
  ariaLabel,
}: MuteButtonViewProps) {
  const token = PLAYER_CONTROL_SIZE[sizeProp];
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [stopText, setStopText] = useState(!shouldAnimate);
  // Tracks the tap-text pill's real expanded state so the shell only widens while text is shown.
  const [textVisible, setTextVisible] = useState(false);

  // Timer IDs for sequencing text↔slider transitions. Refs avoid re-renders.
  const timers = useRef<{
    showSlider: ReturnType<typeof setTimeout> | null;
    resumeText: ReturnType<typeof setTimeout> | null;
  }>({ showSlider: null, resumeText: null });

  const clearTimer = (key: keyof typeof timers.current) => {
    if (timers.current[key] !== null) {
      clearTimeout(timers.current[key]!);
      timers.current[key] = null;
    }
  };

  // Sync to `shouldAnimate`: always collapse the slider; clear timers when it turns off.
  useEffect(() => {
    setStopText(!shouldAnimate);
    setShowVolumeSlider(false);
    if (!shouldAnimate) {
      clearTimer("showSlider");
      clearTimer("resumeText");
    }
  }, [shouldAnimate]);

  useEffect(() => {
    return () => {
      clearTimer("showSlider");
      clearTimer("resumeText");
    };
  }, []);

  const handleMouseEnter = () => {
    // While muted there is no sound to adjust — keep the slider closed until the user unmutes.
    if (!enableVolumeSlider || isMobile || muted) return;
    clearTimer("resumeText");
    clearTimer("showSlider");
    setStopText(true);
    timers.current.showSlider = setTimeout(() => {
      timers.current.showSlider = null;
      setShowVolumeSlider(true);
    }, TRANSITION_MS);
  };

  const handleMouseLeave = () => {
    if (!enableVolumeSlider || isMobile) return;
    clearTimer("showSlider");
    setShowVolumeSlider(false);
    timers.current.resumeText = setTimeout(() => {
      timers.current.resumeText = null;
      if (shouldAnimate) setStopText(false);
    }, TRANSITION_MS);
  };

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onToggleMuted();
      setStopText(true);
    },
    [onToggleMuted]
  );

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onVolumeChange(Number(e.target.value));
  };

  const volPct = muted ? 0 : Math.max(0, Math.min(100, volume));
  const showPill = showVolumeSlider || (muted && !stopText);

  // Slider track width scales with the button size token.
  const sliderWidth = VOLUME_SLIDER_WIDTH[sizeProp];
  // Slider expanded width = speaker circle + gap + input + spacer(16) + paddingRight(12)
  const expandedWidth = token.outer + 4 + sliderWidth + 16 + 12;

  return (
    <div
      data-testid={testId}
      aria-label={ariaLabel}
      onClick={handleClick}
      className={cn(
        "gencl:group gencl:cursor-pointer gencl:flex gencl:z-50 gencl:items-center gencl:justify-start gencl:overflow-hidden gencl:rounded-full gencl:transition-[max-width,gap,padding-right,background-color]",
        className
      )}
      style={{
        height: token.outer,
        maxWidth: showVolumeSlider
          ? expandedWidth
          : textVisible
            ? token.outer + TAP_TEXT_WIDTH
            : token.outer,
        gap: showVolumeSlider ? 4 : 0,
        paddingRight: showVolumeSlider ? 12 : 0,
        backdropFilter: `blur(${token.outerBlur}px)`,
        WebkitBackdropFilter: `blur(${token.outerBlur}px)`,
        background: showPill ? DARK_OVERLAY_20 : "transparent",
        transitionDuration: "350ms",
        transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}>
      {/* Speaker double-circle — reuses IconCircleButton. Ring hides when the slider is open. */}
      <IconCircleButton
        size={sizeProp}
        outerBg={showPill ? "transparent" : DARK_OVERLAY_20}
        innerBg={showVolumeSlider ? "transparent" : DARK_OVERLAY_40}
        volPct={!showVolumeSlider ? volPct : undefined}
        icon={muted ? muteIcon : unmuteIcon}
        className="gencl:overflow-hidden gencl:flex-shrink-0"
      />

      {/* Always rendered while muted so the width-collapse animation plays on unmute. */}
      {muted && (
        <AnimatedText
          text="Tap to unmute"
          width={TAP_TEXT_WIDTH}
          once={once}
          stop={stopText || suppressText}
          onVisibleChange={setTextVisible}
        />
      )}

      {/* Volume slider — always rendered so the close animation plays. */}
      {enableVolumeSlider && !isMobile && (
        <div
          style={{ transitionDuration: "350ms", transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)" }}
          className={cn(
            "gencl:transition-[max-width,opacity] gencl:flex gencl:flex-1 gencl:items-center gencl:overflow-hidden gencl:py-2",
            showVolumeSlider ? "gencl:max-w-full gencl:opacity-100" : "gencl:max-w-0 gencl:opacity-0"
          )}>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolumeChange}
            onClick={(e) => e.stopPropagation()}
            style={{ accentColor: "white", width: sliderWidth }}
            className="gencl:volume-slider gencl:relative gencl:h-1 gencl:cursor-pointer gencl:rounded-full"
          />
          <div className="gencl:h-full gencl:w-4 gencl:flex-shrink-0" />
        </div>
      )}

      {/* Track fill follows volume; custom round white thumb. */}
      <style>{`
        input[type='range'] {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          cursor: pointer;
          outline: none;
          border-radius: 15px;
          height: 6px;
          background: linear-gradient(to right, white ${volume}%, rgba(255, 255, 255, 0.4) ${volume}%);
        }

        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 15px;
          width: 15px;
          background-color: white;
          border-radius: 50%;
          border: none;
          transition: 0.2s ease-in-out;
        }
      `}</style>
    </div>
  );
}
