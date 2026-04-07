"use client";
import { cn } from "@genuin/ui/utils";
import { type ComponentProps } from "react";

import {
  IHeartMuteIcon,
  IHeartPauseIcon,
  IHeartPlayIcon,
  IHeartShareIcon,
  IHeartUnmuteIcon,
} from "@genuin/ui/icons";

import { usePlayerContext } from "../../../context";
import { ShareButton } from "@genuin/components/molecules/share-button";
import { useAnalytics } from "@genuin/components/context/analytics";
import { ReactionButton } from "@genuin/components/molecules/reaction-button";
import { DynamicReactionIcon } from "@genuin/components/molecules/reaction-button";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import {
  SDKEventEmitter,
  SDKEventName,
} from "@genuin/components/lib/sdk-event-emitter";
// import { useBaseContext } from "@genuin/components/context";
import { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";
import { Button } from "@genuin/ui/components/button";
import { compressText } from "@genuin/components/lib/utils";

type IHeartControlsProps = ComponentProps<"div"> & {
  /**
   * Size of the buttons within the controls
   * @default "xs"
   */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /**
   * Variant of the controls layout
   * - "clip": Default horizontal layout without reaction icon
   * - "expand": Vertical layout with reaction icon at the top
   * @default "clip"
   */
  variant?: "clip" | "expand";
  /**
   * Data required for share and reaction functionality (same as Actions component)
   */
  contentId?: string;
  slug?: string;
  isReacted?: boolean;
  reactionCount?: number;
  isActive: boolean;
  videoDetails: PostDetailsType["video"];
  /**
   * Callback functions for handling control actions
   */
  onReactionStateChange?: (isReacted: boolean) => void;
  index?: number;
  isVideoWatched?: boolean;
};

export function IHeartControls({
  className,
  size = "xs",
  variant = "clip",
  isActive,
  contentId,
  slug,
  isReacted = false,
  reactionCount = 0,
  videoDetails,
  index,
  onReactionStateChange,
  isVideoWatched,
  ...restProps
}: IHeartControlsProps) {
  const {
    view: { websiteType },
  } = useEmbedConfigs();
  const { playingState, togglePlay, muted, toggleMuted } = usePlayerContext();
  const { track, EventName } = useAnalytics();
  //  Access baseContextManager to subscribe to preview index change events
  // const { baseContextManager } = useBaseContext();
  const { isMobile, isDesktop } = useDeviceDetectMediaQuery();

  //  Track custom muted state for video preview (hover) mode
  // This state is separate from the actual player mute state and controls UI appearance only
  // When true, displays mute icon even if player is not actually muted
  // const [customMuted, setCustomMuted] = useState(false);

  //  Listen for preview index changes to update custom mute UI state
  // When a video enters preview mode (hover), it should show as muted in the controls
  // useEffect(() => {
  //   function handlePreviewIndexChanged(payload: any) {
  //     // Set customMuted to true when this video's index matches the preview index
  //     // This shows a muted icon during hover/preview without affecting actual audio state
  //     setCustomMuted(payload.previewIndex === index);
  //   }

  //   // Subscribe to preview index changes
  //   baseContextManager.on("onPreviewIndexChanged", handlePreviewIndexChanged);

  //   // Cleanup: unsubscribe when component unmounts or dependencies change
  //   return () => {
  //     baseContextManager.off(
  //       "onPreviewIndexChanged",
  //       handlePreviewIndexChanged
  //     );
  //   };
  // }, [baseContextManager, index]);

  const isExpand = variant === "expand";

  // Generate share URL with action=share parameter
  const generateShareUrl = (
    isExpand: boolean,
    slug?: string,
    contentId?: string,
  ) => {
    // let url = isExpand
    //   ? window.location.href
    //   : (() => {
    //       const url = new URL(window.location.href);
    //       const pathSegments = url.pathname.split("/").filter(Boolean);
    //       const hasHighlights = pathSegments.includes("highlights");

    //       let newPath;
    //       if (hasHighlights) {
    //         newPath = `${url.pathname}/${slug}_${contentId}`;
    //       } else {
    //         newPath = `${url.pathname.replace(/\/$/, "")}/highlights/${slug}_${contentId}`;
    //       }
    //       const queryString = url.search;
    //       return `${url.origin}${newPath}${queryString}`;
    //     })();
    const isPodcast = videoDetails?.attributes?.type === "podcast";
    const url = new URL(
      "https://iheart.com/" +
        (isPodcast ? "podcast/" : "live/") +
        (isPodcast
          ? videoDetails.attributes?.slug
          : videoDetails?.attributes?.station_id) +
        "/highlights/" +
        videoDetails?.slug +
        "_" +
        videoDetails?.id,
    );

    if (!url.searchParams.has("action")) {
      url.searchParams.set("action", "share");
    }

    if (!url.searchParams.has("cmp")) {
      url.searchParams.set("cmp", `web_${websiteType}_hl_share`);
    }

    if (!url.searchParams.has("sc")) {
      url.searchParams.set("sc", `web_${websiteType}_hl_social_share`);
    }

    return url.toString();
  };

  const shareUrl = generateShareUrl(isExpand, slug, contentId);

  // Truncate title and description based on device type
  const titleMaxLength = isMobile ? 30 : 55;
  const descriptionMaxLength = isMobile ? 120 : 180;

  const truncatedTitle = compressText(
    videoDetails?.attributes?.description ?? "",
    titleMaxLength,
  );
  const truncatedDescription = compressText(
    videoDetails?.descritptionText ?? "",
    descriptionMaxLength,
  );

  return (
    <div
      // role="toolbar"
      // aria-label="Media controls"
      // aria-orientation={isExpand ? "vertical" : "horizontal"}
      className={cn("gencl:flex gencl:flex-col", className)}
      {...restProps}
    >
      <ReactionButton
        shareUrl={shareUrl ?? ""}
        videoSlug={slug ?? ""}
        isReacted={isReacted}
        contentId={contentId ?? ""}
        reactionCount={reactionCount}
        contentType="VIDEO"
        onReactionStateChange={onReactionStateChange}
        reactionButtonTheme="dark"
        withCustomChildren
        onClick={(e) => {
          e?.stopPropagation();
        }}
        className="gencl:w-11 gencl:h-11"
        tabIndex={-1}
        aria-hidden="true"
      >
        <Button
          theme="custom"
          aria-label={isReacted ? `Thumb up, Pressed` : `Thumb up, Not pressed`}
          aria-pressed={isReacted}
          role="button"
          tabIndex={-1}
          variant="icon"
          title="Thumbs Up"
          className="gencl:w-11 gencl:h-11 gencl:p-0 gencl:flex gencl:items-center gencl:justify-center"
        >
          <DynamicReactionIcon
            isSparked={isReacted}
            sparkCount={reactionCount}
            theme="dark"
            iconHeight={24}
            iconWidth={24}
            type="feed"
          />
        </Button>
      </ReactionButton>

      {/* {isExpand && (
        <Button
          theme="custom"
          variant="icon"
          className="gencl:w-11 gencl:h-11 gencl:p-0 gencl:flex gencl:items-center gencl:justify-center"
          onClick={() => {
            onReactionClick?.();
          }}
        >
          <IHeartReactionIcon theme="dark" size={size} />
        </Button>
      )} */}

      <Button
        theme="custom"
        variant="icon"
        aria-label={muted ? "Mute, Pressed" : "Mute, Not pressed"}
        role="button"
        aria-pressed={muted}
        tabIndex={isVideoWatched ? -1 : 0}
        className="gencl:w-11 gencl:h-11 gencl:p-0 gencl:flex gencl:items-center gencl:justify-center"
        onClick={() => {
          toggleMuted(true);
        }}
        title={muted ? "Unmute" : "Mute"}
      >
        {muted ? (
          <IHeartMuteIcon theme="dark" size={size} aria-hidden="true" />
        ) : (
          <IHeartUnmuteIcon theme="dark" size={size} aria-hidden="true" />
        )}
      </Button>

      <Button
        theme="custom"
        variant="icon"
        aria-label={
          playingState === "PLAYING" ? "Paused, Not pressed" : "Paused, Pressed"
        }
        role="button"
        aria-pressed={playingState !== "PLAYING"}
        tabIndex={isVideoWatched ? -1 : 0}
        className="gencl:w-11 gencl:h-11 gencl:p-0 gencl:flex gencl:items-center gencl:justify-center"
        onClick={() => {
          togglePlay(true);
        }}
        title={playingState === "PLAYING" ? "Pause" : "Play"}
      >
        {playingState === "PLAYING" ? (
          <IHeartPauseIcon theme="dark" size={size} aria-hidden="true" />
        ) : (
          <IHeartPlayIcon theme="dark" size={size} aria-hidden="true" />
        )}
      </Button>

      <ShareButton
        pathName={shareUrl ?? ""}
        withCustomChildren
        disableInternalFunctionality={false}
        onClick={() => {
          // Track share event (same as Actions component)
          if (contentId) {
            track(EventName.VIDEO_SHARED, {
              content_id: contentId,
              title: videoDetails?.descritptionText,
              content_category: "loop",
              event_record_screen: "feed",
              event_target_screen: "none",
            });
          }
          // Emit SDK share event
          SDKEventEmitter.emit(SDKEventName.SHARE, {
            shareUrl: shareUrl ?? "",
            type: videoDetails?.attributes?.type,
            id:
              videoDetails?.attributes?.type === "podcast"
                ? videoDetails.attributes?.podcast_id || undefined
                : videoDetails?.attributes?.type === "station"
                  ? videoDetails?.attributes?.station_id || undefined
                  : undefined,
            clipDescription: truncatedDescription ?? "",
            clipTitle: truncatedTitle ?? "",
            clipThumbnailUrl: videoDetails?.thumbnail,
          });
        }}
      >
        <Button
          theme="custom"
          variant="icon"
          aria-label="Share"
          role="button"
          tabIndex={isVideoWatched ? -1 : 0}
          className="gencl:w-11 gencl:h-11 gencl:p-0 gencl:flex gencl:items-center gencl:justify-center"
          title="Share"
        >
          <IHeartShareIcon theme="dark" size={size} aria-hidden="true" />
        </Button>
      </ShareButton>
    </div>
  );
}
