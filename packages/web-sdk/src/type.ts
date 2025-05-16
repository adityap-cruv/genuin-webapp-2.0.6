// Define a type for the SDK API
export type SDKAPI = {
  initialize: (config: SDKConfig) => void
  loadPage: (page: string) => void
  setUser: (user: UserParam) => void
}

export type SDKConfig = {
  embed?: number
  brand_id?: number
  hide_navbar?: number
  api_key?: string
  community?: string
  loop?: string
  video?: string
  style?: 'carousel' | 'feed'
  subdomain?: string
  embed_page?: string
  embed_id?: string
  brand_colors?: any
  live_customization_data?: any
  token?: string
  name?: string
  type?: 'brand_feed' | 'community_feed' | 'loop_feed'
}

export type SDKInitConfig = {
  embed_id?: string
  api_key?: string
  token?: string
}

type ReactionKey = {
  png: string
  svg: string
}

type ReactionKeys = {
  comment_selected: ReactionKey
  comment_unselected: ReactionKey
  feed_selected: ReactionKey
  feed_unselected: ReactionKey
  // feed_animate: ReactionKey
}

type ReactionType = {
  type: string
  title: string
  suffix: string
  keys: ReactionKeys
  tooltip: string
}

type VideoAutoplayConfig = {
  type: number
  auto_play_after: number
}

type FeedVideoPlayConfig = {
  type: number
  repeat_video: number
  swipe_after: number
}

type LinkoutDelayConfig = {
  /**
   * 1: Custom.
   *
   * 2: Immediately.
   */
  type: number
  /**
   * appear_after is in seconds..
   */
  appear_after: number
}

type PopupConfig = {
  enable: boolean
  popup_after: number
}

export type WebConfigsType = {
  video_autoplay: VideoAutoplayConfig
  feed_video_play: FeedVideoPlayConfig
  linkout_delay: LinkoutDelayConfig
  login_signup_popup: PopupConfig
  is_start_with_sound: boolean
  interest_selection_popup: PopupConfig
  username_popup: PopupConfig
  complete_profile_popup: PopupConfig
  idle_time_interruption: PopupConfig
  video_aspect_ratio: string
  tap_behavior: number
  gesture_guidance: boolean
}

export type BrandDetailsConfigType = {
  brand_id: number
  type: number
  is_claimed: boolean
  website: string
  name: string
  status: number
  subdomain: string
  logo: string
  created_at: number
  integrations: {
    sdk: {
      web: {
        enable: boolean
        hide_navbar: boolean
      }
      android: {
        enable: boolean
        playstore_link: string
      }
      ios: {
        enable: boolean
        appstore_link: string
      }
    }
    white_label: {
      enable: boolean
      allowed_domains: string[]
      test_allowed_domains: string[]
    }
  }
  brand_colors: {
    primary: {
      primary_100: string
      primary_200: string
      primary_300: string
      primary_400: string
      primary: string
      primary_600: string
      primary_700: string
    }
    secondary: {
      secondary_300: string
      secondary_400: string
      secondary: string
      secondary_600: string
    }
    tertiary: {
      tertiary_100: string
      tertiary_200: string
      tertiary_300: string
      tertiary_400: string
      tertiary: string
    }
  }
  brand_web_logo: string
  favicon: string
  is_wallet_enabled: boolean
  global_reward_point_configs: {
    view: number
    spark: number
    comments: number
    repost: number
  }
  social_login: {
    google: boolean
    apple: boolean
    brand: boolean
    brand_sso_id: string
  }
  slogan: {
    text: string | null
    image: string | null
    font: {
      _id: string | null
      weight: string | null
      style: string | null
    }
  }
  environment: string
  privacy_policy?: string
  terms_and_condition?: string
  reactions: ReactionType
  show_become_creator: boolean
  web_configs: WebConfigsType
}

export type UserParam = {
  email: string
  id: string
  token: string
  name: string
  ip: string
  thumb: string
}

export type EmbedDataType = {
  name: string
  style: ViewType
  type: 'brand_feed' | 'community_feed' | 'loop_feed'
  brand_id: string
  customization: Partial<CustomizationType>
  embed_id: string
  brandDetails: BrandDetailsConfigType
  environment: string
}

export type CustomizationType = {
  dimensions: {
    width: number
    height: number
  }
  cta_button?: {
    text: string
    url: string
    color?: string
    text_color?: string
  } | null
  links: {
    is_show_links: boolean
    position: 'overlay' | 'outside'
  }
  autoplay: boolean
  heading?: string | null
  sub_heading?: string | null
  is_carousel_icon: boolean
  is_floating_view: boolean
  is_show_username: boolean
  is_show_view_count: boolean
  is_loop_video: boolean
  is_popup_view: boolean
  is_show_social_interaction_data: boolean
  heading_text_color?: string
  sub_heading_text_color?: string
  community_ids: string[]
  community_loop_ids: {
    loop_id: string
    community_id: string
  }[]
  brandColors: Record<string, string>
  element: HTMLElement
  view: ViewType
  enable_brand_click?: boolean
  enable_community_click?: boolean
  show_share_icon?: boolean
  show_view_loop_button?: boolean
  show_comments_section?: boolean
  carousel_style?: 'focus'
  is_enable_engagement_tools: boolean
  enable_engagement_tools: {
    repost: boolean
    spark: boolean
    comment: boolean
    share: boolean
  }
  show_side_panel: boolean
  show_join_community_button: boolean
  show_navigation: boolean
  show_community_share_button: boolean
  is_enable_redirection: boolean
  enable_redirection_tools: {
    community: boolean
    group: boolean
    user: boolean
  }
  is_show_popup_by_default: boolean
  theme: 'dark' | 'light'
}

export type FeedVideoType = {
  community: {
    brand_id: number
    color_code: string
    description: string
    handle: string
    name: string
    share_string: string
    share_url: string
    slug: string
    text_color_code: string
    type: number
    uuid: string
    dp: string
    dp_l?: string
    dp_m?: string
    dp_s?: string
    logged_in_user_role?: number
    is_join_requested?: boolean
    brand?: {
      brand_id: number
      brand_slug: string
      brand_user_logo: number
      brand_web_logo: string
      name: string
    }
  }
  loop: {
    color_code: string
    group_description: string
    group_id: string
    group_name: string
    settings: {
      discoverable: boolean
    }
    share_string: string
    share_url: string
    slug: string
    type: number
    uuid: string
  }
  owner: {
    bio: string
    brand?: {
      brand_id: number
      brand_slug: string
      brand_user_logo: number
    }
    is_avatar: boolean
    name: string
    profile_image: string
    profile_image_s?: string
    profile_image_m?: string
    profile_image_l?: string
    share_url: string
    username: string
    uuid: string
  }
  uuid: string
  video: {
    clickable_url?: string | null
    attached_link: string | null
    conversation_at: number
    description_data: string | null
    description_text: string | null
    linkouts: any
    linkouts_id: string
    linkouts_inappbrowser: boolean
    media_url: string
    media_url_m3u8: string
    meta_data: {
      aspect_ratio: string
      contains_external_videos: boolean
      duration: string
      media_type: string
      resolution: string
      size: string
    }
    no_of_comments: number
    no_of_shares: number
    no_of_sparks: number
    no_of_views: number
    share_url: string
    slug: string
    sprite_image_url: string | null
    thumbnail_url: string
    thumbnail_url_l: string
    thumbnail_url_s: string
    uuid: string
    video_summary: string | null
    is_sparked?: boolean
    is_read?: boolean
  }
}

export type User = {
  brand_id: number
  user_id: string
  name?: string | null
  nickname: string
  bio: string | null
  is_new_message: boolean
  is_avatar: boolean
  is_brand_system_user: boolean
  phone: string | null
  profile_image: string
  profile_image_s?: string | null
  profile_image_m?: string | null
  profile_image_l?: string | null
  is_username_generated: boolean
  email?: string | null
  is_email_verified: boolean
  platform_guidelines: boolean
  community_walkthrough: boolean
  onboarding_communities: boolean
  onboarding_subscription: boolean
  login_source: number
  device_type: string
  action_meta_data: string | null
  is_user_signedup: boolean
  ks_cb_request_status: number
  onboarding_topics: boolean
  brand_guidelines: boolean
  device_uuid: string
  accessToken: string
  autoLoginToken: string
}

export type AuthUser = {
  id: string
  accessToken: string
  bio?: string
  email?: string
  phoneNumber?: string
  isAvatar: boolean
  name: string
  nickname: string
  image: string
  /**
   * Token to refresh accessToken.
   */
  refreshToken?: string
  ksCbRequestStatus?: number
  /**
   * if user is brand user.
   */
  isBrandSystemUser?: boolean
  brandId?: string
  brandSlug?: string
  /**
   * Checks if use has already topics.
   */
  hasTopics?: boolean
  birth?: string
  usernameSet: boolean
  autoLoginToken?: string
  brandGuidelines?: boolean
}

export type CommunityJoinStatusType =
  | 'unjoined'
  | 'joined'
  | 'requested'
  | 'leader'

export type ViewType = 'feed' | 'carousel' | 'standard_wall'

export type SizeBoxType = { height: number; width: number }

export type FeedType = 'HOME' | 'POPULAR' | 'LATEST'

/**
 * Return type for fetchFeed.
 */
export type FetchFeedReturnType = { videos: FeedVideoType[]; end: boolean }
