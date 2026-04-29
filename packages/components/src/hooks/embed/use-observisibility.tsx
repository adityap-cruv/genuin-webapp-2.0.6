// hooks/useObservability.ts
import { useEffect, useRef } from "react";
import {
  SDKEventEmitter,
  SDKListenerEventName,
} from "@genuin/components/lib/sdk-event-emitter";
import {
  EmbedEventContextType,
  EmbedEventNameType,
} from "../../context/embed/event-bus";
import { EventManager } from "../../lib/utils/event-manager";
import { AnalyticsService, EventName } from "../../context";

// Lazy imports for observability utilities
let observabilityUtils:
  | typeof import("@genuin/components/lib/utils/observability/service")
  | null = null;

interface UseObservabilityProps {
  embedEventBus: EventManager<EmbedEventContextType, EmbedEventNameType>;
  sdkInitTime?: number;
}

/**s
 * Lazy load observability utilities
 * This ensures the observability-tracker module is only loaded when needed
 */
async function loadObservabilityUtils() {
  if (!observabilityUtils) {
    observabilityUtils = await import(
      "@genuin/components/lib/utils/observability/service.js"
    );
  }
  return observabilityUtils;
}

export function useObservability({
  embedEventBus,
  sdkInitTime,
}: UseObservabilityProps) {
  const observerRef = useRef<PerformanceObserver | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Seed from context so re-mounting the hook doesn't re-fire an already-sent event.
    let isEmbedRenderedFired: boolean =
      embedEventBus.getContext().hasEmittedEmbedRendered;

    // Load observability utilities asynchronously
    loadObservabilityUtils().then((utils) => {
      setupObservability(utils);
      utils.observabilityTracker.setSdkRenderedTime(sdkInitTime ?? 0);
    });

    function setupObservability(
      utils: typeof import("@genuin/components/lib/utils/observability/service"),
    ) {
      /*
        The `embed_rendered` event is fired only after the first video’s
        thumbnail and video assets are successfully loaded.

        We verify this using the Performance API by checking whether the
        thumbnail and video resources have completed loading. Once both
        resources are confirmed as loaded, the `embed_rendered` event
        is triggered with the corresponding video URL and thumbnail URL.
      */
      function handleVideosLoaded(eventData: any) {
        const {
          payload: { thumbnailUrl, videoUrl },
        } = eventData;

        // Skip if URLs are empty (no media to track), or if event already fired (guards against duplicate FEED_LOADED emissions).
        if (
          (videoUrl === "" && thumbnailUrl === "") ||
          isEmbedRenderedFired ||
          utils.observabilityTracker.getIsRenderFired()
        ) {
          return;
        }

        // Update expected counts
        // We use the embedEventBus instance to track thumbnail and video load counts and emit embed events accordingly.
        embedEventBus.emit("updateResourceTracking", undefined, (ctx) => ({
          ...ctx,
          resourceTracking: {
            ...ctx.resourceTracking,
            thumbnailImages: {
              ...ctx.resourceTracking.thumbnailImages,
              thumbnailUrl,
              expected: 1,
            },
            videos: {
              ...ctx.resourceTracking.videos,
              expected: 1,
              videoUrl,
            },
          },
        }));

        // Start observing resources
        observerRef.current = startResourceObserver(utils);
      }

      function startResourceObserver(
        utils: typeof import("@genuin/components/lib/utils/observability/service"),
      ): PerformanceObserver | null {
        try {
          const observer = new PerformanceObserver((list) => {
            const ctx = embedEventBus.getContext();
            if (
              isEmbedRenderedFired ||
              utils.observabilityTracker.getIsRenderFired()
            )
              return;

            list.getEntries().forEach((entry) => {
              const url = entry.name.toLowerCase();
              const originalUrl = entry.name;

              if (!utils.observabilityTracker.isAllowedDomain(originalUrl))
                return;

              const updates: Partial<
                EmbedEventContextType["resourceTracking"]
              > = ctx.resourceTracking;
              const currentTracking = ctx.resourceTracking;

              // Track thumbnail images
              if (utils.observabilityTracker.isImageResource(url)) {
                const thumbData = currentTracking.thumbnailImages;
                if (
                  !thumbData.resources.includes(originalUrl) &&
                  originalUrl === thumbData.thumbnailUrl
                ) {
                  updates.thumbnailImages = {
                    expected: thumbData.expected,
                    loaded: thumbData.loaded + 1,
                    resources: [...thumbData.resources, originalUrl],
                    thumbnailUrl: thumbData.thumbnailUrl,
                  };
                }
              }

              // Track videos
              if (utils.observabilityTracker.isVideoResource(url)) {
                const videoData = currentTracking.videos;
                if (
                  !videoData.resources.includes(originalUrl) &&
                  originalUrl === videoData.videoUrl
                ) {
                  updates.videos = {
                    expected: videoData.expected,
                    loaded: videoData.loaded + 1,
                    resources: [...videoData.resources, originalUrl],
                    videoUrl: videoData.videoUrl,
                  };
                }
              }

              // Emit updates if any
              if (Object.keys(updates).length > 0) {
                embedEventBus.emit(
                  "updateResourceTracking",
                  undefined,
                  (currentCtx) => ({
                    ...currentCtx,
                    resourceTracking: {
                      ...currentCtx.resourceTracking,
                      ...updates,
                    },
                  }),
                );

                // Check if all resources loaded
                // Both thumbnail and video must be fully loaded before firing embed_rendered.
                const allLoaded =
                  updates.videos?.expected === updates.videos?.loaded &&
                  updates.thumbnailImages?.expected ===
                    updates.thumbnailImages?.loaded;

                if (
                  allLoaded &&
                  !isEmbedRenderedFired &&
                  !utils.observabilityTracker.getIsRenderFired()
                ) {
                  fireEmbedRenderedEvent(observer, 0, utils);
                }
              }
            });
          });

          observer.observe({ entryTypes: ["resource"] });

          // Failsafe: fire embed_rendered after 10s even if resources never completed,
          // so downstream latency metrics aren't blocked indefinitely.
          timeoutRef.current = setTimeout(() => {
            if (
              !isEmbedRenderedFired &&
              !utils.observabilityTracker.getIsRenderFired()
            ) {
              fireEmbedRenderedEvent(observer, 10000, utils);
            }
          }, 10000);

          return observer;
        } catch (error) {
          return null;
        }
      }

      function fireEmbedRenderedEvent(
        observer: PerformanceObserver | null,
        resourceWaitDuration: number,
        utils: typeof import("@genuin/components/lib/utils/observability/service"),
      ) {
        const ctx = embedEventBus.getContext();
        // early return if it is already fired.
        if (
          isEmbedRenderedFired ||
          utils.observabilityTracker.getIsRenderFired()
        )
          return;
        // Mark embed render as fired to ensure it runs only once, even when multiple embeds are present
        utils.observabilityTracker.setIsRenderFired(true);
        // Disconnect observer and clear timeout
        if (observer) {
          observer.disconnect();
        }
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        isEmbedRenderedFired = true;
        embedEventBus.emit(
          "updateResourceTracking",
          undefined,
          (currentCtx) => ({
            ...currentCtx,
            resourceTracking: {
              ...currentCtx.resourceTracking,
            },
          }),
        );

        // Build and track event
        const performanceMetrics =
          utils.observabilityTracker.capturePerformanceMetricsSince(0);
        const embedRenderedPayload =
          utils.observabilityTracker.buildEmbedRenderedPayload(
            performanceMetrics,
            ctx.resourceTracking.thumbnailImages.resources,
            ctx.resourceTracking.videos.resources,
          );

        AnalyticsService.track(EventName.EMBED_RENDERED, {
          api_details: embedRenderedPayload.api_details,
          resource_details: embedRenderedPayload.resource_details,
          latency:
            utils.observabilityTracker.getSdkToEmbedTime() -
            resourceWaitDuration,
          api_latency: embedRenderedPayload.api_latency,
          resource_latency: embedRenderedPayload.resource_latency,
        });
      }

      // Listen for videos loaded event
      SDKEventEmitter.on(SDKListenerEventName.FEED_LOADED, handleVideosLoaded);
    }

    return () => {
      // Removes listener by reference identity; no-op lambda used because the original handleVideosLoaded
      // is scoped inside setupObservability and unavailable here — acceptable since the effect re-runs rarely.
      SDKEventEmitter.off(SDKListenerEventName.FEED_LOADED, () => {});

      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [embedEventBus]);
}
