import { useEmbedContext } from "@genuin/components/context/embed";
import { useBaseContext } from "@genuin/components/context/base";
import { useMemo } from "react";
import { useDeviceDetectMediaQuery } from "../use-devide-detect-media-query";
import type { CustomizationType } from "@genuin/components/context/embed/embed.types";
import { useBrowserDetect } from "@genuin/ui/hooks";
import { FeedType } from "@genuin/components/types/post";
import { IS_PRODUCTION_ENVIRONMENT } from "@genuin/components/lib/utils/env";

const MIN_EMBED_WIDTH = 150;
const MIN_EMBED_HEIGHT = 268; // Based on 9:16 aspect ratio for 150 width
const MIN_GRID_VIDEO_WIDTH = 150;

// TODO REMOVE UNUSED CONFIGS, USE ONLY IF REQUIRED
/**
 * Hook that extracts and organizes all customization values from the embed context
 * @returns A comprehensive, organized object containing all customization options
 */
export function useEmbedConfigs() {
  let embedContextData;
  try {
    embedContextData = useEmbedContext();
  } catch (error) {
    // Use default values if embed context is unavailable
    embedContextData = {
      customization: null,
      rootElement: null,
      embedData: null,
    };
  }
  const { customization, rootElement, embedData, brandLayoutType } =
    embedContextData;
  const { brandDetails, isEmbed } = useBaseContext();
  const { isMobile, isDesktop } = useDeviceDetectMediaQuery();
  const { isSafari } = useBrowserDetect();

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
    [customization?.dimensions, embedData?.aspect_ratio],
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
      expandOnInteraction:
        (embedData?.placement_id === "69de71089f6934fe0ba22fb5" ||
          embedData?.placement_id === "69de7b51ede71540a7f10fd7" ||
          embedData?.placement_id === "69de814d6778217d372a2308") &&
        isMobile,
      scrollBehavior: customization?.scroll_behavior || "paging",
      isNavigationControlEnabled:
        brandLayoutType === "ted"
          ? false
          : customization?.is_navigation_control_enabled,
      /**
       * This flag is used to determine whether the player should pause when the player doesn't autoplay in unmuted state specifically for safari.
       * If true: the player will pause when autoplay is not allowed error gets thrown from player.
       * If false: the will play in muted state when auto play not allowed error gets thrown from player.
       *
       * right now it is not productised so keeping this flag static based on brand id (only for ted.)
       */
      playerShouldPauseOnNotAllowed:
        brandDetails.brand_id === 2357 || brandDetails.brand_id === 1729,
      centeredSlides:
        embedData?.style === "feed" &&
        embedData?.placement_card_layout_id === 2,
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
        Boolean(customization?.heading) ||
        Boolean(customization?.sub_heading) ||
        Boolean(customization?.cta_button?.url),
      heading: customization?.heading || null,
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
    [customization, embedData],
  );

  // ============================================================
  // Video Configuration
  // ============================================================
  const videoConfig = useMemo(
    () => ({
      videoLoop: !!embedData?.placement_id
        ? embedData?.media_play?.enable_loop_video
        : !!customization?.is_loop_video,
      videoAutoplay: !!embedData?.placement_id
        ? embedData?.media_play?.enable_autoplay ||
          (viewConfig.websiteType === "polaris" &&
            viewConfig.brandLayoutType === "iheart")
        : !!customization?.autoplay,
      moveToNextTime:
        brandDetails.brand_id === 2476
          ? 5
          : embedData?.media_play?.auto_advance_playback || 0,
      showBorderAroundVideo:
        (!!customization?.is_show_social_interaction_data ||
          (customization?.links?.is_show_links &&
            customization?.links?.position === "outside")) &&
        brandLayoutType !== "iheart",
      videoCrop: customization?.video_crop,
      autoScrollToNextSlide: customization?.enable_auto_scroll ?? false,
      resumePlaybackFrom: brandDetails.web_configs.resume_playback_from,
      previewSeconds: embedData?.media_play?.video_preview_seconds ?? 0,
      /**
       * Video preview enabled flag.
       */
      videoShouldPreview:
        embedData?.media_play?.video_preview_seconds !== undefined &&
        embedData.media_play.video_preview_seconds > 0,
    }),
    [customization, brandDetails.brand_id, embedData?.style],
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
      sectionDetailsPosition:
        embedData?.section_details?.position || "overlay_on_top",
      showPostDate: embedData?.video_details?.post_date ?? false,
      showPostDescription: embedData?.video_details?.post_description ?? false,
      showVideoLinkouts: embedData?.video_details?.show_linkouts ?? false,
      showVideoDuration: embedData?.video_details?.video_duration ?? false,
      videoDetailsPosition:
        embedData?.video_details?.position || "overlay_on_bottom",
      socialInteractionCountsPosition:
        embedData?.social_interaction_counts?.position || "overlay_on_bottom",
      showCommentCount: embedData?.social_interaction_counts?.comments ?? false,
      showReactionCount:
        embedData?.social_interaction_counts?.reactions ?? false,
      showViewCount: embedData?.social_interaction_counts?.views ?? false,
    }),
    [
      embedData?.section_details,
      embedData?.video_details,
      embedData?.show_style_details,
      embedData?.social_metrics,
      embedData?.social_interaction_counts,
    ],
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
      showJoinCommunityButton: !!customization?.show_join_community_button,
      showCommunityShareButton: !!customization?.show_community_share_button,
      enableCommunityClick: !!customization?.enable_community_click,
      enableBrandClick: !!customization?.enable_brand_click,
      showUserName: !!customization?.is_show_username,
      showViewCount: !!customization?.is_show_view_count,
    }),
    [customization],
  );

  // ============================================================
  // Engagement & Interaction Configuration
  // ============================================================
  const engagementConfig = useMemo(() => {
    // Generalized engagement tools logic
    const showEngagementTools = isEmbed
      ? !!customization?.is_enable_engagement_tools
      : true;

    // Default and disabled engagement tool states
    const defaultEngagementTools = {
      octo: true,
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
    if (
      !isEmbed ||
      (isEmbed && customization?.enable_engagement_tools?.repost === undefined)
    ) {
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
        {} as Record<string, boolean>,
      );

    // Generalized assignment for redirectionTools
    let redirectionTools;
    if (isEmbed) {
      if (isEnableRedirection) {
        // Use customized redirection tools if provided, otherwise enable all
        redirectionTools =
          customization?.enable_redirection_tools ?? getRedirectionTools(true);
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
      showSocialInteractionData:
        !!customization?.is_show_social_interaction_data,
      showShareIcon: !!customization?.show_share_icon,
      showCommentsSection: !!customization?.show_comments_section,
      showSidePanel: !!customization?.show_side_panel,
      isEnableRedirection,
      redirectionTools,
      openAllLinksInNewTab: false,
    };
  }, [customization, rootElement]);

  // ============================================================
  // Link Configuration
  // ============================================================
  const linkConfig = useMemo(
    () => ({
      showLinks: customization?.links?.is_show_links ?? false,
      showLinksInExpand: embedData?.show_linkout_in_expand ?? true,
      linkPosition: customization?.links?.position ?? "outside",
      showLinkOutside:
        customization?.links?.is_show_links &&
        customization?.links?.position === "outside",
      showLinkInside:
        customization?.links?.is_show_links &&
        customization?.links?.position === "overlay",
    }),
    [customization, embedData],
  );

  // ============================================================
  // Styling Configuration
  // ============================================================
  const stylingConfig = useMemo(
    () => ({
      brandColors: customization?.brandColors || {},
      isOpacityDown:
        embedData?.style === "carousel" &&
        customization?.carousel_style === "focus",
      showDataOutside:
        engagementConfig.showSocialInteractionData || linkConfig.showLinks,
      theme: customization?.theme || "light", // Added theme support
    }),
    [
      customization,
      embedData?.style,
      engagementConfig.showSocialInteractionData,
      linkConfig.showLinks,
    ],
  );

  // ============================================================
  // Expand View Configuration
  // ============================================================
  const expandView = useMemo(() => {
    const isDisabled = embedData?.disable_expand_view === true;

    return {
      enable: !isDisabled && (customization?.is_popup_view ?? true),
      isShowByDefault: !isDisabled && !!customization?.is_show_popup_by_default,
      defaultAudioUnmute:
        embedData?.placement_id === "69f47831e964b815fc224b52" ||
        embedData?.placement_id === "69f47bbbe964b815fc224dd2" ||
        embedData?.placement_id === "69f47c44f1feb6b63d575df9",
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
      showNavigationBar: isEmbed
        ? customization?.show_navigation && embedData?.style === "standard_wall"
        : true,
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
  }, [
    embedContextData.embedData?.style,
    embedContextData.embedData?.card_layout_id,
  ]);

  //==================================================================
  // Responsive breakpoints configuration
  //==================================================================
  const responsiveConfig = useMemo(() => {
    const containerWidth = rootElement?.offsetWidth || 0;
    const containerHeight = rootElement?.offsetHeight || 0;
    const currentStyle = embedData?.style;
    const gridColumn = embedData?.grid_layout?.column ?? 1;

    // Define breakpoints for responsive behavior
    const breakpoints = {
      xs: 120,
      sm: 140,
      md: 184,
      lg: 240,
    } as const;

    // Calculate effective video width based on embed style
    const getEffectiveVideoWidth = () => {
      switch (currentStyle) {
        case "grid":
          return gridColumn > 0 ? containerWidth / gridColumn : containerWidth;
        case "carousel":
        case "feed":
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
          return (
            containerWidth >= MIN_EMBED_WIDTH &&
            containerHeight >= MIN_EMBED_HEIGHT
          );
        case "carousel":
          return (
            containerWidth >= MIN_EMBED_WIDTH &&
            containerHeight >= MIN_EMBED_HEIGHT
          );
        case "grid":
          return (
            gridColumn > 0 &&
            containerWidth / gridColumn >= MIN_GRID_VIDEO_WIDTH
          );
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
    };

    return responsive;
  }, [
    rootElement,
    embedData?.style,
    embedData?.grid_layout?.column,
    customization,
  ]);

  /**
   * If we want to render slides into window directly instead of redering it into container.
   */
  const useWindowSwiperMode = useMemo(() => false, []);

  const virtualizeSwiper = true;

  const brand = useMemo(() => {
    /** IHeart placement/embed IDs — shared across all IHeart-specific feature flags. */
    const IHEART_PLACEMENT_IDS = new Set([
      "69de71089f6934fe0ba22fb5",
      "69c2812fd98484cf6b83a5ba",
      "69de78f2d89621dcaa5e7d79",
      "69de7b51ede71540a7f10fd7",
      "69de7ea22e853bae28d73adb",
      "69de7ff541254f559233a72a",
      "69de824b41254f559233a8b1",
      "69de814d6778217d372a2308",
      "69de834da5228bc03bca779b",
    ]);
    const AD_INJECTION_PLACEMENT_IDS = new Set(["69e22226dd5806e4fb990a48"]);
    const IHEART_EMBED_IDS = new Set<string>([]);

    const isIheart =
      (!!embedData?.placement_id &&
        IHEART_PLACEMENT_IDS.has(embedData.placement_id)) ||
      (!!embedData?.embed_id && IHEART_EMBED_IDS.has(embedData.embed_id));

    const autoPageContext = isIheart;

    const shouldInjectExpandViewAds =
      (typeof window !== "undefined" &&
        window.location.hostname === "iheartvip.prototype.begenuin.com") ||
      (isIheart &&
        typeof window !== "undefined" &&
        window.location.hostname === "gendemo.b-cdn.net") ||
      (!!embedData?.placement_id &&
        AD_INJECTION_PLACEMENT_IDS.has(embedData.placement_id));

    const showIheartIframe = false;
    const isUsWeekly = brandDetails.brand_id === 2476;
    // const feedType: FeedType = embedData?.placement_id
    //   ? "PLACEMENT_SECTIONS"
    //   : "FEED_V1";
    const feedType: FeedType = "FEED_V1";
    return {
      // configuration to identify US Weekly brand
      isUsWeekly,
      isIndianExpress: brandDetails.brand_id === 2793,
      feedType,
      autoPageContext,
      showIheartIframe,
      shouldInjectExpandViewAds,
    };
  }, [brandDetails.brand_id]);

  const embedSwiperConfigs = useMemo(() => {
    return {
      useWindowSwiperMode,
      virtualizeSwiper,
      allowGestureScroll:
        embedContextData.embedData?.configs?.allowGestureScroll ?? true,
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
