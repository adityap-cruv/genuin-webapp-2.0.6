import { checkAndAppendHttps, cn } from "@genuin/ui/lib/utils";
import { LinkData } from "@genuin/components/react-query/api/linkouts/schema";
import { ChevronRight, LinkIcon } from "lucide-react";
import { Button } from "@genuin/ui/components";
import { useAnalytics } from "@genuin/components/context/analytics/context";
import { VariantProps, cva } from "class-variance-authority";
import { useBaseContext } from "@genuin/components/context/base";

// Combined variant for both card layouts
const multiLinkCardVariants = cva(
  "gencl:gap-2 gencl:flex gencl:backdrop-blur-md gencl:rounded-xl gencl:text-sm gencl:font-medium gencl:text-white gencl:p-2 gencl:w-full",
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
}

export const MultiLinkCard = ({
  isEmbed,
  isOutside,
  links,
  ctaText = "",
  ctaLink = "",
  maxVisible = 3,
  variant,
}: MultiLinkCardProps) => {
  const visibleLinks = links.slice(0, maxVisible);
  const hasMore = links.length > maxVisible;
  const hasCTA = ctaText && ctaText.trim() !== "";
  const { track, EventName } = useAnalytics();
  const { brandDetails } = useBaseContext();

  const handleLinkClick = (link: LinkData) => {
    const url = checkAndAppendHttps(link.link);
    track(EventName.LINKOUTS_CLICKED, {
      linkUrl: link.link,
      linkTitle: link.title || new URL(url).hostname,
    });
    window.open(url, "_blank");
  };

  const handleCTAClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering card click
    const url = checkAndAppendHttps(ctaLink);
    track(EventName.LINKOUTS_CTA_CLICKED, {
      linkUrl: ctaLink,
      linkCount: links.length,
    });
    window.open(url, "_blank");
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
            "gencl:flex-1 gencl:text-start gencl:flex! gencl:items-center gencl:gap-2 gencl:line-clamp-2 gencl:overflow-x-auto gencl:flex-nowrap gencl:scrollbar-hide",
            isEmbed && "gencl:gap-1"
          )}
        >
          {visibleLinks.map((link, index) => (
            <div
              key={`${link.link}-${index}`}
              className={cn(
                "gencl:h-16 gencl:w-16 gencl:rounded-xl gencl:bg-[#F4F5F6] gencl:shrink-0 gencl:flex gencl:items-center gencl:justify-center gencl:cursor-pointer gencl:transition-colors gencl:overflow-hidden",
                isOutside && "gencl:h-12 gencl:w-12 gencl:rounded-md"
              )}
              onClick={() => handleLinkClick(link)}
            >
              {link.image && link.image.trim() !== "" ? (
                <>
                  <img
                    src={link.image}
                    alt=""
                    className="gencl:w-full gencl:h-full gencl:object-cover"
                    onError={handleImageError}
                  />
                  <LinkIcon className="gencl:h-6 gencl:w-6 gencl:shrink-0 gencl:stroke-black gencl:hidden" />
                </>
              ) : (
                <LinkIcon className="gencl:h-6 gencl:w-6 gencl:shrink-0 gencl:stroke-black " />
              )}
            </div>
          ))}
          {hasMore && (
            <div className="gencl:h-16 gencl:w-16 gencl:rounded-xl gencl:bg-gray-300 gencl:shrink-0 gencl:flex gencl:items-center gencl:justify-center gencl:text-black gencl:text-xs gencl:font-semibold">
              +{links.length - maxVisible}
            </div>
          )}
        </div>
        <Button
          size={isEmbed ? "sm" : "md"}
          className={cn(
            "gencl:w-full gencl:text-body-1-medium! gencl:font-semibold gencl:transition-all gencl:bg-white gencl:hover:bg-white/90 gencl:!text-black gencl:flex gencl:justify-between gencl:items-center gencl:px-3 gencl:py-2 gencl:rounded-lg",
            isOutside && "gencl:bg-secondary-50 gencl:hover:bg-secondary-150",
            !brandDetails.cta_config?.show_arrow_icon &&
              "gencl:rounded-full gencl:text-center gencl:justify-center "
          )}
          style={{
            borderRadius: brandDetails.cta_config?.button_radius ?? "",
            background: brandDetails.cta_config?.button_color ?? "",
            color: brandDetails.cta_config?.text_color ?? "",
          }}
          onClick={handleCTAClick}
        >
          {brandDetails.cta_config?.default_button_text
            ? brandDetails.cta_config?.default_button_text
            : ctaText}
          {brandDetails.cta_config?.show_arrow_icon && (
            <ChevronRight className="gencl:h-4 gencl:w-4 gencl:stroke-black! gencl:shrink-0" />
          )}
        </Button>
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
          "gencl:flex-1 gencl:text-start gencl:flex! gencl:items-center gencl:gap-2 gencl:line-clamp-2 gencl:overflow-x-auto gencl:flex-nowrap gencl:scrollbar-hide",
          isEmbed && "gencl:gap-1"
        )}
      >
        {visibleLinks.map((link, index) => (
          <div
            key={`${link.link}-${index}`}
            className={cn(
              "gencl:h-16 gencl:w-16 gencl:rounded-xl gencl:bg-[#F4F5F6] gencl:shrink-0 gencl:flex gencl:items-center gencl:justify-center gencl:cursor-pointer gencl:transition-colors gencl:overflow-hidden",
              isOutside && "gencl:h-12 gencl:w-12 gencl:rounded-md"
            )}
            onClick={() => handleLinkClick(link)}
          >
            {link.image && link.image.trim() !== "" ? (
              <>
                <img
                  src={link.image}
                  alt=""
                  className="gencl:w-full gencl:h-full gencl:object-cover"
                  onError={handleImageError}
                />
                <LinkIcon className="gencl:h-6 gencl:w-6 gencl:shrink-0 gencl:stroke-black gencl:hidden" />
              </>
            ) : (
              <LinkIcon className="gencl:h-6 gencl:w-6 gencl:shrink-0 gencl:stroke-black " />
            )}
          </div>
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
