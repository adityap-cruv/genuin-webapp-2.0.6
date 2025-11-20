import { cn } from "@genuin/ui/lib/utils";
import {
  IHeartPauseIcon,
  IHeartPlayIcon,
  IHeartStopIcon,
} from "@genuin/ui/icons/iheart-icons";
import { Button } from "@genuin/ui";
import { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { useIHeartPlayback } from "./use-iheart-playback";

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

  const isOutlined = !isPlaying;

  if (!ctaText) return null;

  return (
    <Button
      theme="custom"
      aria-label={ctaText}
      tabIndex={0}
      role="button"
      className={cn(
        "gencl:border gencl:px-4 gencl:py-2 gencl:rounded-full gencl:flex gencl:items-center gencl:justify-center gencl:gap-1 gencl:transition-colors gencl:h-9! gencl:text-body-1-semi-bold!",
        !isOutlined
          ? "gencl:border-transparent gencl:bg-white gencl:text-black!"
          : "gencl:border-white gencl:bg-transparent gencl:text-white",
        className
      )}
      title={ctaText}
      onClick={handleClick}
    >
      {!isGoToEpisode &&
        (isPlaying ? (
          info.type === "station" ? (
            <IHeartStopIcon theme={isOutlined ? "dark" : "light"} size="md" />
          ) : (
            <IHeartPauseIcon theme={isOutlined ? "dark" : "light"} size="md" />
          )
        ) : (
          <IHeartPlayIcon theme={isOutlined ? "dark" : "light"} size="md" />
        ))}
      <p
        className={cn(
          "gencl:text-body-1-semi-bold!"
        )}
      >
        {ctaText}
      </p>
    </Button>
  );
}
