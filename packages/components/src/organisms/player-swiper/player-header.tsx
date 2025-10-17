import { Button } from "@genuin/ui/button";
import { ChevronLeftIcon } from "lucide-react";
import { ComponentProps } from "react";

type PlayerHeaderProps = ComponentProps<"div"> & {
  title?: string;
  onBackClick?: () => void;
};

export function PlayerHeader({
  title = "The Daily",
  onBackClick,
  className,
  ...restProps
}: PlayerHeaderProps) {
  return (
    <div
      className="gencl:absolute gencl:top-0 gencl:left-0 gencl:right-0 gencl:z-20 gencl:flex gencl:items-center gencl:p-4"
      role="banner"
      {...restProps}
    >
      <Button
        id="player-header-back-button"
        variant="icon"
        theme="overlay"
        onClick={(e) => {
          e.stopPropagation();
          onBackClick?.();
        }}
        className="gencl:absolute gencl:left-0 gencl:w-11 gencl:h-11"
        aria-label="Go back"
      >
        <ChevronLeftIcon className="gencl:size-6 gencl:text-white" aria-hidden="true" />
      </Button>
      <p
        className="gencl:flex-1 gencl:line-clamp-1 gencl:text-center gencl:font-semibold gencl:text-[18px] gencl:text-white gencl:leading-[24px] gencl:tracking-[-2%]!"
        role="heading"
        aria-level={1}
      >
        {title}
      </p>
    </div>
  );
}
