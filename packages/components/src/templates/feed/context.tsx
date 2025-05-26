import React, { createContext, useContext, useState } from "react";
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
};

const FeedContext = createContext<FeedContextType>({
  activeIndex: 0,
  setActiveIndex: () => {},
  showExpandView: true,
  openExpandView: () => {},
  closeExpandView: () => {},
  toggleExpandView: () => {},
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
  // TODO: manage this prop in feed provider to whether to enable expand view or not.
  enableExpandView?: boolean;
};

export function FeedContextProvider({
  children,
  enableExpandView = true,
}: FeedContextProviderProps) {
  // State is used to track the active index of the feed.
  const [activeIndex, setActiveIndex] = useState(0);

  // State is used to track whether the expand view is open or not.
  const {
    value: showExpandView,
    setFalse: closeExpandView,
    setTrue: openExpandView,
    toggle: toggleExpandView,
  } = useBoolean(false);

  return (
    <FeedContext.Provider
      value={{
        activeIndex,
        setActiveIndex,
        showExpandView,
        openExpandView,
        closeExpandView,
        toggleExpandView,
      }}
    >
      {children}
    </FeedContext.Provider>
  );
}

export { FeedContext, useFeedContext };
