import { ExpandIcon } from "@genuin/ui/icons";
import { CollapseIcon } from "@genuin/ui/icons";
import {
  ControlButtonGroup,
  ExpandCollapseButton,
  SPONSORED_TAG_SIZE,
  type PlayerControlSize,
} from "@genuin/ui/player-controls";
import { cn } from "@genuin/ui/utils";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { memo, useEffect, useState, type ComponentProps } from "react";

import { useBaseContext } from "@genuin/components/context/base";
import { useSafeEmbedContext } from "@genuin/components/context/embed/context";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";
import { usePathname } from "@genuin/components/hooks/use-pathname";
import { useSearchParams } from "@genuin/components/hooks/use-search-params";
import { HOME_FEED_VIEW_EVENT, HOME_FULL_VIEW_EVENT } from "@genuin/components/lib/home-feed/events";

import { usePlayerContext } from "../../context";

import { AnimatedPlayButton } from "./control-buttons";
import { AnimatedMuteIcon } from "./control-buttons";
import { EmbedControls } from "./embed-v2";

const FIXED_PLAYER_CONTROL_SIZE: PlayerControlSize = "md";

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
  /** Responsive size used by adjacent control metadata. Player buttons use a fixed small size. */
  size?: PlayerControlSize;
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
  size = "md",
  ...restProps
}: ControlButtonsPropsType & {
  isSponsored?: boolean;
  /** When true, hides play/mute/expand controls while keeping the sponsored badge visible. */
  hidePlayerControls?: boolean;
}) {
  const { isMobile } = useDeviceDetectMediaQuery();
  const { showExpandView, toggleExpandView } = usePlayerContext();
  const embedDetails = useSafeEmbedContext();
  // Home's intermediate feed view reuses the expanded player layout, but its control still
  // represents the next step: promotion into the SDK's existing fullscreen view.
  const [isIntermediateFeedView, setIsIntermediateFeedView] = useState(
    embedDetails?.rootElement?.dataset.homeFeedView === "true"
  );
  const [isHomeFeedSession] = useState(
    embedDetails?.rootElement?.dataset.homeFeedSession === "true" ||
      embedDetails?.rootElement?.dataset.homeFeedView === "true"
  );
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

  useEffect(() => {
    if (!isHomeFeedSession) return;
    const handleFullView = () => setIsIntermediateFeedView(false);
    const handleFeedView = () => setIsIntermediateFeedView(true);
    document.addEventListener(HOME_FULL_VIEW_EVENT, handleFullView);
    document.addEventListener(HOME_FEED_VIEW_EVENT, handleFeedView);
    return () => {
      document.removeEventListener(HOME_FULL_VIEW_EVENT, handleFullView);
      document.removeEventListener(HOME_FEED_VIEW_EVENT, handleFeedView);
    };
  }, [isHomeFeedSession]);

  const handleExpandClick = () => {
    if (showExpandView && isIntermediateFeedView) {
      setIsIntermediateFeedView(false);
      document.dispatchEvent(new CustomEvent(HOME_FULL_VIEW_EVENT));
      return;
    }
    // Only the player that owns the Home placement session may return to the
    // bounded Feed View. A document-wide session lookup can capture unrelated
    // /latest, /popular, or /video players during a route hand-off.
    if (showExpandView && isHomeFeedSession) {
      setIsIntermediateFeedView(true);
      document.dispatchEvent(new CustomEvent(HOME_FEED_VIEW_EVENT));
      return;
    }
    toggleExpandView?.();
  };
  const showCollapseControl = showExpandView && !isIntermediateFeedView;

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
      {!isEmbed && (
        <>
          {/* Left slot: keeps the control cluster pinned top-right via justify-between. */}
          {isSponsored && isMobile ? (
            <div
              className="gencl:bg-white gencl:z-50 gencl:rounded-3xl gencl:flex-center gencl:text-gray-900 gencl:px-2! gencl:py-1!"
              style={{
                backdropFilter: "blur(7.5px)",
                // fit-content, not the token's fixed px width — see sponsored-tag.tsx.
                width: "fit-content",
                height: SPONSORED_TAG_SIZE[size].height,
              }}>
              <p className={SPONSORED_TAG_SIZE[size].text}>Sponsored</p>
            </div>
          ) : (
            <div />
          )}

          {/* Right cluster: mute → play/pause → expand|close, grouped top-right. */}
          {!hidePlayerControls && (
            <ControlButtonGroup gap="liberal">
              {showMuteButton && (
                <AnimatedMuteIcon
                  shouldAnimate={shouldAnimateMuteUnmute}
                  size={FIXED_PLAYER_CONTROL_SIZE}
                  suppressText={isBoxHovered}
                />
              )}
              {showPlayButton && (
                <AnimatedPlayButton
                  shouldAnimate={shouldAnimatePlayPause}
                  size={FIXED_PLAYER_CONTROL_SIZE}
                  suppressText={isBoxHovered}
                />
              )}

              {!isMobile && enableExpand && (
                <ExpandCollapseButton
                  size={FIXED_PLAYER_CONTROL_SIZE}
                  onClick={handleExpandClick}
                  ariaLabel={showCollapseControl ? "Collapse" : "Expand"}
                  icon={showCollapseControl ? <CollapseIcon theme="dark" /> : <ExpandIcon theme="dark" />}
                />
              )}

              {isMobile && showCloseButton && getSearchParams("feed") !== "1" && !pathname.includes("/video") && (
                <ExpandCollapseButton
                  size={FIXED_PLAYER_CONTROL_SIZE}
                  onClick={toggleExpandView}
                  ariaLabel="Collapse"
                  icon={<CollapseIcon theme="dark" />}
                />
              )}
            </ControlButtonGroup>
          )}
        </>
      )}

      {isMobile && isEmbed && !hidePlayerControls && showExpandView && !isSponsored && (
        <ExpandCollapseButton
          size={FIXED_PLAYER_CONTROL_SIZE}
          onClick={toggleExpandView}
          ariaLabel={showExpandView ? "Collapse" : "Expand"}
          icon={showExpandView ? <CollapseIcon theme="dark" /> : <ExpandIcon theme="dark" />}
        />
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
          <EmbedControls className={cn(spacing === "liberal" && "gencl:gap-3")} size={FIXED_PLAYER_CONTROL_SIZE} />
        </div>
      )}
    </div>
  );
});
