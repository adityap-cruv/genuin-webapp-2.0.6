import { ChevronRightIcon, LinkIcon } from "@genuin/ui";
import { Button } from "@genuin/ui/components/button";
import { Loader } from "@genuin/ui/components/loader";
import { cn } from "@genuin/ui/lib/utils";

import { Link } from "../link/link";

interface LinkoutCTAProps {
  ctaText: string;
  ctaLink: string;
  linkCount?: number;
  isDisabled?: boolean;
  isLoading?: boolean;
  showIcon?: boolean;
  handleCTAClick?: (e: React.MouseEvent) => void;
  className?: string;
}

export const LinkoutCTA = ({
  ctaText,
  ctaLink,
  isDisabled = false,
  isLoading = false,
  showIcon = false,
  handleCTAClick,
  className,
}: LinkoutCTAProps) => {
  return (
    <Link
      href={ctaLink}
      target="_blank"
      rel="noopener noreferrer"
      className="gencl:w-full"
      onClick={(e) => e.stopPropagation()}>
      <Button
        size="md"
        shape="default"
        variant="default"
        className={cn(
          "gencl:w-full gencl:text-body-1-semi-bold! gencl:transition-all gencl:text-white gencl:bg-black gencl:hover:bg-black/80 gencl:flex gencl:gap-2 gencl:justify-between gencl:items-center gencl:px-3 gencl:py-2 gencl:rounded-lg!",
          className
        )}
        onClick={handleCTAClick}
        disabled={isDisabled || isLoading}>
        <div className="gencl:flex gencl:gap-2 gencl:items-center gencl:w-[90%]">
          {showIcon && <LinkIcon className="gencl:size-4 gencl:shrink-0 gencl:stroke-white" />}
          <p className="gencl:line-clamp-1 gencl:truncate">{ctaText}</p>
        </div>
        {isLoading ? (
          <Loader className={cn("gencl:size-4 gencl:shrink-0 gencl:animate-spin gencl:stroke-white")} />
        ) : (
          <ChevronRightIcon className={cn("gencl:size-4 gencl:shrink-0 gencl:stroke-white")} />
        )}
      </Button>
    </Link>
  );
};
