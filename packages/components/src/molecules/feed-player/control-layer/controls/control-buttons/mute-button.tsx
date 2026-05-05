"use client";
import { UnmuteIcon } from "@genuin/ui/icons";
import { MuteIcon } from "@genuin/ui/icons";
import { cn } from "@genuin/ui/utils";
import { useCallback, useEffect, useRef, useState } from "react";

import { useBaseContext } from "@genuin/components/context/base";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";

import { usePlayerContext } from "../../../context";

import { AnimatedText } from "./animated-text";

const TRANSITION_MS = 300;

// todo: check if we can use <Slider/> component instead of input[type="range"] here.
export const AnimatedMuteIcon = ({
  shouldAnimate,
  enableVolumeSlider = true,
}: {
  shouldAnimate: boolean;
  enableVolumeSlider?: boolean;
}) => {
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

  useEffect(() => {
    setStopText(!shouldAnimate);
    if (!shouldAnimate) {
      clearTimer("showSlider");
      clearTimer("resumeText");
      setShowVolumeSlider(false);
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

  // Restart animation whenever system mutes (shouldAnimate flips to true),
  // and stop it when the prop goes back to false (user acted or system unmuted).
  useEffect(() => {
    setShowVolumeSlider(false);
  }, [shouldAnimate]);

  const handleClick = useCallback(
    (e: any) => {
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

    if (muted && newVolume > 0) {
      toggleMuted(false);
    }

    if (newVolume === 0) {
      toggleMuted(true);
    }

    // Update progress color dynamically
    const progress = (newVolume / 100) * 100;
    e.target.style.background = `linear-gradient(to right, white ${progress}%, #707070 ${progress}%)`;
  };

  useEffect(() => {
    // Ensure slider updates on re-renders
    const slider = document.querySelector<HTMLInputElement>(".volume-slider");
    if (slider) {
      const progress = (volume / 100) * 100;
      slider.style.background = `linear-gradient(to right, white ${progress}%, #707070 ${progress}%)`;
    }
  }, [volume]);

  return (
    <div
      onClick={handleClick}
      className={cn(
        "gencl:group gencl:cursor-pointer gencl:flex gencl:z-50 gencl:items-center gencl:justify-start gencl:overflow-hidden gencl:rounded-full gencl:transition-all gencl:duration-300 gencl:ease-in-out",
        showVolumeSlider ? "gencl:w-full gencl:bg-black/50" : "gencl:w-fit gencl:bg-black/40"
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}>
      <div className="gencl:flex gencl:size-9 gencl:sm:size-12! gencl:flex-shrink-0 gencl:items-center gencl:justify-center">
        {!muted ? (
          <UnmuteIcon theme="dark" size="md" className="gencl:sm:size-6!" />
        ) : (
          <MuteIcon theme="dark" size="md" className="gencl:sm:size-6!" />
        )}
      </div>

      {/* Always rendered while muted so the close (width-collapse) animation plays on unmute */}
      {muted && <AnimatedText text="Tap to unmute" width={110} stop={stopText} />}

      {/* Volume slider — always rendered so close animation plays */}
      {enableVolumeSlider && !isMobile && (
        <div
          className={cn(
            "gencl:transition-[max-width] gencl:duration-500 gencl:ease-in-out gencl:flex gencl:flex-1 gencl:items-center gencl:overflow-hidden gencl:py-2",
            showVolumeSlider ? "gencl:max-w-full" : "gencl:max-w-0"
          )}>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolumeChange}
            onClick={(e) => {
              e.stopPropagation();
            }}
            style={{
              accentColor: "white",
            }}
            className="gencl:volume-slider gencl:relative gencl:h-1 gencl:w-[140px] gencl:cursor-pointer gencl:rounded-full"
          />
          <div className="gencl:h-full gencl:w-4 gencl:flex-shrink-0" />
        </div>
      )}

      {/* Custom thumb and track progress styling */}
      <style>{`
        input[type='range'] {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          cursor: pointer;
          outline: none;
          border-radius: 15px;
          height: 6px;
          background: linear-gradient(
            to right,
            white ${(volume / 100) * 100}%,
            #707070 ${(volume / 100) * 100}%
          );
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
