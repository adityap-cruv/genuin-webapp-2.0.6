"use client";
import { checkAndAppendHttps, cn } from "@genuin/ui/lib/utils";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { ComponentProps } from "react";
import { useEffect, useState, useMemo, lazy } from "react";

import { useAnalytics } from "@genuin/components/context/analytics/context";
import { useShowLinkouts } from "@genuin/components/hooks/use-show-linkouts";
import { SafeSuspense } from "@genuin/components/molecules/error/safe-suspense";
import type { LinkoutSlotContent } from "@genuin/components/molecules/linkout-new/types";
import { buildLinkoutsAnalyticsData } from "@genuin/components/organisms/linkouts/build-linkouts-analytics-data";
import type { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { useGetLinkouts } from "@genuin/components/react-query/api/linkouts/get-linkouts";
import type { LinkoutsType } from "@genuin/components/react-query/api/linkouts/schema";

const SingleLinkCard = lazy(() =>
  import("@genuin/components/molecules/linkouts/single-link-card").then((m) => ({
    default: m.SingleLinkCard,
  }))
);
const MultiLinkCard = lazy(() =>
  import("@genuin/components/molecules/linkouts/multi-link-card").then((m) => ({
    default: m.MultiLinkCard,
  }))
);
const CTAOnlyCard = lazy(() =>
  import("@genuin/components/molecules/linkouts/cta-only-card").then((m) => ({
    default: m.CTAOnlyCard,
  }))
);
const DynamicLinkouts = lazy(() =>
  import("@genuin/components/molecules/linkout-new/linkouts-dynamic").then((m) => ({
    default: m.DynamicLinkouts,
  }))
);

// Module-level set deduplicates tracking across simultaneous instances (embed + expand).
// Key format: `${linkoutId}:${positionIndex ?? 0}`. Cleared when video goes inactive.
const trackedKeys = new Set<string>();

export const linkOutVariant = cva("gencl:space-y-4", {
  variants: {
    variant: {
      default: "",
      dynamic: "",
      cta_only: "",
      single: "",
      multi: "",
    },
    view: {
      embed: "",
      expand: "",
      default: "",
    },
    layout: {
      overlay: "",
      outside: "",
    },
  },
  defaultVariants: {
    variant: "default",
    layout: "overlay",
    view: "default",
  },
});

export type LinkoutsVariant = "default" | "dynamic" | "cta_only" | "single" | "multi";

type ResolvedVariant = Exclude<LinkoutsVariant, "default">;

export type LinkoutsProps = {
  linkouts?: LinkoutsType;
  linkoutId?: number | null;
  isActive: boolean;
  showImmediately?: boolean;
  videoDetails?: PostDetailsType["video"];
  totalVideos?: number;
  positionIndex?: number;
  autoplay?: boolean;
  handleCTAClick?: (e: React.MouseEvent) => void;
  onSwiperToggle?: (isOpen: boolean) => void;
  /**
   * Forwarded to `<DynamicLinkouts>` when `variant === "dynamic"`.
   * Takes precedence over `linkouts` — pass when the slot should
   * host an IAB banner ad instead of a link card.
   */
  dynamicContent?: LinkoutSlotContent;
} & ComponentProps<"div"> &
  VariantProps<typeof linkOutVariant>;

export function Linkouts({
  linkouts: initialLinkouts,
  linkoutId,
  className,
  isActive,
  variant: variantProp,
  showImmediately = false,
  videoDetails,
  totalVideos,
  positionIndex,
  autoplay,
  view,
  layout,
  handleCTAClick,
  onSwiperToggle,
  dynamicContent,
  ...restProps
}: LinkoutsProps) {
  const { showLinkouts } = useShowLinkouts({ linkoutId, isActive });
  const {
    data: fetchedLinkouts,
    isLoading,
    isError,
  } = useGetLinkouts(linkoutId, {
    enabled: !initialLinkouts && !!linkoutId,
    staleTime: 1000 * 60,
  });
  const { track, EventName } = useAnalytics();
  const trackingKey = `${linkoutId ?? 0}:${positionIndex ?? 0}`;
  const [isVisible, setIsVisible] = useState(showImmediately);
  const [shouldRender, setShouldRender] = useState(showImmediately || showLinkouts);

  const linkouts = initialLinkouts ?? fetchedLinkouts;
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

  // ─── Animation effect ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!isActive) {
      trackedKeys.delete(trackingKey);
      return;
    }
    // Handle immediate display without animation
    if (showImmediately) {
      setShouldRender(true);
      setIsVisible(true);

      if (!trackedKeys.has(trackingKey) && linkouts && linkouts.length > 0) {
        trackedKeys.add(trackingKey);
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

      const shouldTrack = !trackedKeys.has(trackingKey) && !!linkouts && linkouts.length > 0;
      if (shouldTrack) {
        trackedKeys.add(trackingKey);
      }

      // Small delay for DOM update before animation
      const timer = setTimeout(() => {
        setIsVisible(true);

        if (shouldTrack) {
          track(EventName.LINKOUTS_VIEWED, {
            ...analyticsEventData,
            linkoutId,
            count: linkouts!.length,
          });
        }
      }, 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      trackedKeys.delete(trackingKey);

      // Remove from DOM after animation completes
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [
    showLinkouts,
    linkouts,
    linkoutId,
    trackingKey,
    track,
    EventName.LINKOUTS_VIEWED,
    showImmediately,
    analyticsEventData,
    isActive,
  ]);

  // ─── Derive processed data ────────────────────────────────────────────────
  const linkoutData = linkouts?.[0];
  // Linkout URLs can come from the API without a protocol (e.g. "www.iheart.com/podcast/").
  // The Link component treats protocol-less hrefs as internal and rewrites them against the
  // brand's white_label_url, sending users to the whitelabel site instead of the linkout.
  // Normalize here so every card variant receives absolute URLs.
  const sortedLinks = useMemo(
    () =>
      [...(linkoutData?.links ?? [])]
        .sort((a, b) => (a.position || 0) - (b.position || 0))
        .map((link) => (link.link ? { ...link, link: checkAndAppendHttps(link.link) } : link)),
    [linkoutData]
  );

  const effectiveCTAText = linkoutData?.cta_text ?? "";
  const effectiveCTALink = linkoutData?.cta_link ? checkAndAppendHttps(linkoutData.cta_link) : "";

  // ─── Resolve effective variant ────────────────────────────────────────────
  const resolvedVariant = useMemo((): ResolvedVariant => {
    if (variantProp === "dynamic") return "dynamic";
    if (variantProp === "cta_only") return "cta_only";
    if (variantProp === "single") return "single";
    if (variantProp === "multi") return "multi";
    return sortedLinks.length === 1 ? "single" : "multi";
  }, [variantProp, sortedLinks.length]);

  // ─── Guard rails ──────────────────────────────────────────────────────────
  if (isLoading) return <div className="gencl:p-4 animate-pulse">Loading…</div>;
  if (isError || !linkouts || linkouts.length === 0) return null;
  if (!shouldRender) return null;
  if (!linkoutData || (!linkoutData.links?.length && !linkoutData.cta_text)) return null;

  const animationClasses = showImmediately
    ? "gencl:w-full"
    : cn(
        "gencl:transition-transform gencl:duration-300 gencl:ease-out gencl:w-full",
        isVisible ? "gencl:translate-y-0" : "gencl:translate-y-full"
      );

  const commonCardProps = {
    isOutside: layout === "outside",
    isEmbed: view === "embed",
    ctaText: effectiveCTAText,
    ctaLink: effectiveCTALink,
    analyticsEventData,
  } as const;

  // ─── Variant switch ───────────────────────────────────────────────────────
  switch (resolvedVariant) {
    case "dynamic":
      return (
        <SafeSuspense fallback={null} errorFallback={null}>
          <DynamicLinkouts
            links={sortedLinks}
            ctaText={effectiveCTAText}
            ctaLink={effectiveCTALink}
            isActive={isActive}
            view={view}
            layout={layout}
            analyticsEventData={analyticsEventData}
            onSwiperToggle={onSwiperToggle}
            content={dynamicContent}
          />
        </SafeSuspense>
      );

    case "cta_only":
      return (
        <div className={cn(animationClasses, className)} {...restProps}>
          <SafeSuspense fallback={null} errorFallback={null}>
            <CTAOnlyCard
              key={`cta-only`}
              isEmbed={view === "embed"}
              ctaText={effectiveCTAText ?? ""}
              showIcon={effectiveCTAText !== "Go to Episodes"}
              ctaLink={effectiveCTALink ?? ""}
              linkCount={sortedLinks.length}
              handleCTAClick={handleCTAClick}
            />
          </SafeSuspense>
        </div>
      );

    case "single": {
      const link = sortedLinks[0];
      if (!link) return null;

      return (
        <div className={cn(animationClasses, className)} {...restProps}>
          <SafeSuspense fallback={null} errorFallback={null}>
            <SingleLinkCard link={link} showThumbnail={!!link.image?.trim()} {...commonCardProps} />
          </SafeSuspense>
        </div>
      );
    }

    case "multi":
      return (
        <div className={cn(animationClasses, className)} {...restProps}>
          <SafeSuspense fallback={null} errorFallback={null}>
            <MultiLinkCard links={sortedLinks} maxVisible={100} {...commonCardProps} />
          </SafeSuspense>
        </div>
      );
  }
}
