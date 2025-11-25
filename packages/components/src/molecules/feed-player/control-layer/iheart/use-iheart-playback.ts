import { useCallback, useEffect, useState } from "react";
import {
  PlayChangeIHeartContentPayload,
  SDKEventEmitter,
  SDKEventName,
  SDKListenerEventName,
} from "@genuin/components/lib/sdk-event-emitter";
import { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { useBaseContext } from "@genuin/components/context";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { ActiveIHeartContentType } from "@genuin/components/context/base/feed-context-manager";
import { useSafeEmbedContext } from "@genuin/components/context/embed/context";

interface UseIHeartPlaybackParams {
  info: {
    podcast?: number;
    station?: number;
    episode?: number;
    type?: "station" | "podcast";
  };
  videoDetails: PostDetailsType["video"];
  options?: {
    onRedirection?: () => void;
  };
  variant?: "complete" | "overlay" | "watch" | "listen";
}

interface UseIHeartPlaybackReturn {
  isPlaying: boolean;
  handleClick: (e: React.MouseEvent) => void;
  ctaText: string | undefined;
  isGoToEpisode: boolean;
}

/**
 * Removes the /highlights segment and everything after it from a URL
 * For radio URLs (station type with /live/), replaces /live/ with /podcast/
 * @param url - The URL to process
 * @returns The base URL without /highlights and subsequent segments
 * @example
 * // Returns "https://dev.listen.iheart.com/podcast/z100-1469"
 * getBaseUrlWithouthighlights({ type: "station", slug: "z100-1469" })
 * // Input: "https://dev.listen.iheart.com/live/z100-1469/highlights/..."
 *
 * // Returns "https://dev.listen.iheart.com/podcast/971-wash-fm-2501"
 * getBaseUrlWithouthighlights({ type: "podcast", slug: "971-wash-fm-2501" })
 * // Input: "https://dev.listen.iheart.com/podcast/971-wash-fm-2501/highlights/..."
 */
export function getBaseUrlWithouthighlights({
  type,
  slug,
}: {
  type: "station" | "podcast";
  slug?: string | null;
}): string {
  const url = window.location.href;

  // Remove /highlights and everything after it
  const clipIndex = url.indexOf("/highlights");
  const baseUrl = clipIndex !== -1 ? url.substring(0, clipIndex) : url;

  // For station type with radio URL (/live/), replace with /podcast/
  if (type === "podcast" && baseUrl.includes("/live/")) {
    const urlObj = new URL(baseUrl);
    return `${urlObj.origin}/podcast/${slug}`;
  }

  return baseUrl;
}

/**
 * Custom hook to manage iHeart content playback state and interactions.
 *
 * Handles:
 * - Initial playback state based on brand context
 * - Event listening for play/pause state changes
 * - Click handling for play/pause/redirection actions
 *
 * @param params - Configuration object
 * @returns Playback state and handlers
 */
export function useIHeartPlayback({
  info,
  videoDetails,
  options,
  variant,
}: UseIHeartPlaybackParams): UseIHeartPlaybackReturn {
  const { baseContextManager } = useBaseContext();
  const embedDetails = useSafeEmbedContext();
  const {
    view: { websiteType },
  } = useEmbedConfigs();
  const isPolaris = websiteType === "polaris";

  // Initialize isPlaying state based on brand context
  // Logic prioritized from listen-live-button.tsx
  const [isPlaying, setIsPlaying] = useState(() => {
    const iheartStatus = baseContextManager.getCurrentActiveIHeartContent();
    if (!iheartStatus) return false;
    return (
      iheartStatus.type === info.type &&
      (iheartStatus.stationId === info.station ||
        (iheartStatus.episodeId === info.episode &&
          iheartStatus.podcastId === info.podcast))
    );
  });

  // Derived values
  const isGoToEpisode =
    (info.type === "podcast" ||
      embedDetails?.embedData.brand_context?.[0]?.type === "podcast") &&
    (variant === "watch" || variant === "complete" || variant === "overlay")
      ? true
      : info.type === "podcast"
        ? !!info.podcast && !info.episode
        : false;
  const ctaText =
    variant === "watch" || variant === "complete" || variant === "overlay"
      ? isGoToEpisode
        ? "Go to Episodes"
        : "Listen Live"
      : videoDetails?.linkouts?.[0]?.cta_text;

  // Helper function to update active iHeart content
  const updateActiveIHeartContent = useCallback(
    (
      payload: {
        type: "station" | "podcast";
        podcastId?: number;
        episodeId?: number;
        stationId?: number;
      } | null
    ) => {
      if (payload === null) {
        baseContextManager.setActiveIHeartContent(null);
      } else {
        baseContextManager.setActiveIHeartContent({
          type: payload.type,
          podcastId:
            payload.type === "podcast" ? (payload.podcastId ?? -1) : -1,
          episodeId:
            payload.type === "podcast" ? (payload.episodeId ?? -1) : -1,
          stationId:
            payload.type === "station" ? (payload.stationId ?? -1) : -1,
        });
      }
    },
    [baseContextManager]
  );

  useEffect(() => {
    function handlePlayChange({ payload }: PlayChangeIHeartContentPayload) {
      if (!payload.playStatus) {
        updateActiveIHeartContent(null);
      } else {
        updateActiveIHeartContent(payload);
      }
    }
    SDKEventEmitter.on(
      SDKListenerEventName.PLAY_CHANGE_IHEART_CONTENT,
      handlePlayChange
    );
    return () => {
      SDKEventEmitter.off(
        SDKListenerEventName.PLAY_CHANGE_IHEART_CONTENT,
        handlePlayChange
      );
    };
  }, [
    info.type,
    info.podcast,
    info.episode,
    info.station,
    updateActiveIHeartContent,
  ]);

  useEffect(() => {
    function activeIHeartContentChange(payload: ActiveIHeartContentType) {
      if (payload === null) {
        setIsPlaying(false);
      }

      setIsPlaying(
        info.type === payload?.type &&
          (info.station === payload?.stationId ||
            (info.episode === payload?.episodeId &&
              info.podcast === payload?.podcastId))
      );
    }

    baseContextManager.on(
      "onActiveIHeartContentChanged",
      activeIHeartContentChange as any
    );
    return () => {
      baseContextManager.off(
        "onActiveIHeartContentChanged",
        activeIHeartContentChange as any
      );
    };
  }, [baseContextManager, info.type, info.episode, info.podcast, info.station]);

  // Helper to construct payload for SDK events
  const constructPayload = useCallback(() => {
    return info.type === "station" && info.station
      ? { type: "station" as const, stationId: info.station }
      : info.type === "podcast" && info.podcast
        ? {
            type: "podcast" as const,
            podcastId: info.podcast,
            episodeId: info.episode,
          }
        : null;
  }, [info]);

  const constructClipPlayerPayload = useCallback(() => {
    const brandContext = embedDetails?.embedData.brand_context?.[0];
    return {
      type:
        brandContext?.type === "station" || brandContext?.type === "podcast"
          ? brandContext.type
          : undefined,

      stationId: brandContext?.id ? Number(brandContext.id) : undefined,
      podcastId: brandContext?.id ? Number(brandContext.id) : undefined,
      slug: brandContext?.id ? brandContext.id : undefined,
    };
  }, [videoDetails, variant]);

  // Main click handler with optional redirection logic
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();

      // Call optional redirection callback (for overlay-buttons)
      options?.onRedirection?.();
      const payload = constructPayload();

      // Handle "Go to Episode" redirection logic (for overlay-buttons)
      if (isGoToEpisode) {
        if (isPolaris && info.type) {
          const redirectUrl = getBaseUrlWithouthighlights({
            type: info.type,
            slug: videoDetails.attributes?.slug,
          });
          window.location.replace(redirectUrl);
        } else if (
          isPolaris &&
          embedDetails?.embedData.brand_context?.[0]?.type === "podcast"
        ) {
          const redirectUrl = getBaseUrlWithouthighlights({ type: "podcast" });
          window.location.replace(redirectUrl);
        } else {
          SDKEventEmitter.emit(SDKEventName.PLAY_IHEART_CONTENT, {
            ...payload,
            episodeId: undefined,
            play: !isPlaying,
            navigate: true,
            slug: videoDetails.attributes?.slug ?? "",
            videoId: videoDetails.id,
            videoTitle: videoDetails.attributes?.title ?? undefined,
          });
        }
        return; // Don't play - just redirect/scroll
      }
      const clipPlayerPayLoad = constructClipPlayerPayload();
      if (
        clipPlayerPayLoad &&
        (variant === "complete" || variant === "overlay" || variant === "watch")
      ) {
        SDKEventEmitter.emit(SDKEventName.PLAY_IHEART_CONTENT, {
          ...clipPlayerPayLoad,
          type: "station",
          slug: clipPlayerPayLoad.slug ?? undefined,
          play: true,
          navigate: true,
        });
        return;
      }

      // Standard play/pause logic (base behavior from listen-live-button)
      if (payload) {
        // Optimistically update UI immediately for better user experience
        setIsPlaying(!isPlaying);

        if (!isPlaying) {
          updateActiveIHeartContent(payload);
        } else {
          updateActiveIHeartContent(null);
        }
        SDKEventEmitter.emit(SDKEventName.PLAY_IHEART_CONTENT, {
          ...payload,
          videoTitle: videoDetails.attributes?.description ?? undefined,
          slug: videoDetails.attributes?.slug ?? undefined,
          play: !isPlaying,
          videoId: videoDetails.id,
        });
      }
    },
    [
      isPlaying,
      constructPayload,
      constructClipPlayerPayload,
      options?.onRedirection,
      isGoToEpisode,
      info.type,
    ]
  );

  return {
    isPlaying,
    handleClick,
    ctaText,
    isGoToEpisode,
  };
}
