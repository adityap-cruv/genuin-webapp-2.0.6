import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

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
} | null

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
   * 1 → 'no request or all request are rejected'
   *
   * 2 → 'all request is in progress'
   *
   * 3 → 'any request is approved or user is already CB'
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
  embed: boolean
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
}

type ActionsType = {
  setData: (data: Partial<StateType>) => void
}

const initialState: StateType = {
  embed: true,
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
  config: null,
  notificationCount: -1,
  walletBalance: 0,
  isLoading: true,
  webCTA: 'app',
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
