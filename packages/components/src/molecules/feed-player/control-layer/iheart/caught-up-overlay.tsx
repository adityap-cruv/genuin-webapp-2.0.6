import { Button, IHeartTickIcon } from "@genuin/ui";
import { cn } from "@genuin/ui/lib/utils";
import { type ComponentProps } from "react";

interface IHeartCaughtUpOverlayProps extends ComponentProps<"div"> {
  variant: "overlay" | "complete";
  title?: string;
  subtitle?: string;
  onGoToEpisodes?: () => void;
}

export function IHeartCaughtUpOverlay({
  className,
  title = "You're all caught up!",
  subtitle = "New highlights will appear soon.",
  variant = "overlay",
  onGoToEpisodes,
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
        "gencl:pointer-events-none gencl:z-50 gencl:h-full gencl:w-full gencl:bg-black gencl:backdrop-blur-sm gencl:flex gencl:flex-col gencl:items-center gencl:justify-center gencl:gap-4",
        className
      )}
    >
      <div className="gencl:flex gencl:flex-col gencl:gap-4 gencl:pointer-events-auto">
        <div className="gencl:flex gencl:flex-col gencl:gap-2 gencl:text-center gencl:text-white">
          {variant === "complete" && (
            <IHeartTickIcon className="gencl:self-center" />
          )}
          <p
            id="caught-up-title"
            tabIndex={0}
            className="gencl:text-body-1-semi-bold gencl:text-[18px] gencl:leading-[24px] gencl:tracking-[-0.5px]"
          >
            {title}
          </p>
          <p
            id="caught-up-subtitle"
            tabIndex={0}
            className="gencl:text-body-2-normal gencl:text-[14px] gencl:leading-4"
          >
            {subtitle}
          </p>
        </div>
        {variant === "overlay" && (
          <Button
            onClick={onGoToEpisodes}
            aria-label="Go to all episodes page"
            tabIndex={0}
            className="gencl:h-11 gencl:text-body-1-semi-bold! gencl:flex gencl:items-center gencl:justify-center gencl:rounded-full gencl:bg-white gencl:px-5 gencl:text-[#27292D]!"
          >
            Go to episodes
          </Button>
        )}
      </div>
    </div>
  );
}
