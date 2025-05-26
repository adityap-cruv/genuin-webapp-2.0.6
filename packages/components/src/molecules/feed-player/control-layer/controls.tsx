import { cn } from "@genuin/ui/utils";
import { memo, type ComponentProps } from "react";

import { ExpandIcon } from "@genuin/ui/icons";
import { CollapseIcon } from "@genuin/ui/icons";
import { useBaseContext } from "src/context/base";
import { AnimatedPlayButton } from "./control-buttons";
import { AnimatedMuteIcon } from "./control-buttons";
import { useDeviceDetectMediaQuery } from "src/hooks/use-devide-detect-media-query";
import { usePlayerContext } from "../context/context";

type ControlButtonsPropsType = ComponentProps<"div">;

export const Controls = memo(function Controls({
  className,
  onClick,
  ...restProps
}: ControlButtonsPropsType) {
  const { isMobile } = useDeviceDetectMediaQuery();
  const { showExpandView, toggleExpandView } = usePlayerContext();

  const {
    brandDetails: {
      web_configs: { tap_behavior: tapBehavior },
    },
  } = useBaseContext();

  // Show mute button only if tap behaviour is 2 (play/pause) or if it's not mobile
  const showMuteButton = isMobile ? tapBehavior !== 1 : true;
  // Show play button only if tap behaviour is 1 (mute/unmute) or if it's not mobile
  const showPlayButton = isMobile ? tapBehavior === 1 : true;
  // Animate play/pause button only if tap behaviour is 2
  const shouldAnimatePlayPause = tapBehavior === 2;
  // Animate mute/unmute button only if tap behaviour is not 2
  const shouldAnimateMuteUnmute = tapBehavior !== 2;

  return (
    <div
      className={cn(
        "gencl:absolute gencl:z-10 gencl:flex gencl:w-full gencl:bg-gradient-to-b gencl:from-black/50 gencl:to-transparent gencl:top-16 gencl:sm:top-0 gencl:justify-between gencl:items-center gencl:gap-3 gencl:p-2 gencl:px-4",
        className
      )}
      onClick={(e) => {
        // Prevent click event from bubbling up to the video player
        e.stopPropagation();
        onClick?.(e);
      }}
      {...restProps}
    >
      <div className="gencl:flex gencl:items-center gencl:gap-2 gencl:w-full">
        {showPlayButton && (
          <AnimatedPlayButton shouldAnimate={shouldAnimatePlayPause} />
        )}
        {showMuteButton && (
          <AnimatedMuteIcon shouldAnimate={shouldAnimateMuteUnmute} />
        )}
      </div>

      {!isMobile && (
        <div
          onClick={toggleExpandView}
          className="gencl:flex gencl:h-12 gencl:w-12 gencl:cursor-pointer gencl:flex-shrink-0 gencl:items-center gencl:justify-center gencl:rounded-full gencl:bg-black/40"
        >
          {showExpandView ? (
            <CollapseIcon variant="light" />
          ) : (
            <ExpandIcon variant="light" />
          )}
        </div>
      )}
    </div>
  );
});
