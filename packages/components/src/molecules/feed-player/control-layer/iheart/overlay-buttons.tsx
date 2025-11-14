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

type OverLayButtonProps = {
  onIheartRedirection?: () => void;
  videoDetails: PostDetailsType["video"];
  info: {
    podcast?: number;
    station?: number;
    episode?: number;
    type?: "station" | "podcast";
  };
};

export function OverLayButton({
  videoDetails,
  info,
  onIheartRedirection,
}: OverLayButtonProps) {
  const { isPlaying, handleClick, ctaText, isGoToEpisode } = useIHeartPlayback({
    info,
    videoDetails,
    options: {
      onRedirection: onIheartRedirection,
    },
  });

  if (!ctaText) return;

  return (
    <Button
      onClick={handleClick}
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
