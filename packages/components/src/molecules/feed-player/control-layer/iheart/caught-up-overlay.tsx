import { Button } from "@genuin/ui";
import { cn } from "@genuin/ui/lib/utils";
import { type ComponentProps } from "react";

interface IHeartCaughtUpOverlayProps extends ComponentProps<"div"> {
  onGoToEpisodes?: () => void;
  title?: string;
  subtitle?: string;
}

export function IHeartCaughtUpOverlay({
  className,
  onGoToEpisodes,
  title = "You're all caught up!",
  subtitle = "New clips will appear soon.",
  ...props
}: IHeartCaughtUpOverlayProps) {
  return (
    <div
      {...props}
      role="status"
      aria-live="polite"
      aria-labelledby="caught-up-title"
      aria-describedby="caught-up-subtitle"
      className={cn(
        "gencl:pointer-events-none gencl:z-50 gencl:h-full gencl:w-full gencl:bg-black/65 gencl:backdrop-blur-sm gencl:flex gencl:flex-col gencl:items-center gencl:justify-center gencl:gap-4",
        className
      )}
    >
      <div className="gencl:flex gencl:flex-col gencl:gap-4 gencl:pointer-events-auto">
        <div className="gencl:flex gencl:flex-col gencl:gap-2 gencl:text-center gencl:text-white">
          <p id="caught-up-title" className="gencl:text-body-1-semi-bold">{title}</p>
          <p id="caught-up-subtitle" className="gencl:text-body-2-normal">{subtitle}</p>
        </div>
        <Button
          onClick={onGoToEpisodes}
          aria-label="Go to all episodes page"
          className="gencl:h-11 gencl:text-body-1-semi-bold! gencl:flex gencl:items-center gencl:justify-center gencl:rounded-full gencl:bg-white gencl:px-5 gencl:text-[#27292D]!"
        >
          Go to episodes
        </Button>
      </div>
    </div>
  );
}
