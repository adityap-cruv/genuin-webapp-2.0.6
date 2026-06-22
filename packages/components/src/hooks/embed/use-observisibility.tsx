// hooks/useObservability.ts
import { useEffect, useRef } from "react";

import { SDKEventEmitter, SDKListenerEventName } from "@genuin/components/lib/sdk-event-emitter";
import type * as ObservabilityService from "@genuin/components/lib/utils/observability/service";

import { AnalyticsService, EventName } from "../../context";
import { buildLayoutIdentity } from "../../context/analytics/build-layout-identity";
import { useSafeEmbedContext } from "../../context/embed/context";
import type { EmbedEventContextType, EmbedEventNameType } from "../../context/embed/event-bus";
import type { EventManager } from "../../lib/utils/event-manager";

// Lazy imports for observability utilities
let observabilityUtils: typeof ObservabilityService | null = null;

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
    observabilityUtils = await import("@genuin/components/lib/utils/observability/service");
  }
  return observabilityUtils;
}

export function useObservability({ embedEventBus, sdkInitTime }: UseObservabilityProps) {
  const observerRef = useRef<PerformanceObserver | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  // useObservability runs inside <EmbedContext> but ABOVE <AnalyticsProvider>, so we
  // cannot use useAnalytics() here. Read embedData directly and attach layout identity
  // per-call via the shared helper.
  const embedContext = useSafeEmbedContext();
  const embedData = embedContext?.embedData;

  useEffect(() => {
    // Seed from context so re-mounting the hook doesn't re-fire an already-sent event.
    let isEmbedRenderedFired: boolean = embedEventBus.getContext().hasEmittedEmbedRendered;

    // Captured at registration so cleanup can remove the SAME handler reference.
    // FEED_LOADED is registered asynchronously (after the lazy utils import resolves),
    // so the handler may still be null if the effect tears down before the import lands.
    let feedLoadedHandler: ((eventData: any) => void) | null = null;

    // Track whether this effect run has been cleaned up so a late-resolving import
    // does not register a listener after unmount (which would leak).
    let isCleanedUp = false;

    // Load observability utilities asynchronously
    loadObservabilityUtils().then((utils) => {
      if (isCleanedUp) return;
      setupObservability(utils);
      utils.observabilityTracker.setSdkRenderedTime(sdkInitTime ?? 0);
    });

    function setupObservability(utils: typeof ObservabilityService) {
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

      function startResourceObserver(utils: typeof ObservabilityService): PerformanceObserver | null {
        try {
          const observer = new PerformanceObserver((list) => {
            if (isEmbedRenderedFired || utils.observabilityTracker.getIsRenderFired()) return;

            // Snapshot the current tracking once, then accumulate across every entry in
            // this batch into a local mutable copy. Reading getContext() per entry would
            // miss updates made earlier in the same batch (the emit below is async w.r.t.
            // this loop), so a thumbnail + video arriving together could under-count.
            const baseTracking = embedEventBus.getContext().resourceTracking;
            let nextThumbnails = baseTracking.thumbnailImages;
            let nextVideos = baseTracking.videos;
            let changed = false;

            list.getEntries().forEach((entry) => {
              const url = entry.name.toLowerCase();
              const originalUrl = entry.name;

              if (!utils.observabilityTracker.isAllowedDomain(originalUrl)) return;

              // Track thumbnail images
              if (utils.observabilityTracker.isImageResource(url)) {
                if (!nextThumbnails.resources.includes(originalUrl) && originalUrl === nextThumbnails.thumbnailUrl) {
                  nextThumbnails = {
                    ...nextThumbnails,
                    loaded: nextThumbnails.loaded + 1,
                    resources: [...nextThumbnails.resources, originalUrl],
                  };
                  changed = true;
                }
              }

              // Track videos
              if (utils.observabilityTracker.isVideoResource(url)) {
                if (!nextVideos.resources.includes(originalUrl) && originalUrl === nextVideos.videoUrl) {
                  nextVideos = {
                    ...nextVideos,
                    loaded: nextVideos.loaded + 1,
                    resources: [...nextVideos.resources, originalUrl],
                  };
                  changed = true;
                }
              }
            });

            // Emit only when an actual match advanced a count this batch.
            if (changed) {
              embedEventBus.emit("updateResourceTracking", undefined, (currentCtx) => ({
                ...currentCtx,
                resourceTracking: {
                  ...currentCtx.resourceTracking,
                  thumbnailImages: nextThumbnails,
                  videos: nextVideos,
                },
              }));

              // Both thumbnail and video must be fully loaded before firing embed_rendered.
              const allLoaded =
                nextVideos.expected === nextVideos.loaded &&
                nextThumbnails.expected === nextThumbnails.loaded;

              if (allLoaded && !isEmbedRenderedFired && !utils.observabilityTracker.getIsRenderFired()) {
                fireEmbedRenderedEvent(observer, 0, utils);
              }
            }
          });

          observer.observe({ entryTypes: ["resource"] });

          // Failsafe: fire embed_rendered after 10s even if resources never completed,
          // so downstream latency metrics aren't blocked indefinitely.
          timeoutRef.current = setTimeout(() => {
            if (!isEmbedRenderedFired && !utils.observabilityTracker.getIsRenderFired()) {
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
        utils: typeof ObservabilityService
      ) {
        const ctx = embedEventBus.getContext();
        // early return if it is already fired.
        if (isEmbedRenderedFired || utils.observabilityTracker.getIsRenderFired()) return;
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
        embedEventBus.emit("updateResourceTracking", undefined, (currentCtx) => ({
          ...currentCtx,
          resourceTracking: {
            ...currentCtx.resourceTracking,
          },
        }));

        // Build and track event
        const performanceMetrics = utils.observabilityTracker.capturePerformanceMetricsSince(0);
        const embedRenderedPayload = utils.observabilityTracker.buildEmbedRenderedPayload(
          performanceMetrics,
          ctx.resourceTracking.thumbnailImages.resources,
          ctx.resourceTracking.videos.resources
        );

        AnalyticsService.track(EventName.EMBED_RENDERED, {
          ...buildLayoutIdentity(embedData),
          api_details: embedRenderedPayload.api_details,
          resource_details: embedRenderedPayload.resource_details,
          // Clamp to >= 0. On the failsafe path resourceWaitDuration is 10000, which can
          // exceed elapsed time (early failsafe / clock skew) and yield a negative latency
          // that would pollute the metric average.
          latency: Math.max(0, utils.observabilityTracker.getSdkToEmbedTime() - resourceWaitDuration),
          api_latency: embedRenderedPayload.api_latency,
          resource_latency: embedRenderedPayload.resource_latency,
        });
      }

      // Listen for videos loaded event. Capture the reference so cleanup can
      // remove this exact handler by identity (SDKEventEmitter.off matches by ref).
      feedLoadedHandler = handleVideosLoaded;
      SDKEventEmitter.on(SDKListenerEventName.FEED_LOADED, handleVideosLoaded);
    }

    return () => {
      isCleanedUp = true;

      // Remove the actual registered handler by reference identity. Previously a
      // throwaway `() => {}` was passed, which never matched the real listener and
      // leaked a FEED_LOADED subscription on every re-mount.
      if (feedLoadedHandler) {
        SDKEventEmitter.off(SDKListenerEventName.FEED_LOADED, feedLoadedHandler);
        feedLoadedHandler = null;
      }

      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
    // embedData is read by fireEmbedRenderedEvent -> buildLayoutIdentity. Include it so a
    // late-resolving embed context doesn't ship a stale/empty layout identity in the event.
  }, [embedEventBus, embedData]);
}
