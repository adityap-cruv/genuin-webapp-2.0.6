import { Button } from "@genuin/ui/components/button";
import { checkAndAppendHttps } from "@genuin/ui/lib/utils";
import { LinkData } from "@genuin/components/react-query/api/linkouts/schema";
import { LinkIcon, ChevronRight } from "lucide-react";

interface LinkCardProps {
  link: LinkData;
  showThumbnail?: boolean;
  ctaText?: string;
  ctaLink?: string;
}

export const LinkCard: React.FC<LinkCardProps> = ({
  link,
  showThumbnail = false,
  ctaText = "",
  ctaLink = "",
}) => {
  const hasImage = link.image && link.image.trim() !== "";
  const hasTitle = link.title && link.title.trim() !== "";
  const hasCTA = ctaText && ctaText.trim() !== "";

  const getDomain = (url: string): string => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  const displayText = hasTitle ? link.title : getDomain(link.link);

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    const target = e.target as HTMLImageElement;
    const nextSibling = target.nextElementSibling as HTMLElement;
    target.style.display = "none";
    if (nextSibling) {
      nextSibling.style.display = "flex";
    }
  };

  const handleCTAClick = () => {
    const url = checkAndAppendHttps(ctaLink);
    window.open(url, "_blank");
  };

  const handleCardClick = () => {
    const url = checkAndAppendHttps(link.link);
    window.open(url, "_blank");
  };

  if (hasCTA) {
    return (
      <div
        className="gencl:bg-black/50 gencl:cursor-pointer gencl:gap-2 gencl:flex gencl:flex-col gencl:backdrop-blur-md gencl:rounded-lg gencl:text-sm gencl:font-medium gencl:text-white gencl:p-2 gencl:w-full"
        onClick={handleCardClick}
      >
        <div className="gencl:flex-1 gencl:text-start gencl:flex gencl:items-center gencl:gap-2 gencl:line-clamp-1">
          {hasImage && showThumbnail && (
            <div className="gencl:h-16 gencl:w-16 gencl:rounded-lg gencl:bg-gray-200 gencl:shrink-0 gencl:overflow-hidden">
              <img
                src={link.image ?? ""}
                alt=""
                className="gencl:w-full gencl:h-full gencl:object-cover"
                onError={handleImageError}
              />
              <div className="gencl:w-full gencl:h-full gencl:bg-gray-200 gencl:items-center gencl:justify-center gencl:text-gray-600 gencl:text-xs gencl:hidden">
                Image
              </div>
            </div>
          )}
          {!hasImage && showThumbnail && (
            <LinkIcon className="gencl:h-4 gencl:w-4 gencl:shrink-0 gencl:stroke-white" />
          )}
          {!showThumbnail && (
            <LinkIcon className="gencl:h-4 gencl:w-4 gencl:shrink-0 gencl:stroke-white" />
          )}
          <span className="gencl:truncate gencl:text-body-1-medium">
            {displayText}
          </span>
        </div>
        <Button
          className="gencl:w-full gencl:text-body-1-medium gencl:font-semibold gencl:transition-all gencl:bg-white gencl:hover:bg-white/90 gencl:!text-black gencl:flex gencl:justify-between gencl:items-center gencl:px-3 gencl:py-2 gencl:rounded"
          onClick={handleCTAClick}
        >
          {ctaText}
          <ChevronRight className="gencl:h-4 gencl:w-4 gencl:shrink-0" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className="gencl:bg-black/50 gencl:gap-2 gencl:flex gencl:items-center gencl:justify-between gencl:backdrop-blur-md gencl:rounded-lg gencl:text-sm gencl:font-medium gencl:text-white gencl:p-2 gencl:w-full gencl:cursor-pointer gencl:hover:bg-black/60 gencl:transition-colors"
      onClick={handleCardClick}
    >
      <div className="gencl:flex-1 gencl:text-start gencl:flex gencl:items-center gencl:gap-2 gencl:line-clamp-1">
        {hasImage && showThumbnail ? (
          <div className="gencl:h-16 gencl:w-16 gencl:rounded-lg gencl:bg-gray-200 gencl:shrink-0 gencl:overflow-hidden">
            <img
              src={link.image ?? ""}
              alt=""
              className="gencl:w-full gencl:h-full gencl:object-cover"
              onError={handleImageError}
            />
            <div className="gencl:w-full gencl:h-full gencl:bg-gray-200 gencl:items-center gencl:justify-center gencl:text-gray-600 gencl:text-xs gencl:hidden">
              Image
            </div>
          </div>
        ) : (
          <LinkIcon className="gencl:h-4 gencl:w-4 gencl:shrink-0 gencl:stroke-white" />
        )}
        <span className="gencl:truncate gencl:text-body-1-medium">
          {displayText}
        </span>
      </div>
      <ChevronRight className="gencl:h-4 gencl:w-4 gencl:shrink-0 gencl:stroke-white" />
    </div>
  );
};
