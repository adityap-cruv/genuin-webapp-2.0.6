"use client";
import { EmbedContext } from "./context";
import { ActivePlayerType, createEmbedEventBus } from "./event-bus";
import { EmbedDataType } from "./embed.types";
import { useCallback, useEffect, useMemo, useState } from "react";

type EmbedProviderProps = {
  embedData: EmbedDataType;
  children: React.ReactNode;
  container: HTMLElement;
};

/**
 * EmbedProvider component that provides the embed context to its children.
 * @param param0 EmbedProviderProps - The properties for the EmbedProvider component.
 * @property embedData - The data to be provided to the embed context.
 * @returns
 */
export function EmbedProvider({
  embedData,
  children,
  container,
}: EmbedProviderProps) {
  // Create a unique event bus for this provider instance
  const embedEventBus = useMemo(() => createEmbedEventBus(), []);
  const [bucketList, setBucketList] = useState<string[]>([]);

  const updateBucketList = useCallback((newBucketList: string[]) => {
    setBucketList(newBucketList);
  }, []);

  // Detect if running inside an iframe (safe for SSR)
  const isInIframe = useMemo(() => {
    if (typeof window === "undefined") return false;
    try {
      return window.self !== window.top;
    } catch {
      // Accessing window.top can throw due to cross-origin
      return true;
    }
  }, []);

  const changeActiveIndex = useCallback(
    (newIndex: number) => {
      embedEventBus.emit("activeIndexChange", undefined, (currentContext) => ({
        ...currentContext,
        activeIndex: newIndex,
      }));
    },
    [embedEventBus]
  );

  const changeActivePlayerType = useCallback(
    (newActiveType: ActivePlayerType, activeIndex?: number) => {
      // if (
      //   newActiveType === "expand-view" &&
      //   !embedData.customization.is_popup_view
      // )
      //   return;

      embedEventBus.emit(
        "activePlayerTypeChange",
        undefined,
        (currentContext) => ({
          ...currentContext,
          previousPlayerType: currentContext.activePlayerType,
          activePlayerType: newActiveType,
          activeIndex: activeIndex ?? currentContext.activeIndex,
        })
      );
    },
    [embedEventBus]
  );
  useEffect(() => {
    if (embedData.startVideoSlug) changeActivePlayerType("expand-view");
  }, [changeActivePlayerType, embedData.startVideoSlug]);

  const goBackToPreviousPlayerType = useCallback(() => {
    embedEventBus.emit(
      "activePlayerTypeChange",
      undefined,
      (currentContext) => ({
        ...currentContext,
        activePlayerType: currentContext.previousPlayerType ?? "embed",
      })
    );
  }, [embedEventBus]);

  // Observe the container for visibility changes to handle floating view behavior
  useEffect(() => {
    const element = document.getElementById("gen-sdk");
    // if floating view is not enabled or element is not found, do nothing
    if (!embedData.customization.is_floating_view || !element) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting && embedData.customization.is_floating_view) {
          changeActivePlayerType("pip");
        } else {
          const embedContext = embedEventBus.getContext();
          // In case of new player-type is expand view don't close the the pip view yet. because intersection observer will be triggered again if expand-view opens.
          if (embedContext.activePlayerType === "expand-view") return;
          changeActivePlayerType("embed");
        }
      });
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [container, changeActivePlayerType, embedData]);

  return (
    <EmbedContext.Provider
      value={{
        rootElement: container,
        embedData,
        customization: embedData.customization,
        isInIframe,
        embedEventBus,
        changeActiveIndex,
        changeActivePlayerType,
        goBackToPreviousPlayerType,
        bucketList,
        updateBucketList,
      }}
    >
      {children}
    </EmbedContext.Provider>
  );
}
