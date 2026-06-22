"use client";
import { UnmuteIcon } from "@genuin/ui/icons";
import { MuteIcon } from "@genuin/ui/icons";
import { cn } from "@genuin/ui/utils";
import { useCallback, useEffect, useRef, useState } from "react";

import { useBaseContext } from "@genuin/components/context/base";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";

import { usePlayerContext } from "../../../context";
import {
  DARK_OVERLAY_20,
  DARK_OVERLAY_40,
  PLAYER_CONTROL_SIZE,
  type PlayerControlSize,
} from "../../player-control-size";
import { VolumeRing } from "../../volume-ring";

import { AnimatedText } from "./animated-text";

const TRANSITION_MS = 300;

// todo: check if we can use <Slider/> component instead of input[type="range"] here.
export const AnimatedMuteIcon = ({
  shouldAnimate,
  enableVolumeSlider = true,
  size: sizeProp = "md",
  suppressText = false,
}: {
  shouldAnimate: boolean;
  enableVolumeSlider?: boolean;
  size?: PlayerControlSize;
  /** Force the "Tap to unmute" text collapsed — set while the cursor is anywhere
   * in the control bar so the text can't reflow the row mid-interaction. */
  suppressText?: boolean;
}) => {
  const size = PLAYER_CONTROL_SIZE[sizeProp];
  const glyphStyle = { width: size.glyph, height: size.glyph };
  const { volume, setVolume } = useBaseContext();
  const { toggleMuted, muted } = usePlayerContext();
  const { isMobile } = useDeviceDetectMediaQuery();
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [stopText, setStopText] = useState(!shouldAnimate);

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
    if (!enableVolumeSlider || isMobile) return;
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
      toggleMuted(true);
      setStopText(true);
    },
    [toggleMuted]
  );

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    if (muted && newVolume > 0) toggleMuted(false);
    if (newVolume === 0) toggleMuted(true);
  };

  const volPct = muted ? 0 : Math.max(0, Math.min(100, volume));
  const showPill = showVolumeSlider || (muted && !stopText);

  // Slider expanded width = speaker circle + gap + input(140) + spacer(16) + paddingRight(12)
  const expandedWidth = size.outer + 4 + 140 + 16 + 12;

  return (
    <div
      onClick={handleClick}
      className="gencl:group gencl:cursor-pointer gencl:flex gencl:z-50 gencl:items-center gencl:justify-start gencl:overflow-hidden gencl:rounded-full gencl:transition-[max-width,gap,padding-right,background-color]]"
      style={{
        height: size.outer,
        maxWidth: showVolumeSlider ? expandedWidth : size.outer,
        gap: showVolumeSlider ? 4 : 0,
        paddingRight: showVolumeSlider ? 12 : 0,
        backdropFilter: `blur(${size.outerBlur}px)`,
        WebkitBackdropFilter: `blur(${size.outerBlur}px)`,
        background: showPill ? DARK_OVERLAY_20 : "transparent",
        transitionDuration: "350ms",
        transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}>
      {/* Speaker double-circle; the volume arc shows only in the close view (hidden once the slider is open). */}
      <div
        className="gencl:relative gencl:flex gencl:flex-shrink-0 gencl:items-center gencl:justify-center gencl:overflow-hidden gencl:rounded-full gencl:h-full gencl:aspect-square"
        style={{ background: showVolumeSlider ? "transparent" : DARK_OVERLAY_20 }}>
        {!showVolumeSlider && <VolumeRing volPct={volPct} inner={size.inner} />}
        <div
          className="gencl:relative gencl:flex gencl:flex-shrink-0 gencl:items-center gencl:justify-center gencl:rounded-full"
          style={{
            width: size.inner,
            height: size.inner,
            background: DARK_OVERLAY_40,
            backdropFilter: `blur(${size.innerBlur}px)`,
            WebkitBackdropFilter: `blur(${size.innerBlur}px)`,
          }}>
          {!muted ? <UnmuteIcon theme="dark" style={glyphStyle} /> : <MuteIcon theme="dark" style={glyphStyle} />}
        </div>
      </div>

      {/* Always rendered while muted so the width-collapse animation plays on unmute. */}
      {muted && <AnimatedText text="Tap to unmute" width={110} stop={stopText || suppressText} />}

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
            style={{ accentColor: "white" }}
            className="gencl:volume-slider gencl:relative gencl:h-1 gencl:w-[140px] gencl:cursor-pointer gencl:rounded-full"
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
};
