import type { EmbedDataType } from "../src/context/embed/embed.types";
export declare const testBrandDetails: {
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
      };
      ios: {
        enable: boolean;
      };
    };
    white_label: {
      enable: boolean;
      allowed_domains: never[];
      test_allowed_domains: never[];
    };
  };
  brand_colors: {
    primary: {
      primary: string;
      primary_100: string;
      primary_200: string;
      primary_300: string;
      primary_400: string;
      primary_600: string;
      primary_700: string;
    };
    secondary: {
      secondary: string;
      secondary_300: string;
      secondary_400: string;
      secondary_600: string;
    };
    tertiary: {
      tertiary: string;
      tertiary_100: string;
      tertiary_200: string;
      tertiary_300: string;
      tertiary_400: string;
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
    brand_sso_id: null;
  };
  web_cta: string;
  is_interruption_disabled: boolean;
  show_become_creator: boolean;
  api_key: string;
  reactions: {
    type: string;
    title: string;
    suffix: string;
    tooltip: string;
    keys: {
      comment_selected: {
        png: string;
        svg: string;
      };
      comment_unselected: {
        png: string;
        svg: string;
      };
      feed_animate: {
        png: string;
        svg: string;
      };
      feed_selected: {
        png: string;
        svg: string;
      };
      feed_unselected: {
        png: string;
        svg: string;
      };
      social_count_black: {
        png: string;
        svg: string;
      };
      social_count_white: {
        png: string;
        svg: string;
      };
    };
  };
  privacy_policy: null;
  industry_type: number;
  terms_and_condition: null;
  mobile_configs: {
    video_autoplay: {
      type: number;
      auto_play_after: number;
      is_start_with_sound: boolean;
    };
    feed_video_play: {
      type: number;
      repeat_video: number;
      swipe_after: number;
    };
    linkout_delay: {
      type: number;
      appear_after: number;
    };
    login_signup_popup: {
      enable: boolean;
      popup_after: number;
    };
    interest_selection_popup: {
      enable: boolean;
      popup_after: number;
    };
    username_popup: {
      enable: boolean;
      popup_after: number;
    };
    complete_profile_popup: {
      enable: boolean;
      popup_after: number;
    };
    idle_time_interruption: {
      enable: boolean;
      popup_after: number;
    };
    playback_speed_enabled: boolean;
    video_aspect_ratio: string;
    tap_behavior: number;
    share_transcript_enabled: boolean;
    gesture_guidance: boolean;
    is_start_with_sound: boolean;
    resume_playback_from: number;
  };
  web_configs: {
    share_transcript_enabled: boolean;
    playback_speed_enabled: boolean;
    video_aspect_ratio: string;
    video_autoplay: {
      type: number;
      auto_play_after: number;
      is_start_with_sound: boolean;
    };
    feed_video_play: {
      type: number;
      repeat_video: number;
      swipe_after: number;
    };
    tap_behavior: number;
    linkout_delay: {
      type: number;
      appear_after: number;
    };
    login_signup_popup: {
      enable: boolean;
      popup_after: number;
    };
    get_app_popup: {
      enable: boolean;
      popup_after: number;
    };
    interest_selection_popup: {
      enable: boolean;
      popup_after: number;
    };
    username_popup: {
      enable: boolean;
      popup_after: number;
    };
    complete_profile_popup: {
      enable: boolean;
      popup_after: number;
    };
    idle_time_interruption: {
      enable: boolean;
      popup_after: number;
    };
    gesture_guidance: boolean;
    is_start_with_sound: boolean;
    resume_playback_from: number;
  };
  sitemap_configs: {
    asset_links_config: never[];
  };
  white_label_url: string;
  protected_content: boolean;
  pin_limit: {
    loop: number;
    loop_videos: number;
  };
  ad_configs: {
    feed_stream: boolean;
    in_video_stream: boolean;
  };
  comment_type: {
    text: boolean;
    video: boolean;
    audio: boolean;
  };
  camera_enabled: boolean;
  default_embeds: never[];
  slogan: {
    text: null;
    image: null;
    font: {
      _id: null;
      style: null;
      weight: null;
    };
  };
  environment: string;
  cta_config: {
    button_color: string;
    text_color: string;
    button_radius: number;
    show_arrow_icon: boolean;
    default_button_text: string;
  };
  join_enabled: boolean;
  subscribe_enabled: boolean;
  post_enabled: boolean;
  is_socket_enabled: boolean;
  create_post_enabled: boolean;
  track_observability_enabled: boolean;
};
export declare const testEmbedData: EmbedDataType;
//# sourceMappingURL=test-data.d.ts.map
