import { useSafeEmbedContext } from "@genuin/components/context/embed/context";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import {
  PlayChangeIHeartContentPayload,
  SDKEventEmitter,
  SDKEventName,
  SDKListenerEventName,
} from "@genuin/components/lib/sdk-event-emitter";
import { getBaseUrlWithouthighlights } from "@genuin/components/lib/utils";
import { ContentType } from "@genuin/components/lib/utils/iheart-text-utils";
import { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import {
  Button,
  cn,
  IHeartPauseIcon,
  IHeartPlayIcon,
  IHeartStopIcon,
} from "@genuin/ui";
import { useCallback, useEffect, useMemo, useState } from "react";

export function OverLayButton({
  videoDetails,
  info,
  onIheartRedirection,
}: {
  videoDetails: PostDetailsType["video"];
  info: {
    podcast?: number;
    station?: number;
    episode?: number;
    type?: "station" | "podcast";
  };
  onIheartRedirection?: () => void;
}) {
  const embedDetails = useSafeEmbedContext();
  const {
    view: { websiteType },
  } = useEmbedConfigs();
  const brandContext = embedDetails?.embedData?.brand_context?.[0];
  const [isPlaying, setIsPlaying] = useState(() => {
    const isPlaying = brandContext?.isPlaying;
    const activePlayingId = brandContext?.activePlayingId
      ? Number(brandContext.activePlayingId)
      : undefined;
    const brandContextId = brandContext?.id
      ? Number(brandContext.id)
      : undefined;

    if (
      brandContext?.activePlayingType === "station" &&
      activePlayingId !== undefined
    ) {
      if (
        info.type === "podcast" &&
        activePlayingId === info.episode &&
        brandContextId !== undefined &&
        brandContextId === info.podcast
      ) {
        return isPlaying;
      }

      if (info.type === "station" && activePlayingId === info.station) {
        return isPlaying;
      }
    }
    return false;
  });

  const contentType = useMemo(() => {
    return embedDetails?.embedData.brand_context?.[0]?.type;
  }, [embedDetails]);

  const type = useMemo(() => {
    return videoDetails.type as ContentType;
  }, [videoDetails]);

  // Use utility functions for text and aria labels
  const ctaText = useMemo(() => {
    return videoDetails?.linkouts?.[0]?.cta_text;
  }, [videoDetails]);

  const isGoToEpisode = ctaText === "Go to Episodes";

  useEffect(() => {
    function handlePlayChange(payload: PlayChangeIHeartContentPayload) {
      if (payload.type === "podcast" && info.type === "podcast") {
        // Check if podcast and episode IDs match
        if (
          payload.podcastId === info.podcast &&
          payload.episodeId === info.episode
        ) {
          setIsPlaying(payload.playStatus);
        }
      }

      if (payload.type === "station" && info.type === "station") {
        // Check if station ID matches
        if (payload.stationId === info.station) {
          setIsPlaying(payload.playStatus);
        }
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
  }, [info.type, info.podcast, info.episode, info.station]);

  /**
   * Handles "Go to Episodes" or "Full Episode / Listen Live" actions.
   * Manages redirection, scrolling, or playback behavior based on the content type and website type.
   *
   * Logic:
   * - For podcasts:
   *   - "Go to Episode" button:
   *       - Polaris sites → redirect to the base URL without highlights.
   *       - Legacy sites → smoothly scroll to the top of the page.
   *   - "Full Episode":
   *       - Both Polaris and Legacy → play the mini player.
   * - For stations:
   *   - Both Polaris and Legacy → play the mini player.
   */
  const handleIheartRedirection = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onIheartRedirection?.();

      const isPodcast = contentType === "podcast";
      const isPolaris = websiteType === "polaris";

      if (isPodcast && isGoToEpisode) {
        if (isPolaris) {
          const redirectUrl = getBaseUrlWithouthighlights(window.location.href);
          window.location.replace(redirectUrl);
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
        return;
      }

      // play mini player
      const payload =
        info.type === "station" && info.station
          ? { type: "station" as const, stationId: info.station }
          : info.type === "podcast" && info.podcast && info.episode
            ? {
                type: "podcast" as const,
                podcastId: info.podcast,
                episodeId: info.episode,
              }
            : null;

      if (payload) {
        SDKEventEmitter.emit(SDKEventName.PLAY_IHEART_CONTENT, {
          ...payload,
          play: !isPlaying,
        });
      }
    },
    [
      contentType,
      ctaText,
      websiteType,
      onIheartRedirection,
      info,
      isPlaying,
      isGoToEpisode,
    ]
  );

  if (!ctaText) return;

  //TODO: Remove this component. Use the "Listen Live" button for non–full episode cases, and for full episodes, redirect to the "Episodes" tab.

  return (
    <Button
      onClick={handleIheartRedirection}
      aria-label="Go to all episodes page"
      className={cn(
        "gencl:h-11 gencl:text-body-1-semi-bold! gencl:flex gencl:items-center gencl:justify-center gencl:rounded-full gencl:px-5",
        isPlaying
          ? "gencl:bg-transparent gencl:border-white"
          : "gencl:bg-white gencl:text-[#27292D]!"
      )}
      title={ctaText}
    >
      {!isGoToEpisode &&
        (isPlaying ? (
          info.type === "station" ? (
            <IHeartStopIcon
              theme={isPlaying ? "light" : "dark"}
              size="sm"
              aria-hidden="true"
            />
          ) : (
            <IHeartPauseIcon
              theme={isPlaying ? "light" : "dark"}
              size="sm"
              aria-hidden="true"
            />
          )
        ) : (
          <IHeartPlayIcon
            theme={isPlaying ? "light" : "dark"}
            size="sm"
            aria-hidden="true"
          />
        ))}
      {ctaText}
    </Button>
  );
}
