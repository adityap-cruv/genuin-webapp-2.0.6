import { ExpandIconOld } from "@genuin/ui/icons";
import { CollapseIconOld } from "@genuin/ui/icons";
import { cn } from "@genuin/ui/utils";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { memo, useState, type ComponentProps } from "react";

import { useBaseContext } from "@genuin/components/context/base";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";
import { usePathname } from "@genuin/components/hooks/use-pathname";
import { useSearchParams } from "@genuin/components/hooks/use-search-params";

import { usePlayerContext } from "../../context";

import { AnimatedMuteIcon } from "./control-buttons/mute-button-old";
import { AnimatedPlayButton } from "./control-buttons/play-button-old";
import { EmbedControls } from "./embed-old";

const controlsVariants = cva("gencl:transition-all gencl:z-20 gencl:flex gencl:w-full gencl:justify-between", {
  variants: {
    variant: {
      default: "gencl:absolute gencl:top-12 gencl:sm:top-0! gencl:items-center gencl:gap-3 gencl:p-4",
      embed: "gencl:absolute gencl:p-2 gencl:bg-gradient-to-b gencl:from-black/30 gencl:to-transparent",
      custom: "",
      sectioned:
        "gencl:absolute gencl:items-center gencl:bg-gradient-to-b gencl:from-black/50 gencl:to-transparent gencl:gap-3 gencl:p-4 gencl:from-transparent gencl:to-transparent gencl:top-13 gencl:sm:top-14!",
    },
    /**
     * spacing between the control buttons.
     */
    spacing: {
      liberal: "",
      tight: "",
    },
  },
  defaultVariants: {
    variant: "default",
    spacing: "tight",
  },
});

type ControlButtonsPropsType = ComponentProps<"div"> & {
  showCloseButton?: boolean;
  enableExpand?: boolean;
} & VariantProps<typeof controlsVariants> &
  (
    | {
        variant: "embed";
        ownerInfo?: {
          userName: string;
        };
        /**
         * Show the username of the owner of the video.
         * @default true
         */
        showUserName?: boolean;
      }
    | {
        variant?: Exclude<VariantProps<typeof controlsVariants>["variant"], "embed">;
        ownerInfo?: never;
        showUserName?: never;
      }
  );

/**
 * Control buttons for the video player.
 */
export const Controls = memo(function Controls({
  variant,
  spacing,
  showUserName = true,
  className,
  ownerInfo,
  showCloseButton,
  onClick,
  enableExpand,
  isSponsored,
  hidePlayerControls = false,
  ...restProps
}: ControlButtonsPropsType & {
  isSponsored?: boolean;
  /** When true, hides play/mute/expand controls while keeping the sponsored badge visible. */
  hidePlayerControls?: boolean;
}) {
  const { isMobile } = useDeviceDetectMediaQuery();
  const {
    expandViewConfig: { enable: expandViewEnabled },
  } = useEmbedConfigs();
  const { showExpandView, toggleExpandView } = usePlayerContext();
  const { getSearchParams } = useSearchParams();
  const pathname = usePathname();
  const { brandDetails } = useBaseContext();
  const tapBehavior = brandDetails?.web_configs?.tap_behavior ?? 3;

  // Determine if the variant is embed
  const isEmbed = variant === "embed";

  // Show mute button only if tap behaviour is 2 (play/pause) or if it's not mobile
  const showMuteButton = isMobile ? tapBehavior !== 1 : true;
  // Show play button only if tap behaviour is 1 (mute/unmute) or if it's not mobile
  const showPlayButton = isMobile ? tapBehavior === 1 : true;
  // Animate play/pause button only if tap behaviour is 2
  const shouldAnimatePlayPause = tapBehavior === 2;
  // Animate mute/unmute button only if tap behaviour is not 2
  const shouldAnimateMuteUnmute = tapBehavior !== 2;

  // Suppress hint texts while cursor is in the bar so they can't reflow the row mid-interaction.
  const [isBoxHovered, setIsBoxHovered] = useState(false);

  return (
    <div
      className={cn(controlsVariants({ variant }), className)}
      onClick={(e) => {
        // Prevent click event from bubbling up to the video player
        e.stopPropagation();
        onClick?.(e);
      }}
      onMouseEnter={() => setIsBoxHovered(true)}
      onMouseLeave={() => setIsBoxHovered(false)}
      {...restProps}>
      {!isEmbed && !hidePlayerControls && (
        <div className="gencl:flex gencl:items-center gencl:gap-4 gencl:w-full">
          {showPlayButton && <AnimatedPlayButton shouldAnimate={shouldAnimatePlayPause} suppressText={isBoxHovered} />}
          {showMuteButton && <AnimatedMuteIcon shouldAnimate={shouldAnimateMuteUnmute} suppressText={isBoxHovered} />}
        </div>
      )}

      {isSponsored && isMobile && (
        <div
          className={cn(
            "gencl:bg-black/40 gencl:z-50 gencl:px-4 gencl:rounded-[50px] gencl:flex-center gencl:text-white",
            isMobile ? "gencl:h-9" : "gencl:h-12"
          )}>
          <p className="gencl:text-body-1-normal">Sponsored</p>
        </div>
      )}

      {!isMobile && !isSponsored && !isEmbed && !hidePlayerControls && enableExpand && expandViewEnabled && (
        <div
          onClick={toggleExpandView}
          className="gencl:flex gencl:h-12 gencl:w-12 gencl:cursor-pointer gencl:flex-shrink-0 gencl:items-center gencl:justify-center gencl:rounded-full gencl:bg-black/40">
          {showExpandView ? <CollapseIconOld theme="dark" /> : <ExpandIconOld theme="dark" />}
        </div>
      )}
      {isMobile &&
        !hidePlayerControls &&
        showCloseButton &&
        getSearchParams("feed") !== "1" &&
        !pathname.includes("/video") && (
          <div
            className="gencl:p-2 gencl:rounded-full gencl:bg-black/40 gencl:cursor-pointer"
            onClick={toggleExpandView}>
            <CollapseIconOld theme="dark" />
          </div>
        )}

      {isMobile && isEmbed && !hidePlayerControls && showExpandView && !isSponsored && expandViewEnabled && (
        <div
          onClick={toggleExpandView}
          className="gencl:flex gencl:h-12 gencl:w-12 gencl:cursor-pointer gencl:flex-shrink-0 gencl:items-center gencl:justify-center gencl:rounded-full gencl:bg-black/40">
          {showExpandView ? <CollapseIconOld theme="dark" /> : <ExpandIconOld theme="dark" />}
        </div>
      )}

      {isEmbed && (
        <div className="gencl:flex gencl:w-full gencl:items-center gencl:justify-between">
          {showUserName && ownerInfo ? (
            <p className="gencl:text-white gencl:text-body-1-medium gencl:line-clamp-1 gencl:break-all">
              @{ownerInfo.userName}
            </p>
          ) : (
            <div />
          )}
          <EmbedControls className={cn(spacing === "liberal" && "gencl:gap-3")} size="sm" />
        </div>
      )}
    </div>
  );
});
