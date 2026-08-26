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
          // Panel/full CTA per Figma (node 15912-202432): Body-0 semibold (16/22),
          // 24px chevron, pl-12/pr-8/py-8. Was Body-1 (14px) + 16px icon — too small.
          "gencl:w-full gencl:text-body-0-semi-bold! gencl:transition-all gencl:text-white gencl:bg-black gencl:hover:bg-black/80 gencl:flex gencl:gap-2 gencl:justify-between gencl:items-center gencl:pl-3 gencl:pr-2 gencl:py-2 gencl:rounded-lg!",
          className
        )}
        onClick={handleCTAClick}
        disabled={isDisabled || isLoading}>
        <div className="gencl:flex gencl:gap-2 gencl:items-center gencl:w-[90%]">
          {showIcon && <LinkIcon className="gencl:size-6 gencl:shrink-0 gencl:stroke-white" />}
          <p className="gencl:line-clamp-1 gencl:truncate">{ctaText}</p>
        </div>
        {isLoading ? (
          <Loader className={cn("gencl:size-6 gencl:shrink-0 gencl:animate-spin gencl:stroke-white")} />
        ) : (
          <ChevronRightIcon className={cn("gencl:size-6 gencl:shrink-0 gencl:stroke-white")} />
        )}
      </Button>
    </Link>
  );
};
