import { useEmbedContext } from "@genuin/components/context/embed";
import { EmbedEventContextType } from "@genuin/components/context/embed/event-bus";
import { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { FeedView } from "@genuin/components/templates/feed";
import { useEffect, useState } from "react";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { QueryKey } from "@tanstack/react-query";
import { RootPortal } from "@genuin/components/molecules/root-portal";

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
    isInIframe,
  } = useEmbedContext();
  const [showExpandView, setShowExpandView] = useState(
    embedEventBus.getContext().activePlayerType === "expand-view"
  );
  const [startIndex, setStartIndex] = useState(0);
  const {
    engagement: {
      engagementTools: { comment, share, repost, spark },
    },
  } = useEmbedConfigs();

  useEffect(() => {
    const handleActivePlayerTypeChange = (
      eventData: any,
      context: EmbedEventContextType
    ) => {
      if (context.activePlayerType === "expand-view") {
        setShowExpandView(true);
        setStartIndex(context.isSectioned ? 0 : context.activeIndex);
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
        goBackToPreviousPlayerType();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showExpandView, goBackToPreviousPlayerType]);

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
        goBackToPreviousPlayerType();
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
  }, [showExpandView, goBackToPreviousPlayerType, isInIframe]);

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
        goBackToPreviousPlayerType();
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
  }, [showExpandView, goBackToPreviousPlayerType, isInIframe]);

  if (showExpandView)
    return (
      <RootPortal>
        <FeedView
          startIndex={startIndex}
          defaultExpandView
          onCloseExpandView={goBackToPreviousPlayerType}
          variant="expand"
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
      </RootPortal>
    );
}
