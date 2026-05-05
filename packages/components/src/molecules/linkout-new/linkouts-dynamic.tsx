"use client";
import { LinkIcon, XIcon } from "@genuin/ui";
import { cn } from "@genuin/ui/lib/utils";
import { lazy, Suspense, useState } from "react";

import { useAnalytics } from "@genuin/components/context/analytics/context";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";
import { useSheetState } from "@genuin/components/hooks/use-sheet-state";
import { LinkoutItem } from "@genuin/components/molecules/linkout-new/linkout-item";
import { getLinkoutsConfig } from "@genuin/components/molecules/linkout-new/linkouts-sheet-config";
import { LinkoutCTA } from "@genuin/components/molecules/linkouts/linkout-cta";
import type { buildLinkoutsAnalyticsData } from "@genuin/components/organisms/linkouts/build-linkouts-analytics-data";
import type { LinkData } from "@genuin/components/react-query/api/linkouts/schema";

const LazyDynamicSheet = lazy(() =>
  import("@genuin/ui/dynamic-sheet").then((m) => ({
    default: m.DynamicSheet,
  }))
);

export interface DynamicLinkoutsProps {
  links: LinkData[];
  ctaText: string;
  ctaLink: string;
  isActive: boolean;
  view?: "embed" | "expand" | "default" | null | undefined;
  layout?: "overlay" | "outside" | null | undefined;
  analyticsEventData: ReturnType<typeof buildLinkoutsAnalyticsData>;
  onSwiperToggle?: (isOpen: boolean) => void;
  /** Override effectiveVideoWidth from embed context. Used in Storybook/testing. */
  effectiveVideoWidth?: number;
  /** Override aspect ratio from embed context. Used in Storybook/testing (e.g. "16:9"). */
  aspectRatio?: string;
}

export function DynamicLinkouts({
  links,
  ctaText,
  ctaLink,
  isActive,
  view,
  layout,
  analyticsEventData,
  onSwiperToggle,
  effectiveVideoWidth: effectiveVideoWidthProp,
  aspectRatio: aspectRatioProp,
}: DynamicLinkoutsProps) {
  const [currentLinkIdx, setCurrentLinkIdx] = useState(0);
  const { track, EventName } = useAnalytics();
  const {
    hasContentType,
    getContentTypeState,
    setContentTypeState,
    resetSheet,
    toggleContentType,
    openContentType,
    sheetContentPlacements,
  } = useSheetState();
  const { isMobile, isDesktop } = useDeviceDetectMediaQuery();
  const {
    responsive: { effectiveVideoWidth: contextVideoWidth, containerWidth, containerHeight },
    dimensions: { aspectRatio: contextAspectRatio },
  } = useEmbedConfigs();
  if (!links?.length) return null;

  const effectiveVideoWidth = effectiveVideoWidthProp ?? contextVideoWidth;
  const aspectRatio = aspectRatioProp ?? contextAspectRatio;
  const linkoutsState = getContentTypeState("linkouts");
  const {
    scenario,
    config: baseConfig,
    showHeader,
    className,
    footerClassName,
  } = getLinkoutsConfig({
    view,
    isMobile,
    effectiveVideoWidth,
    aspectRatio: aspectRatio ?? "16:9",
    linkoutPlacement: sheetContentPlacements["linkouts"],
    linkoutsState,
    layout,
  });

  const isPanelOrFullState = linkoutsState === "panel-view" || linkoutsState === "full-view";
  const headerPaddingClass = isPanelOrFullState
    ? "gencl:p-3"
    : view === "expand" && isDesktop
      ? sheetContentPlacements["linkouts"] === "outside"
        ? "gencl:sm:p-3!"
        : "gencl:p-2"
      : "gencl:p-2";
  const footerPaddingClass = isPanelOrFullState ? "gencl:p-3" : "gencl:p-2";

  const handleSheetClose = () => {
    switch (scenario) {
      case "expand-desktop-inside":
        toggleContentType("linkouts");
        break;
      case "expand-desktop-outside":
        if (sheetContentPlacements["linkouts"] === "outside") {
          setContentTypeState("linkouts", "default");
          openContentType("linkouts", "inside", "default");
        } else {
          toggleContentType("linkouts");
        }
        break;
      default:
        resetSheet();
        break;
    }
  };

  const handleLinkItemClick = (link: string, title: string) => {
    track(EventName.LINKOUTS_CLICKED, {
      ...analyticsEventData,
      link_url: link,
      link_title: title,
    });
    window.open(link, "_blank", "noopener,noreferrer");
  };

  const handleCTAClick = (e: React.MouseEvent) => {
    track(EventName.LINKOUTS_CTA_CLICKED, {
      ...analyticsEventData,
      cta_link: ctaLink,
      cta_text: ctaText,
    });
    window.open(ctaLink, "_blank", "noopener,noreferrer");
  };

  const header = (
    <div
      className={cn(
        "gencl:w-full gencl:text-body-0-semi-bold! gencl:transition-all gencl:flex gencl:gap-2 gencl:justify-between gencl:items-center gencl:rounded-lg gencl:z-[99999]",
        baseConfig.theme === "light" ? "gencl:text-secondary-900" : "gencl:text-white",
        headerPaddingClass
      )}
      onClick={(e) => e.stopPropagation()}>
      <div className="gencl:flex gencl:gap-2 gencl:items-center gencl:max-w-[80%]">
        {!links[currentLinkIdx]?.title && (
          <LinkIcon
            className={cn(
              "gencl:size-5 gencl:sm:size-5! gencl:shrink-0",
              baseConfig.theme === "light" ? "gencl:stroke-secondary-900" : "gencl:stroke-white"
            )}
          />
        )}
        <p className="gencl:line-clamp-1 gencl:truncate">
          {links[currentLinkIdx]?.title || links[currentLinkIdx]?.link}
        </p>
      </div>
      <XIcon
        theme={baseConfig.theme}
        size="md"
        onClick={(e) => {
          e.stopPropagation();
          handleSheetClose();
        }}
      />
    </div>
  );

  const ctaFooter = (
    <LinkoutCTA
      className={footerPaddingClass}
      ctaText={
        ctaText
          ? ctaText
          : links[currentLinkIdx]?.title
            ? links[currentLinkIdx]?.title
            : (links[currentLinkIdx]?.link ?? "")
      }
      ctaLink={ctaLink ?? links[currentLinkIdx]?.link}
      showIcon
      handleCTAClick={handleCTAClick}
    />
  );

  return (
    <Suspense fallback={null}>
      <LazyDynamicSheet
        isOpen={isActive && hasContentType("linkouts")}
        renderMode="inline"
        config={{
          ...baseConfig,
          onStateChange: (state) => setContentTypeState("linkouts", state),
          onClose: handleSheetClose,
        }}
        header={showHeader ? header : undefined}
        footer={ctaFooter}
        footerClassName={footerClassName(linkoutsState)}
        className={className(linkoutsState)}
        onSwiperToggle={onSwiperToggle}>
        <Suspense fallback={null}>
          <LinkoutItem
            linkoutsState={linkoutsState}
            links={links}
            onLinkClick={handleLinkItemClick}
            theme={baseConfig.theme}
            onActiveIndexChange={setCurrentLinkIdx}
            view={view}
            isDesktop={isDesktop}
          />
        </Suspense>
      </LazyDynamicSheet>
    </Suspense>
  );
}
