import { cn } from "@genuin/ui/lib/utils";
import { LinkData } from "@genuin/components/react-query/api/linkouts/schema";
import { ChevronRight, LinkIcon } from "lucide-react";
import { Button } from "@genuin/ui/components";
import { useAnalytics } from "@genuin/components/context/analytics/context";
import { VariantProps, cva } from "class-variance-authority";
import { useBaseContext } from "@genuin/components/context/base";
import { Loader } from "@genuin/ui/components/loader";
import { useSafeRedirect } from "./use-safe-redirect";
import { Link } from "../link/link";
import { useDeviceDetection } from "@genuin/components/hooks/use-device-detection";
import { buildLinkoutsAnalyticsData } from "@genuin/components/organisms";
import { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { useMemo } from "react";

// Combined variant for both card layouts
const multiLinkCardVariants = cva(
  "gencl:gap-2 gencl:flex gencl:backdrop-blur-md gencl:rounded-xl gencl:text-sm gencl:font-medium gencl:text-white gencl:p-2 gencl:w-full gencl:overflow-hidden gencl:scrollbar-none",
  {
    variants: {
      variant: {
        default: "gencl:bg-black/50 gencl:hover:bg-black/60",
        transparent: "gencl:bg-transparent gencl:hover:bg-transparent",
        primary: "gencl:bg-primary gencl:hover:bg-primary-700",
        secondary: "gencl:bg-secondary gencl:hover:bg-secondary-700",
      },
      layout: {
        withCTA: "gencl:flex-col gencl:items-start gencl:justify-between",
        standard: "gencl:items-center gencl:justify-between",
      },
    },
    defaultVariants: {
      variant: "default",
      layout: "standard",
    },
  }
);

interface MultiLinkCardProps
  extends VariantProps<typeof multiLinkCardVariants> {
  isEmbed: boolean;
  isOutside: boolean;
  links: LinkData[];
  ctaText?: string;
  ctaLink?: string;
  maxVisible?: number;
  videoDetails?: PostDetailsType["video"];
  totalVideos?: number;
  positionIndex?: number;
  autoplay?: boolean;
}

export const MultiLinkCard = ({
  isEmbed,
  isOutside,
  links,
  ctaText = "",
  ctaLink = "",
  maxVisible = 3,
  variant,
  videoDetails,
  totalVideos,
  positionIndex,
  autoplay,
}: MultiLinkCardProps) => {
  const visibleLinks = links.slice(0, maxVisible);
  const hasMore = links.length > maxVisible;
  const hasCTA = ctaText && ctaText.trim() !== "";
  const { track, EventName } = useAnalytics();
  const { brandDetails } = useBaseContext();
  const { isLoading, handleRedirect } = useSafeRedirect();
  const { isMobile } = useDeviceDetection();

  // Memoized analytics event data
  const analyticsEventData = useMemo(
    () =>
      buildLinkoutsAnalyticsData({
        videoDetails,
        totalVideos,
        positionIndex,
        autoplay,
      }),
    [videoDetails, totalVideos, positionIndex, autoplay]
  );

  const handleLinkClick = async (e: React.MouseEvent, link: LinkData) => {
    e.stopPropagation();

    track(EventName.LINKOUTS_CLICKED, {
      ...analyticsEventData,
      linkUrl: link.link,
      linkTitle: link.title || new URL(link.link).hostname,
    });

    // this condition is specifically for brand_id 2790(price) to handle safe redirects
    if (brandDetails.brand_id === 2790 && isMobile) {
      e.preventDefault();
      await handleRedirect(link.link);
    }
  };

  const handleCTAClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    track(EventName.LINKOUTS_CTA_CLICKED, {
      ...analyticsEventData,
      linkUrl: ctaLink,
      linkCount: links.length,
    });

    // this condition is specifically for brand_id 2790(price) to handle safe redirects
    if (brandDetails.brand_id === 2790 && isMobile) {
      e.preventDefault();
      await handleRedirect(ctaLink);
    }
  };

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

  if (hasCTA) {
    return (
      <div
        className={cn(
          multiLinkCardVariants({
            variant: isOutside ? "transparent" : variant,
            layout: "withCTA",
          })
        )}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div
          className={cn(
            "gencl:w-full gencl:flex-1 gencl:text-start gencl:flex! gencl:items-center gencl:gap-2 gencl:line-clamp-2 gencl:overflow-auto gencl:flex-nowrap gencl:scrollbar-none",
            isEmbed && "gencl:gap-1"
          )}
        >
          {visibleLinks.map((link, index) => (
            <Link
              href={link.link}
              target="_blank"
              rel="noopener noreferrer"
              key={`${link.link}-${index}`}
              className={cn(
                "gencl:h-16 gencl:w-16 gencl:rounded-xl gencl:bg-[#F4F5F6] gencl:shrink-0 gencl:flex gencl:items-center gencl:justify-center gencl:cursor-pointer gencl:transition-colors gencl:overflow-hidden",
                isOutside && "gencl:h-12 gencl:w-12 gencl:rounded-md"
              )}
              onClick={(e) => handleLinkClick(e, link)}
            >
              {link.image && link.image.trim() !== "" ? (
                <>
                  <img
                    src={link.image}
                    alt=""
                    className="gencl:w-full gencl:h-full gencl:object-cover"
                    onError={handleImageError}
                  />
                </>
              ) : (
                <LinkIcon className="gencl:h-6 gencl:w-6 gencl:shrink-0 gencl:stroke-black " />
              )}
            </Link>
          ))}
          {hasMore && (
            <div className="gencl:h-16 gencl:w-16 gencl:rounded-xl gencl:bg-gray-300 gencl:shrink-0 gencl:flex gencl:items-center gencl:justify-center gencl:text-black gencl:text-xs gencl:font-semibold">
              +{links.length - maxVisible}
            </div>
          )}
        </div>
        <Link
          href={ctaLink}
          target="_blank"
          rel="noopener noreferrer"
          className="gencl:w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            size={isEmbed ? "sm" : "md"}
            className={cn(
              "gencl:w-full gencl:text-body-1-medium! gencl:font-semibold gencl:transition-all gencl:bg-white gencl:hover:bg-white/90 gencl:text-black gencl:flex gencl:justify-between gencl:items-center gencl:px-3 gencl:py-2 gencl:rounded-lg",
              isOutside && "gencl:bg-secondary-50 gencl:hover:bg-secondary-150",
              !brandDetails.cta_config?.show_arrow_icon &&
                "gencl:text-center gencl:justify-center "
            )}
            style={{
              borderRadius: brandDetails.cta_config?.button_radius ?? "",
              background: brandDetails.cta_config?.button_color ?? "",
              color: brandDetails.cta_config?.text_color ?? "black",
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
                <Loader
                  className={cn(
                    "gencl:h-4 gencl:w-4 gencl:shrink-0 gencl:animate-spin",
                    brandDetails.cta_config?.text_color
                      ? `gencl:stroke-[${brandDetails.cta_config?.text_color}]`
                      : "gencl:stroke-black"
                  )}
                />
              ) : (
                <ChevronRight
                  className={cn(
                    "gencl:h-4 gencl:w-4 gencl:shrink-0",
                    brandDetails.cta_config?.text_color
                      ? `gencl:stroke-[${brandDetails.cta_config?.text_color}]`
                      : "gencl:stroke-black"
                  )}
                />
              ))}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div
      className={cn(
        multiLinkCardVariants({
          variant: isOutside ? "transparent" : variant,
          layout: "standard",
        })
      )}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <div
        className={cn(
          "gencl:w-full gencl:flex-1 gencl:text-start gencl:flex! gencl:items-center gencl:gap-2 gencl:line-clamp-2 gencl:overflow-auto gencl:flex-nowrap gencl:scrollbar-hide",
          isEmbed && "gencl:gap-1"
        )}
      >
        {visibleLinks.map((link, index) => (
          <Link
            href={link.link}
            target="_blank"
            rel="noopener noreferrer"
            key={`${link.link}-${index}`}
            className={cn(
              "gencl:h-16 gencl:w-16 gencl:rounded-xl gencl:bg-[#F4F5F6] gencl:shrink-0 gencl:flex gencl:items-center gencl:justify-center gencl:cursor-pointer gencl:transition-colors gencl:overflow-hidden",
              isOutside && "gencl:h-12 gencl:w-12 gencl:rounded-md"
            )}
            onClick={(e) => handleLinkClick(e, link)}
          >
            {link.image && link.image.trim() !== "" ? (
              <>
                <img
                  src={link.image}
                  alt=""
                  className="gencl:w-full gencl:h-full gencl:object-cover"
                  onError={handleImageError}
                />
              </>
            ) : (
              <LinkIcon className="gencl:h-6 gencl:w-6 gencl:shrink-0 gencl:stroke-black " />
            )}
          </Link>
        ))}
        {hasMore && (
          <div className="gencl:h-16 gencl:w-16 gencl:rounded-xl gencl:bg-gray-300 gencl:shrink-0 gencl:flex gencl:items-center gencl:justify-center gencl:text-black gencl:text-xs gencl:font-semibold">
            +{links.length - maxVisible}
          </div>
        )}
      </div>
    </div>
  );
};
