import { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { Button } from "@genuin/ui/button";
import { cn } from "@genuin/ui/lib/utils";
import {
  IHeartPauseIcon,
  IHeartPlayIcon,
  IHeartStopIcon,
} from "@genuin/ui/icons/iheart-icons";
import { useIHeartPlayback } from "./use-iheart-playback";
import { useBaseContext } from "@genuin/components/context";

type OverLayButtonProps = {
  onIheartRedirection?: () => void;
  variant?: "overlay" | "complete" | "watch";
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
  variant = "overlay",
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
  const { theme: currentTheme } = useBaseContext();
  const theme = variant === "complete" ? "light" : isPlaying ? "dark" : "light";

  if (!ctaText) return;

  return (
    <Button
      onClick={handleClick}
      aria-label="Go to all episodes page"
      className={cn(
        "gencl:text-body-1-semi-bold! gencl:flex gencl:items-center gencl:justify-center gencl:rounded-full gencl:px-5 gencl:h-8",
        variant === "watch" &&
          (isPlaying
            ? "gencl:bg-transparent gencl:text-white gencl:border! gencl:border-white!"
            : "gencl:bg-white gencl:text-[#27292D]!"),
        variant === "overlay" &&
          (currentTheme === "dark"
            ? isPlaying
              ? "gencl:bg-transparent gencl:text-black gencl:border! gencl:border-black!"
              : "gencl:bg-white gencl:text-black"
            : isPlaying
              ? "gencl:bg-transparent gencl:text-white gencl:border! gencl:border-white!"
              : "gencl:bg-black gencl:text-white"),
        variant === "complete" && "gencl:bg-white gencl:text-black",
        (variant === "complete" || variant === "overlay") &&
          "gencl:w-fit! gencl:self-center!"
      )}
      title={ctaText}
    >
      {!isGoToEpisode &&
        (isPlaying ? (
          info.type === "station" ? (
            <IHeartStopIcon theme={theme} size="sm" aria-hidden="true" />
          ) : (
            <IHeartPauseIcon theme={theme} size="sm" aria-hidden="true" />
          )
        ) : (
          <IHeartPlayIcon theme={theme} size="sm" aria-hidden="true" />
        ))}
      <span className="gencl:text-body-1-semi-bold!">{ctaText}</span>
    </Button>
  );
}
