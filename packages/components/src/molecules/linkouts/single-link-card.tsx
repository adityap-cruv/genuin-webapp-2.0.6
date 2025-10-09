import { Button } from "@genuin/ui/components/button";
import { checkAndAppendHttps, cn, openUrlInNewTab } from "@genuin/ui/lib/utils";
import { LinkData } from "@genuin/components/react-query/api/linkouts/schema";
import { LinkIcon, ChevronRight } from "lucide-react";
import { useAnalytics } from "@genuin/components/context/analytics/context";
import { VariantProps, cva } from "class-variance-authority";
import { useBaseContext } from "@genuin/components/context/base";
import { useState } from "react";
import { Loader } from "@genuin/ui/components/loader";
import { getRedirectUrl } from "./utils";

// Combined variant for both card types
const linkCardVariants = cva(
  "gencl:cursor-pointer gencl:gap-2 gencl:backdrop-blur-md gencl:rounded-xl gencl:text-sm gencl:font-medium gencl:text-white gencl:p-2 gencl:w-full gencl:transition-colors gencl:overflow-hidden gencl:scrollbar-none",
  {
    variants: {
      variant: {
        default: "gencl:bg-black/50 gencl:hover:bg-black/60",
        transparent: "gencl:bg-transparent gencl:hover:bg-transparent",
        primary: "gencl:bg-primary gencl:hover:bg-primary-700",
        secondary: "gencl:bg-secondary gencl:hover:bg-secondary-700",
      },
      layout: {
        withCTA: "gencl:flex gencl:flex-col",
        standard: "gencl:flex gencl:items-center gencl:justify-between",
      },
    },
    defaultVariants: {
      variant: "default",
      layout: "standard",
    },
  }
);

interface LinkCardProps extends VariantProps<typeof linkCardVariants> {
  isEmbed: boolean;
  isOutside: boolean;
  link: LinkData;
  showThumbnail?: boolean;
  ctaText?: string;
  ctaLink?: string;
}

export const LinkCard = ({
  isEmbed,
  isOutside,
  link,
  showThumbnail = false,
  ctaText = "",
  ctaLink = "",
  variant,
}: LinkCardProps) => {
  const hasImage = link.image && link.image.trim() !== "";
  const hasTitle = link.title && link.title.trim() !== "";
  const hasCTA = ctaText && ctaText.trim() !== "";
  const { track, EventName } = useAnalytics();
  const { brandDetails } = useBaseContext();
  const [isLoading, setIsLoading] = useState(false);

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

  const handleCTAClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);
    try {
      const url = checkAndAppendHttps(ctaLink);
      const finalUrl = await getRedirectUrl(url, brandDetails.brand_id);

      track(EventName.LINKOUTS_CTA_CLICKED, {
        linkUrl: ctaLink,
        linkTitle: link.title || getDomain(link.link),
      });

      openUrlInNewTab(finalUrl);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);
    try {
      const url = checkAndAppendHttps(link.link);
      const finalUrl = await getRedirectUrl(url, brandDetails.brand_id);

      track(EventName.LINKOUTS_CLICKED, {
        linkUrl: link.link,
        linkTitle: link.title || getDomain(link.link),
      });

      openUrlInNewTab(finalUrl);
    } finally {
      setIsLoading(false);
    }
  };

  if (hasCTA) {
    return (
      <div
        className={cn(
          linkCardVariants({
            variant: isOutside ? "transparent" : variant,
            layout: "withCTA",
          })
        )}
        onClick={handleCardClick}
      >
        <div className="gencl:flex-1 gencl:text-start gencl:flex gencl:items-center gencl:gap-2 gencl:line-clamp-2">
          {hasImage && showThumbnail && (
            <div
              className={cn(
                "gencl:h-16 gencl:w-16 gencl:rounded-xl gencl:bg-gray-200 gencl:shrink-0 gencl:overflow-hidden gencl:scrollbar-none",
                isEmbed && "gencl:h-12 gencl:w-12 gencl:rounded-md"
              )}
            >
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
          <span
            className={cn(
              "gencl:truncate gencl:text-body-1-medium!",
              isOutside && "gencl:text-black"
            )}
          >
            {displayText}
          </span>
        </div>
        <Button
          size={isEmbed ? "sm" : "md"}
          className={cn(
            "gencl:w-full gencl:text-body-1-medium! gencl:font-semibold gencl:transition-all gencl:text-black gencl:bg-white gencl:hover:bg-white/90 gencl:flex gencl:justify-between gencl:items-center gencl:px-3 gencl:py-2 gencl:rounded-lg",
            isOutside && "gencl:bg-secondary-50 gencl:hover:bg-secondary-150",
            !brandDetails.cta_config?.show_arrow_icon &&
              "gencl:text-center gencl:justify-center"
          )}
          style={{
            borderRadius: brandDetails.cta_config?.button_radius ?? "",
            background: brandDetails.cta_config?.button_color ?? "",
            color: brandDetails.cta_config?.text_color ?? "",
          }}
          onClick={handleCTAClick}
        >
          <p className="gencl:line-clamp-1 gencl:truncate gencl:w-fit">
            {brandDetails.cta_config?.default_button_text
              ? brandDetails.cta_config?.default_button_text
              : ctaText}
          </p>
          {brandDetails.cta_config?.show_arrow_icon &&
            (isLoading ? (
              <Loader className="gencl:h-4 gencl:w-4 gencl:stroke-black! gencl:shrink-0 gencl:animate-spin" />
            ) : (
              <ChevronRight className="gencl:h-4 gencl:w-4 gencl:stroke-black! gencl:shrink-0" />
            ))}
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        linkCardVariants({
          variant: isOutside ? "transparent" : variant,
          layout: "standard",
        })
      )}
      onClick={handleCardClick}
    >
      <div className="gencl:flex-1 gencl:text-start gencl:flex gencl:items-center gencl:gap-2 gencl:line-clamp-2">
        {hasImage && showThumbnail ? (
          <div
            className={cn(
              "gencl:h-16 gencl:w-16 gencl:rounded-xl gencl:bg-gray-200 gencl:shrink-0 gencl:overflow-hidden gencl:scrollbar-none",
              isEmbed && "gencl:h-12 gencl:w-12 gencl:rounded-md"
            )}
          >
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
        <span
          className={cn(
            "gencl:truncate gencl:text-body-1-medium!",
            isOutside && "gencl:text-black"
          )}
        >
          {displayText}
        </span>
      </div>
      {isLoading ? (
        <Loader
          className={cn(
            "gencl:h-4 gencl:w-4 gencl:shrink-0 gencl:stroke-white! gencl:animate-spin",
            isOutside && "gencl:stroke-black!"
          )}
        />
      ) : (
        <ChevronRight
          className={cn(
            "gencl:h-4 gencl:w-4 gencl:shrink-0 gencl:stroke-white!",
            isOutside && "gencl:stroke-black!"
          )}
        />
      )}
    </div>
  );
};
