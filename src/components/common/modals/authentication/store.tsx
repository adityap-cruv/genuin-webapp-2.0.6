import { getAvatarUrl, getRandomAvatar } from '@lib/utils'
import { create } from 'zustand'

type StepsType =
  | 'SIGN_UP'
  | 'EMAIL_INPUT'
  | 'NUMBER_INPUT'
  | 'PASSWORD_INPUT'
  | 'EMAIL_SENT_NOTICE'
  | 'OTP_INPUT'
  | 'IMAGE_INPUT'
  | 'EMAIL_VERIFICATION_SUCCESS'
  | 'EMAIL_VERIFICATION_FAILURE'
  | 'MAGIC_LINK_VERIFICATION_SUCCESS'
  | 'MAGIC_LINK_VERIFICATION_FAILURE'
  | 'COMPLETE_PROFILE'
  | 'NOTE'

type FormDataType = {
  displayName: string
  email: string
  password: string
  mobileNumber: string
  imageUrl: string
  imageFile: File
}

type States = {
  step: StepsType
  formData: Partial<FormDataType>
  isOpen: boolean
}

type Actions = {
  open: () => void
  close: () => void
  setStep: (step: StepsType) => void
  reset: () => void
  setFormData: (formData: Partial<FormDataType>) => void
}

const initialStates: States = {
  step: 'SIGN_UP',
  formData: {
    imageUrl: getAvatarUrl(getRandomAvatar()),
  },
  isOpen: false,
}

export const useAuthenticationModalStore = create<Actions & States>((set) => {
  return {
    ...initialStates,
    open() {
      set({ isOpen: true })
    },
    close() {
      set({ isOpen: false })
    },
    setStep(step) {
      set({ step })
    },
    reset() {
      set(initialStates)
    },
    setFormData(formData) {
      set({ formData })
    },
  }
})
