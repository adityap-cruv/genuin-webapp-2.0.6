import { ForwardIcon } from "@genuin/ui/icons";
// import { CloseIcon } from '@icons/close-icon'
import { XIcon } from "@genuin/ui/icons";
import { cn } from "@genuin/ui/lib/utils";
import { type ComponentProps } from "react";
import { useFeedContext } from "@genuin/components/templates/feed/context";

type PlaybackSpeedCapsuleProps = ComponentProps<"div">;

export const PlaybackSpeedCapsule = ({
  className,
  ...props
}: PlaybackSpeedCapsuleProps) => {
  const { playbackSpeed, setPlaybackSpeed } = useFeedContext();

  if (playbackSpeed.speed === 1) return null;

  return (
    <div
      className={cn(
        "gencl:flex gencl:items-center gencl:justify-center gencl:gap-2",
        {
          "gencl:rounded-xl gencl:bg-black/40 gencl:px-2 gencl:py-1":
            !playbackSpeed.isSpeedFromGesture,
        },
        className
      )}
      onClick={(e) => {
        e.stopPropagation();
      }}
      {...props}
    >
      <ForwardIcon />
      <span className="gencl:text-body-2-medium gencl:text-white">
        {playbackSpeed.speed}x speed
      </span>
      {!playbackSpeed.isSpeedFromGesture && (
        <XIcon
          size="sm"
          theme="dark"
          onClick={(e) => {
            e.stopPropagation();
            setPlaybackSpeed({ speed: 1, isSpeedFromGesture: false });
          }}
        />
      )}
    </div>
  );
};
