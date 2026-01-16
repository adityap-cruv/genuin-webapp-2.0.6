import { IHeartTickIcon } from "@genuin/ui/icons";
import { cn } from "@genuin/ui/lib/utils";
import { type ComponentProps } from "react";
import { OverLayButton } from "./overlay-buttons";
import { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { useBaseContext } from "@genuin/components/context";

interface IHeartCaughtUpOverlayProps extends ComponentProps<"div"> {
  variant: "overlay" | "complete";
  title?: string;
  subtitle?: string;
  videoDetails?: PostDetailsType["video"];
  info?: {
    podcast?: number;
    station?: number;
    episode?: number;
    type?: "station" | "podcast";
  };
  onIheartRedirection?: () => void;
  websiteType?: "polaris" | "legacy";
}

export function IHeartCaughtUpOverlay({
  className,
  title = "You're all caught up!",
  subtitle = "New highlights will appear soon.",
  variant = "overlay",
  videoDetails,
  info,
  websiteType,
  onIheartRedirection,
  ...props
}: IHeartCaughtUpOverlayProps) {
  const { theme } = useBaseContext();
  return (
    <div
      {...props}
      role="status"
      aria-live="polite"
      aria-labelledby="caught-up-title"
      aria-describedby="caught-up-subtitle"
      className={cn(
        "gencl:pointer-events-none gencl:z-50 gencl:h-full gencl:w-full gencl:bg-black gencl:backdrop-blur-sm gencl:flex gencl:flex-col gencl:items-center gencl:justify-center gencl:gap-4",
        theme === "dark" || variant === "complete"
          ? "gencl:bg-black gencl:text-white"
          : "gencl:bg-transparent gencl:text-black",
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
            className={cn(
              "gencl:text-body-1-semi-bold gencl:text-[18px] gencl:leading-[24px] gencl:tracking-[-0.5px]",
              theme === "dark" || variant === "complete"
                ? "gencl:text-white"
                : "gencl:text-black"
            )}
          >
            {title}
          </p>
          <p
            id="caught-up-subtitle"
            tabIndex={0}
            className={cn(
              "gencl:text-body-2-normal gencl:text-[14px] gencl:leading-4",
              theme === "dark" || variant === "complete"
                ? "gencl:text-white"
                : "gencl:text-black"
            )}
          >
            {subtitle}
          </p>
        </div>
        {websiteType !== "legacy" && (
          <OverLayButton
            videoDetails={videoDetails ?? ({} as PostDetailsType["video"])}
            info={info ?? {}}
            onIheartRedirection={onIheartRedirection}
            variant={variant}
            websiteType={websiteType}
          />
        )}
      </div>
    </div>
  );
}
