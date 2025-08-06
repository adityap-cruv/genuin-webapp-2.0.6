import { useEmbedContext } from "@genuin/components/context/embed";
import { useBaseContext } from "@genuin/components/context/base";
import { useMemo } from "react";
import { isCheckFifthVideoType } from "@genuin/components/lib/utils";

const MIN_EMBED_WIDTH = 232;
const MIN_EMBED_HEIGHT = 350;

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
    };
  }

  const { customization, rootElement } = embedContextData;
  const { brandDetails } = useBaseContext();

  // ============================================================
  // Dimensions Configuration
  // ============================================================
  const dimensionsConfig = useMemo(
    () => ({
      containerHeight: customization?.dimensions?.height,
      containerWidth: customization?.dimensions?.width,
      hasMinimumWidth: rootElement
        ? rootElement.offsetWidth >= MIN_EMBED_WIDTH
        : true,
      hasMinimumHeight: rootElement
        ? rootElement.offsetHeight >= MIN_EMBED_HEIGHT
        : true,
    }),
    [customization?.dimensions, rootElement]
  );

  // ============================================================
  // View Type Configuration (feed/carousel)
  // ============================================================
  const viewConfig = useMemo(
    () => ({
      isFeed: customization?.view === "feed",
      isCarousel: customization?.view === "carousel",
      isFocusCarouselStyle:
        customization?.view === "carousel" &&
        customization?.carousel_style === "focus",
      isFloatingView: !!customization?.is_floating_view,
      isPopupView: !!customization?.is_popup_view,
      isShowPopupByDefault: !!customization?.is_show_popup_by_default,
      theme: customization?.theme || "light",
      carouselStyle: customization?.carousel_style,
      showCarouselIcon: !!customization?.is_carousel_icon,
      showNavigation: !!customization?.show_navigation,
    }),
    [customization]
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
      playVideoInLoop: !!customization?.is_loop_video,
      autoplay: !!customization?.autoplay,
      showBorderAroundVideo: !(
        isCheckFifthVideoType(brandDetails.brand_id) &&
        customization?.view === "carousel"
      ),
      showViewLoopButton: !!customization?.show_view_loop_button,
    }),
    [customization, brandDetails.brand_id]
  );

  // ============================================================
  // Community & Content Configuration
  // ============================================================
  const communityConfig = useMemo(
    () => ({
      communityIds: customization?.community_ids || [],
      communityLoopIds: customization?.community_loop_ids || [],
      showJoinCommunityButton: !!customization?.show_join_community_button,
      showCommunityShareButton: !!customization?.show_community_share_button,
      enableCommunityClick: !!customization?.enable_community_click,
      enableBrandClick: !!customization?.enable_brand_click,
      showUserName: !!customization?.is_show_username,
      showViewCount:
        !!customization?.is_show_view_count &&
        !customization.is_show_social_interaction_data,
    }),
    [customization]
  );

  // ============================================================
  // Compute showEngagementOnRootElement once, used in both the flattened return and engagementConfig
  // ============================================================
  const showEngagementOnRootElement = useMemo(() => {
    if (!customization || !rootElement) return false;
    // Check for feed view with minimum width requirement
    if (
      customization?.view === "feed" &&
      rootElement.offsetWidth < MIN_EMBED_WIDTH
    ) {
      return false;
    }
    // Check for carousel view with minimum height requirement
    if (
      customization?.view === "carousel" &&
      rootElement.offsetHeight < MIN_EMBED_HEIGHT
    ) {
      return false;
    }

    return true;
  }, [customization, rootElement]);

  // ============================================================
  // Engagement & Interaction Configuration
  // ============================================================
  const engagementConfig = useMemo(() => {
    return {
      showEngagementOnRootElement,
      showEngagementTools: !!customization?.is_enable_engagement_tools,
      engagementTools: customization?.enable_engagement_tools || {
        repost: true,
        spark: true,
        comment: true,
        share: true,
      },
      showSocialInteractionData:
        !!customization?.is_show_social_interaction_data,
      showShareIcon: !!customization?.show_share_icon,
      showCommentsSection: !!customization?.show_comments_section,
      showSidePanel: !!customization?.show_side_panel,
      isEnableRedirection: !!customization?.is_enable_redirection,
      redirectionTools: customization?.enable_redirection_tools || {
        community: true,
        group: true,
        user: true,
      },
    };
  }, [customization, rootElement, viewConfig, dimensionsConfig]);

  // ============================================================
  // Link Configuration
  // ============================================================
  const linkConfig = useMemo(
    () => ({
      showLinks: customization?.links?.is_show_links || false,
      linkPosition: customization?.links?.position || "outside",
      showLinkOutside:
        customization?.links?.is_show_links &&
        customization?.links?.position === "outside",
      showLinkInside:
        customization?.links?.is_show_links &&
        customization?.links?.position === "overlay",
    }),
    [customization]
  );

  // ============================================================
  // Styling Configuration
  // ============================================================
  const stylingConfig = useMemo(
    () => ({
      brandColors: customization?.brandColors || {},
      isOpacityDown: viewConfig.isFocusCarouselStyle,
      showDataOutside:
        engagementConfig.showSocialInteractionData || linkConfig.showLinks,
    }),
    [customization, viewConfig, engagementConfig, linkConfig]
  );

  // ============================================================
  // Expand View Configuration
  // ============================================================
  const expandView = useMemo(() => {
    return { enable: customization?.is_popup_view };
  }, [customization]);

  return {
    dimensions: dimensionsConfig,
    view: viewConfig,
    header: headerConfig,
    video: videoConfig,
    community: communityConfig,
    engagement: engagementConfig,
    links: linkConfig,
    styling: stylingConfig,
    expanViewConfig: expandView,
  };
}
