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
  track_observability_enabled?: boolean;
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

type WebConfigsType = {
  resume_playback_from: -1 | 0 | 3 | 5;
  /**
   * Video autoplay behaviour config.
   */
  video_autoplay: VideoAutoplayConfig;
  /**
   * Depicts how video will play in feed. If loop or swipe to next video.
   */
  feed_video_play: FeedVideoPlayConfig;
  linkout_delay: LinkoutDelayConfig;
  get_app_popup: PopupConfig;
  /**
   * If there is get_app_popup then show this popup.
   * If user is not logged in then show login/signup popup.
   * If user is logged in and has not selected interest then show interest selection popup.
   * If user is logged in and has selected interest then show username popup.
   * If user is logged in and has selected interest and username then show complete profile popup.
   */
  login_signup_popup: PopupConfig;
  interest_selection_popup: PopupConfig;
  username_popup: PopupConfig;
  complete_profile_popup: PopupConfig;
  idle_time_interruption: PopupConfig;
  /**
   * Start with sound if true.
   */
  is_start_with_sound: boolean;
  video_aspect_ratio: string;
  /**
   * 1: Tap to mute/unmute.
   *
   * 2: Tap to play/pause.
   *
   * 3: Tap to unmute and than play/pause.
   */
  tap_behavior: number;
  gesture_guidance: boolean;
  playback_speed_enabled?: boolean;
  /**
   * Enable transcript sharing if true.
   */
  share_transcript_enabled?: boolean;
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
  social_count_white: ReactionKey;
  social_count_black: ReactionKey;
  feed_animate: ReactionKey;
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
  show_arrow_icon?: boolean;
  default_button_text?: string;
};

type ViewType = "feed" | "carousel" | "standard_wall";

type DefaultEmbedType = {
  embed_layout: string;
  _id: string;
  name: string;
  style: ViewType;
  type: "brand_feed" | "community_feed" | "loop_feed";
  brand_id: number;
  is_default: boolean;
  customization: Partial<{
    dimensions: {
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
      position: "overlay" | "outside" | "";
    };
    autoplay: boolean;
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
    feed_display_pref?: string;
    show_navigation: boolean;
    carousel_style?: string;
    video_crop?: boolean;
    enable_engagement_tools: {
      octo: boolean;
      repost: boolean;
      spark: boolean;
      comment: boolean;
      share: boolean;
    };
    is_enable_engagement_tools: boolean;
    show_side_panel: boolean;
    show_join_community_button: boolean;
    show_community_share_button: boolean;
    enable_redirection_tools?: {
      community: boolean;
      group: boolean;
      user: boolean;
    } | null;
    is_enable_redirection: boolean;
  }>;
  aspect_ratio: string;
  card_layout_id: number;
  video_layout_id: number;
};
