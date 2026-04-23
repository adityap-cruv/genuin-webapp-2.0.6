"use client";
import { cn } from "@genuin/ui/lib/utils";
import {
  IHeartPauseIcon,
  IHeartPlayIcon,
  IHeartStopIcon,
} from "@genuin/ui/icons/iheart-icons";
import { Button } from "@genuin/ui/button";
import { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { useIHeartPlayback } from "./use-iheart-playback";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  SDKEventEmitter,
  SDKEventName,
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
  const { isPlaying, handleClick, ctaText, isGoToEpisode } = useIHeartPlayback({
    info,
    videoDetails,
  });

  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const checkTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  // TODO: This view is used in iheart publisher page so in that the clicking behavior should be to open the clip player page instead of controlling playback, we should separate it via some flag to ensure proper rendering for both use cases
  const isOutlined = true;

  // Check if button should be visible based on available space
  useEffect(() => {
    const buttonElement = buttonRef.current;
    if (!buttonElement) return;

    const checkVisibility = () => {
      // Clear any pending checks
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }

      // Debounce the check to avoid rapid toggling
      checkTimeoutRef.current = setTimeout(() => {
        // Get parent container (grandparent of button)
        const parent = buttonElement.parentElement?.parentElement;
        if (!parent) return;

        const buttonRect = buttonElement.getBoundingClientRect();
        const parentRect = parent.getBoundingClientRect();

        // Calculate siblings width (all controls except this button's container)
        const siblings = Array.from(parent.children).filter(
          (child) => child !== buttonElement.parentElement,
        ) as HTMLElement[];

        const siblingsWidth = siblings.reduce(
          (total, sibling) => total + sibling.getBoundingClientRect().width,
          0,
        );

        // Calculate available space and check if button would fit
        const availableSpace = parentRect.width - siblingsWidth;
        const buttonWidth = buttonElement.offsetWidth;
        const wouldFit = availableSpace >= buttonWidth + 8;
        const isCutOff = buttonRect.right > parentRect.right + 2;
        const isOverflowing =
          buttonElement.scrollWidth > buttonElement.clientWidth + 2;

        // Show button only if it fits and is not cut off or overflowing
        // setIsVisible(wouldFit && !isCutOff && !isOverflowing);
      }, 30); // Reduced debounce for faster response
    };

    // Initial check
    checkVisibility();

    // Monitor size changes on button and parent
    const resizeObserver = new ResizeObserver(checkVisibility);
    const parent = buttonElement.parentElement?.parentElement;

    resizeObserver.observe(buttonElement);
    if (parent) {
      resizeObserver.observe(parent);
    }

    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
      resizeObserver.disconnect();
    };
  }, [ctaText, isPlaying]);

  const openClipPlayerLink = useCallback(() => {
    const episodeId = videoDetails?.attributes?.episode_id
      ? Number(videoDetails.attributes.episode_id)
      : undefined;
    const podcastId = videoDetails?.attributes?.podcast_id
      ? Number(videoDetails.attributes.podcast_id)
      : undefined;
    const stationId = videoDetails?.attributes?.station_id
      ? Number(videoDetails.attributes.station_id)
      : undefined;
    const slug = videoDetails?.attributes?.slug;
    const type = videoDetails?.attributes?.type;

    if (slug) {
      SDKEventEmitter.emit(SDKEventName.PLAY_IHEART_CONTENT, {
        navigate: true,
        play: true,
        episodeId,
        podcastId,
        slug,
        stationId,
        type,
        videoId: videoDetails?.id,
        videoTitle: videoDetails?.attributes?.description ?? undefined,
      });
    }

    const isStation = !podcastId && !episodeId;
    const isFullEpisode = podcastId && episodeId;
    const url = new URL(
      "https://iheart.com/" +
        (isStation ? "live/" : "podcast/") +
        (isStation ? stationId : slug) +
        (isFullEpisode ? "/episode/" + episodeId : ""),
    );

    window.open(url, "_blank", "noopener,noreferrer");
  }, [videoDetails]);

  const handleButtonClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      // handleClick(e);
      openClipPlayerLink();
    },
    [handleClick, openClipPlayerLink],
  );

  if (!ctaText) return null;

  // Generate accessible label based on button state
  const getAriaLabel = () => {
    if (isGoToEpisode) return ctaText;
    const state = isPlaying ? "Pressed" : "Not pressed";
    return `${ctaText}, ${state}`;
  };

  return (
    <div className="gencl:flex-shrink-0">
      <Button
        ref={buttonRef}
        theme="custom"
        aria-label={getAriaLabel()}
        aria-pressed={!isGoToEpisode ? isPlaying : undefined}
        tabIndex={isVisible ? 0 : -1}
        role="button"
        className={cn(
          "gencl:border gencl:px-3 gencl:py-2 gencl:rounded-full gencl:flex gencl:items-center gencl:justify-center gencl:gap-1 gencl:transition-colors gencl:h-9! gencl:text-body-1-semi-bold!",
          "gencl:border-white gencl:bg-transparent gencl:text-white",
          !isVisible &&
            "gencl:opacity-0 gencl:invisible gencl:pointer-events-none",
          className,
        )}
        title={ctaText}
        onClick={handleButtonClick}
        aria-hidden={!isVisible}
      >
        {!isGoToEpisode &&
          (isPlaying ? (
            info.type === "station" ? (
              <IHeartStopIcon theme={isOutlined ? "dark" : "light"} size="md" />
            ) : (
              <IHeartPauseIcon
                theme={isOutlined ? "dark" : "light"}
                size="md"
              />
            )
          ) : (
            <IHeartPlayIcon theme={isOutlined ? "dark" : "light"} size="md" />
          ))}
        <p
          className={cn(
            "gencl:text-body-1-semi-bold! gencl:whitespace-nowrap",
            "gencl:text-white!",
          )}
        >
          {ctaText}
        </p>
      </Button>
    </div>
  );
}
