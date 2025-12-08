import { useEmbedContext } from "@genuin/components/context/embed";
import { EmbedEventContextType } from "@genuin/components/context/embed/event-bus";
import { useAnalytics } from "@genuin/components/context/analytics/context";
import {
  ControlLayer,
  FeedPlayer,
} from "@genuin/components/molecules/feed-player";
import { PlayerProvider } from "@genuin/components/molecules/feed-player/context";
import { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { XIcon } from "@genuin/ui/icons";
import { cn } from "@genuin/ui/lib/utils";
import { ComponentProps, useCallback, useEffect, useState } from "react";
import { RootPortal } from "@genuin/components/molecules/root-portal";

type PipViewProps = {
  videos: PostDetailsType[];
  isLoading: boolean;
};

export function PipView({ videos, isLoading }: PipViewProps) {
  const [isPipViewOpen, setIsPipViewOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const { track, EventName } = useAnalytics();
  const {
    embedEventBus,
    changeActiveIndex,
    changeActivePlayerType,
    goBackToPreviousPlayerType,
  } = useEmbedContext();

  useEffect(() => {
    const handleActivePlayerTypeChange = (
      eventData: any,
      context: EmbedEventContextType
    ) => {
      if (context.activePlayerType === "pip") {
        setActiveIndex(context.activeIndex);
        setIsPipViewOpen(true);

        // Track FLOATING_EMBED event when PiP mode is enabled
        if (videos.length > context.activeIndex) {
          const currentVideo = videos[context.activeIndex];
          if (currentVideo) {
            track(EventName.FLOATING_EMBED, {
              videoId: currentVideo.video.id,
              postSlug: currentVideo.video.slug,
              communityId: currentVideo.community.id,
              brandId: currentVideo.community.brand?.id,
              creatorName: currentVideo.owner.userName,
            });
          }
        }
      } else {
        setIsPipViewOpen(false);
      }
    };

    embedEventBus.on("activePlayerTypeChange", handleActivePlayerTypeChange);
    return () => {
      embedEventBus.off("activePlayerTypeChange", handleActivePlayerTypeChange);
    };
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
    goBackToPreviousPlayerType();
  }, [goBackToPreviousPlayerType]);

  if (isPipViewOpen && videos.length > 0 && !isLoading) {
    // Ensure activeIndex is valid
    const validIndex =
      activeIndex >= 0 && activeIndex < videos.length ? activeIndex : 0;
    const videoDetails = videos[validIndex];

    if (videoDetails)
      return (
        <RootPortal className="gen-sdk-class">
          <div className="gencl:fixed gencl:bottom-4 gencl:z-999999 gencl:flex gencl:right-4 gencl:h-75 gencl:w-50">
            <div className="gencl:rounded-lg gencl:h-full gencl:w-45">
              <PipPlayer
                videoDetails={videoDetails}
                onInterationEnd={handleIterationEnd}
                isPipActive={isPipViewOpen}
                onClick={handlePipPlayerClick}
              />
            </div>
            <button
              onClick={handleClosePipView}
              className="gencl:size-6 gencl:mt-3! gencl:border-l-0! gencl:bg-secondary-600 gencl:p-1 gencl:flex-center gencl:rounded-r-md"
            >
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
} & ComponentProps<"div">;

function PipPlayer({
  videoDetails,
  className,
  isPipActive = false,
  onInterationEnd,
  ...restProps
}: PipPLayerPropsType) {
  return (
    <div
      className={cn(
        "gencl:relative gencl:h-full gencl:w-full gencl:rounded-lg gencl:overflow-clip",
        className
      )}
      {...restProps}
    >
      <PlayerProvider
        isActive={isPipActive}
        videoId={videoDetails.video.id}
        onPlayerIterationEnd={onInterationEnd ?? (() => {})}
      >
        <FeedPlayer
          videoId={videoDetails.video.id}
          src={videoDetails.video.source}
          poster={videoDetails.video.thumbnail}
          className="gencl:object-cover gencl:w-full gencl:h-full!"
        />
        <ControlLayer variant="embed-pip" isActive postDetails={videoDetails} />
      </PlayerProvider>
    </div>
  );
}
