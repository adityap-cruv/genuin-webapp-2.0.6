import { useEmbedContext } from "@genuin/components/context/embed";
import { EmbedEventContextType } from "@genuin/components/context/embed/event-bus";
import { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { useEffect, useState, lazy, Suspense } from "react";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { QueryKey } from "@tanstack/react-query";
import { RootPortal } from "@genuin/components/molecules/root-portal";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";
import { cn } from "@genuin/ui/lib/utils";
import { useBaseContext } from "@genuin/components/context/base";
import { usePrevious } from "@genuin/components/hooks/use-previous";
import { RemoveScroll } from "react-remove-scroll";
import {
  SDKEventEmitter,
  SDKEventName,
  SDKListenerEventName,
} from "@genuin/components/lib/sdk-event-emitter";
import { FeedSkeleton } from "@genuin/components/templates/feed/feed-skeleton.js";
import useViewportHeight from "@genuin/components/hooks/use-screen-height";

const FeedView = lazy(() =>
  import("../../../templates/feed/index.js").then((module) => ({
    default: module.FeedView,
  }))
);

const StandardWall = lazy(() =>
  import("../../../page/standard-wall/standard-wall.js").then((module) => ({
    default: module.StandardWall,
  }))
);

const IheartFullscreenContainer = lazy(() =>
  import("../../../molecules/iheart-full-screen-contaner/index.js").then(
    (module) => ({
      default: module.IheartFullscreenContainer,
    })
  )
);
type EmbedExpandViewProps = {
  videos: PostDetailsType[];
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  queryKey: QueryKey;
  totalVideos: number;
};

const ExpandViewContent = ({
  defaultComponent,
  community,
  group,
  user,
}: {
  defaultComponent: React.ReactNode;
  community: boolean;
  group: boolean;
  user: boolean;
}) => {
  return !(community || group || user) ? (
    defaultComponent
  ) : (
    <Suspense fallback={<FeedSkeleton variant="fullscreen" />}>
      <StandardWall
        className="gencl:h-full gencl:w-full"
        defaultComponent={defaultComponent}
        baseLayoutVariant="embed-expand-view"
      />
    </Suspense>
  );
};

/**
 * EmbedExpandView component for displaying an expanded video feed view in an embedded context.
 *
 * @remarks
 * This component should only be used through the ExpandViewLoader component.
 * Direct usage is not recommended as it relies on the loader to manage the component's
 * mounting/unmounting based on the activePlayerType state. The loader ensures that
 * this component only renders when activePlayerType is "expand-view".
 *
 * @param props - EmbedExpandViewProps containing video feed data, pagination, loading state, and context handlers.
 */
export function EmbedExpandView({
  videos,
  hasNextPage,
  isFetchingNextPage,
  isLoading,
  queryKey,
  totalVideos,
  fetchNextPage,
}: EmbedExpandViewProps) {
  const [startIndex, setStartIndex] = useState(0);
  const { changeActiveIndex, embedEventBus, goBackToPreviousPlayerType } =
    useEmbedContext();
  const {
    setMuted,
    muted,
    setPlaybackSpeed,
    isInIframe,
    baseEventBus,
    brandDetails,
  } = useBaseContext();
  const {
    brand: { isIndianExpress },
  } = useEmbedConfigs();
  const { isMobile, isDesktop } = useDeviceDetectMediaQuery();
  const viewportHeight = useViewportHeight();
  const previousMuteState = usePrevious(muted);
  const isSectioned = embedEventBus.getContext().isSectioned;
  const {
    engagement: {
      engagementTools: { comment, share, repost, spark },
      redirectionTools: { community, group, user },
    },
    view: { brandLayoutType, websiteType },
  } = useEmbedConfigs();
  const isIHeart = brandLayoutType === "iheart";

  // Function to handle closing expand view - restores mute state and goes back
  const handleCloseExpandView = (isEscapeKey?: boolean) => {
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
    /*
     * Handle closing the expand view and syncing with embed view.
     * The embed view shows all cards (including overlay), while expand view
     * skips the overlay card, requiring index adjustment when switching views.
     */
    const { activeIndex } = embedEventBus.getContext();
    const currentVideo = videos[activeIndex];
    const nextVideo = videos[activeIndex + 1];

    // Case 1: At end of feed - move back one position before returning to embed view
    const isEndOfFeed = currentVideo?.video.type === "complete";
    if (isEndOfFeed) {
      changeActiveIndex(Math.max(activeIndex - 1, 0));
      embedEventBus.emit("centerActiveSlide", {});
      goBackToPreviousPlayerType();
      return;
    }

    // Case 2: Closed via back button OR one position before end
    // No sync needed - indices already aligned (end card not shown in embed view)
    const isClosedViaBackButton = !isEscapeKey;
    const isBeforeEndOfFeed = nextVideo?.video.type === "complete";
    if (isClosedViaBackButton || isBeforeEndOfFeed) {
      embedEventBus.emit("centerActiveSlide", {});
      goBackToPreviousPlayerType();
      return;
    }

    // Case 3: Closed via Escape key - sync indices if overlay card was skipped
    // Overlay card exists in embed view but not in expand view
    const overlayIndex = videos.findIndex(
      (post) => post.video.type === "overlay"
    );
    const hasPassedOverlay = activeIndex > overlayIndex && overlayIndex !== -1;
    if (
      hasPassedOverlay ||
      (activeIndex === overlayIndex &&
        (websiteType === "legacy" || (websiteType === "polaris" && !isDesktop)))
    ) {
      // Increment by 1 to account for the skipped overlay card in expand view
      changeActiveIndex(activeIndex + 1);
    }
    embedEventBus.emit("centerActiveSlide", {});
    goBackToPreviousPlayerType();
  };

  useEffect(() => {
    /**
     * Initialization effect for EmbedExpandView component.
     *
     * This component is designed to only mount when the expand view is active.
     * The ExpandViewLoader component manages the mounting/unmounting lifecycle
     * based on the activePlayerType state, ensuring this component only renders
     * when activePlayerType equals "expand-view".
     *
     * Direct usage of EmbedExpandView without ExpandViewLoader is not recommended
     * as it may lead to unexpected behavior or rendering issues.
     */

    const context = embedEventBus.getContext();
    // Store current mute state when entering expand view
    const currentActiveIndex = context.isSectioned ? 0 : context.activeIndex;
    const overlayIndex = videos.findIndex(
      (post) => post.video.type === "overlay"
    );
    setStartIndex(
      overlayIndex === -1
        ? currentActiveIndex
        : currentActiveIndex >= overlayIndex
          ? currentActiveIndex - 1
          : currentActiveIndex
    );
    if (brandLayoutType === "iheart") {
      setTimeout(() => {
        setMuted(muted);
      }, 100);
      if (
        websiteType === "legacy" &&
        !baseEventBus.getContext().globalPlayingState
      ) {
        baseEventBus.emit(
          "globalPlayingStateChange",
          undefined,
          (oldContext) => ({ ...oldContext, globalPlayingState: true })
        );
      }
    } else if (brandLayoutType === "ted") {
      setTimeout(() => {
        setMuted(false);
      }, 300);
    }

    const handleUpdateStartVideoSlug = () => {
      setStartIndex(0);
    };

    SDKEventEmitter.on(
      SDKListenerEventName.UPDATE_START_VIDEO_SLUG,
      handleUpdateStartVideoSlug
    );

    return () => {
      SDKEventEmitter.off(
        SDKListenerEventName.UPDATE_START_VIDEO_SLUG,
        handleUpdateStartVideoSlug
      );
    };
  }, [embedEventBus, brandLayoutType, setMuted, muted, videos]);

  // Add keyboard event listener for ESC key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleCloseExpandView(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleCloseExpandView]);

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
          const video = videos[startIndex]?.video;
          let videoShareUrl = video?.shareUrl;

          // For brand_id 2249, construct custom URL with white_label_url
          if (isIndianExpress && video?.slug && brandDetails?.white_label_url) {
            videoShareUrl = `${brandDetails.white_label_url}/home?startVideoSlug=${video.slug}`;
          }

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
    if (!isFullscreen()) {
      void requestFullscreen();
    }

    // Listen for user exiting fullscreen (e.g., ESC), then revert expand-view
    const handleFsChange = () => {
      const stillFs = isFullscreen();
      if (!stillFs) {
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
      if (isFullscreen()) {
        void exitFullscreen();
      }
    };
  }, [isInIframe, isIndianExpress]);

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
    // const htmlElement = document.querySelector("html");
    // if (!htmlElement) return;

    // // Check if there's an inline style first
    // const hasInlineStyle = htmlElement.style.overflow !== "";
    // const originalOverflow = hasInlineStyle
    //   ? htmlElement.style.overflow
    //   : getComputedStyle(htmlElement).overflow;
    // const originalPriority = hasInlineStyle
    //   ? htmlElement.style.getPropertyPriority("overflow")
    //   : ""; // Computed styles don't have priority info
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
    SDKEventEmitter.emit(SDKEventName.EXPAND_VIEW_CHANGED, true);
    // htmlElement.style.setProperty("overflow", "hidden", "important");

    return () => {
      SDKEventEmitter.emit(SDKEventName.EXPAND_VIEW_CHANGED, false);
      // if (hasInlineStyle) {
      //   htmlElement.style.setProperty(
      //     "overflow",
      //     originalOverflow,
      //     originalPriority
      //   );
      // } else {
      //   // Remove inline style to let CSS cascade take over
      //   htmlElement.style.removeProperty("overflow");
      // }
    };
  }, []);

  // Make underlying embed content inert when expand view is active
  useEffect(() => {
    // Find the main embed container
    const embedContainer = document.querySelector(".gen-sdk-embed");

    if (embedContainer && embedContainer instanceof HTMLElement) {
      // Set inert attribute to prevent all interactions with elements behind expand view
      embedContainer.inert = true;

      return () => {
        // Remove inert attribute when expand view is closed
        embedContainer.inert = false;
      };
    }
  }, []);

  const defaultComponent = (
    <Suspense fallback={<FeedSkeleton variant="fullscreen" />}>
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
          totalVideos,
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
    </Suspense>
  );

  return (
    <RemoveScroll>
      <RootPortal
        className={cn(
          "gen-sdk-class gen-sdk-expand-view gencl:h-full gencl:w-full gencl:inset-0 gencl:z-50",
          isMobile && "gencl:flex-col",
          // Apply fixed positioning with full screen dimensions for non-iHeart layouts
          !isIHeart && "gencl:fixed gencl:h-screen gencl:w-screen",
          isIHeart &&
            websiteType === "legacy" && [
              "gencl:fixed",
              isDesktop ? "gencl:z-[115]!" : "gencl:z-[112]!",
            ]
        )}
        style={{ height: !isIHeart ? `${viewportHeight}px` : "100%" }}
        enabledToaster={!(community || group || user)}
      >
        {isIHeart ? (
          <Suspense fallback={<FeedSkeleton variant="fullscreen" />}>
            <IheartFullscreenContainer>
              <ExpandViewContent
                defaultComponent={defaultComponent}
                community={community}
                group={group}
                user={user}
              />
            </IheartFullscreenContainer>
          </Suspense>
        ) : (
          <ExpandViewContent
            defaultComponent={defaultComponent}
            community={community}
            group={group}
            user={user}
          />
        )}
      </RootPortal>
    </RemoveScroll>
  );
}
