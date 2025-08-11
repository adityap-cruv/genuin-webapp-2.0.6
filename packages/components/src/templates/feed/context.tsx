"use client";

import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";
import { PlaybackSpeedType } from "@genuin/components/molecules/feed-player/context/types";
import { useAnalytics } from "@genuin/components/context/analytics";
import React, {
  ComponentProps,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useBoolean } from "usehooks-ts";
import { FeedView } from "./feed";

type VariantType = ComponentProps<typeof FeedView>["variant"];

type FeedContextType = {
  activeIndex: number;
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
  /**
   * To open the expand view of the feed.
   * @returns
   */
  openExpandView: () => void;
  /**
   * To close the expand view of the feed.
   * @returns
   */
  closeExpandView: () => void;
  /**
   * To toggle the expand view of the feed.
   * @returns
   */
  toggleExpandView: () => void;
  /**
   * Whether to show the expand view or not.
   */
  showExpandView: boolean;

  playbackSpeed: PlaybackSpeedType;

  setPlaybackSpeed: React.Dispatch<React.SetStateAction<PlaybackSpeedType>>;

  /**
   * The variant of the feed view.
   */
  variant?: VariantType;
};

const FeedContext = createContext<FeedContextType | undefined>(undefined);

const useFeedContext = () => {
  const context = useContext(FeedContext);
  if (!context) {
    throw new Error("useFeedContext must be used within a FeedProvider");
  }
  return context;
};

type FeedContextProviderProps = {
  children: React.ReactNode;
  /**
   * Whether to show the expand view by default.
   */
  defaultExpandView?: boolean;
  /**
   * Callback function to handle when the expand view is closed.
   */
  onCloseExpandView?: () => void;
  /**
   * The variant of the feed view.
   */
  variant?: VariantType;
  /**
   * A flag to indicate if you want to disable the native fullscreen API.
   */
  disableNativeFullscreenApi?: boolean;
};

export function FeedContextProvider({
  children,
  defaultExpandView = false,
  onCloseExpandView,
  disableNativeFullscreenApi = false,
  variant,
}: FeedContextProviderProps) {
  const { isMobile } = useDeviceDetectMediaQuery();
  const { track, EventName } = useAnalytics();
  // State is used to track the active index of the feed.
  const [activeIndex, setActiveIndex] = useState(0);

  // State is used to track whether the expand view is open or not.
  const {
    value: showExpandView,
    setFalse: closeExpandView,
    setTrue: openExpandView,
    toggle: toggleExpandView,
  } = useBoolean(defaultExpandView);

  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeedType>({
    speed: 1.0,
    isSpeedFromGesture: false,
  });

  useEffect(() => {
    // Track when the expand view is opened or closed
    if (showExpandView) {
      track(EventName.VIDEO_MAXIMIZED, { activeIndex });
    } else {
      track(EventName.VIDEO_MINIMIZED, { activeIndex });
    }

    // If the device is mobile, we do not want to request fullscreen mode. And if the fullscreen api is disabled by user.
    if (isMobile || disableNativeFullscreenApi) return;
    // Only run this effect in browser environments
    if (typeof document === "undefined") return;

    const element = document.getElementsByTagName("body")[0];

    // Try-catch to handle potential errors with fullscreen API
    const enterFullscreen = async () => {
      if (showExpandView && element && document.fullscreenEnabled) {
        try {
          await element.requestFullscreen({ navigationUI: "hide" });
        } catch (error) {
          console.error("Failed to enter fullscreen mode:", error);
        }
      }
    };

    const exitFullscreen = async () => {
      if (!showExpandView && document.fullscreenElement) {
        try {
          await document.exitFullscreen();
        } catch (error) {
          console.error("Failed to exit fullscreen mode:", error);
        }
      }
    };

    // Execute the appropriate function
    if (showExpandView) {
      enterFullscreen();
    } else {
      exitFullscreen();
    }

    function handleFullScreenChange() {
      if (!document?.fullscreenElement) {
        closeExpandView();
      }
    }

    document.addEventListener("fullscreenchange", handleFullScreenChange);

    // Cleanup the event listener on component unmount
    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
    };
  }, [showExpandView, closeExpandView]);

  useEffect(() => {
    // Only run cleanup in browser environments
    if (typeof document === "undefined") return undefined;

    return () => {
      // Ensure to exit fullscreen when the component unmounts
      if (document.fullscreenElement) {
        try {
          document.exitFullscreen().catch((error) => {
            console.error("Failed to exit fullscreen on unmount:", error);
          });
        } catch (error) {
          console.error("Error while exiting fullscreen:", error);
        }
      }
    };
  }, []);

  useEffect(() => {
    if (!showExpandView) {
      onCloseExpandView?.();
    }
  }, [onCloseExpandView, showExpandView]);

  return (
    <FeedContext.Provider
      value={{
        activeIndex,
        setActiveIndex,
        showExpandView,
        openExpandView,
        closeExpandView,
        toggleExpandView,
        playbackSpeed,
        setPlaybackSpeed,
        variant,
      }}
    >
      {children}
    </FeedContext.Provider>
  );
}

export { FeedContext, useFeedContext };
