import { cn } from "@genuin/ui/lib/utils";
import {
  IHeartPauseIcon,
  IHeartPlayIcon,
  IHeartStopIcon,
} from "@genuin/ui/icons/iheart-icons";
import { type ComponentProps, useMemo } from "react";
import { Button } from "@genuin/ui";
import { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { useSafeEmbedContext } from "@genuin/components/context/embed/context";
import { type ContentType } from "@genuin/components/lib/utils/iheart-text-utils";

interface IHeartListenLiveButtonProps extends ComponentProps<"button"> {
  isIheartPlaying?: boolean;
  videoDetails?: PostDetailsType["video"];
  onClick?: () => void;
}

export function IHeartListenLiveButton({
  className,
  isIheartPlaying = false,
  videoDetails,
  onClick,
  ...props
}: IHeartListenLiveButtonProps) {
  const embedDetails = useSafeEmbedContext();

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

  const iconTheme = isIheartPlaying ? "light" : "dark";

  const renderIcon = useMemo(() => {
    if (!isIheartPlaying) {
      return <IHeartPlayIcon theme={iconTheme} size="md" />;
    }

    if (type === "podcast") {
      return <IHeartPauseIcon theme={iconTheme} size="md" />;
    }

    return <IHeartStopIcon theme={iconTheme} size="md" />;
  }, [isIheartPlaying, type, iconTheme]);

  if (!videoDetails?.linkoutId) return null;

  return (
    <Button
      {...props}
      theme="custom"
      aria-label={type === "podcast" ? "Play full episode" : "Play live radio"}
      tabIndex={0}
      role="button"
      className={cn(
        "gencl:h-11 gencl:border gencl:px-4 gencl:py-2 gencl:rounded-full gencl:flex gencl:items-center gencl:justify-center gencl:gap-1 gencl:transition-colors",
        isIheartPlaying
          ? "gencl:border-transparent gencl:bg-white"
          : "gencl:border-white gencl:bg-transparent",
        className
      )}
      title={ctaText}
      onClick={onClick}
    >
      {renderIcon}
      <p
        className={cn(
          "gencl:text-body-1-semi-bold!",
          isIheartPlaying ? "gencl:text-black" : "gencl:text-white"
        )}
      >
        {ctaText}
      </p>
    </Button>
  );
}
