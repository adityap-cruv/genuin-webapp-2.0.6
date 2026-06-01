import type { QueryKey } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import type { EmbedDataType } from "@genuin/components/context/embed/embed.types";
import type { createEmbedEventBus } from "@genuin/components/context/embed/event-bus";
import { SDKEventEmitter, SDKListenerEventName } from "@genuin/components/lib/sdk-event-emitter";
import type { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { useInsertVideoToFeed } from "@genuin/components/react-query/api/video/use-insert-video-to-feed";

type UseUpdateStartVideoSlugParams = {
  videos: PostDetailsType[];
  queryKey: QueryKey;
  embedData: EmbedDataType | undefined;
  shouldShowMiddlewareOverlay: boolean;
  brandContext: { id?: string; type: string; value?: string }[] | undefined;
  changeActiveIndex: (index: number) => void;
  setStartIndex: (index: number) => void;
  embedEventBus: ReturnType<typeof createEmbedEventBus>;
};

/**
 * Sets up and tears down the UPDATE_START_VIDEO_SLUG SDK event listener.
 * Manages deduplication, cache insertion via mutation, and index synchronization.
 */
export function useUpdateStartVideoSlug({
  videos,
  queryKey,
  embedData,
  shouldShowMiddlewareOverlay,
  brandContext,
  changeActiveIndex,
  setStartIndex,
  embedEventBus,
}: UseUpdateStartVideoSlugParams): void {
  const lastProcessedVideoRef = useRef<{ slug: string; timestamp: number } | null>(null);
  const { mutateAsync: insertVideo } = useInsertVideoToFeed(queryKey);

  useEffect(() => {
    const handleUpdateStartVideoSlug = (props: any) => {
      const payload = props?.payload;
      const newVideoSlug = payload?.startVideoSlug;

      if (!newVideoSlug) {
        return;
      }

      // Guard against infinite loops: skip if we recently processed this same video
      const now = Date.now();
      const lastProcessed = lastProcessedVideoRef.current;
      if (lastProcessed && lastProcessed.slug === newVideoSlug && now - lastProcessed.timestamp < 3000) {
        return;
      }

      // Skip if this video is already the active one
      const context = embedEventBus.getContext();
      const currentVideo = videos[context.activeIndex];
      if (currentVideo && (currentVideo.video?.slug === newVideoSlug || currentVideo.video?.id === newVideoSlug)) {
        return;
      }

      const sourceInstanceId =
        typeof payload?.sourceInstanceId === "string" ? payload.sourceInstanceId : payload.instanceId;

      const isNestedOctoUpdate = typeof sourceInstanceId === "string" && sourceInstanceId.startsWith("octo-panel-");

      if (isNestedOctoUpdate && !context.autoInteractionActionDone) {
        embedEventBus.updateContext({
          ...context,
          autoInteractionActionDone: true,
        });
      }

      const videoIndex = videos.findIndex(
        (video) => video.video?.slug === newVideoSlug || video.video?.id === newVideoSlug
      );

      if (videoIndex !== -1) {
        lastProcessedVideoRef.current = { slug: newVideoSlug, timestamp: Date.now() };
        changeActiveIndex(videoIndex);
        setStartIndex(videoIndex);
        return;
      }

      const targetIndex = context.activeIndex;

      void insertVideo({
        slug: newVideoSlug,
        targetIndex,
        embedId: embedData?.embed_id,
        placementId: embedData?.placement_id,
        shouldShowMiddlewareOverlay,
        brandContext,
      })
        .then(({ didInsert, targetIndex: insertedAt }) => {
          if (didInsert) {
            lastProcessedVideoRef.current = { slug: newVideoSlug, timestamp: Date.now() };
            changeActiveIndex(insertedAt);
            setStartIndex(insertedAt);
          }
        })
        .catch((error: unknown) => {
          console.error("Failed to fetch/append video:", error);
        });
    };

    SDKEventEmitter.on(SDKListenerEventName.UPDATE_START_VIDEO_SLUG, handleUpdateStartVideoSlug);

    return () => {
      SDKEventEmitter.off(SDKListenerEventName.UPDATE_START_VIDEO_SLUG, handleUpdateStartVideoSlug);
    };
  }, []);
}
