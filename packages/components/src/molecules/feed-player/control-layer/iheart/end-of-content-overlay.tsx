import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { Button } from "@genuin/ui";
import { IHeartPlayAgainIcon } from "@genuin/ui/icons";
import { cn } from "@genuin/ui/lib/utils";
import { type ComponentProps } from "react";

interface IHeartEndOfContentOverlayProps extends ComponentProps<"div"> {
  isMobile: boolean;
  onGoToEpisodes?: () => void;
  onPlayAgain?: () => void;
}

export function IHeartEndOfContentOverlay({
  className,
  onGoToEpisodes,
  onPlayAgain,
  isMobile,
  ...props
}: IHeartEndOfContentOverlayProps) {
  const {
    view: { websiteType },
  } = useEmbedConfigs();
  return (
    <div
      {...props}
      role="dialog"
      aria-modal="true"
      aria-label="Video ended"
      className={cn(
        "gencl:absolute gencl:inset-0 gencl:pointer-events-none gencl:z-50 gencl:h-full gencl:w-full gencl:bg-black/65 gencl:flex gencl:flex-col gencl:items-center gencl:justify-center gencl:gap-4",
        className
      )}
    >
      <div className="gencl:flex gencl:flex-col gencl:gap-4 gencl:pointer-events-auto">
        {/* TODO: Move static color declaration to CSS utility class: gencl:text-[#27292D]! */}
        {/* TODO : iheart phase-2 implementation  */}
        {/* <Button
          onClick={onGoToEpisodes}
          aria-label="Go to all episodes"
          className="gencl:h-11 gencl:text-body-1-semi-bold! gencl:flex gencl:items-center gencl:justify-center gencl:rounded-full gencl:bg-white gencl:px-5 gencl:text-[#27292D]!"
        >
          Go to episodes
        </Button> */}
        <Button
          onClick={onPlayAgain}
          aria-label="Play this episode again"
          className={cn(
            "gencl:text-body-1-semi-bold! gencl:bg-white gencl:flex gencl:items-center gencl:justify-center gencl:rounded-full gencl:px-5 gencl:text-[#27292D]!",
            websiteType === "polaris" ? "gencl:h-8 gencl:md:h-12" : "gencl:h-8"
          )}
        >
          <IHeartPlayAgainIcon
            strokeWidth="0px"
            theme="light"
            size={isMobile || websiteType === "legacy" ? "sm" : "lg"}
            aria-hidden="true"
          />{" "}
          Play again
        </Button>
      </div>
    </div>
  );
}
