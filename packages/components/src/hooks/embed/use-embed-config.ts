import { useEmbedContext } from "@genuin/components/context/embed";
import { useBaseContext } from "@genuin/components/context/base";
import { useMemo } from "react";
import { useDeviceDetectMediaQuery } from "../use-devide-detect-media-query";
import type { CustomizationType } from "@genuin/components/context/embed/embed.types";

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
  const { customization, rootElement, embedData } = embedContextData;
  const { brandDetails, isEmbed } = useBaseContext();
  const { isMobile } = useDeviceDetectMediaQuery();

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
  const viewConfig = useMemo(
    () => ({
      embedStyle: embedData?.style,
      isFeed: embedData?.style === "feed",
      isCarousel: embedData?.style === "carousel",
      isStandardWall: embedData?.style === "standard_wall",
      isGrid: embedData?.style === "grid",
      isPlacementView: !!embedData?.placement_id,
      showCarouselIcon: !!customization?.is_carousel_icon,
      showNavigation: embedData?.card_layout_id !== 3,
      isFloatingView: !!customization?.is_floating_view,
      isExpandedView: !!customization?.is_expanded_view,
      feedDisplayPreference: customization?.feed_display_pref || "default",
      carouselStyle: customization?.carousel_style || "default",
      showViewLoopButton: !!customization?.show_view_loop_button,
      isShowPopupByDefault: !!customization?.is_show_popup_by_default,
      theme: customization?.theme || "light",
      enableAdaptiveVideo: embedData?.enable_adaptive_video || false,
      gridLayout: embedData?.grid_layout || undefined,
    }),
    [customization, embedData?.style]
  );

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
    [customization]
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
        ? embedData?.media_play?.enable_autoplay
        : !!customization?.autoplay,
      moveToNextTime: embedData?.media_play?.auto_advance_playback ?? 0,
      showBorderAroundVideo:
        !!customization?.is_enable_engagement_tools ||
        (customization?.links?.is_show_links &&
          customization?.links?.position === "outside")
          ? true
          : false,
      videoCrop: !!customization?.video_crop,
    }),
    [customization, brandDetails.brand_id, embedData?.style]
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
    [customization]
  );

  // ============================================================
  // Compute showEngagementOnRootElement once, used in both the flattened return and engagementConfig
  // ============================================================
  const showEngagementOnRootElement = useMemo(() => {
    if (!customization || !rootElement) return false;

    const currentWidth = rootElement.offsetWidth;
    const currentHeight = rootElement.offsetHeight;
    const currentStyle = embedData?.style;
    const gridColumn = embedData?.grid_layout?.column ?? 0;

    // Check if the current embed style has minimum size requirements
    switch (currentStyle) {
      case "feed":
        return (
          currentWidth >= MIN_EMBED_WIDTH && currentHeight >= MIN_EMBED_HEIGHT
        );

      case "carousel":
        return (
          currentWidth >= MIN_EMBED_WIDTH && currentHeight >= MIN_EMBED_HEIGHT
        );

      case "grid":
        return (
          !!gridColumn && currentWidth / gridColumn >= MIN_GRID_VIDEO_WIDTH
        );

      default:
        return true;
    }
  }, [
    customization,
    rootElement,
    embedData?.style,
    embedData?.grid_layout?.column,
  ]);

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
      repost: true,
      spark: true,
      comment: true,
      share: true,
    };
    const disabledEngagementTools = {
      repost: false,
      spark: false,
      comment: false,
      share: false,
    };
    // Use customized engagement tools if provided, otherwise fallback to defaults
    const engagementTools = showEngagementTools
      ? (customization?.enable_engagement_tools ?? defaultEngagementTools)
      : disabledEngagementTools;

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
      showEngagementOnRootElement,
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
  }, [customization, rootElement, showEngagementOnRootElement]);

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
    [customization, embedData]
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
    ]
  );

  // ============================================================
  // Expand View Configuration
  // ============================================================
  const expandView = useMemo(() => {
    return {
      enable: customization?.is_popup_view ?? true,
      isShowByDefault: !!customization?.is_show_popup_by_default,
    };
  }, [customization]);

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
        embedContextData.embedData?.style === "grid",
    };
  }, [
    embedContextData.embedData?.style,
    embedContextData.embedData?.card_layout_id,
  ]);

  return {
    dimensions: dimensionsConfig,
    view: viewConfig,
    header: headerConfig,
    video: videoConfig,
    community: communityConfig,
    engagement: engagementConfig,
    links: linkConfig,
    styling: stylingConfig,
    expandViewConfig: expandView,
    layoutConfig,
    modalConfig,
    rawCustomization: customization as CustomizationType | null,
    embedStyle: viewConfig.embedStyle,
  };
}
