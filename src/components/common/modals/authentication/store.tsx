import { type AuthActionType } from '@lib/api/auth'
import { getRandomAvatar } from '@lib/utils'
import { create } from 'zustand'

export type StepsType =
  | 'SIGN_UP'
  | 'EMAIL_INPUT'
  | 'NUMBER_INPUT'
  | 'PASSWORD_INPUT'
  | 'OTP_INPUT'
  | 'IMAGE_CROPPER'
  | 'EMAIL_VERIFICATION_SUCCESS'
  | 'EMAIL_VERIFICATION_FAILURE'
  | 'MAGIC_LINK_VERIFICATION_SUCCESS'
  | 'MAGIC_LINK_VERIFICATION_FAILURE'
  | 'COMPLETE_PROFILE'
  | 'EMAIL_SENT_NOTE'
  | 'MAGIC_LINK_SENT_NOTE'
  | 'ERROR'
  | 'USERNAME_INPUT'
  | 'PASSWORD_INPUT_LOGIN'
  | 'EMAIL_SENT_NOTE_ACCOUNT_EXISTS'
  | 'GUIDELINES'
  | 'KS_CB_WEB'
  | 'KS_CB_SUBDOMAIN'
  | 'VERIFY_MAIL'
  | 'MINI_PROFILE_SUCCESS'
  | 'EDIT_USERNAME'
  | 'CHANGE_PASSWORD'
  | 'LOGOUT'

type FormDataType = {
  displayName: string
  email: string
  password: string
  mobileNumber: string
  image: string | File
  isAvatar: boolean
  bio: string
  username: string
  phone: string
  otp: number
  userId: string
  imageName: string
  retryTime?: number
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
  goToPrevios: () => void
  close: () => void
  setStep: (step: StepsType, action?: AuthActionType) => void
  reset: () => void
  setFormData: (formData: Partial<FormDataType>) => void
}

const initialStates: States = {
  step: 'EMAIL_INPUT',
  formData: {
    image: getRandomAvatar(),
    isAvatar: true,
  },
  isOpen: false,
}

export const useAuthenticationModalStore = create<Actions & States>((set) => {
  return {
    ...initialStates,
    open() {
      set({ isOpen: true })
    },
    openWithStep(action, step = 'EMAIL_INPUT') {
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
    goToPrevios() {
      set((state) => {
        state.step = state.previousStep ?? 'EMAIL_INPUT'
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
