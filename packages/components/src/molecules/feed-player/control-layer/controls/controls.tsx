import { cn } from "@genuin/ui/utils";
import { memo, type ComponentProps } from "react";

import { ExpandIcon, XIcon } from "@genuin/ui/icons";
import { CollapseIcon } from "@genuin/ui/icons";
import { useBaseContext } from "@genuin/components/context/base";
import { AnimatedPlayButton } from "./control-buttons";
import { AnimatedMuteIcon } from "./control-buttons";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";
import { useSearchParams } from "@genuin/components/hooks/use-search-params";
import { usePlayerContext } from "../../context";
import { usePathname } from "@genuin/components/hooks/use-pathname";
import { cva, VariantProps } from "class-variance-authority";
import { EmbedControls } from "./embed";

const controlsVariants = cva(
  "gencl:transition-all gencl:z-10 gencl:flex gencl:w-full gencl:justify-between",
  {
    variants: {
      variant: {
        default:
          "gencl:absolute gencl:top-16 gencl:sm:top-0 gencl:items-center gencl:bg-gradient-to-b gencl:from-black/50 gencl:to-transparent gencl:gap-3 gencl:p-4",
        embed:
          "gencl:absolute gencl:p-2 gencl:bg-gradient-to-b gencl:from-black/30 gencl:to-transparent",
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
  }
);

type ControlButtonsPropsType = ComponentProps<"div"> & {
  showCloseButton?: boolean;
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
        variant?: Exclude<
          VariantProps<typeof controlsVariants>["variant"],
          "embed"
        >;
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

  return (
    <div
      className={cn(controlsVariants({ variant }), className)}
      onClick={(e) => {
        // Prevent click event from bubbling up to the video player
        e.stopPropagation();
        onClick?.(e);
      }}
      {...restProps}
    >
      {/**
       * Show the animated icons only if it's not an embed
       */}
      {!isEmbed && (
        <div className="gencl:flex gencl:items-center gencl:gap-4 gencl:w-full">
          {showPlayButton && (
            <AnimatedPlayButton shouldAnimate={shouldAnimatePlayPause} />
          )}
          {showMuteButton && (
            <AnimatedMuteIcon shouldAnimate={shouldAnimateMuteUnmute} />
          )}
        </div>
      )}

      {!isMobile && !isEmbed && (
        <div
          onClick={toggleExpandView}
          className="gencl:flex gencl:h-12 gencl:w-12 gencl:cursor-pointer gencl:flex-shrink-0 gencl:items-center gencl:justify-center gencl:rounded-full gencl:bg-black/40"
        >
          {showExpandView ? (
            <CollapseIcon theme="dark" />
          ) : (
            <ExpandIcon theme="dark" />
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

      {isMobile && isEmbed && (
        <div
          onClick={toggleExpandView}
          className="gencl:flex gencl:h-12 gencl:w-12 gencl:cursor-pointer gencl:flex-shrink-0 gencl:items-center gencl:justify-center gencl:rounded-full gencl:bg-black/40"
        >
          {showExpandView ? (
            <CollapseIcon theme="dark" />
          ) : (
            <ExpandIcon theme="dark" />
          )}
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
          <EmbedControls
            className={cn(spacing === "liberal" && "gencl:gap-3")}
            size="sm"
          />
        </div>
      )}
    </div>
  );
});
