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
  contextualParams?: {
    page_context?: string | null
    geo?: {
      lat?: string | null
      long?: string | null
    }
    url?: string | null
  }

  brand_ids?: number[]
  type?: 'brand_feed' | 'community_feed' | 'loop_feed'
  action?: ActionType
  comment?: string
  authInfo?: AuthInfoType
}

type ActionType = 'spark' | 'comment-spark' | 'comment'

type AuthInfoType = {
  signInUrl: string
  signUpUrl: string
}

// export type SDKInitConfig = {
//   embed_id?: string
//   api_key?: string
//   token?: string
//   params?: SDKConfig['params']
//   authInfo?: AuthInfoType
// }

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
  playback_speed_enabled: boolean
  get_app_popup: PopupConfig
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
  web_cta: 'login' | 'app' | 'both'
  white_label_url: string
}

export type UserParam = {
  email: string
  id: string
  token: string
  name: string
  ip: string
  thumb: string
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

// export type AuthUser = {
//   id?: string
//   accessToken: string
//   bio?: string
//   email?: string
//   phoneNumber?: string
//   isAvatar: boolean
//   name: string
//   nickname: string
//   image: string
//   instaId?: string
//   linkedinId?: string
//   tiktokId?: string
//   youtubeId?: string
//   xId?: string
//   /**
//    * Token to refresh accessToken.
//    */
//   refreshToken?: string
//   ksCbRequestStatus: number
//   /**
//    * if user is brand user.
//    */
//   isBrandSystemUser?: boolean
//   brandId?: number
//   brandSlug?: string
//   /**
//    * Checks if use has already topics.
//    */
//   hasTopics?: boolean
//   birth?: string
//   usernameSet: boolean
//   autoLoginToken?: string
//   brandGuidelines?: boolean
// }
