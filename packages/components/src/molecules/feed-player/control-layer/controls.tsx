import { cn } from "@genuin/ui/utils";
import { memo, type ComponentProps } from "react";

import { ExpandIcon, XIcon } from "@genuin/ui/icons";
import { CollapseIcon } from "@genuin/ui/icons";
import { useBaseContext } from "@genuin/components/context/base";
import { AnimatedPlayButton } from "./control-buttons";
import { AnimatedMuteIcon } from "./control-buttons";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";
import { usePlayerContext } from "../context/context";
import { useSearchParams } from "@genuin/components/hooks/use-search-params";
import { usePathname } from "@genuin/components/hooks/use-pathname";

type ControlButtonsPropsType = ComponentProps<"div"> & {
  /**
   * Whether to show the close button on mobile devices.
   * If true, a close button will be displayed on mobile devices.
   * This is useful for mobile players where the close button is needed to exit the expand view.
   */
  showCloseButton?: boolean;
};

export const Controls = memo(function Controls({
  showCloseButton = false,
  className,
  onClick,
  ...restProps
}: ControlButtonsPropsType) {
  const { isMobile } = useDeviceDetectMediaQuery();
  const { showExpandView, toggleExpandView } = usePlayerContext();
  const { getSearchParams } = useSearchParams();
  const pathname = usePathname();
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
        "gencl:absolute gencl:transition-all gencl:z-20 gencl:flex gencl:w-full gencl:sm:bg-gradient-to-b gencl:from-black/50 gencl:to-transparent gencl:top-16 gencl:sm:top-0 gencl:justify-between gencl:items-center gencl:gap-3 gencl:p-4",
        // in case of expand view and show close button is true, which means the control layer is on mobile expand view, which doesn't contain the top-bar so that we can put top-0.
        showExpandView && isMobile && showCloseButton
          ? "gencl:top-0"
          : "gencl:top-16",
        className
      )}
      onClick={(e) => {
        // Prevent click event from bubbling up to the video player
        e.stopPropagation();
        onClick?.(e);
      }}
      {...restProps}
    >
      <div className="gencl:flex gencl:items-center gencl:gap-4 gencl:w-full">
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
      {isMobile &&
        showCloseButton &&
        getSearchParams("feed") !== "1" &&
        !pathname.includes("/video") && (
          <div
            className="gencl:p-2 gencl:rounded-full gencl:bg-black/40 gencl:cursor-pointer"
            onClick={toggleExpandView}
          >
            <XIcon theme="dark" />
          </div>
        )}
    </div>
  );
});
