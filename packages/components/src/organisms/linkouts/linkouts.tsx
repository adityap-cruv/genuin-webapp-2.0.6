"use client";
import { useEffect, useState, useMemo, ComponentProps } from "react";
import { LinkCard } from "@genuin/components/molecules/linkouts";
import { MultiLinkCard } from "@genuin/components/molecules/linkouts";
import { useGetLinkouts } from "@genuin/components/react-query/api/linkouts/get-linkouts";
import { LinkoutsType } from "@genuin/components/react-query/api/linkouts/schema";
import { cn } from "@genuin/ui/lib/utils";
import useShowLinkouts from "@genuin/components/hooks/use-show-linkouts";
import { useAnalytics } from "@genuin/components/context/analytics/context";
import { cva, VariantProps } from "class-variance-authority";
import { CTAOnlyCard } from "@genuin/components/molecules/linkouts";
import { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { buildLinkoutsAnalyticsData } from "..";

export const linkOutVariant = cva("gencl:space-y-4", {
  variants: {
    variant: {
      default: "",
      embed: "",
    },
    cardVariant: {
      default: "",
      transparent: "",
      primary: "",
      secondary: "",
    },
  },
  defaultVariants: {
    variant: "default",
    cardVariant: "default",
  },
});

/**
 * Props for the Linkouts component
 */
export type LinkoutsProps = {
  /**
   * Initial linkouts data to display.
   */
  linkouts?: LinkoutsType;
  /**
   * ID of the linkout to display.
   */
  linkoutId?: number | null;
  /**
   * If isActive is true, the linkouts will be displayed.
   */
  isActive: boolean;
  /**
   * If true, the linkouts will be shown immediately without animation.
   */
  showImmediately?: boolean;
  isOutside?: boolean;
  /**
   * If true, only the CTA button will be shown without link thumbnails.
   * This can be controlled by brand configuration or layout preferences.
   */
  ctaOnly?: boolean;
  handleCTAClick?: (e: React.MouseEvent) => void;
  videoDetails?: PostDetailsType["video"];
  totalVideos?: number;
  positionIndex?: number;
  autoplay?: boolean;
} & ComponentProps<"div"> &
  VariantProps<typeof linkOutVariant>;

/**
 * Linkouts component to display a list of linkouts.
 * The component supports:
 * - Fetching linkouts data when not provided
 * - Animated display with entrance/exit effects
 * - Single and multi-link card rendering
 * - Analytics tracking for linkout views
 */
export function Linkouts({
  linkouts: initialLinkouts,
  linkoutId,
  className,
  isActive,
  variant,
  cardVariant = "default",
  showImmediately = false,
  isOutside = false,
  ctaOnly = false,
  handleCTAClick,
  videoDetails,
  totalVideos,
  positionIndex,
  autoplay,
  ...restProps
}: LinkoutsProps) {
  const { showLinkouts } = useShowLinkouts({
    linkoutId,
    isActive,
  });
  const {
    data: fetchedLinkouts,
    isLoading,
    isError,
  } = useGetLinkouts(linkoutId, {
    enabled: !initialLinkouts && !!linkoutId,
    staleTime: 1000 * 60, // 1 minute
  });
  const linkouts = initialLinkouts ?? fetchedLinkouts;

  const { track, EventName } = useAnalytics();
  const [isVisible, setIsVisible] = useState(showImmediately);
  const [shouldRender, setShouldRender] = useState(
    showImmediately || showLinkouts,
  );
  const isEmbed = variant === "embed";

  const analyticsEventData = useMemo(
    () =>
      buildLinkoutsAnalyticsData({
        videoDetails,
        totalVideos,
        positionIndex,
        autoplay,
      }),
    [videoDetails, totalVideos, positionIndex, autoplay],
  );

  useEffect(() => {
    // Handle immediate display without animation
    if (showImmediately) {
      setShouldRender(true);
      setIsVisible(true);

      if (linkouts && linkouts.length > 0) {
        track(EventName.LINKOUTS_VIEWED, {
          ...analyticsEventData,
          linkoutId,
          count: linkouts.length,
        });
      }
      return;
    }

    if (showLinkouts) {
      setShouldRender(true);

      // Small delay for DOM update before animation
      const timer = setTimeout(() => {
        setIsVisible(true);

        if (linkouts && linkouts.length > 0) {
          track(EventName.LINKOUTS_VIEWED, {
            ...analyticsEventData,
            linkoutId,
            count: linkouts.length,
          });
        }
      }, 10);
      return () => clearTimeout(timer);
    } else {
      // Handle hiding with animation
      setIsVisible(false);

      // Remove from DOM after animation completes
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [
    showLinkouts,
    linkouts,
    linkoutId,
    track,
    EventName.LINKOUTS_VIEWED,
    showImmediately,
    analyticsEventData,
  ]);

  // Memoize rendered linkouts to avoid unnecessary re-renders
  const renderedLinkouts = useMemo(() => {
    if (!linkouts || linkouts.length === 0) {
      return null;
    }

    return linkouts.map((item, index) => {
      const { links, cta_text, cta_link } = item;

      if (!links || links.length === 0) {
        return null;
      }

      // Sort links by position if available
      const sortedLinks = [...links].sort(
        (a, b) => (a.position || 0) - (b.position || 0),
      );

      // Render CTA-only card if configured
      if (ctaOnly) {
        return (
          <CTAOnlyCard
            key={`cta-only-${index}`}
            isEmbed={isEmbed}
            ctaText={cta_text ?? ""}
            showIcon={cta_text !== "Go to Episodes"}
            ctaLink={cta_link ?? ""}
            linkCount={sortedLinks.length}
            handleCTAClick={handleCTAClick}
          />
        );
      }

      // Render single link card
      if (sortedLinks.length === 1) {
        const link = sortedLinks[0];
        if (!link) return null;

        const showThumbnail = !!(link.image && link.image.trim() !== "");

        return (
          <LinkCard
            isEmbed={isEmbed}
            isOutside={isOutside}
            key={`single-${index}`}
            link={link}
            showThumbnail={showThumbnail}
            ctaText={cta_text ?? ""}
            ctaLink={cta_link ?? ""}
            variant={cardVariant}
            videoDetails={videoDetails}
            totalVideos={totalVideos}
            positionIndex={positionIndex}
            autoplay={autoplay}
          />
        );
      }

      // Render multi-link card
      return (
        <MultiLinkCard
          isOutside={isOutside}
          isEmbed={isEmbed}
          key={`multi-${index}`}
          links={sortedLinks}
          maxVisible={100}
          ctaText={cta_text ?? ""}
          ctaLink={cta_link ?? ""}
          variant={cardVariant}
          videoDetails={videoDetails}
          totalVideos={totalVideos}
          positionIndex={positionIndex}
          autoplay={autoplay}
        />
      );
    });
  }, [linkouts, isEmbed, isOutside, cardVariant, ctaOnly]);

  // Loading state
  if (isLoading) {
    return <div className="animate-pulse p-4">Loading…</div>;
  }

  // Error or empty state
  if (isError || !linkouts || linkouts.length === 0) {
    return null;
  }

  // Don't render if not in DOM
  if (!shouldRender) {
    return null;
  }

  // Animation classes based on visibility state
  const animationClasses = showImmediately
    ? "gencl:w-full"
    : cn(
        "gencl:transition-transform gencl:duration-300 gencl:ease-out gencl:w-full",
        isVisible ? "gencl:translate-y-0" : "gencl:translate-y-full",
      );

  return (
    <div
      className={cn(
        animationClasses,
        linkOutVariant({ variant, cardVariant }),
        className,
      )}
      {...restProps}
    >
      {renderedLinkouts}
    </div>
  );
}
