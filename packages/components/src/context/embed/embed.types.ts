// Define a type for the SDK API
export type SDKAPI = {
  initialize: (config: SDKConfig) => void;
  loadPage: (page: string) => void;
  setUser: (user: UserParam) => void;
};

export type SDKConfig = {
  embed?: number;
  brand_id?: number;
  hide_navbar?: number;
  api_key?: string;
  community?: string;
  loop?: string;
  video?: string;
  style?: "carousel" | "feed";
  subdomain?: string;
  embed_page?: string;
  embed_id?: string;
  brand_colors?: any;
  live_customization_data?: any;
  token?: string;
  name?: string;
  contextualParams?: {
    page_context?: string | null;
    geo?: {
      lat?: string | null;
      long?: string | null;
    };
    url?: string | null;
  };
  brand_ids?: number[];
  type?: "brand_feed" | "community_feed" | "loop_feed";
};

export type SDKInitConfig = {
  embed_id?: string;
  api_key?: string;
  token?: string;
};

type ReactionKey = {
  png: string;
  svg: string;
};

type ReactionKeys = {
  comment_selected: ReactionKey;
  comment_unselected: ReactionKey;
  feed_selected: ReactionKey;
  feed_unselected: ReactionKey;
  // feed_animate: ReactionKey
};

type ReactionType = {
  type: string;
  title: string;
  suffix: string;
  keys: ReactionKeys;
  tooltip: string;
};

type VideoAutoplayConfig = {
  type: number;
  auto_play_after: number;
};

type FeedVideoPlayConfig = {
  type: number;
  repeat_video: number;
  swipe_after: number;
};

type LinkoutDelayConfig = {
  /**
   * 1: Custom.
   *
   * 2: Immediately.
   */
  type: number;
  /**
   * appear_after is in seconds..
   */
  appear_after: number;
};

type PopupConfig = {
  enable: boolean;
  popup_after: number;
};

export type WebConfigsType = {
  video_autoplay: VideoAutoplayConfig;
  feed_video_play: FeedVideoPlayConfig;
  linkout_delay: LinkoutDelayConfig;
  login_signup_popup: PopupConfig;
  is_start_with_sound: boolean;
  interest_selection_popup: PopupConfig;
  username_popup: PopupConfig;
  complete_profile_popup: PopupConfig;
  idle_time_interruption: PopupConfig;
  video_aspect_ratio: string;
  tap_behavior: number;
  gesture_guidance: boolean;
  playback_speed_enabled: boolean;
  share_transcript_enabled?: boolean;
  get_app_popup?: PopupConfig;
};

type MobileConfigsType = {
  video_autoplay: VideoAutoplayConfig & {
    is_start_with_sound: boolean;
  };
  feed_video_play: FeedVideoPlayConfig;
  linkout_delay: LinkoutDelayConfig;
  login_signup_popup: PopupConfig;
  interest_selection_popup: PopupConfig;
  username_popup: PopupConfig;
  complete_profile_popup: PopupConfig;
  idle_time_interruption: PopupConfig;
  playback_speed_enabled: boolean;
  video_aspect_ratio: string;
  tap_behavior: number;
  share_transcript_enabled?: boolean;
  gesture_guidance: boolean;
  is_start_with_sound: boolean;
};

type SitemapConfigsType = {
  apple_app_site_association_config: {
    appclips: {
      apps: string[];
    };
    applinks: {
      details: Array<{
        appID: string;
        paths: string[];
      }>;
    };
  };
  asset_links_config: Array<{
    relation: string[];
    target: {
      namespace: string;
      package_name: string;
      sha256_cert_fingerprints: string[];
    };
  }>;
};

type CTAConfigType = {
  button_color: string;
  text_color: string;
  button_radius: number;
};

type DefaultEmbedType = {
  embed_layout: string;
  _id: string;
  name: string;
  style: ViewType;
  type: "brand_feed" | "community_feed" | "loop_feed";
  brand_id: number;
  is_default: boolean;
  customization: Partial<CustomizationType>;
  aspect_ratio: string;
  card_layout_id: number;
  video_layout_id: number;
};

export type BrandDetailsConfigType = {
  brand_id: number;
  type: number;
  is_claimed: boolean;
  website: string;
  name: string;
  status: number;
  subdomain: string;
  logo: string;
  created_at: number;
  integrations: {
    sdk: {
      web: {
        enable: boolean;
        hide_navbar: boolean;
      };
      android: {
        enable: boolean;
        playstore_link: string;
      };
      ios: {
        enable: boolean;
        appstore_link: string;
      };
    };
    white_label: {
      enable: boolean;
      allowed_domains: string[];
      test_allowed_domains: string[];
    };
  };
  brand_colors: {
    primary: {
      primary_100: string;
      primary_200: string;
      primary_300: string;
      primary_400: string;
      primary: string;
      primary_600: string;
      primary_700: string;
    };
    secondary: {
      secondary_300: string;
      secondary_400: string;
      secondary: string;
      secondary_600: string;
    };
    tertiary: {
      tertiary_100: string;
      tertiary_200: string;
      tertiary_300: string;
      tertiary_400: string;
      tertiary: string;
    };
  };
  brand_web_logo: string;
  favicon: string;
  is_wallet_enabled: boolean;
  global_reward_point_configs: {
    view: number;
    spark: number;
    comments: number;
    repost: number;
  };
  social_login: {
    google: boolean;
    apple: boolean;
    brand: boolean;
    brand_sso_id: string;
  };
  slogan: {
    text: string | null;
    image: string | null;
    font: {
      _id: string | null;
      weight: string | null;
      style: string | null;
    };
  };
  environment: string;
  privacy_policy?: string;
  terms_and_condition?: string | null;
  reactions: ReactionType;
  show_become_creator: boolean;
  web_configs: WebConfigsType;
  web_cta: "login" | "app" | "both";
  white_label_url: string;
  // New properties from testBrandDetails
  api_key?: string;
  is_interruption_disabled?: boolean;
  industry_type?: number;
  mobile_configs?: MobileConfigsType;
  sitemap_configs?: SitemapConfigsType;
  protected_content?: boolean;
  pin_limit?: {
    loop: number;
    loop_videos: number;
  };
  ad_configs?: {
    in_video_stream_frequency: number;
    feed_stream: boolean;
    in_video_stream: boolean;
    in_video_stream_type: string;
  };
  comment_type?: {
    text: boolean;
    video: boolean;
    audio: boolean;
  };
  fonts_config?: {
    size: number;
    fonts: {
      bold: string;
      bold_italic: string;
      demi_bold: string;
      demi_bold_italic: string;
      heavy: string;
      heavy_italic: string;
      medium: string;
      regular: string;
    };
  };
  language_configs?: {
    language_selection: string;
    default_language: string;
    supported_languages: Array<{
      language: string;
      last_updated_at: number;
    }>;
  };
  camera_enabled?: boolean;
  card_layout_id?: number;
  video_layout_id?: number;
  default_embeds?: DefaultEmbedType[];
  unsupported_feature_message?: {
    title: string;
    body: string;
  };
  cta_config?: CTAConfigType;
};

export type UserParam = {
  email: string;
  id: string;
  token: string;
  name: string;
  ip: string;
  thumb: string;
};

/**
 * Type of the auto user interaction to perform.
 *
 * - "spark": Represents a user giving a 'spark' (like/upvote) to a video or content.
 * - "comment-spark": Represents a user giving a 'spark' specifically to a comment.
 * - "repost": Represents a user reposting or sharing the content to their own feed or elsewhere.
 * - "comment": Represents a user adding a comment to the content.
 *
 * Use these types to specify which automatic user interaction should be performed in the embed context.
 */
type AutoUserInteractionToPerformType =
  | "spark"
  | "comment-spark"
  | "repost"
  | "comment";

type AuthInfoType = {
  signInUrl: string;
  signUpUrl: string;
};

export type EmbedDataType = {
  _id?: string;
  name: string;
  style: ViewType;
  type: "brand_feed" | "community_feed" | "loop_feed";
  brand_id: number;
  customization: Partial<CustomizationType>;
  embed_layout?: string;
  card_layout_id?: number;
  video_layout_id?: number;
  __v?: number;
  is_live?: boolean;
  embed_id?: string;
  placement_id?: string;
  style_id?: string;
  environment?: string;
  contextualParams?: SDKConfig["contextualParams"];
  elementId?: string;
  brand_ids?: number[];
  /**
   * The slug of the video to start with in the embed view.
   */
  startVideoSlug?: string;
  /**
   * Type of the auto user interaction to perform.
   */
  autoUserInteractionToPerform?: AutoUserInteractionToPerformType;
  authInfo?: AuthInfoType;
  is_default?: boolean;
  aspect_ratio?: string;
  enable_adaptive_video?: boolean;
  
  // Additional fields from PlacementDataResponse
  feed_type?: string;
  created_at?: string;
  updated_at?: string;
  styles?: PlacementStyle[];
  grid_layout?: {
    auto_adjust: boolean;
    column: number;
    row: number;
  };
  implementation_guide?: {
    is_on_page_context_fetch?: boolean;
    is_real_time_context_fetch?: boolean;
    show_brand_id?: boolean;
    show_community_group_id?: boolean;
    show_custom_context?: boolean;
    show_location?: boolean;
    show_pdp_url?: boolean;
    show_place?: boolean;
    show_posted_by_user?: boolean;
    show_style_id?: boolean;
    show_time?: boolean;
    show_user_interests?: boolean;
    show_user_segmentation?: boolean;
  };
  report_options?: {
    inappropriate_content?: boolean;
    non_professional_content?: boolean;
    other?: boolean;
    spam?: boolean;
    threatening_violent?: boolean;
  };
  enable_report?: boolean;
  enable_style_fallback?: boolean;
  is_show_video_thumbnail?: boolean;
  show_video_duration?: boolean;
  is_show_metrics?: boolean;
  placement_card_section_layout_id?: number;
  placement_card_layout_id?: number
  placement_video_layout_id?: number
  grid_auto_advance_playback?: number
  grid_enable_loop_video?: boolean
  show_linkout_in_expand?: boolean
};

export type CustomizationType = {
  dimensions: {
    auto_fit_height?: boolean
    width: number;
    height: number;
  };
  cta_button?: {
    text: string;
    url: string;
    color?: string;
    text_color?: string;
  } | null;
  links: {
    is_show_links: boolean;
    position: "overlay" | "outside";
  };
  autoplay: boolean;
  feed_display_pref?: string;
  heading?: string | null;
  sub_heading?: string | null;
  is_carousel_icon: boolean;
  is_floating_view: boolean;
  is_expanded_view?: boolean;
  is_show_username: boolean;
  is_show_view_count: boolean;
  is_loop_video: boolean;
  is_popup_view: boolean;
  is_show_social_interaction_data: boolean;
  heading_text_color?: string;
  sub_heading_text_color?: string;
  community_ids: string[];
  community_loop_ids: {
    loop_id: string;
    community_id: string;
  }[];
  brandColors?: Record<string, string>;
  element?: HTMLElement;
  view?: ViewType;
  enable_brand_click?: boolean;
  enable_community_click?: boolean;
  show_share_icon?: boolean;
  show_view_loop_button?: boolean;
  show_comments_section?: boolean;
  carousel_style?: "focus" | "default";
  is_enable_engagement_tools: boolean;
  enable_engagement_tools: {
    repost: boolean;
    spark: boolean;
    comment: boolean;
    share: boolean;
  };
  show_side_panel: boolean;
  show_join_community_button: boolean;
  show_navigation?: boolean;
  show_community_share_button: boolean;
  is_enable_redirection: boolean;
  enable_redirection_tools: {
    community: boolean;
    group: boolean;
    user: boolean;
  };
  is_show_popup_by_default?: boolean;
  theme?: "dark" | "light";
  video_crop?: boolean;
};

export type FeedVideoType = {
  community: {
    brand_id: number;
    color_code: string;
    description: string;
    handle: string;
    name: string;
    share_string: string;
    share_url: string;
    slug: string;
    text_color_code: string;
    type: number;
    uuid: string;
    dp: string;
    dp_l?: string;
    dp_m?: string;
    dp_s?: string;
    logged_in_user_role?: number;
    is_join_requested?: boolean;
    brand?: {
      brand_id: number;
      brand_slug: string;
      brand_user_logo: number;
      brand_web_logo: string;
      name: string;
    };
  };
  loop: {
    color_code: string;
    group_description: string;
    group_id: string;
    group_name: string;
    settings: {
      discoverable: boolean;
    };
    share_string: string;
    share_url: string;
    slug: string;
    type: number;
    uuid: string;
    is_subscriber?: boolean;
  };
  owner: {
    bio: string;
    brand?: {
      brand_id: number;
      brand_slug: string;
      brand_user_logo: number;
    };
    is_avatar: boolean;
    name: string;
    profile_image: string;
    profile_image_s?: string;
    profile_image_m?: string;
    profile_image_l?: string;
    share_url: string;
    username: string;
    uuid: string;
  };
  uuid: string;
  video: {
    clickable_url?: string | null;
    attached_link: string | null;
    conversation_at: number;
    description_data: string | null;
    description_text: string | null;
    linkouts: any;
    linkouts_id: string;
    linkouts_inappbrowser: boolean;
    media_url: string;
    media_url_m3u8: string;
    meta_data: {
      aspect_ratio: string;
      contains_external_videos: boolean;
      duration: string;
      media_type: string;
      resolution: string;
      size: string;
    };
    no_of_comments: number;
    no_of_shares: number;
    no_of_sparks: number;
    no_of_views: number;
    share_url: string;
    slug: string;
    sprite_image_url: string | null;
    thumbnail_url: string;
    thumbnail_url_l: string;
    thumbnail_url_s: string;
    uuid: string;
    video_summary: string | null;
    is_sparked?: boolean;
    is_read?: boolean;
    is_pinned?: boolean;
  };
};

export type User = {
  brand_id: number;
  user_id: string;
  name?: string | null;
  nickname: string;
  bio: string | null;
  is_new_message: boolean;
  is_avatar: boolean;
  is_brand_system_user: boolean;
  phone: string | null;
  profile_image: string;
  profile_image_s?: string | null;
  profile_image_m?: string | null;
  profile_image_l?: string | null;
  is_username_generated: boolean;
  email?: string | null;
  is_email_verified: boolean;
  platform_guidelines: boolean;
  community_walkthrough: boolean;
  onboarding_communities: boolean;
  onboarding_subscription: boolean;
  login_source: number;
  device_type: string;
  action_meta_data: string | null;
  is_user_signedup: boolean;
  ks_cb_request_status: number;
  onboarding_topics: boolean;
  brand_guidelines: boolean;
  device_uuid: string;
  accessToken: string;
  autoLoginToken: string;
};

export type AuthUser = {
  id: string;
  accessToken: string;
  bio?: string;
  email?: string;
  phoneNumber?: string;
  isAvatar: boolean;
  name: string;
  nickname: string;
  image: string;
  /**
   * Token to refresh accessToken.
   */
  refreshToken?: string;
  ksCbRequestStatus?: number;
  /**
   * if user is brand user.
   */
  isBrandSystemUser?: boolean;
  brandId?: string;
  brandSlug?: string;
  /**
   * Checks if use has already topics.
   */
  hasTopics?: boolean;
  birth?: string;
  usernameSet: boolean;
  autoLoginToken?: string;
  brandGuidelines?: boolean;
};

export type PlacementDataResponse = {
  __v: number;
  _id: string;
  brand_id: number;
  community_ids: string[];
  community_loop_ids: string[];
  created_at: string;
  environments: {
    app: PlacementEnvironmentConfig;
    web: PlacementEnvironmentConfig;
  };
  feed_type: string;
  is_live: boolean;
  name: string;
  placement_brand_ids: number[];
  styles: PlacementStyle[];
  type: "grid" | "carousel" | "feed" | "standard_wall" | "dynamic";
  updated_at: string;
};

export type PlacementEnvironmentConfig = {
  configure_view: {
    aspect_ratio: string;
    card_layout_id: number;
    carousel_style: "default" | "focus";
    dimensions: {
      auto_fit_height: boolean;
      height: number;
      width: number;
    };
    video_crop?: boolean;
    enable_style_fallback: boolean;
    grid_layout: {
      auto_adjust: boolean;
      column: number;
      row: number;
    };
    heading_text_color: string;
    is_carousel_icon: boolean;
    is_expanded_view: boolean;
    is_floating_view: boolean;
    is_show_metrics: boolean;
    is_show_social_interaction_data: boolean;
    is_show_username: boolean;
    is_show_video_thumbnail: boolean;
    is_show_view_count: boolean;
    media_play: {
      enable_autoplay: boolean;
      enable_loop_video?: boolean;
      auto_advance_playback?: number
    };
    placement_card_layout_id: number;
    placement_card_section_layout_id: number;
    placement_video_layout_id: number;
    show_community_share_button: boolean;
    show_join_community_button: boolean;
    show_links: boolean;
    show_navigation: boolean;
    show_social_interaction_data: boolean;
    show_username: boolean;
    show_video_duration: boolean;
    sub_heading_text_color: string;
    video_layout_id: number;
  };
  expand_view: {
    enable_engagement_tools: {
      comment: boolean;
      repost: boolean;
      share: boolean;
      spark: boolean;
    };
    enable_linkout: boolean;
    enable_redirection_tools: {
      community: boolean;
      group: boolean;
      user: boolean;
    };
    enable_report: boolean;
    is_enable_engagement_tools: boolean;
    is_enable_redirection: boolean;
    report_options: {
      inappropriate_content: boolean;
      non_professional_content: boolean;
      other: boolean;
      spam: boolean;
      threatening_violent: boolean;
    };
  };
  implementation_guide: {
    is_on_page_context_fetch: boolean;
    is_real_time_context_fetch: boolean;
    show_brand_id: boolean;
    show_community_group_id: boolean;
    show_custom_context: boolean;
    show_location: boolean;
    show_pdp_url: boolean;
    show_place: boolean;
    show_posted_by_user: boolean;
    show_style_id: boolean;
    show_time: boolean;
    show_user_interests: boolean;
    show_user_segmentation: boolean;
  };
};

export type PlacementStyle = {
  _id: string;
  categories: string[];
  consumer_journey_ids: string[];
  content_mapping: {
    unique_linkout_videos: boolean;
    unique_videos_to_sections: boolean;
  };
  content_restrictions: {
    pinned_videos: boolean;
    recommendation_engine: boolean;
    same_brand_videos: boolean;
    same_url_linkouts_videos: boolean;
  };
  is_adaptive_styling_enabled: boolean;
  sections: PlacementSection[];
  sub_title: string | null;
  title: string;
};

export type PlacementSection = {
  _id: string;
  description: string;
  position: number;
  title: string;
};

export type EnvironmentConfig = {
  configure_view: {
    dimensions: {
      auto_fit_height: boolean;
      height: number;
      width: number;
    };
    enable_adaptive_video: boolean;
    enable_style_fallback: boolean;
    grid_layout: {
      auto_adjust: boolean;
      height: number;
      width: number;
    };
    heading_text_color: string;
    media_play: {
      enable_autoplay: boolean;
    };
    show_links: boolean;
    show_social_interaction_data: boolean;
    show_username: boolean;
    show_video_duration: boolean;
    social_metrics: string;
    sub_heading_text_color: string;
  };
  expand_view: {
    enable_engagement: boolean;
    enable_linkout: boolean;
    enable_redirection: boolean;
    enable_report: boolean;
    redirection_tools: {
      community: boolean;
      group: boolean;
      user: boolean;
    };
    report_options: {
      inappropriate_content: boolean;
      non_professional_content: boolean;
      other: boolean;
      spam: boolean;
      threatening_violent: boolean;
    };
    social_counts: {
      comment: boolean;
      reaction: boolean;
      repost: boolean;
      share: boolean;
    };
  };
  implementation_guide: {
    show_brand_id: boolean;
    show_community_group_id: boolean;
    show_custom_context: boolean;
    show_location: boolean;
    show_pdp_url: boolean;
    show_place: boolean;
    show_posted_by_user: boolean;
    show_style_id: boolean;
    show_time: boolean;
    show_user_interests: boolean;
    show_user_segmentation: boolean;
  };
};
export type Style = {
  _id: string;
  categories: string[];
  consumer_journey_ids: string[];
  content_mapping: {
    unique_linkout_videos: boolean;
    unique_videos_to_sections: boolean;
  };
  content_restrictions: {
    pinned_videos: boolean;
    recommendation_engine: boolean;
    same_brand_videos: boolean;
    same_url_linkouts_videos: boolean;
  };
  is_adaptive_styling_enabled: boolean;
  sections: Section[];
  title: string;
};
export type Section = {
  description: string;
  position: number;
  title: string;
};

export type CommunityJoinStatusType =
  | "unjoined"
  | "joined"
  | "requested"
  | "leader";

export type ViewType =
  | "feed"
  | "carousel"
  | "standard_wall"
  | "grid"
  | "dynamic";

export type SizeBoxType = { height: number; width: number };

export type FeedType = "HOME" | "POPULAR" | "LATEST";

/**
 * Return type for fetchFeed.
 */
export type FetchFeedReturnType = { videos: FeedVideoType[]; end: boolean };
