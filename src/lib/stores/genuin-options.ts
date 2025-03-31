import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { getUrlForReaction } from '../utils'

export type VideoSizeBoxType = {
  width: number
  height: number
}

export type ModalSizeBoxType = VideoSizeBoxType & { player: VideoSizeBoxType }

export type SizeBoxesType = {
  modal: ModalSizeBoxType
  default: VideoSizeBoxType
}

type IntegrationSettingsType = {
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
  }
}

type SloganType = {
  font: {
    _id: string
    style: string
    weight: string
  }
  image: string
  text: string
}

type RewardPointConfig = {
  view: number
  spark: number
  comments: number
  repost: number
}

type EmbedCustomization = {
  dimensions: {
    width: number
    height: number
  }
  cta_button?: {
    text: string
    url: string
  }
  enable_engagement_tools?: {
    repost: boolean
    spark: boolean
    comment: boolean
    share: boolean
  }
  enable_redirection_tools?: {
    community: boolean
    group: boolean
    user: boolean
  }
  links?: {
    is_show_links: boolean
    position: 'outside' | 'overlay'
  }
  carousel_style?: string
  autoplay?: boolean
  heading?: string
  sub_heading?: string
  is_carousel_icon?: boolean
  is_floating_view?: boolean
  is_expanded_view?: boolean
  is_show_username?: boolean
  is_show_view_count?: boolean
  is_enable_engagement_tools?: boolean
  is_enable_redirection?: boolean
  is_loop_video?: boolean
  is_show_social_interaction_data?: boolean
  show_side_panel?: boolean
  show_join_community_button?: boolean
  show_community_share_button?: boolean
  community_ids?: string[]
  community_loop_ids?: string[]
}

type Embed = {
  _id: string
  name: string
  style: 'carousel' | 'feed'
  type: string
  brand_id: number
  is_default: boolean
  customization: EmbedCustomization
  __v: number
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
  is_start_with_sound: boolean
  auto_play_after: number
}

type FeedVideoPlayConfig = {
  type: number
  repeat_video: number
  swipe_after: number
}

type LinkoutDelayConfig = {
  type: number
  appear_after: number
}

type PopupConfig = {
  enable: boolean
  popup_after: number
}

type WebConfigs = {
  video_autoplay: VideoAutoplayConfig
  feed_video_play: FeedVideoPlayConfig
  linkout_delay: LinkoutDelayConfig
  login_signup_popup: PopupConfig
  interest_selection_popup: PopupConfig
  username_popup: PopupConfig
  complete_profile_popup: PopupConfig
  idle_time_interruption: PopupConfig
  video_aspect_ratio: string
  /**
   * 1: Tap to mute/unmute.
   *
   * 2: Tap to play/pause.
   *
   * 3: Tap to unmute and than play/pause.
   */
  tap_behavior: number
  gesture_guidance: boolean
}

export type ConfigType = {
  brand_id: string
  created_at: string
  id: string
  logo: string
  integrations: IntegrationSettingsType
  environment: string
  name: string
  subdomain: string
  slogan: SloganType
  brand_colors: any
  favicon: any
  brand_web_logo: string
  is_claimed: boolean
  website: string
  is_wallet_enabled: boolean
  global_reward_point_configs: RewardPointConfig
  social_login: { google: boolean; apple: boolean; brand: boolean; brand_sso_id?: string | null }
  status?: number
  web_cta: 'app' | 'login' | 'both'
  privacy_policy?: string
  terms_and_condition?: string
  industry_type?: number
  default_embeds?: Embed[]
  api_key?: string
  show_become_creator: boolean
  reactions: ReactionType
  web_configs?: WebConfigs
}

export type User = {
  bio?: string
  email?: string | null
  phoneNumber?: string | null
  isAvatar: boolean
  name?: string | null
  nickname: string
  image?: string | null
  accessToken: string
  refreshToken?: string | null
  birth?: string | null
  id?: string
  /**
   * The status can be:
   * - 1: Pending to request.
   * - 2: Requested. -> If request is rejected or approved then the status will be updated to 3 (in case of appr.) or 1 (in case of rejected).
   * - 3: Accepted.
   */
  ksCbRequestStatus?: number
  /**
   *
   */
  isBrandSystemUser?: boolean
  brandId?: number
  brandSlug?: string
  /**
   * Checks if use has already topics.
   */
  hasTopics?: boolean
  usernameSet: boolean
}

type StateType = {
  /**
   * Set true if you embed needs to be true.
   * @default false
   */
  brandId: string
  logoUrl: string
  brandWebLogo: string
  /**
   * Set false if you don't want to show general navbar.s
   * @default true
   */
  showNavbar: boolean
  /**
   * Video Size boxes for video.
   */
  sizeBoxes: SizeBoxesType
  isMobile: boolean
  os: string
  isIframe: boolean
  deviceType: string
  browserType: string
  isSafari: boolean
  /**
   * If user has focus on web.
   * @default true
   */
  userHasFocus: boolean
  parentUrl: string
  config: ConfigType
  user?: User
  notificationCount?: number
  walletBalance?: number | null
  isLoading: boolean
  webCTA: 'app' | 'login' | 'both'
  host: string
}

type ActionsType = {
  setData: (data: Partial<StateType>) => void
}

const initialState: StateType = {
  brandId: '',
  logoUrl: '',
  brandWebLogo: '',
  showNavbar: true,
  isMobile: true,
  sizeBoxes: {
    default: { height: -1, width: -1 },
    modal: { width: -1, height: -1, player: { height: -1, width: -1 } },
  },
  isIframe: false,
  os: '',
  deviceType: '',
  browserType: '',
  isSafari: false,
  userHasFocus: true,
  parentUrl: '',
  config: {
    reactions: {
      keys: {
        comment_selected: { svg: getUrlForReaction('spark', true, true), png: '' },
        comment_unselected: { svg: getUrlForReaction('spark', false, true), png: '' },
        feed_selected: { svg: getUrlForReaction('spark', true, false), png: '' },
        feed_unselected: { svg: getUrlForReaction('spark', false, false), png: '' },
      },
      suffix: 'to',
      title: 'react',
      type: 'default',
    },
    web_configs: {
      video_autoplay: {
        type: 1,
        is_start_with_sound: true,
        auto_play_after: 5,
      },
      feed_video_play: {
        type: 1,
        repeat_video: 0,
        swipe_after: 0,
      },
      linkout_delay: {
        type: 1,
        appear_after: 10,
      },
      login_signup_popup: {
        enable: true,
        popup_after: 5,
      },
      interest_selection_popup: {
        enable: true,
        popup_after: 5,
      },
      username_popup: {
        enable: true,
        popup_after: 5,
      },
      complete_profile_popup: {
        enable: true,
        popup_after: 5,
      },
      idle_time_interruption: {
        enable: true,
        popup_after: 60,
      },
      video_aspect_ratio: '9:16',
      tap_behavior: 3,
      gesture_guidance: true,
    },
  } as any,
  notificationCount: -1,
  walletBalance: 0,
  isLoading: true,
  webCTA: 'app',
  host: '',
}

export const useGenuinOptions = create(
  persist<StateType & ActionsType>(
    (set) => {
      return {
        ...initialState,
        setData(data) {
          set(data)
        },
      }
    },
    { name: 'genuin-options', storage: createJSONStorage(() => sessionStorage) }
  )
)
