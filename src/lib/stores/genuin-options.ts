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

export type ConfigType = {
  brand_id: string
  created_at: string
  id: string
  logo: string
  integrations: IntegrationSettingsType
  name: string
  subdomain: string
  slogan: SloganType
} | null

type User = {
  bio?: string
  email?: string | null
  isAvatar: boolean
  name?: string | null
  nickname: string
  isEmailVerified: boolean
  isPasswordSet: boolean
  image?: string | null
  accessToken: string
  id?: string
}

type StateType = {
  /**
   * Set true if you embed needs to be true.
   * @default false
   */
  embed: boolean
  brandId: string
  logoUrl: string
  /**
   * Set false if you don't want to show general navbar.s
   * @default true
   */
  showNavbar: boolean
  /**
   * Video Size boxes for video.
   */
  sizeBoxes: SizeBoxesType
  /**
   * If initially data is being set.
   * @default true
   */
  isLoading: boolean
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
}

type ActionsType = {
  setData: (data: Partial<StateType>) => void
}

const initialState: StateType = {
  embed: false,
  brandId: '',
  logoUrl: '',
  showNavbar: true,
  isLoading: true,
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
}

export const useGenuinOptions = create(
  persist<StateType & ActionsType>(
    (set, get) => {
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
