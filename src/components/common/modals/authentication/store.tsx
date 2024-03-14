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
}

type States = {
  step: StepsType
  formData: Partial<FormDataType>
  isOpen: boolean
  note?: React.ReactNode
  action?: AuthActionType
}

type Actions = {
  open: (action?: AuthActionType) => void
  close: () => void
  setStep: (step: StepsType) => void
  reset: () => void
  setFormData: (formData: Partial<FormDataType>) => void
}

const initialStates: States = {
  step: 'SIGN_UP',
  formData: {
    image: getRandomAvatar(),
    isAvatar: true,
  },
  isOpen: false,
}

export const useAuthenticationModalStore = create<Actions & States>((set) => {
  return {
    ...initialStates,
    open(action) {
      set({ isOpen: true, action })
    },
    close() {
      set({ isOpen: false, step: 'SIGN_UP' })
    },
    setStep(step) {
      set({ step })
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
