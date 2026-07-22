"use client";

import { useBrowserDetect } from "@genuin/ui/hooks";
import { useLayoutEffect, useMemo, useState } from "react";

import { useBaseContext } from "@genuin/components/context/base";
import { useSafeEmbedContext } from "@genuin/components/context/embed/context";
import type { CustomizationType } from "@genuin/components/context/embed/embed.types";
import { isCurrentPageIheartSubdomain } from "@genuin/components/lib/utils/iheart-url";
import { resolveControlSize } from "@genuin/components/molecules/feed-player/control-layer/player-control-size";
import type { FeedType } from "@genuin/components/types/post";

import { useDeviceDetectMediaQuery } from "../use-devide-detect-media-query";
import { useSearchParams } from "../use-search-params";

const MIN_EMBED_WIDTH = 150;
const MIN_EMBED_HEIGHT = 268; // Based on 9:16 aspect ratio for 150 width
const MIN_GRID_VIDEO_WIDTH = 150;

// ============================================================
// Brand Feature ID Configuration
// Add embed/placement IDs here to enable a feature for specific embeds.
// Each key maps to a feature; add IDs to placementIds or embedIds to opt in.
// ============================================================
const BRAND_FEATURE_IDS = {
  iheart: {
    placementIds: new Set([
      "69de71089f6934fe0ba22fb5",
      "69c2812fd98484cf6b83a5ba",
      "69de78f2d89621dcaa5e7d79",
      "69de7b51ede71540a7f10fd7",
      "69de7ea22e853bae28d73adb",
      "69de7ff541254f559233a72a",
      "69de824b41254f559233a8b1",
      "69de814d6778217d372a2308",
      "69de834da5228bc03bca779b",
      "69e22226dd5806e4fb990a48",
    ]),
    embedIds: new Set<string>([]),
  },
  // LIVE: synthetic ad slides inserted between videos. Do not alter.
  adInjection: {
    placementIds: new Set(["69e22226dd5806e4fb990a48", "69fdb9cc45fa9f171bd1ab70"]),
    embedIds: new Set<string>([]),
  },
  // New, id-scoped: attaches a static adTagObject onto existing videos (no new slides).
  staticExpandViewAd: {
    placementIds: new Set<string>(["6a312de7a01f8b8ab6edde5a", "6a312e6756a45d0f66cf554c", "6a312ed0fa2e81f7e2dc4e79"]),
    embedIds: new Set<string>([]),
  },
  autoExpand: {
    placementIds: new Set<string>([
      "69faddecc002c7c205f3ad6a",
      "69fdb9cc45fa9f171bd1ab70",
      "6a22797a5c3c0f6ee27cacb5",
      "6a20274c5c3c0f6ee27c197b",
    ]),
    embedIds: new Set<string>([]),
  },
  expandOnInteraction: {
    placementIds: new Set([
      "69de71089f6934fe0ba22fb5",
      "69de7b51ede71540a7f10fd7",
      "69de814d6778217d372a2308",
      "69faddecc002c7c205f3ad6a",
      "69fdb9cc45fa9f171bd1ab70",
    ]),
    embedIds: new Set(["69c38273686a088a80a25ea2"]),
  },
};

type EmbedDataSlice =
  | {
      embed_id?: string | null;
      placement_id?: string | null;
    }
  | null
  | undefined;

function matchesFeature(
  feature: { placementIds: Set<string>; embedIds: Set<string> },
  embedData: EmbedDataSlice
): boolean {
  if (!embedData) return false;
  return (
    (!!embedData.placement_id && feature.placementIds.has(embedData.placement_id)) ||
    (!!embedData.embed_id && feature.embedIds.has(embedData.embed_id))
  );
}

// TODO REMOVE UNUSED CONFIGS, USE ONLY IF REQUIRED
/**
 * Hook that extracts and organizes all customization values from the embed context
 * @returns A comprehensive, organized object containing all customization options
 */
export function useEmbedConfigs() {
  const embedContextData = useSafeEmbedContext() ?? {
    customization: null,
    rootElement: null,
    embedData: null,
    brandLayoutType: undefined,
  };
  const { customization, rootElement, embedData, brandLayoutType } = embedContextData;
  const { brandDetails, isEmbed } = useBaseContext();
  const { isMobile, isDesktop } = useDeviceDetectMediaQuery();
  const { isSafari } = useBrowserDetect();
  const { searchParams } = useSearchParams();

  // Tracks whether the v2 design system experience is enabled, either via the
  // `design_system=v2` URL param (webapp testing) or the `configuration.design_system`
  // field passed to `Genuin.init()` (per-embed opt-in for web-sdk consumers).
  // Recomputed whenever the search string or embed data changes.
  const isDesignSystemV2 = useMemo(
    () =>
      new URLSearchParams(searchParams).get("design_system") === "v2" ||
      embedData?.configuration?.design_system === "v2",
    [searchParams, embedData?.configuration?.design_system]
  );

  const isAdsEnabledInIheart = useMemo(() => {
    return rootElement?.getAttribute("data-ads-enabled") === "true";
  }, [rootElement]);

  // ============================================================
  // Dimensions Configuration
  // ============================================================
  const dimensionsConfig = useMemo(
    () => ({
      containerHeight: customization?.dimensions?.height,
      containerWidth: customization?.dimensions?.width,
      aspectRatio: embedData?.aspect_ratio, // Add aspect ratio support from embedData
    }),
    [customization?.dimensions, embedData?.aspect_ratio]
  );

  // ============================================================
  // View Type Configuration (feed/carousel/standard_wall)
  // ============================================================
  const viewConfig = useMemo(() => {
    return {
      embedStyle: embedData?.style,
      isFeed: embedData?.style === "feed",
      isExpandOnly: embedData?.style === "expand_only",
      isCarousel: embedData?.style === "carousel",
      isStandardWall: embedData?.style === "standard_wall",
      isGrid: embedData?.style === "grid",
      isPlacementView: !!embedData?.placement_id,
      showCarouselIcon: !!customization?.is_carousel_icon,
      isFloatingView: !!customization?.is_floating_view,
      isExpandedView: !!customization?.is_expanded_view,
      feedDisplayPreference: customization?.feed_display_pref || "default",
      carouselStyle: customization?.carousel_style || "default",
      showViewLoopButton: !!customization?.show_view_loop_button,
      isShowPopupByDefault: !!customization?.is_show_popup_by_default,
      theme: customization?.theme || "light",
      gridLayout: (() => {
        if (embedData?.placement_id === "69c2846f506553c1e2b21722") {
          const autoAdjust = embedData?.grid_layout?.auto_adjust ?? false;
          if (isDesktop) {
            return { column: 3, row: 3, auto_adjust: autoAdjust };
          }
          if (!isMobile && !isDesktop) {
            return { column: 2, row: 4, auto_adjust: autoAdjust };
          }
          return { column: 2, row: 3, auto_adjust: autoAdjust };
        }
        return embedData?.grid_layout || undefined;
      })(),
      scrollBehavior: customization?.scroll_behavior || "paging",
      isNavigationControlEnabled: customization?.is_navigation_control_enabled,
      /**
       * This flag is used to determine whether the player should pause when the player doesn't autoplay in unmuted state specifically for safari.
       * If true: the player will pause when autoplay is not allowed error gets thrown from player.
       * If false: the will play in muted state when auto play not allowed error gets thrown from player.
       *
       * right now it is not productised so keeping this flag static based on brand id (only for ted.)
       */
      playerShouldPauseOnNotAllowed: brandDetails.brand_id === 2357 || brandDetails.brand_id === 1729,
      centeredSlides: embedData?.style === "feed" && embedData?.placement_card_layout_id === 2,
      brandLayoutType: brandLayoutType ?? "default",
      websiteType: embedData?.websiteType ?? "polaris",
      isAdsEnabledInIheart: isAdsEnabledInIheart ?? false,
    };
  }, [
    customization,
    embedData?.style,
    embedData?.placement_id,
    embedData?.card_layout_id,
    embedData?.placement_card_layout_id,
    embedData?.grid_layout?.auto_adjust,
    brandLayoutType,
    isMobile,
    isDesktop,
  ]);

  // ============================================================
  // Header Configuration
  // ============================================================
  const headerConfig = useMemo(
    () => ({
      showHeader:
        embedData?.placement_id === "69c2812fd98484cf6b83a5ba" ||
        Boolean(customization?.heading) ||
        Boolean(customization?.sub_heading) ||
        Boolean(customization?.cta_button?.url),
      heading: customization?.heading,
      subHeading: customization?.sub_heading || null,
      headingTextColor: customization?.heading_text_color,
      subHeadingTextColor: customization?.sub_heading_text_color,
      ctaButton: customization?.cta_button
        ? {
            text: customization.cta_button.text,
            url: customization.cta_button.url,
            color: customization.cta_button.color,
            textColor: customization.cta_button.text_color,
          }
        : null,
    }),
    [customization, embedData]
  );

  // ============================================================
  // Video Configuration
  // ============================================================
  const videoConfig = useMemo(
    () => ({
      videoLoop: embedData?.placement_id ? embedData?.media_play?.enable_loop_video : !!customization?.is_loop_video,
      videoAutoplay: embedData?.placement_id
        ? embedData?.media_play?.enable_autoplay ||
          (viewConfig.websiteType === "polaris" && viewConfig.brandLayoutType === "iheart")
        : !!customization?.autoplay,
      moveToNextTime: brandDetails.brand_id === 2476 ? 5 : embedData?.media_play?.auto_advance_playback || 0,
      showBorderAroundVideo:
        (!!customization?.is_show_social_interaction_data ||
          (customization?.links?.is_show_links && customization?.links?.position === "outside")) &&
        brandLayoutType !== "iheart",
      videoCrop: customization ? customization?.video_crop : true,
      autoScrollToNextSlide: customization?.enable_auto_scroll ?? false,
      resumePlaybackFrom: brandDetails.web_configs.resume_playback_from,
      previewSeconds: embedData?.media_play?.video_preview_seconds ?? 0,
      /**
       * Video preview enabled flag.
       */
      videoShouldPreview:
        embedData?.media_play?.video_preview_seconds !== undefined && embedData.media_play.video_preview_seconds > 0,
    }),
    [customization, brandDetails.brand_id, embedData?.style]
  );

  // ============================================================
  // Content Display Configuration
  // ============================================================
  const contentDisplayConfig = useMemo(
    () => ({
      sectionDetails: embedData?.section_details || {
        cover: false,
        no_of_clips: false,
        position: "overlay_on_top",
        sub_title: false,
        thumbnail: false,
        title: false,
      },
      videoDetails: embedData?.video_details || {
        position: "overlay_on_bottom",
        post_date: false,
        post_description: false,
        show_linkouts: false,
        video_duration: false,
      },
      socialInteractionCounts: embedData?.social_interaction_counts || {
        position: "overlay_on_bottom",
        comments: false,
        reactions: false,
        views: false,
      },
      showStyleDetails: embedData?.show_style_details ?? false,
      socialMetrics: embedData?.social_metrics || "views",
      showSectionCover: embedData?.section_details?.cover ?? false,
      showSectionTitle: embedData?.section_details?.title ?? false,
      showSectionSubTitle: embedData?.section_details?.sub_title ?? false,
      showSectionThumbnail: embedData?.section_details?.thumbnail ?? false,
      showClipsCount: embedData?.section_details?.no_of_clips ?? false,
      sectionDetailsPosition: embedData?.section_details?.position || "overlay_on_top",
      showPostDate: embedData?.video_details?.post_date ?? false,
      showPostDescription: embedData?.video_details?.post_description ?? false,
      showVideoLinkouts: embedData?.video_details?.show_linkouts ?? false,
      showVideoDuration: embedData?.video_details?.video_duration ?? false,
      videoDetailsPosition: embedData?.video_details?.position || "overlay_on_bottom",
      socialInteractionCountsPosition: embedData?.social_interaction_counts?.position || "overlay_on_bottom",
      showCommentCount: embedData?.social_interaction_counts?.comments ?? false,
      showReactionCount: embedData?.social_interaction_counts?.reactions ?? false,
      showViewCount: embedData?.social_interaction_counts?.views ?? false,
    }),
    [
      embedData?.section_details,
      embedData?.video_details,
      embedData?.show_style_details,
      embedData?.social_metrics,
      embedData?.social_interaction_counts,
    ]
  );

  // ============================================================
  // Community & Content Configuration
  // ============================================================
  const communityConfig = useMemo(
    () => ({
      communityIds: customization?.community_ids || [],
      communityLoopIds: customization?.community_loop_ids
        ? customization.community_loop_ids.map((group) => group.loop_id)
        : [],
      showJoinCommunityButton:
        embedData?.style === "standard_wall" ? !!customization?.show_join_community_button : true,
      showCommunityShareButton:
        embedData?.style === "standard_wall" ? !!customization?.show_community_share_button : true,
      enableCommunityClick: !!customization?.enable_community_click,
      enableBrandClick: !!customization?.enable_brand_click,
      showUserName: !!customization?.is_show_username,
      showViewCount: !!customization?.is_show_view_count,
    }),
    [customization, embedData?.style]
  );

  // ============================================================
  // Engagement & Interaction Configuration
  // ============================================================
  const engagementConfig = useMemo(() => {
    // Generalized engagement tools logic
    const showEngagementTools = isEmbed ? !!customization?.is_enable_engagement_tools : true;

    // Default and disabled engagement tool states
    const defaultEngagementTools = {
      octo: false,
      repost: true,
      spark: true,
      comment: true,
      share: true,
    };
    const disabledEngagementTools = {
      octo: false,
      repost: false,
      spark: false,
      comment: false,
      share: false,
    };

    let engagementTools = showEngagementTools
      ? (customization?.enable_engagement_tools ?? defaultEngagementTools)
      : disabledEngagementTools;

    // Apply camera_enabled logic to repost functionality
    // Prioritize embed configuration over brand details camera_enabled
    if (!isEmbed || (isEmbed && customization?.enable_engagement_tools?.repost === undefined)) {
      // Only apply camera_enabled check if not in embed context or if embed doesn't explicitly configure repost
      if (!brandDetails.camera_enabled) {
        engagementTools = {
          ...engagementTools,
          repost: false,
        };
      }
    }

    // Generalized redirection tools logic
    const isEnableRedirection = !!customization?.is_enable_redirection;

    // Define the keys for redirection tools
    const redirectionToolKeys = ["community", "group", "user"];
    // Helper to generate redirection tools object with all keys set to the same value
    const getRedirectionTools = (enabled: boolean) =>
      redirectionToolKeys.reduce(
        (acc, key) => {
          acc[key] = enabled;
          return acc;
        },
        {} as Record<string, boolean>
      );

    // Generalized assignment for redirectionTools
    let redirectionTools;
    if (isEmbed) {
      if (isEnableRedirection) {
        // Use customized redirection tools if provided, otherwise enable all
        redirectionTools = customization?.enable_redirection_tools ?? getRedirectionTools(true);
      } else {
        // All redirection tools disabled
        redirectionTools = getRedirectionTools(false);
      }
    } else {
      // Not embed: all redirection tools enabled
      redirectionTools = getRedirectionTools(true);
    }

    return {
      showEngagementTools,
      engagementTools,
      showSocialInteractionData: !!customization?.is_show_social_interaction_data,
      showShareIcon: !!customization?.show_share_icon,
      showCommentsSection: !!customization?.show_comments_section,
      showSidePanel: !!customization?.show_side_panel,
      isEnableRedirection,
      redirectionTools,
      openAllLinksInNewTab: false,
    };
  }, [customization, isEmbed, brandDetails.camera_enabled]);

  // ============================================================
  // Link Configuration
  // ============================================================
  const linkConfig = useMemo(
    () => ({
      showLinks: customization?.links?.is_show_links ?? false,
      showLinksInExpand: embedData?.show_linkout_in_expand ?? true,
      linkPosition: customization?.links?.position ?? "outside",
      showLinkOutside: customization?.links?.is_show_links && customization?.links?.position === "outside",
      showLinkInside: customization?.links?.is_show_links && customization?.links?.position === "overlay",
    }),
    [customization, embedData]
  );

  // ============================================================
  // Styling Configuration
  // ============================================================
  const stylingConfig = useMemo(
    () => ({
      brandColors: customization?.brandColors || {},
      isOpacityDown: embedData?.style === "carousel" && customization?.carousel_style === "focus",
      showDataOutside: engagementConfig.showSocialInteractionData || linkConfig.showLinks,
      theme: customization?.theme || "light", // Added theme support
    }),
    [customization, embedData?.style, engagementConfig.showSocialInteractionData, linkConfig.showLinks]
  );

  // ============================================================
  // Expand View Configuration
  // ============================================================
  const expandView = useMemo(() => {
    const isDisabled = embedData?.disable_expand_view === true;

    return {
      enable: !isDisabled && (customization?.is_popup_view ?? true),
      isShowByDefault: !isDisabled && !!customization?.is_show_popup_by_default,
      defaultAudioUnmute: true,
    };
  }, [customization, embedData?.disable_expand_view]);

  // ============================================================
  // Layout configs for the standard wall component.
  // ============================================================
  const layoutConfig = useMemo(() => {
    return {
      showSideBar:
        customization?.show_side_panel !== undefined
          ? embedData?.style === "standard_wall"
            ? customization?.show_side_panel && !isMobile
            : false
          : true,
      /**
       * In case of standard wall and embed show navigation bar based on customization.
       * If it's not embed show the navigation bar.
       */
      showNavigationBar: isEmbed ? customization?.show_navigation && embedData?.style === "standard_wall" : true,
      /**
       * In case of embed show back and forward buttons.
       * In case of standard-wall we want to show back button and close button.
       * In case of embed if it's mobile view we want to show back/close button. In desktop cases embed component will handle the buttons.
       */
      showBackAndCloseButton: isEmbed,
      /**
       * In case of embed show close button.
       */
      showCloseButton: isEmbed ? embedData?.style !== "standard_wall" : false,
      feedDisplayPreference: customization?.feed_display_pref || "default",
      isIheartArticlePage: brandLayoutType === "iheart" && isCurrentPageIheartSubdomain(),
    };
  }, [customization, isMobile]);

  //==================================================================
  // Modal configs
  //==================================================================
  const modalConfig = useMemo(() => {
    return {
      hideModal:
        embedContextData.embedData?.style === "carousel" ||
        embedContextData.embedData?.style === "feed" ||
        embedContextData.embedData?.style === "grid" ||
        embedContextData.embedData?.style === "expand_only" ||
        embedContextData.embedData?.expandOnLoad === true,
    };
  }, [embedContextData.embedData?.style, embedContextData.embedData?.card_layout_id]);

  //==================================================================
  // Responsive breakpoints configuration
  //==================================================================
  // Live container dimensions, kept in sync with the embed root via a
  // ResizeObserver. Reading `rootElement.offsetWidth` directly inside
  // the memo below races against React's render cycle: on first paint
  // the element isn't laid out yet (offsetWidth=0) and `canShowEngagement`
  // resolves to `false`, picking the minimal "responsiveness" variant
  // even though the actual rendered size satisfies the threshold. The
  // memo's `[rootElement, …]` deps don't recompute when the element's
  // size changes — only when its identity changes — so the wrong value
  // sticks unless something else triggers a re-render. Threading the
  // dimensions through state forces the memo to re-evaluate as soon
  // as the box has dimensions.
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>(() => ({
    width: rootElement?.offsetWidth ?? 0,
    height: rootElement?.offsetHeight ?? 0,
  }));
  // `useLayoutEffect`, not `useEffect`: the dimensions read must happen
  // synchronously *before* the browser paints the first frame. Otherwise
  // first paint reads the stale initial state (0×0), ControlLayer picks
  // the "responsiveness" variant, then the effect fires post-paint and
  // re-renders into the real variant — visible as a layout flash on
  // mount (and on every key={playerImpl} remount during V1/V2 toggling).
  useLayoutEffect(() => {
    if (!rootElement) return;
    const sync = () => {
      setContainerSize((prev) => {
        const w = rootElement.offsetWidth ?? 0;
        const h = rootElement.offsetHeight ?? 0;
        if (prev.width === w && prev.height === h) return prev;
        return { width: w, height: h };
      });
    };
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(rootElement);
    return () => observer.disconnect();
  }, [rootElement]);

  const responsiveConfig = useMemo(() => {
    const containerWidth = containerSize.width;
    const containerHeight = containerSize.height;
    const currentStyle = embedData?.style;
    const gridColumn = embedData?.grid_layout?.column ?? 1;

    // Define breakpoints for responsive behavior
    const breakpoints = {
      xs: 120,
      sm: 140,
      md: 184,
      lg: 240,
    } as const;

    // Header height constants — mirrors useEmbedDimensions to avoid circular deps
    const HEADER_HEIGHTS = {
      feed: { withCtaButton: 104, withSubHeading: 64, basic: 40 },
      carousel: 56,
      grid: 48,
    } as const;

    const getHeaderHeight = (): number => {
      if (
        !headerConfig.showHeader ||
        (viewConfig.isPlacementView && (!contentDisplayConfig.showStyleDetails || !headerConfig.heading))
      )
        return 0;

      if (viewConfig.isFeed) {
        if (headerConfig.ctaButton?.url) return HEADER_HEIGHTS.feed.withCtaButton;
        return headerConfig.subHeading ? HEADER_HEIGHTS.feed.withSubHeading : HEADER_HEIGHTS.feed.basic;
      }

      if (viewConfig.isCarousel) return HEADER_HEIGHTS.carousel;
      if (viewConfig.isGrid) return HEADER_HEIGHTS.grid;

      return 0;
    };

    // Parse aspect ratio (number like 0.5625, or string "9:16")
    const parseAspectRatio = (): number => {
      const ar = dimensionsConfig.aspectRatio;
      if (typeof ar === "number" && ar > 0) return ar;
      if (typeof ar === "string" && ar.includes(":")) {
        const [w, h] = ar.split(":").map(Number);
        if (w && h && h > 0) return w / h;
      }
      return 9 / 16; // default portrait
    };

    // Calculate effective video width based on embed style
    const getEffectiveVideoWidth = () => {
      switch (currentStyle) {
        case "grid":
          return gridColumn > 0 ? containerWidth / gridColumn : containerWidth;

        case "carousel":
        case "feed": {
          // Video height = container height minus header
          const headerH = getHeaderHeight();
          const availableH = Math.max(containerHeight - headerH, 0);
          const aspectRatioValue = parseAspectRatio();
          const widthFromAspectRatio = availableH * aspectRatioValue;
          return widthFromAspectRatio > 0 ? Math.min(containerWidth, widthFromAspectRatio) : containerWidth;
        }

        case "standard_wall":
        default:
          return containerWidth;
      }
    };

    const effectiveVideoWidth = getEffectiveVideoWidth();

    const canShowEngagement = () => {
      if (!customization || !rootElement) return false;

      switch (currentStyle) {
        case "feed":
          return containerWidth >= MIN_EMBED_WIDTH && containerHeight >= MIN_EMBED_HEIGHT;
        case "carousel":
          return containerWidth >= MIN_EMBED_WIDTH && containerHeight >= MIN_EMBED_HEIGHT;
        case "grid":
          return gridColumn > 0 && containerWidth / gridColumn >= MIN_GRID_VIDEO_WIDTH;
        default:
          return true;
      }
    };

    // Create responsive utilities based on effective video width
    const responsive = {
      breakpoints,
      containerWidth,
      containerHeight,
      effectiveVideoWidth,
      isXs: effectiveVideoWidth <= breakpoints.xs,
      isSm: effectiveVideoWidth <= breakpoints.sm,
      isMd: effectiveVideoWidth <= breakpoints.md,
      isLg: effectiveVideoWidth <= breakpoints.lg,
      canShowEngagement: canShowEngagement(),
      controlSize: resolveControlSize(containerWidth),
    };

    return responsive;
  }, [
    // `containerSize` replaces the bare `rootElement` dep — we still
    // need rootElement.identity to know which element to observe (that
    // lives in the effect above), but the memo only cares about its
    // dimensions, fed in via state.
    containerSize,
    rootElement,
    embedData?.style,
    embedData?.grid_layout?.column,
    customization,
    dimensionsConfig.aspectRatio,
    headerConfig.showHeader,
    headerConfig.heading,
    headerConfig.ctaButton,
    headerConfig.subHeading,
    viewConfig.isFeed,
    viewConfig.isCarousel,
    viewConfig.isGrid,
    viewConfig.isPlacementView,
    contentDisplayConfig.showStyleDetails,
  ]);

  /**
   * If we want to render slides into window directly instead of redering it into container.
   */
  const useWindowSwiperMode = useMemo(() => false, []);

  const virtualizeSwiper = true;

  const brand = useMemo(() => {
    const isIheart = matchesFeature(BRAND_FEATURE_IDS.iheart, embedData);

    const shouldInjectExpandViewAds =
      matchesFeature(BRAND_FEATURE_IDS.adInjection, embedData) ||
      (typeof window !== "undefined" &&
        (window.location.hostname === "iheartvip.prototype.begenuin.com" ||
          (isIheart && window.location.hostname === "gendemo.b-cdn.net")));

    const shouldAttachStaticExpandViewAd = matchesFeature(BRAND_FEATURE_IDS.staticExpandViewAd, embedData);

    const feedType: FeedType = "FEED_V1";
    const iheartArticleId = isIheart;
    return {
      isUsWeekly: brandDetails.brand_id === 2476,
      isIndianExpress: brandDetails.brand_id === 2793,
      feedType,
      autoPageContext: isIheart,
      showIheartIframe: false,
      shouldInjectExpandViewAds,
      shouldAttachStaticExpandViewAd,
      iheartArticleId,
      shouldAutoExpand: matchesFeature(BRAND_FEATURE_IDS.autoExpand, embedData),
      expandOnInteraction: matchesFeature(BRAND_FEATURE_IDS.expandOnInteraction, embedData) && isMobile,
    };
  }, [brandDetails.brand_id, isMobile]);

  const embedSwiperConfigs = useMemo(() => {
    return {
      useWindowSwiperMode,
      virtualizeSwiper,
      allowGestureScroll: embedContextData.embedData?.configs?.allowGestureScroll ?? true,
    };
  }, [useWindowSwiperMode, virtualizeSwiper]);

  // const renderOnlySingleVideoInEmbed = useMemo(() => {
  //   return (
  //     !!embedData?.initialVideoIds?.length &&
  //     embedData?.embed_id === "6980fb600599bd5a2e1011b5"
  //   );
  // }, [embedData?.initialVideoIds, embedData?.embed_id]);

  return {
    dimensions: dimensionsConfig,
    view: viewConfig,
    header: headerConfig,
    video: videoConfig,
    contentDisplay: contentDisplayConfig,
    community: communityConfig,
    engagement: engagementConfig,
    links: linkConfig,
    styling: stylingConfig,
    expandViewConfig: expandView,
    layoutConfig,
    modalConfig,
    responsive: responsiveConfig,
    rawCustomization: customization as CustomizationType | null,
    embedStyle: viewConfig.embedStyle,
    /**
     * @deprecated: use embedSwiperConfigs.useWindowSwiperMode instead
     * If we want to render slides into window directly instead of redering it into container.
     */
    useWindowSwiperMode,
    /**
     * @deprecated: use embedSwiperConfigs.virtualizeSwiper instead
     */
    virtualizeSwiper,
    brand,
    embedSwiperConfigs,
    /**
     * True when the embed URL contains `design_system=v2`. Gates the v2
     * design system experience (e.g. dynamic linkouts, v2 player controls)
     * across the app.
     */
    isDesignSystemV2,
    /**
     * TODO: Productise this — currently hardcoded to a specific embed ID (6980fb600599bd5a2e1011b5).
     * Once validated, this should be driven by an embed-level config flag (e.g. embedData.render_only_single_video)
     * instead of matching against a hardcoded embed ID.
     *
     * True only when `initialVideoIds` are provided AND the embed ID matches the target embed.
     * Used to render only a single video in the embed view rather than the full feed.
     */
    // renderOnlySingleVideoInEmbed,
  };
}
