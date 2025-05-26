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
  terms_and_condition?: string;
  reactions: ReactionType;
  show_become_creator: boolean;
  web_configs: WebConfigsType;
  web_cta: "login" | "app" | "both";
  white_label_url: string;
};

type WebConfigsType = {
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
