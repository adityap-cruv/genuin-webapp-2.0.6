import { cn } from "@genuin/ui/lib/utils";
import {
  IHeartPauseIcon,
  IHeartPlayIcon,
  IHeartStopIcon,
} from "@genuin/ui/icons/iheart-icons";
import { Button } from "@genuin/ui";
import { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { useSafeEmbedContext } from "@genuin/components/context/embed/context";
import { type ContentType } from "@genuin/components/lib/utils/iheart-text-utils";

import { useCallback, useEffect, useState, useMemo } from "react";
import {
  PlayChangeIHeartContentPayload,
  SDKEventEmitter,
  SDKEventName,
  SDKListenerEventName,
} from "@genuin/components/lib/sdk-event-emitter";

interface IHeartListenLiveButtonProps {
  className?: string;
  variant?: "outlined" | "filled";
  videoDetails: PostDetailsType["video"];
  info: {
    podcast?: number;
    station?: number;
    episode?: number;
    type?: "station" | "podcast";
  };
}

export function IHeartListenLiveButton({
  className,
  videoDetails,
  info,
}: IHeartListenLiveButtonProps) {
  const embedDetails = useSafeEmbedContext();
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
  const isOutlined = !isPlaying;

  const contentType: ContentType = useMemo(() => {
    return embedDetails?.embedData.brand_context?.some(
      (val) => val.type === "podcast"
    )
      ? "podcast"
      : "station";
  }, [embedDetails?.embedData.brand_context]);

  const type = (videoDetails?.attributes?.type as ContentType) ?? contentType;

  // Use utility functions for text and aria labels
  const ctaText = videoDetails?.linkouts?.[0]?.cta_text;

  useEffect(() => {
    function handlePlayChange({ payload }: PlayChangeIHeartContentPayload) {
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

  const togglePlayInIheartContent = useCallback(
    (e: any) => {
      e.stopPropagation();

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

      payload &&
        SDKEventEmitter.emit(SDKEventName.PLAY_IHEART_CONTENT, {
          ...payload,
          play: !isPlaying,
        });
    },
    [info, isPlaying]
  );

  if (!ctaText) return null;

  return (
    <Button
      theme="custom"
      aria-label={type === "podcast" ? "Play full episode" : "Play live radio"}
      tabIndex={0}
      role="button"
      className={cn(
        "gencl:h-11 gencl:border gencl:px-4 gencl:py-2 gencl:rounded-full gencl:flex gencl:items-center gencl:justify-center gencl:gap-1 gencl:transition-colors",
        !isOutlined
          ? "gencl:border-transparent gencl:bg-white"
          : "gencl:border-white gencl:bg-transparent",
        className
      )}
      title={ctaText}
      onClick={togglePlayInIheartContent}
    >
      {isPlaying ? (
        info.type === "station" ? (
          <IHeartStopIcon theme={isOutlined ? "dark" : "light"} size="md" />
        ) : (
          <IHeartPauseIcon theme={isOutlined ? "dark" : "light"} size="md" />
        )
      ) : (
        <IHeartPlayIcon theme={isOutlined ? "dark" : "light"} size="md" />
      )}
      <p
        className={cn(
          "gencl:text-body-1-semi-bold!",
          isOutlined ? "gencl:text-white!" : "gencl:text-black!"
        )}
      >
        {ctaText}
      </p>
    </Button>
  );
}
