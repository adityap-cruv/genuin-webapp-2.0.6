import { cn } from "@genuin/ui";
import { Button } from "@genuin/ui/button";
import { ChevronLeftIcon } from "@genuin/ui/icons";
import type { ComponentProps } from "react";

type PlayerHeaderProps = ComponentProps<"div"> & {
  title?: string;
  isMobile?: boolean;
  isSectioned?: boolean;
  showTitle: boolean;
  onBackClick?: () => void;
};

export function PlayerHeader({
  title = "The Daily",
  onBackClick,
  isMobile,
  className,
  showTitle,
  ...restProps
}: PlayerHeaderProps) {
  return (
    <div
      className="gencl:absolute gencl:top-0 gencl:left-0 gencl:right-0 gencl:z-20 gencl:flex gencl:items-center gencl:p-4 gencl:bg-gradient-to-b gencl:from-black/50 gencl:justify-center gencl:to-transparent"
      {...restProps}>
      {isMobile && (
        <Button
          id="player-header-back-button"
          variant="icon"
          theme="overlay"
          onClick={(e) => {
            e.stopPropagation();
            onBackClick?.();
          }}
          className={cn(
            "gencl:absolute gencl:left-0 gencl:w-11 gencl:h-11",
            !showTitle && "gencl:size-11! gencl:top-2.5"
          )}
          aria-label="Back"
          role="button"
          tabIndex={0}>
          <ChevronLeftIcon theme="dark" size="lg" aria-hidden="true" />
        </Button>
      )}
      {showTitle && (
        <p
          className="gencl:line-clamp-1 gencl:text-center gencl:font-semibold gencl:text-[18px] gencl:text-white gencl:leading-[24px] gencl:tracking-[-2%] gencl:lg:text-[24px]! gencl:lg:leading-[30px]! gencl:lg:tracking-[-0.5px]! gencl:lg:font-bold! gencl:rounded gencl:px-1"
          // role="heading"
          // aria-level={1}
          aria-label={title}
          tabIndex={0}>
          {title}
        </p>
      )}
    </div>
  );
}
