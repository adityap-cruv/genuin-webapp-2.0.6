import { XIcon } from "@genuin/ui/icons";
import { cn } from "@genuin/ui/lib/utils";
import type { ComponentProps } from "react";
import { useCallback, useEffect, useState } from "react";

import { useAnalytics, VideoTypes } from "@genuin/components/context/analytics/context";
import { useEmbedContext } from "@genuin/components/context/embed";
import { ControlLayer, FeedPlayer } from "@genuin/components/molecules/feed-player";
import { PlayerProvider } from "@genuin/components/molecules/feed-player/context";
import { RootPortal } from "@genuin/components/molecules/root-portal";
import type { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";

type PipViewProps = {
  videos: PostDetailsType[];
  isLoading: boolean;
  totalVideos: number;
};

/**
 * PipView component for displaying videos in Picture-in-Picture mode.
 * This component should not be used directly. Instead, use it via PipViewLoader.
 */
export function PipView({ videos, isLoading, totalVideos }: PipViewProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const { track, EventName } = useAnalytics();
  const { embedEventBus, changeActiveIndex, changeActivePlayerType } = useEmbedContext();

  // Initialize active index from embed context and track floating embed event on mount
  useEffect(() => {
    const context = embedEventBus.getContext();
    setActiveIndex(context.activeIndex);

    // Track FLOATING_EMBED event when PiP mode is enabled
    if (videos.length > context.activeIndex) {
      const currentVideo = videos[context.activeIndex];
      if (currentVideo) {
        track(EventName.FLOATING_EMBED, {
          videoId: currentVideo.video?.id,
          postSlug: currentVideo.video?.slug,
          communityId: currentVideo.community?.id,
          brandId: currentVideo.community?.brand?.id,
          creatorName: currentVideo.owner?.userName,
        });
      }
    }
  }, []);

  const handleIterationEnd = useCallback(() => {
    setActiveIndex((prevIndex) => {
      const nextIndex = prevIndex + 1;
      changeActiveIndex(nextIndex);
      return nextIndex;
    });
  }, [changeActiveIndex, setActiveIndex]);

  const handlePipPlayerClick = useCallback(() => {
    changeActivePlayerType("expand-view");
  }, [changeActivePlayerType]);

  const handleClosePipView = useCallback(() => {
    changeActivePlayerType("embed");
  }, [changeActivePlayerType]);

  if (videos.length > 0 && !isLoading) {
    // Ensure activeIndex is valid
    const validIndex = activeIndex >= 0 && activeIndex < videos.length ? activeIndex : 0;
    const videoDetails = videos[validIndex];

    if (videoDetails)
      return (
        <RootPortal className="gen-sdk-class" portalKey="pip" style={{ height: "0px", width: "0px" }}>
          <div className="gencl:fixed gencl:bottom-4 gencl:z-999999 gencl:flex gencl:right-4 gencl:h-75 gencl:w-50">
            <div className="gencl:rounded-lg gencl:h-full gencl:w-45">
              <PipPlayer
                videoDetails={videoDetails}
                onInterationEnd={handleIterationEnd}
                totalVideos={totalVideos}
                isPipActive
                onClick={handlePipPlayerClick}
                itemSize={{
                  height: 300,
                  width: 180,
                }}
              />
            </div>
            <button
              onClick={handleClosePipView}
              className="gencl:size-6 gencl:mt-3! gencl:border-l-0! gencl:bg-secondary-600 gencl:p-1 gencl:flex-center gencl:rounded-r-md">
              <XIcon size="md" theme="dark" />
            </button>
          </div>
        </RootPortal>
      );
  }
}

type PipPLayerPropsType = {
  videoDetails: PostDetailsType;
  isPipActive?: boolean;
  onInterationEnd?: () => void;
  totalVideos: number;
  itemSize: { height: number; width: number };
} & ComponentProps<"div">;

function PipPlayer({
  videoDetails,
  className,
  isPipActive = false,
  totalVideos,
  onInterationEnd,
  itemSize,
  ...restProps
}: PipPLayerPropsType) {
  const [isAdFilled, setIsAdFilled] = useState(false);

  return (
    <div
      className={cn("gencl:relative gencl:h-full gencl:w-full gencl:rounded-lg gencl:overflow-clip", className)}
      {...restProps}>
      <PlayerProvider
        isActive={isPipActive}
        videoId={videoDetails.video?.id ?? ""}
        videoUrl={videoDetails.video?.source ?? ""}
        onPlayerIterationEnd={onInterationEnd ?? (() => {})}
        totalVideos={totalVideos}
        videoType={videoDetails.video?.videoType ?? VideoTypes.Content}>
        <FeedPlayer
          videoId={videoDetails.video?.id ?? ""}
          src={videoDetails.video?.source}
          poster={videoDetails.video?.thumbnail}
          videoType={videoDetails.video?.videoType ?? VideoTypes.Content}
          adsPlatform={videoDetails.video?.adsPlatform}
          className="gencl:object-cover gencl:w-full gencl:h-full!"
          adTagObject={(videoDetails as any).adTagObject ?? undefined}
          sponsorshipInfo={videoDetails.sponsored}
          isSponsored={videoDetails.video?.cardLayoutId === 7 || videoDetails.video?.videoLayoutId === 6}
          playerSize={{
            height: 180,
            width: 200,
          }}
          onAdStateChange={setIsAdFilled}
        />
        {!isAdFilled && (
          <ControlLayer
            variant="embed-pip"
            isActive
            postDetails={videoDetails}
            style={{ touchAction: "manipulation" }}
          />
        )}
      </PlayerProvider>
    </div>
  );
}
