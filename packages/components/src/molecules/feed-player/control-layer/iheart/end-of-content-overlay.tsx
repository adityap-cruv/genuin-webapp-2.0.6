import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { Button } from "@genuin/ui";
import { IHeartPlayAgainIcon, IHeartPlayIcon } from "@genuin/ui/icons";
import { cn } from "@genuin/ui/lib/utils";
import { type ComponentProps } from "react";
import { OverLayButton } from "./overlay-buttons";

interface IHeartEndOfContentOverlayProps extends ComponentProps<"div"> {
  isMobile: boolean;
  onIheartRedirection?: () => void;
  onPlayAgain?: () => void;
}

export function IHeartEndOfContentOverlay({
  className,
  isMobile,
  onIheartRedirection,
  onPlayAgain,
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
      tabIndex={0}
      className={cn(
        "gencl:absolute gencl:inset-0 gencl:pointer-events-none gencl:z-50 gencl:h-full gencl:w-full gencl:bg-black/65 gencl:flex gencl:flex-col gencl:items-center gencl:justify-center gencl:gap-4",
        className
      )}
    >
      <div className="gencl:flex gencl:flex-col gencl:gap-4 gencl:pointer-events-auto">
        {/* TODO: Move static color declaration to CSS utility class: gencl:text-[#27292D]! */}
        <OverLayButton onIheartRedirection={onIheartRedirection} />
        <Button
          onClick={onPlayAgain}
          aria-label="Play this episode again"
          tabIndex={0}
          className={cn(
            "gencl:text-body-1-semi-bold! gencl:bg-transparent gencl:flex gencl:items-center gencl:justify-center gencl:rounded-full gencl:text-white gencl:h-fit"
          )}
          theme="custom"
        >
          <IHeartPlayAgainIcon
            strokeWidth="0px"
            theme="dark"
            size={isMobile || websiteType === "legacy" ? "sm" : "lg"}
            aria-hidden="true"
          />{" "}
          Play again
        </Button>
      </div>
    </div>
  );
}
