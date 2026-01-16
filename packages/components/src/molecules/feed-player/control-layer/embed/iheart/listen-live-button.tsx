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
import { useEffect, useRef, useState } from "react";

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
    undefined
  );

  const isOutlined = isGoToEpisode ? true : !isPlaying;

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
          (child) => child !== buttonElement.parentElement
        ) as HTMLElement[];

        const siblingsWidth = siblings.reduce(
          (total, sibling) => total + sibling.getBoundingClientRect().width,
          0
        );

        // Calculate available space and check if button would fit
        const availableSpace = parentRect.width - siblingsWidth;
        const buttonWidth = buttonElement.offsetWidth;
        const wouldFit = availableSpace >= buttonWidth + 8; // 8px buffer

        // Check if button is being cut off or overflowing
        const isCutOff = buttonRect.right > parentRect.right + 2; // 2px threshold
        const isOverflowing =
          buttonElement.scrollWidth > buttonElement.clientWidth + 2;

        // Show button only if it fits and is not cut off or overflowing
        setIsVisible(wouldFit && !isCutOff && !isOverflowing);
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

  if (!ctaText) return null;

  // Generate accessible label based on button state
  const getAriaLabel = () => {
    if (isGoToEpisode) {
      return ctaText;
    }

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
          "gencl:border gencl:px-4 gencl:py-2 gencl:rounded-full gencl:flex gencl:items-center gencl:justify-center gencl:gap-1 gencl:transition-colors gencl:h-9! gencl:text-body-1-semi-bold!",
          !isOutlined
            ? "gencl:border-transparent gencl:bg-white gencl:text-black!"
            : "gencl:border-white gencl:bg-transparent gencl:text-white",
          !isVisible &&
            "gencl:opacity-0 gencl:invisible gencl:pointer-events-none",
          className
        )}
        title={ctaText}
        onClick={handleClick}
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
            isOutlined ? "gencl:text-white!" : "gencl:text-black!"
          )}
        >
          {ctaText}
        </p>
      </Button>
    </div>
  );
}
