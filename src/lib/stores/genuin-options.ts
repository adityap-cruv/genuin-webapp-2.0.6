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
