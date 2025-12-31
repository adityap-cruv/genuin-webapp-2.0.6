"use client";
import { EmbedContext, type FollowStatusItem } from "./context";
import { ActivePlayerType, createEmbedEventBus } from "./event-bus";
import { EmbedDataType } from "./embed.types";
import {
  useCallback,
  useEffect,
  useInsertionEffect,
  useMemo,
  useState,
} from "react";
import { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { createEmbedRouter } from "./embed-router";
import {
  SDKEventEmitter,
  SDKEventName,
  SDKListenerEventName,
} from "@genuin/components/lib/sdk-event-emitter";
import { getBrandType } from "@genuin/components/lib/utils/brand-layout";
import { useFollowStatus } from "./hooks";

type EmbedProviderProps = {
  embedData: EmbedDataType;
  children: React.ReactNode;
  container: HTMLElement;
  brandLayoutType: ReturnType<typeof getBrandType>;
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
  brandLayoutType,
}: EmbedProviderProps) {
  const [stateEmbedData, setStateEmbedData] = useState(embedData);

  const isIHeartLayout = brandLayoutType === "iheart";

  const urlParams = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
  );
  const action = urlParams.get("action");

  // Initialize follow statuses from brand_context (only for iHeart layout)
  const initialFollowStatuses: FollowStatusItem[] = useMemo(() => {
    if (!isIHeartLayout || !embedData.brand_context) return [];

    return embedData.brand_context
      .filter((item) => item.type === "podcast" || item.type === "station")
      .map((item) => ({
        id: String(item.id),
        type: item.type as "podcast" | "station",
        isFollowed: item.isFollowed ?? false,
      }));
  }, [embedData.brand_context, isIHeartLayout]);

  // Create a unique event bus for this provider instance
  const embedEventBus = useMemo(
    () =>
      createEmbedEventBus({
        activePlayerType:
          embedData.style === "expand_only" || embedData.expandOnLoad
            ? "expand-view"
            : "embed",
        activeIndex: 0,
        previousActiveIndex: -1,
        sectionList: [],
        isSectioned: false,
        containerInView: true,
        skipTimeOffsetOnce: false,
        followStatuses: initialFollowStatuses,
        // Only disable swiper for iHeart layout with startVideoSlug and action=share
        disableSwiper:
          isIHeartLayout && !!embedData.startVideoSlug && action === "share",
        isCaughtUpEventFired: false,
      }),
    [
      isIHeartLayout,
      embedData.startVideoSlug,
      action,
      initialFollowStatuses,
      embedData.expandOnLoad,
    ]
  );

  // Create a unique router for this provider instance
  const embedRouter = useMemo(() => createEmbedRouter(), []);

  // Use the follow status hook (only active for iHeart layout)
  const followStatusMethods = useFollowStatus({
    embedData,
    embedEventBus,
    isIHeartLayout,
    setStateEmbedData,
  });

  // Mount event listeners and handlers
  useInsertionEffect(() => {
    const handleUpdateContextualParams = (props: any) => {
      const payload = props.payload;
      if (
        payload &&
        ((payload.embedId && payload.embedId === stateEmbedData.embed_id) ||
          (payload.placementId &&
            payload.placementId === stateEmbedData.placement_id)) &&
        payload.contextualParams
      ) {
        setStateEmbedData((prev) => ({
          ...prev,
          contextualParams: payload.contextualParams,
        }));
      }
    };

    const handleUpdateStartVideoSlug = (props: any) => {
      const payload = props.payload;
      if (
        payload &&
        ((payload.embedId && payload.embedId === stateEmbedData.embed_id) ||
          (payload.placementId &&
            payload.placementId === stateEmbedData.placement_id)) &&
        payload.startVideoSlug
      ) {
        setStateEmbedData((prev) => ({
          ...prev,
          startVideoSlug: payload.startVideoSlug,
          autoUserInteractionToPerform: payload.action,
          commentId: payload.commentId,
        }));
      }
    };

    const handleExpandEmbed = (props: any) => {
      const payload = props.payload;
      const instanceId = container.getAttribute("data-instance-id");
      if (
        payload &&
        ((payload.embedId && payload.embedId === stateEmbedData.embed_id) ||
          (payload.placementId &&
            payload.placementId === stateEmbedData.placement_id)) &&
        instanceId === payload.instanceId
      ) {
        changeActivePlayerType("expand-view");
      }
    };

    const handleCollapseEmbed = (props: any) => {
      const payload = props.payload;
      if (
        payload &&
        ((payload.embedId && payload.embedId === stateEmbedData.embed_id) ||
          (payload.placementId &&
            payload.placementId === stateEmbedData.placement_id))
      ) {
        changeActivePlayerType("embed");
      }
    };

    SDKEventEmitter.on(
      SDKListenerEventName.UPDATE_CONTEXTUAL_PARAMS,
      handleUpdateContextualParams
    );
    SDKEventEmitter.on(
      SDKListenerEventName.UPDATE_START_VIDEO_SLUG,
      handleUpdateStartVideoSlug
    );
    SDKEventEmitter.on(SDKListenerEventName.EXPAND_EMBED, handleExpandEmbed);
    SDKEventEmitter.on(
      SDKListenerEventName.COLLAPSE_EMBED,
      handleCollapseEmbed
    );

    return () => {
      SDKEventEmitter.off(
        SDKListenerEventName.UPDATE_CONTEXTUAL_PARAMS,
        handleUpdateContextualParams
      );
      SDKEventEmitter.off(
        SDKListenerEventName.UPDATE_START_VIDEO_SLUG,
        handleUpdateStartVideoSlug
      );
      SDKEventEmitter.off(SDKListenerEventName.EXPAND_EMBED, handleExpandEmbed);
      SDKEventEmitter.off(
        SDKListenerEventName.COLLAPSE_EMBED,
        handleCollapseEmbed
      );
    };
  }, [stateEmbedData]);

  // Notify that the embed provider is ready
  useEffect(() => {
    // Signal that the embed provider is ready to receive events
    SDKEventEmitter.emit(SDKEventName.EMBED_PROVIDER_READY, {
      embedId: stateEmbedData.embed_id,
      placementId: stateEmbedData.placement_id,
    });
  }, []);

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

  const changeActiveIndex = useCallback(
    (newIndex: number) => {
      embedEventBus.emit("activeIndexChange", undefined, (currentContext) => ({
        ...currentContext,
        activeIndex: newIndex,
        previousActiveIndex: currentContext.activeIndex,
        shouldTrackImpression: newIndex !== currentContext.activeIndex,
      }));
    },
    [embedEventBus]
  );

  const changeActivePlayerType = useCallback(
    (newActiveType: ActivePlayerType, activeIndex?: number) => {
      if (newActiveType === embedEventBus.getContext().activePlayerType) return;
      embedEventBus.emit(
        "activePlayerTypeChange",
        undefined,
        (currentContext) => ({
          ...currentContext,
          previousPlayerType: currentContext.activePlayerType,
          activePlayerType: newActiveType,
          activeIndex: activeIndex ?? currentContext.activeIndex,
          skipTimeOffsetOnce: true,
          previousActiveIndex: currentContext.activeIndex,
          shouldTrackImpression: activeIndex !== currentContext.activeIndex,
        })
      );
    },
    [embedEventBus]
  );

  useEffect(() => {
    if (embedData.startVideoSlug && embedData.expandOnLoad !== false)
      changeActivePlayerType("expand-view");
  }, [
    changeActivePlayerType,
    embedData.startVideoSlug,
    embedData.expandOnLoad,
  ]);

  const goBackToPreviousPlayerType = useCallback(() => {
    embedEventBus.emit(
      "activePlayerTypeChange",
      undefined,
      (currentContext) => ({
        ...currentContext,
        previousPlayerType: currentContext.activePlayerType,
        activePlayerType: currentContext.previousPlayerType ?? "embed",
      })
    );
  }, [embedEventBus]);

  const markAutoInteractionActionDone = useCallback(() => {
    const oldContext = embedEventBus.getContext();
    embedEventBus.updateContext({
      ...oldContext,
      autoInteractionActionDone: true,
    });
  }, [embedEventBus]);

  // Track when user closes expand view for the first time with startVideoSlug
  // and permanently enable swiper for all future opens
  // This feature is only enabled for iHeart brand layout
  useEffect(() => {
    if (!isIHeartLayout || !embedData.startVideoSlug || action !== "share")
      return;

    function handleActivePlayerTypeChange() {
      const context = embedEventBus.getContext();
      // If user exits expand view and swiper is currently disabled, enable it permanently
      if (context.activePlayerType !== "expand-view" && context.disableSwiper) {
        embedEventBus.emit(
          "disableSwiperChange",
          undefined,
          (currentContext) => ({
            ...currentContext,
            disableSwiper: false,
          })
        );
      }
    }

    embedEventBus.on("activePlayerTypeChange", handleActivePlayerTypeChange);
    return () => {
      embedEventBus.off("activePlayerTypeChange", handleActivePlayerTypeChange);
    };
  }, [isIHeartLayout, embedData.startVideoSlug, action, embedEventBus]);

  // Observe the container for visibility changes to handle floating view behavior and track in-view status
  useEffect(() => {
    const element = container;
    if (!element) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const inView = entry.isIntersecting;
        const currentContext = embedEventBus.getContext();

        // Emit event if container in-view status changed
        if (inView !== currentContext.containerInView) {
          embedEventBus.emit(
            "containerInViewChange",
            undefined,
            (currentContext) => ({
              ...currentContext,
              containerInView: inView,
            })
          );
        }

        // Handle floating view behavior only if enabled
        if (!embedData.customization.is_floating_view) return;

        if (!entry.isIntersecting) {
          changeActivePlayerType("pip");
        } else {
          const embedContext = embedEventBus.getContext();
          // In case of new player-type is expand view don't close the pip view yet. because intersection observer will be triggered again if expand-view opens.
          if (embedContext.activePlayerType === "expand-view") return;
          changeActivePlayerType("embed");
        }
      });
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [container, changeActivePlayerType, embedData, embedEventBus]);
  return (
    <EmbedContext.Provider
      value={{
        rootElement: container,
        embedData: stateEmbedData,
        customization: stateEmbedData.customization,
        brandLayoutType,
        embedEventBus,
        embedRouter,
        changeActiveIndex,
        changeActivePlayerType,
        goBackToPreviousPlayerType,
        updateSectionList,
        updateIsSectioned,
        updateSelectedSection,
        markAutoInteractionActionDone,
        getFollowStatus: followStatusMethods.getFollowStatus,
        updateFollowStatus: followStatusMethods.updateFollowStatus,
      }}
    >
      {children}
    </EmbedContext.Provider>
  );
}
