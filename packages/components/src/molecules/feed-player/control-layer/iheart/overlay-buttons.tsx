import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import {
  Button,
  cn,
  IHeartPauseIcon,
  IHeartPlayIcon,
  IHeartStopIcon,
} from "@genuin/ui";
import { useIHeartPlayback } from "./use-iheart-playback";
import { useMemo } from "react";

type OverLayButtonProps = {
  onIheartRedirection?: () => void;
  variant?: "caught" | "watch";
  videoDetails: PostDetailsType["video"];
  info: {
    podcast?: number;
    station?: number;
    episode?: number;
    type?: "station" | "podcast";
  };
  websiteType?: "polaris" | "legacy";
};

export function OverLayButton({
  videoDetails,
  info,
  variant = "caught",
  websiteType,
  onIheartRedirection,
}: OverLayButtonProps) {
  const { isPlaying, handleClick, ctaText, isGoToEpisode } = useIHeartPlayback({
    info,
    videoDetails,
    options: {
      onRedirection: onIheartRedirection,
    },
    variant,
  });

  if (!ctaText) return;

  const isClickDisabled = useMemo(() => {
    return websiteType === "polaris" && variant === "caught" && isGoToEpisode;
  }, [websiteType, variant, isGoToEpisode]);

  return (
    <Button
      onClick={isClickDisabled ? undefined : (event) => handleClick(event)}
      aria-label="Go to all episodes page"
      className={cn(
        "gencl:h-11 gencl:text-body-1-semi-bold! gencl:flex gencl:items-center gencl:justify-center gencl:rounded-full gencl:px-5",
        isPlaying
          ? "gencl:bg-transparent gencl:border-white"
          : "gencl:bg-white gencl:text-[#27292D]!",
        variant === "caught" && "gencl:w-fit! gencl:self-center!"
      )}
      title={ctaText}
    >
      {!isGoToEpisode &&
        (isPlaying ? (
          info.type === "station" ? (
            <IHeartStopIcon
              theme={isPlaying ? "dark" : "light"}
              size="sm"
              aria-hidden="true"
            />
          ) : (
            <IHeartPauseIcon
              theme={isPlaying ? "dark" : "light"}
              size="sm"
              aria-hidden="true"
            />
          )
        ) : (
          <IHeartPlayIcon
            theme={isPlaying ? "dark" : "light"}
            size="sm"
            aria-hidden="true"
          />
        ))}
      {ctaText}
    </Button>
  );
}
