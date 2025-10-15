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
import {
  SDKEventEmitter,
  SDKEventName,
} from "@genuin/components/lib/sdk-event-emitter";

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
  const [startIndex, setStartIndex] = useState(0);
  const {
    changeActiveIndex,
    embedEventBus,
    goBackToPreviousPlayerType,
    embedData,
  } = useEmbedContext();
  const { setMuted, muted, setPlaybackSpeed, isInIframe } = useBaseContext();
  const { isMobile } = useDeviceDetectMediaQuery();
  const previousMuteState = usePrevious(muted);
  const isSectioned = embedEventBus.getContext().isSectioned;
  const [showExpandView, setShowExpandView] = useState(
    embedEventBus.getContext().activePlayerType === "expand-view"
  );
  const {
    engagement: {
      engagementTools: { comment, share, repost, spark },
      redirectionTools: { community, group, user },
    },
    view: { brandLayoutType },
  } = useEmbedConfigs();

  // Function to handle closing expand view - restores mute state and goes back
  const handleCloseExpandView = () => {
    // For iHeart layout, maintain the current mute state (preserve user preference)
    if (
      brandLayoutType !== "iheart" &&
      typeof previousMuteState === "boolean"
    ) {
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

        if (brandLayoutType === "iheart") {
          setTimeout(() => {
            setMuted(muted);
          }, 100);
        } else if (brandLayoutType === "ted") {
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
  }, [embedEventBus, brandLayoutType, setMuted, muted]);

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
        } else if (isInIframe) {
          const videoShareUrl = videos[startIndex]?.video.shareUrl;
          if (videoShareUrl) {
            window.open(videoShareUrl, "_blank");
          }
          handleCloseExpandView();
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

  useEffect(() => {
    /**
     * useEffect to manage the HTML `<html>` element's `overflow` style when the expand view is active.
     *
     * - Purpose: Prevents background scrolling when the expand view is open by setting `overflow: hidden` on the `<html>` element.
     * - Behavior:
     *   - On mount, stores the original `overflow` value of the `<html>` element.
     *   - When `showExpandView` is `true`, sets `overflow` to `hidden` to disable scrolling.
     *   - When `showExpandView` is `false`, restores the original `overflow` value to retain any pre-existing styles.
     *   - On cleanup (component unmount), always restores the original `overflow` value.
     *
     * This ensures that any custom styles related to scrolling or overflow applied to the `<html>` element are preserved and restored after the expand view is closed.
     */
    const htmlElement = document.querySelector("html");
    if (!htmlElement) return;

    // Check if there's an inline style first
    const hasInlineStyle = htmlElement.style.overflow !== "";
    const originalOverflow = hasInlineStyle
      ? htmlElement.style.overflow
      : getComputedStyle(htmlElement).overflow;
    const originalPriority = hasInlineStyle
      ? htmlElement.style.getPropertyPriority("overflow")
      : ""; // Computed styles don't have priority info

    if (showExpandView) {
      /**
       * EmbedExpandView component for displaying an expanded video feed view in an embedded context.
       *
       * @remarks
       * - When the expand view is successfully opened, it emits the `"sdk:expand-view-loaded"` event
       *   via SDKEventEmitter. This event is used to signal that the expand view UI is ready,
       *   allowing to close any skeleton loaders or overlays that may have been shown while waiting
       *   for the expand view to initialize (such as those triggered by a "start video slug" pass-through).
       *
       * @param props - EmbedExpandViewProps containing video feed data, pagination, loading state, and context handlers.
       *
       * @fires SDKEventEmitter.emit(SDKEventName.EXPAND_VIEW_LOADED, true) when expand view is loaded.
       */
      SDKEventEmitter.emit(SDKEventName.EXPAND_VIEW_LOADED, true);
      htmlElement.style.setProperty("overflow", "hidden", "important");
    } else {
      htmlElement.style.setProperty(
        "overflow",
        originalOverflow,
        originalPriority
      );
    }

    return () => {
      if (hasInlineStyle) {
        htmlElement.style.setProperty(
          "overflow",
          originalOverflow,
          originalPriority
        );
      } else {
        // Remove inline style to let CSS cascade take over
        htmlElement.style.removeProperty("overflow");
      }
    };
  }, [showExpandView]);

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
            "gen-sdk-class gen-sdk-expand-view gencl:fixed gencl:flex gencl:justify-center gencl:gap-6 gencl:h-screen gencl:w-screen gencl:inset-0 gencl:z-50 gencl:bg-white",
            isMobile && "gencl:flex-col"
          )}
        >
          {/** for ted internal routing is not enabled. */}
          {!(community || group || user) ? (
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
