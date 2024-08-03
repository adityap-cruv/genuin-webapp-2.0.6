import { type AuthActionType } from './api/auth'
import { getRandomAvatar } from '@lib/utils'
import { create } from 'zustand'

export type FlowType = 'email' | 'phone'

export type StepsType =
  | 'STARTER'
  | 'LOGIN_OTP_INPUT'
  | 'EDIT_BIRTHDATE'
  | 'EDIT_PHONE_NUMBER'
  | 'EDIT_EMAIL_SUCCESS'
  | 'EDIT_PHONE_NUMBER_SUCCESS'
  | 'EDIT_USERNAME'
  | 'EDIT_EMAIL'
  | 'VERIFY_MAIL_OTP'
  | 'VERIFY_PHONE_OTP'
  | 'CATEGORY_SELECTION'
  | 'CLAIM_BRAND_PROFILE'
  | 'IMAGE_CROPPER'
  | 'COMPLETE_PROFILE'
  | 'USERNAME_INPUT'
  | 'GUIDELINES'
  | 'KS_CB_WEB'
  | 'KS_CB_SUBDOMAIN'
  | 'LOGOUT'
  | 'DELETE_CONFIRMATION'
  | 'DELETE_CONFIRMED'

type FormDataType = {
  displayName: string
  email: string
  password: string
  phoneNumber: string
  image: string | File
  isAvatar: boolean
  bio: string
  username: string
  otp: number
  userId: string
  imageName: string
  retryTime: number
  flowType: FlowType
  birth?: string
}

type States = {
  step: StepsType
  previousStep?: StepsType
  formData: Partial<FormDataType>
  isOpen: boolean
  note?: React.ReactNode
  action?: AuthActionType
}

type Actions = {
  open: () => void
  openWithStep: (action?: AuthActionType, step?: StepsType) => void
  goToPrevious: () => void
  close: () => void
  setStep: (step: StepsType, action?: AuthActionType) => void
  reset: () => void
  setFormData: (formData: Partial<FormDataType>) => void
}

const initialStates: States = {
  step: 'STARTER',
  formData: {
    image: getRandomAvatar(),
    isAvatar: true,
    flowType: 'email',
  },
  isOpen: false,
}

export const useAuthenticationModalStore = create<Actions & States>((set) => {
  return {
    ...initialStates,
    open() {
      set({ isOpen: true })
    },
    openWithStep(action, step = 'STARTER') {
      set({ isOpen: true, step, action })
    },
    close() {
      set({ isOpen: false })
    },
    setStep(step, action) {
      set((state) => {
        state.previousStep = state.step
        state.step = step
        if (action) state.action = action
        return { ...state }
      })
    },
    goToPrevious() {
      set((state) => {
        state.step = state.previousStep ?? 'STARTER'
        return state
      })
    },
    reset() {
      set(initialStates)
    },
    setFormData(formData) {
      set((state) => {
        Object.assign(state.formData, formData)
        return { formData: state.formData }
      })
    },
  }
})
