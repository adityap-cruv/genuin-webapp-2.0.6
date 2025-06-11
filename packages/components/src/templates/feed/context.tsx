import { PlaybackSpeedType } from "@molecules/feed-player/context/types";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useBoolean } from "usehooks-ts";

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

    playbackSpeed: PlaybackSpeedType

  setPlaybackSpeed: React.Dispatch<React.SetStateAction<PlaybackSpeedType>>
};

const FeedContext = createContext<FeedContextType>({
  activeIndex: 0,
  setActiveIndex: () => {},
  showExpandView: true,
  openExpandView: () => {},
  closeExpandView: () => {},
  toggleExpandView: () => {},
  playbackSpeed : {
    speed: 1.0,
    isSpeedFromGesture: false
  },
  setPlaybackSpeed : () => {}
});

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
};

export function FeedContextProvider({
  children,
  defaultExpandView = false,
  onCloseExpandView,
}: FeedContextProviderProps) {
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
    isSpeedFromGesture: false
  });

  useEffect(() => {
    const element = document.getElementsByTagName("body")[0];
    if (showExpandView) {
      element?.requestFullscreen({ navigationUI: "hide" });
    } else {
      document.exitFullscreen();
    }

    function handleFullScreenChange() {
      if (!document.fullscreenElement) {
        closeExpandView();
      }
    }
    document.addEventListener("fullscreenchange", handleFullScreenChange);
    // Cleanup the event listener on component unmount
    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
    };
  }, [showExpandView]);

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
        setPlaybackSpeed
      }}
    >
      {children}
    </FeedContext.Provider>
  );
}

export { FeedContext, useFeedContext };
