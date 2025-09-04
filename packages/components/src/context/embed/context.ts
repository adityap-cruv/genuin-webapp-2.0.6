"use client";
import { createContext, useContext } from "react";
import { EmbedDataType } from "./embed.types";
import { ActivePlayerType, createEmbedEventBus } from "./event-bus";
import { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";

/**
 * Type definition for the Embed context.
 * @property rootElement - The root HTML element associated with the embed context, or null if not set.
 */
type EmbedContextType = {
  rootElement: HTMLElement | null;
  embedData: EmbedDataType;
  customization: EmbedDataType["customization"];
  /**
   * Indicates whether the embed is running inside an iframe.
   */
  isInIframe: boolean;
  /**
   * The event bus for the embed context, used to manage events.
   */
  embedEventBus: ReturnType<typeof createEmbedEventBus>;
  /**
   * The router for the embed context, used for navigation.
   */
  embedRouter: {
    navigate: (url: string) => void;
    goBack: () => boolean;
    goForward: () => boolean;
    canGoBack: () => boolean;
    canGoForward: () => boolean;
    replace: (url: string) => void;
    hook: any;
    searchHook: any;
    history: string[];
    reset: () => void;
  };
  /**
   * Changes the active index in the embed context.
   * @param newIndex The new active index.
   * @returns
   */
  changeActiveIndex: (newIndex: number) => void;
  /**
   * Changes the active player type in the embed context.
   * @param newActiveType The new active player type.
   * @param activeIndex The index of the active player.
   * @returns
   */
  changeActivePlayerType: (
    newActiveType: ActivePlayerType,
    activeIndex?: number
  ) => void;
  /**
   * Goes back to the previous player type in the embed context.
   * @returns
   */
  goBackToPreviousPlayerType: () => void;

  /**
   * Updates the section list in the context
   * @param newSectionList The new section list to set
   */
  updateSectionList: (newSectionList: PostDetailsType["section"][]) => void;

  /**
   * Updates the sectioned status in the context
   * @param isSectioned Whether the feed is sectioned
   */
  updateIsSectioned: (isSectioned: boolean) => void;

  /**
   * Updates the currently selected section
   */
  updateSelectedSection: (section: PostDetailsType["section"]) => void;
};

/**
 * React context for embedding components.
 * Provides access to the embed context throughout the component tree.
 */
export const EmbedContext = createContext<EmbedContextType | null>(null);

/**
 * Custom hook to access the EmbedContext.
 * Throws an error if used outside of an EmbedProvider.
 * @throws {Error} If the hook is used outside of an EmbedProvider.
 * @returns The current EmbedContext value.
 */
export function useEmbedContext() {
  const context = useContext(EmbedContext);
  if (!context) {
    throw new Error("useEmbedContext must be used within an EmbedProvider");
  }
  return context;
}

/**
 * Safe version of useEmbedContext that returns undefined if the context is missing.
 * Prevents runtime errors if the provider is not present.
 */
export function useSafeEmbedContext() {
  try {
    return useContext(EmbedContext);
  } catch (e) {
    // Optionally log the error
    // console.warn("EmbedContext not found:", e);
    return undefined;
  }
}
