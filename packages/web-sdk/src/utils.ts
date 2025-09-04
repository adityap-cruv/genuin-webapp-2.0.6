import { AuthUser } from '@genuin/components/types/auth'
import {
  EmbedDataType,
  PlacementDataResponse,
} from '@genuin/components/context/embed/embed.types'

export function parseUserData(
  userData: any,
  accessToken: string,
  refreshToken?: string,
): AuthUser {
  return {
    id: userData.user_id,
    isAvatar: userData.is_avatar,
    phoneNumber: userData.phone,
    nickname: userData.nickname,
    image: userData.profile_image,
    email: userData.email,
    bio: userData.bio,
    name: userData.name,
    ksCbRequestStatus: userData.ks_cb_request_status,
    isBrandSystemUser: userData.is_brand_system_user,
    brandId: userData.brand_id ?? userData.brand?.brand_id,
    accessToken,
    brandSlug: userData?.brand?.brand_slug ? userData?.brand?.brand_slug : null,
    hasTopics: userData.onboarding_topics,
    // brandGuidelines: userData.brand_guidelines,
    refreshToken,
    birth: userData.birthday,
    usernameSet: !userData.is_username_generated,
  }
}

/**
 * Converts PlacementDataResponse to EmbedDataType format.
 *
 * This function maps all available data from PlacementDataResponse to EmbedDataType,
 * ensuring comprehensive data transfer while handling missing fields gracefully.
 *
 * Mappings include:
 * - Basic placement info (_id, name, type, brand_id, etc.)
 * - Web environment configuration (dimensions, engagement tools, redirection tools)
 * - Video and media settings (autoplay, carousel style, aspect ratio)
 * - UI visibility settings (username, social interactions, navigation)
 * - Community and layout configurations
 * - Adaptive video and style fallback settings
 *
 * @param data - PlacementDataResponse containing placement configuration
 * @returns EmbedDataType with all available data mapped
 */
export function parsePlacementToEmbedData(
  data: PlacementDataResponse,
  styleId: string,
): EmbedDataType {
  const webConfig = data.environments?.web
  const configureView = webConfig?.configure_view
  const expandView = webConfig?.expand_view

  return {
    // Direct mapping from PlacementDataResponse
    _id: data._id,
    name: data.name,
    style: data.type ?? 'grid',
    type: (data.feed_type as EmbedDataType['type']) ?? 'loop_feed',
    brand_id: data.brand_id,
    __v: data.__v,
    is_live: data.is_live,

    // Map brand_ids from placement_brand_ids
    brand_ids: data.placement_brand_ids,

    // Map aspect ratio from configure_view
    aspect_ratio: configureView?.aspect_ratio,

    // Map adaptive video setting
    enable_adaptive_video: configureView?.enable_adaptive_video,

    // Map layout IDs properly
    card_layout_id: configureView?.card_layout_id ?? 1,
    video_layout_id: configureView?.video_layout_id ?? 1,

    placement_card_layout_id: configureView?.placement_card_layout_id,
    placement_video_layout_id: configureView?.placement_video_layout_id,
    placement_card_section_layout_id:
      configureView?.placement_card_section_layout_id,

    customization: {
      // Dimensions mapping
      dimensions: {
        auto_fit_height: configureView?.dimensions.auto_fit_height,
        width: configureView?.dimensions?.width ?? 0,
        height: configureView?.dimensions?.height ?? 0,
      },

      // CTA button (not present in PlacementDataResponse, keeping as null)
      cta_button: null,

      // Engagement tools mapping from expand_view
      enable_engagement_tools: {
        repost: expandView?.enable_engagement_tools?.repost ?? false,
        spark: expandView?.enable_engagement_tools?.spark ?? false,
        comment: expandView?.enable_engagement_tools?.comment ?? false,
        share: expandView?.enable_engagement_tools?.share ?? false,
      },

      // Redirection tools mapping from expand_view
      enable_redirection_tools: {
        community: expandView?.enable_redirection_tools?.community ?? false,
        group: expandView?.enable_redirection_tools?.group ?? false,
        user: expandView?.enable_redirection_tools?.user ?? false,
      },

      // Links configuration
      links: {
        is_show_links: configureView?.show_links ?? false,
        position: 'overlay' as const, // Default as PlacementDataResponse doesn't have position
      },

      // Carousel style mapping
      carousel_style: configureView?.carousel_style ?? 'default',

      // Media play settings
      autoplay: configureView?.media_play?.enable_autoplay ?? false,

      // Display preferences
      feed_display_pref: 'default',

      // Heading and sub-heading from styles
      heading:
        data.styles?.find((style) => style._id === styleId)?.title || null,
      heading_text_color: configureView?.heading_text_color,
      sub_heading:
        data.styles?.find((style) => style._id === styleId)?.sub_title || null,
      sub_heading_text_color: configureView?.sub_heading_text_color,

      // UI element visibility
      is_carousel_icon: configureView?.is_carousel_icon ?? false,
      is_floating_view: configureView?.is_floating_view ?? false,
      is_expanded_view: configureView?.is_expanded_view ?? false,
      is_show_username:
        // configureView?.is_show_username ??
        // configureView?.show_username ??
        false,
      is_show_view_count:
        // configureView?.is_show_view_count ??
        false,
      is_show_social_interaction_data:
        // configureView?.is_show_social_interaction_data ??
        // configureView?.show_social_interaction_data ??
        false,

      // Video settings
      is_loop_video: false, // Not directly available in PlacementDataResponse
      is_popup_view: false, // Not available in PlacementDataResponse
      video_crop: false, // Not available in PlacementDataResponse

      // Engagement and redirection flags
      is_enable_engagement_tools:
        expandView?.is_enable_engagement_tools ?? false,
      is_enable_redirection: expandView?.is_enable_redirection ?? false,

      // Community and navigation settings
      show_side_panel: false, // Not available in PlacementDataResponse
      show_join_community_button:
        configureView?.show_join_community_button ?? false,
      show_community_share_button:
        configureView?.show_community_share_button ?? false,
      show_navigation: configureView?.show_navigation ?? false,

      // Additional show settings available in CustomizationType
      show_share_icon: false, // Not available in PlacementDataResponse
      show_view_loop_button: false, // Not available in PlacementDataResponse
      show_comments_section: false, // Not available in PlacementDataResponse

      // Brand and community interaction settings
      enable_brand_click: false, // Not available in PlacementDataResponse
      enable_community_click: false, // Not available in PlacementDataResponse

      // Popup settings
      is_show_popup_by_default: false, // Not available in PlacementDataResponse

      // Theme setting (not available in PlacementDataResponse)
      // theme: 'light' as const,

      // Community data
      community_ids: data.community_ids,
      community_loop_ids: data.community_loop_ids.map((id) => ({
        loop_id: id,
        community_id: id, // Assuming same ID, adjust if different structure
      })),
    },

    // Additional placement-specific data that might be useful
    // placement_id: data._id, // Store original placement ID
    // environment: 'web', // Since we're using web config

    // Styles information (first style if available)
    // style_id: data.styles?.[0]?._id,

    // New fields mapped from PlacementDataResponse
    feed_type: data.feed_type,
    created_at: data.created_at,
    updated_at: data.updated_at,
    styles: data.styles,

    // Grid layout configuration
    grid_layout: configureView?.grid_layout
      ? {
          auto_adjust: configureView.grid_layout.auto_adjust,
          column: configureView.grid_layout.column,
          row: configureView.grid_layout.row,
        }
      : undefined,
    grid_auto_advance_playback:
      configureView.media_play.auto_advance_playback ?? 3,
    grid_enable_loop_video: configureView.media_play.enable_loop_video ?? false,

    // Implementation guide settings
    implementation_guide: webConfig?.implementation_guide
      ? {
          is_on_page_context_fetch:
            webConfig.implementation_guide.is_on_page_context_fetch,
          is_real_time_context_fetch:
            webConfig.implementation_guide.is_real_time_context_fetch,
          show_brand_id: webConfig.implementation_guide.show_brand_id,
          show_community_group_id:
            webConfig.implementation_guide.show_community_group_id,
          show_custom_context:
            webConfig.implementation_guide.show_custom_context,
          show_location: webConfig.implementation_guide.show_location,
          show_pdp_url: webConfig.implementation_guide.show_pdp_url,
          show_place: webConfig.implementation_guide.show_place,
          show_posted_by_user:
            webConfig.implementation_guide.show_posted_by_user,
          show_style_id: webConfig.implementation_guide.show_style_id,
          show_time: webConfig.implementation_guide.show_time,
          show_user_interests:
            webConfig.implementation_guide.show_user_interests,
          show_user_segmentation:
            webConfig.implementation_guide.show_user_segmentation,
        }
      : undefined,

    // Report options and settings
    report_options: expandView?.report_options
      ? {
          inappropriate_content:
            expandView.report_options.inappropriate_content,
          non_professional_content:
            expandView.report_options.non_professional_content,
          other: expandView.report_options.other,
          spam: expandView.report_options.spam,
          threatening_violent: expandView.report_options.threatening_violent,
        }
      : undefined,

    enable_report: expandView?.enable_report,
    enable_style_fallback: configureView?.enable_style_fallback,
    is_show_video_thumbnail: configureView?.is_show_video_thumbnail,
    show_video_duration: configureView?.show_video_duration,
    is_show_metrics: configureView?.is_show_metrics,
  }
}

export function getRandomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
