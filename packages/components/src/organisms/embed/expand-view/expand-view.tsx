import { useEmbedContext } from "@genuin/components/context/embed";
import { EmbedEventContextType } from "@genuin/components/context/embed/event-bus";
import { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { FeedView } from "@genuin/components/templates/feed";
import { useEffect, useState } from "react";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { QueryKey } from "@tanstack/react-query";
import { RootPortal } from "@genuin/components/molecules/root-portal";
import { StandardWall } from "@genuin/components/page/standard-wall/standard-wall";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";
import { cn } from "@genuin/ui/lib/utils";
import { useBaseContext } from "@genuin/components/context/base";
import { usePrevious } from "@genuin/components/hooks/use-previous";
import { RemoveScroll } from "react-remove-scroll";

type EmbedExpandViewProps = {
  videos: PostDetailsType[];
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  queryKey: QueryKey;
};

export function EmbedExpandView({
  videos,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isLoading,
  queryKey,
}: EmbedExpandViewProps) {
  const {
    changeActiveIndex,
    embedEventBus,
    goBackToPreviousPlayerType,
    embedData,
  } = useEmbedContext();
  const { setMuted, muted, setPlaybackSpeed, isInIframe } = useBaseContext();
  const previousMuteState = usePrevious(muted);
  const isSectioned = embedEventBus.getContext().isSectioned;
  const [showExpandView, setShowExpandView] = useState(
    embedEventBus.getContext().activePlayerType === "expand-view"
  );
  const [startIndex, setStartIndex] = useState(0);
  const {
    engagement: {
      engagementTools: { comment, share, repost, spark },
    },
  } = useEmbedConfigs();
  const { isMobile } = useDeviceDetectMediaQuery();

  // Function to handle closing expand view - restores mute state and goes back
  const handleCloseExpandView = () => {
    if (typeof previousMuteState === "boolean") {
      setMuted(true);
    }
    setPlaybackSpeed((x) => {
      if (x.speed !== 1) {
        return { ...x, speed: 1 };
      }
      return x;
    });
    goBackToPreviousPlayerType();
  };

  useEffect(() => {
    const handleActivePlayerTypeChange = (
      eventData: any,
      context: EmbedEventContextType
    ) => {
      if (context.activePlayerType === "expand-view") {
        // Store current mute state when entering expand view
        setShowExpandView(true);
        setStartIndex(context.isSectioned ? 0 : context.activeIndex);

        // Unmute player if brand_id is 2357
        if (embedData?.card_layout_id === 3) {
          // wait till player get init so setMuted update the value::
          setTimeout(() => {
            setMuted(false);
          }, 300);
        }
      } else {
        setShowExpandView(false);
      }
    };

    embedEventBus.on("activePlayerTypeChange", handleActivePlayerTypeChange);
    return () => {
      embedEventBus.off("activePlayerTypeChange", handleActivePlayerTypeChange);
    };
  }, [embedEventBus]);

  // Add keyboard event listener for ESC key
  useEffect(() => {
    if (!showExpandView) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleCloseExpandView();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showExpandView, handleCloseExpandView]);

  // Handle entering/exiting browser fullscreen for expand-view
  useEffect(() => {
    if (!isInIframe) return;
    // Helpers with WebKit fallbacks for Safari
    const isFullscreen = (): boolean => {
      return !!(
        document.fullscreenElement || (document as any).webkitFullscreenElement
      );
    };

    const requestFullscreen = async () => {
      const el = document.documentElement as any;
      try {
        if (el.requestFullscreen) {
          await el.requestFullscreen();
        } else if (el.webkitRequestFullscreen) {
          el.webkitRequestFullscreen();
        }
      } catch (e) {
        // Silently ignore if the browser blocks without user gesture
      }
    };

    const exitFullscreen = async () => {
      const doc: any = document as any;
      try {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (doc.webkitExitFullscreen) {
          doc.webkitExitFullscreen();
        }
      } catch (e) {
        // Ignore
      }
    };

    // If expand-view is shown, request fullscreen; otherwise exit it
    if (showExpandView) {
      if (!isFullscreen()) {
        void requestFullscreen();
      }
    } else {
      if (isFullscreen()) {
        void exitFullscreen();
      }
    }

    // Listen for user exiting fullscreen (e.g., ESC), then revert expand-view
    const handleFsChange = () => {
      const stillFs = isFullscreen();
      if (!stillFs && showExpandView) {
        // Only revert if our UI still thinks we're expanded
        handleCloseExpandView();
      }
    };

    document.addEventListener("fullscreenchange", handleFsChange);
    document.addEventListener("webkitfullscreenchange", handleFsChange as any);

    return () => {
      document.removeEventListener("fullscreenchange", handleFsChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFsChange as any
      );
      // On cleanup, ensure we leave fullscreen if we were in expand-view
      if (showExpandView && isFullscreen()) {
        void exitFullscreen();
      }
    };
  }, [showExpandView, isInIframe]);

  const defaultComponent = (
    <FeedView
      startIndex={startIndex}
      defaultExpandView
      onCloseExpandView={handleCloseExpandView}
      variant="expand"
      isSectioned={isSectioned}
      feedData={{
        videos,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        queryKey,
      }}
      embedOptions={{
        actions: {
          comments: comment,
          share: share,
          reaction: spark,
          repost: repost,
        },
      }}
      onActiveIndexChange={changeActiveIndex}
      disableNativeFullscreenApi
    />
  );

  if (showExpandView)
    return (
      <RemoveScroll>
        <RootPortal
          className={cn(
            "gencl:fixed gencl:flex gencl:justify-center gencl:gap-6 gencl:h-screen gencl:w-screen gencl:inset-0 gencl:z-50 gencl:bg-white",
            isMobile && "gencl:flex-col"
          )}
        >
          {/** for ted internal routing is not enabled. */}
          {embedData.video_layout_id === 3 ? (
            defaultComponent
          ) : (
            <StandardWall
              className="gencl:bg-white gencl:h-full gencl:w-full"
              defaultComponent={defaultComponent}
              baseLayoutVariant="embed-expand-view"
            />
          )}
        </RootPortal>
      </RemoveScroll>
    );
}
