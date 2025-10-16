import { Button } from "@genuin/ui";
import { IHeartPlayAgainIcon } from "@genuin/ui/icons";
import { cn } from "@genuin/ui/lib/utils";
import { type ComponentProps } from "react";

interface IHeartEndOfContentOverlayProps extends ComponentProps<"div"> {
  onGoToEpisodes?: () => void;
  onPlayAgain?: () => void;
}

export function IHeartEndOfContentOverlay({
  className,
  onGoToEpisodes,
  onPlayAgain,
  ...props
}: IHeartEndOfContentOverlayProps) {
  return (
    <div
      {...props}
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
          className="gencl:h-11 gencl:text-body-1-semi-bold! gencl:flex gencl:items-center gencl:justify-center gencl:rounded-full gencl:bg-white gencl:px-5 gencl:text-[#27292D]!"
        >
          Go to episodes
        </Button> */}
        <Button
          onClick={onPlayAgain}
          className="gencl:h-11 gencl:text-body-1-semi-bold! gencl:flex gencl:items-center gencl:justify-center gencl:rounded-full gencl:bg-transparent gencl:px-5 gencl:text-white"
        >
          <IHeartPlayAgainIcon theme="dark" size="md" /> Play again
        </Button>
      </div>
    </div>
  );
}
