import { useCallback, useEffect, useState } from "react";
import { cn } from "@genuin/ui/utils";
import { UnmuteIcon } from "@genuin/ui/icons";
import { MuteIcon } from "@genuin/ui/icons";

import { AnimatedText } from "./animated-text";
import { useBaseContext } from "src/context/base";
import { usePlayerContext } from "../../context";

// todo: check if we can use <Slider/> component instead of input[type="range"] here.
export const AnimatedMuteIcon = ({
  shouldAnimate,
}: {
  shouldAnimate: boolean;
}) => {
  const { volume, setVolume } = useBaseContext();
  const { toggleMuted, muted } = usePlayerContext();
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [stopAnimating, setStopAnimating] = useState(!shouldAnimate);

  const handleClick = useCallback(
    (e: any) => {
      e.stopPropagation();
      toggleMuted(true);
      setStopAnimating(true);
    },
    [toggleMuted]
  );

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const newVolume = Number(e.target.value);
    setVolume(newVolume);

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
      className={`gencl:group gencl:cursor-pointer gencl:flex gencl:z-50 gencl:h-12 gencl:items-center gencl:justify-start gencl:overflow-hidden gencl:rounded-full gencl:bg-black/40 ${showVolumeSlider && !isMobile ? "gencl:w-full gencl:bg-black/50" : "gencl:bg-black/40"}`}
      onMouseEnter={() => {
        setShowVolumeSlider(true);
      }}
      onMouseLeave={() => {
        setShowVolumeSlider(false);
      }}
    >
      <div className="gencl:flex gencl:h-12 gencl:w-12 gencl:flex-shrink-0 gencl:items-center gencl:justify-center">
        {!muted ? <UnmuteIcon variant="light" /> : <MuteIcon variant="light" />}
      </div>

      {!showVolumeSlider && muted && (
        <AnimatedText text="Tap to unmute" width={125} stop={stopAnimating} />
      )}

      {/* Volume slider with smooth animation */}
      {!isMobile && showVolumeSlider && (
        <div
          className={cn(
            "gencl:transition-all gencl:duration-300 gencl:ease-in-out",
            showVolumeSlider
              ? "gencl:opacity-100 gencl:w-full"
              : "gencl:opacity-0 gencl:w-0",
            "gencl:flex gencl:items-center gencl:overflow-hidden gencl:py-2"
          )}
        >
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
            className="gencl:volume-slider gencl:relative gencl:h-1 gencl:w-full gencl:cursor-pointer gencl:rounded-full"
          />
          <div className="gencl:h-full gencl:w-4" />
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
