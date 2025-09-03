"use client";
import { EmbedContext } from "./context";
import { ActivePlayerType, createEmbedEventBus } from "./event-bus";
import { EmbedDataType } from "./embed.types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";

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
  const [stateEmbedData, setStateEmbedData] = useState(embedData);
  // Create a unique event bus for this provider instance
  const embedEventBus = useMemo(
    () =>
      createEmbedEventBus({
        activePlayerType: "embed",
        activeIndex: 0,
        sectionList: [],
        isSectioned: false,
      }),
    []
  );

  useEffect(() => {
    if (!window.genuin) return;

    const handleUpdateContextualParams = (props: any) => {
      const payload = props.payload;
      if (
        payload.embedId === stateEmbedData.embed_id &&
        payload.contextualParams
      ) {
        setStateEmbedData((prev) => ({
          ...prev,
          contextualParams: payload.contextualParams,
        }));
      }
    };

    window.genuin.on(
      "sdk:updateContextualParams",
      handleUpdateContextualParams
    );
    return () => {
      window.genuin?.off(
        "sdk:updateContextualParams",
        handleUpdateContextualParams
      );
    };
  }, [stateEmbedData]);

  const updateSectionList = useCallback(
    // Updates the section list in the embed context and emits a sectionListChange event
    (newSectionList: PostDetailsType["section"][]) => {
      embedEventBus.emit("sectionListChange", undefined, (currentContext) => ({
        ...currentContext,
        sectionList: newSectionList,
      }));
    },
    [embedEventBus]
  );

  const updateIsSectioned = useCallback(
    // Updates the isSectioned flag in the embed context and emits an isSectionedChange event
    (sectioned: boolean) => {
      embedEventBus.emit("isSectionedChange", undefined, (currentContext) => ({
        ...currentContext,
        isSectioned: sectioned,
      }));
    },
    [embedEventBus]
  );

  const updateSelectedSection = useCallback(
    // Updates the selected section in the embed context and emits a selectedSectionChange event
    (section: PostDetailsType["section"] | null) => {
      embedEventBus.emit(
        "selectedSectionChange",
        undefined,
        (currentContext) => ({
          ...currentContext,
          selectedSection: section,
        })
      );
    },
    [embedEventBus]
  );

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
    const element = container;
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
        embedData: stateEmbedData,
        customization: stateEmbedData.customization,
        isInIframe,
        embedEventBus,
        changeActiveIndex,
        changeActivePlayerType,
        goBackToPreviousPlayerType,
        updateSectionList,
        updateIsSectioned,
        updateSelectedSection,
      }}
    >
      {children}
    </EmbedContext.Provider>
  );
}
