"use client";
import { lazy, useCallback, useEffect, useInsertionEffect, useMemo, useState } from "react";

import { SDKEventEmitter, SDKEventName, SDKListenerEventName } from "@genuin/components/lib/sdk-event-emitter";
import type { getBrandType } from "@genuin/components/lib/utils/brand-layout";
import { SafeSuspense } from "@genuin/components/molecules/error/safe-suspense";
import type { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";

import { EmbedContext, type FollowStatusItem } from "./context";
import { createEmbedRouter } from "./embed-router";
import type { EmbedDataType } from "./embed.types";
import { createEmbedEventBus } from "./event-bus";
import type { ActivePlayerType, EmbedEventContextType } from "./event-bus";
import { useFollowStatus } from "./hooks";

type EmbedProviderProps = {
  embedData: EmbedDataType;
  children: React.ReactNode;
  container: HTMLElement;
  brandLayoutType: ReturnType<typeof getBrandType>;
  trackObservability?: boolean;
  sdkInitTime?: number;
};

// Lazy load the observability hook wrapper component
const ObservabilityTracker = lazy(() =>
  import("@genuin/components/lib/utils/observability/ObservabilityTracker").then((module) => ({
    default: module.ObservabilityTracker,
  }))
);

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
  trackObservability,
  sdkInitTime,
}: EmbedProviderProps) {
  const [stateEmbedData, setStateEmbedData] = useState(embedData);

  const isExpandViewDisabled = stateEmbedData.disable_expand_view === true;

  const isIHeartLayout = brandLayoutType === "iheart";

  const urlParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
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
        activePlayerType: embedData.style === "expand_only" || embedData.expandOnLoad ? "expand-view" : "embed",
        activeIndex: 0,
        previousActiveIndex: -1,
        sectionList: [],
        isSectioned: false,
        containerInView: true,
        skipTimeOffsetOnce: false,
        followStatuses: initialFollowStatuses,
        // Only disable swiper for iHeart layout with startVideoSlug and action=share
        disableSwiper: isIHeartLayout && !!stateEmbedData.startVideoSlug && action === "share",
        isCaughtUpEventFired: false,
        hasEmittedEmbedRendered: false,
        resourceTracking: {
          thumbnailImages: {
            expected: 0,
            loaded: 0,
            resources: [],
            thumbnailUrl: "",
          },
          videos: {
            expected: 0,
            loaded: 0,
            resources: [],
            videoUrl: "",
          },
        },
      }),
    [isIHeartLayout, stateEmbedData.startVideoSlug, action, initialFollowStatuses, embedData.expandOnLoad]
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
          (payload.placementId && payload.placementId === stateEmbedData.placement_id)) &&
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
      const instanceId = container.getAttribute("data-instance-id");

      // Check if this event is for this instance
      // Either by instanceId match (for child->parent communication)
      // OR by embedId/placementId match (for normal SDK operations)
      const isTargetedToThisInstance = payload.instanceId
        ? instanceId === payload.instanceId || instanceId === payload.sourceInstanceId
        : (payload.embedId && payload.embedId === stateEmbedData.embed_id) ||
          (payload.placementId && payload.placementId === stateEmbedData.placement_id);

      if (payload && isTargetedToThisInstance && payload.startVideoSlug) {
        const sourceInstanceId =
          typeof payload?.sourceInstanceId === "string" ? payload.sourceInstanceId : payload.instanceId;
        const isNestedOctoUpdate = typeof sourceInstanceId === "string" && sourceInstanceId.startsWith("octo-panel-");

        if (embedEventBus.getContext().activePlayerType === "expand-view") {
          return;
        }

        // Update state so feed query can refetch when expand view is closed
        // The useEffect below will only open expand view if it's not already open
        setStateEmbedData((prev) => ({
          ...prev,
          startVideoSlug: payload.startVideoSlug,
          autoUserInteractionToPerform: isNestedOctoUpdate ? undefined : payload.action,
          commentId: isNestedOctoUpdate ? undefined : payload.commentId,
        }));
      }
    };

    const handleExpandEmbed = (props: any) => {
      if (isExpandViewDisabled) {
        return;
      }

      const payload = props.payload;
      const instanceId = container.getAttribute("data-instance-id");
      if (
        payload &&
        ((payload.embedId && payload.embedId === stateEmbedData.embed_id) ||
          (payload.placementId && payload.placementId === stateEmbedData.placement_id)) &&
        instanceId === payload.instanceId
      ) {
        /*
        If the expand view is already open and the `sdk:expandEmbed` event is fired,
        we should close the loader that was directly appended to the DOM,
        since the expand view’s own loader will be displayed automatically.
        */
        if (embedEventBus.getContext().activePlayerType === "expand-view") {
          SDKEventEmitter.emit(SDKEventName.EXPAND_VIEW_CHANGED, true);
          return;
        }
        changeActivePlayerTypeToExpandView();
      }
    };

    const handleCollapseEmbed = (props: any) => {
      const payload = props.payload;
      if (
        payload &&
        ((payload.embedId && payload.embedId === stateEmbedData.embed_id) ||
          (payload.placementId && payload.placementId === stateEmbedData.placement_id))
      ) {
        changeActivePlayerType("embed");
      }
    };

    // Host → embed inline navigation. Scope to THIS instance (same rule as the handlers
    // above), then re-broadcast on this instance's own event bus, where the component that
    // holds the swiper + post list (embed.tsx) maps the video id to an index and slides.
    const handleGoToVideo = (props: any) => {
      const payload = props.payload;
      const instanceId = container.getAttribute("data-instance-id");
      const isTargetedToThisInstance = payload?.instanceId
        ? instanceId === payload.instanceId
        : (payload?.placementId && payload.placementId === stateEmbedData.placement_id) ||
          (payload?.embedId && payload.embedId === stateEmbedData.embed_id);

      if (payload && isTargetedToThisInstance && payload.videoId) {
        embedEventBus.emit("goToVideoId", { videoId: payload.videoId });
      }
    };

    // Host → embed inline navigation by index (same scoping as handleGoToVideo). embed.tsx
    // slides the swiper straight to the index — used by the index-based contextual mapping.
    const handleGoToIndex = (props: any) => {
      const payload = props.payload;
      const instanceId = container.getAttribute("data-instance-id");
      const isTargetedToThisInstance = payload?.instanceId
        ? instanceId === payload.instanceId
        : (payload?.placementId && payload.placementId === stateEmbedData.placement_id) ||
          (payload?.embedId && payload.embedId === stateEmbedData.embed_id);

      if (payload && isTargetedToThisInstance && typeof payload.index === "number") {
        embedEventBus.emit("goToIndex", { index: payload.index });
      }
    };

    // Embed → host forward contextual flow: when the active video changes, tell the host
    // (scoped to THIS instance) so it can highlight the linked article/list item at that index.
    const handleActiveIndexForward = (_eventData: unknown, context: EmbedEventContextType) => {
      const instanceId = container.getAttribute("data-instance-id");
      SDKEventEmitter.emit(SDKEventName.PLAYER_VIDEO_CHANGED, {
        instanceId: instanceId ?? undefined,
        index: context.activeIndex,
      });
    };

    SDKEventEmitter.on(SDKListenerEventName.UPDATE_CONTEXTUAL_PARAMS, handleUpdateContextualParams);
    SDKEventEmitter.on(SDKListenerEventName.UPDATE_START_VIDEO_SLUG, handleUpdateStartVideoSlug);
    SDKEventEmitter.on(SDKListenerEventName.EXPAND_EMBED, handleExpandEmbed);
    SDKEventEmitter.on(SDKListenerEventName.COLLAPSE_EMBED, handleCollapseEmbed);
    SDKEventEmitter.on(SDKListenerEventName.PLAYER_GO_TO_VIDEO, handleGoToVideo);
    SDKEventEmitter.on(SDKListenerEventName.PLAYER_GO_TO_INDEX, handleGoToIndex);
    embedEventBus.on("activeIndexChange", handleActiveIndexForward);

    return () => {
      SDKEventEmitter.off(SDKListenerEventName.UPDATE_CONTEXTUAL_PARAMS, handleUpdateContextualParams);
      SDKEventEmitter.off(SDKListenerEventName.UPDATE_START_VIDEO_SLUG, handleUpdateStartVideoSlug);
      SDKEventEmitter.off(SDKListenerEventName.EXPAND_EMBED, handleExpandEmbed);
      SDKEventEmitter.off(SDKListenerEventName.COLLAPSE_EMBED, handleCollapseEmbed);
      SDKEventEmitter.off(SDKListenerEventName.PLAYER_GO_TO_VIDEO, handleGoToVideo);
      SDKEventEmitter.off(SDKListenerEventName.PLAYER_GO_TO_INDEX, handleGoToIndex);
      embedEventBus.off("activeIndexChange", handleActiveIndexForward);
    };
  }, [stateEmbedData, isExpandViewDisabled]);

  // Notify that the embed provider is ready
  useEffect(() => {
    // Signal that the embed provider is ready to receive events
    SDKEventEmitter.emit(SDKEventName.EMBED_PROVIDER_READY, {
      embedId: stateEmbedData.embed_id,
      placementId: stateEmbedData.placement_id,
    });
  }, []);

  // Define callback functions before useEffects that use them
  const changeActivePlayerType = useCallback(
    (newActiveType: ActivePlayerType, activeIndex?: number) => {
      if (newActiveType === embedEventBus.getContext().activePlayerType) return;
      embedEventBus.emit("activePlayerTypeChange", undefined, (currentContext) => ({
        ...currentContext,
        previousPlayerType: currentContext.activePlayerType,
        activePlayerType: newActiveType,
        activeIndex: activeIndex ?? currentContext.activeIndex,
        skipTimeOffsetOnce: true,
        previousActiveIndex: currentContext.activeIndex,
        shouldTrackImpression: activeIndex !== currentContext.activeIndex,
      }));
    },
    [embedEventBus]
  );

  const changeActivePlayerTypeToExpandView = useCallback(() => {
    if (isExpandViewDisabled) {
      return;
    }
    changeActivePlayerType("expand-view");
  }, [changeActivePlayerType, isExpandViewDisabled]);

  useEffect(() => {
    // Only open expand view if it's not already open
    // When expand view is already open, it will handle the video change itself
    if (
      !isExpandViewDisabled &&
      stateEmbedData.startVideoSlug &&
      embedEventBus.getContext().activePlayerType !== "expand-view"
    ) {
      changeActivePlayerTypeToExpandView();
    }
  }, [stateEmbedData, embedEventBus, changeActivePlayerTypeToExpandView, isExpandViewDisabled]);

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
      embedEventBus.emit("selectedSectionChange", undefined, (currentContext) => ({
        ...currentContext,
        selectedSection: section,
      }));
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

  const goBackToPreviousPlayerType = useCallback(() => {
    embedEventBus.emit("activePlayerTypeChange", undefined, (currentContext) => ({
      ...currentContext,
      previousPlayerType: currentContext.activePlayerType,
      activePlayerType: currentContext.previousPlayerType ?? "embed",
    }));
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
    if (!isIHeartLayout || !stateEmbedData.startVideoSlug || action !== "share") return;

    function handleActivePlayerTypeChange() {
      const context = embedEventBus.getContext();
      // If user exits expand view and swiper is currently disabled, enable it permanently
      if (context.activePlayerType !== "expand-view" && context.disableSwiper) {
        embedEventBus.emit("disableSwiperChange", undefined, (currentContext) => ({
          ...currentContext,
          disableSwiper: false,
        }));
      }
    }

    embedEventBus.on("activePlayerTypeChange", handleActivePlayerTypeChange);
    return () => {
      embedEventBus.off("activePlayerTypeChange", handleActivePlayerTypeChange);
    };
  }, [isIHeartLayout, stateEmbedData.startVideoSlug, action, embedEventBus]);

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
          embedEventBus.emit("containerInViewChange", undefined, (currentContext) => ({
            ...currentContext,
            containerInView: inView,
          }));
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
      }}>
      {trackObservability && (
        <SafeSuspense fallback={null} errorFallback={null}>
          <ObservabilityTracker sdkInitTime={sdkInitTime} embedEventBus={embedEventBus} />
        </SafeSuspense>
      )}
      {children}
    </EmbedContext.Provider>
  );
}
