import { createContext, useContext, useState, useCallback } from 'react'
import { getRandomAvatar } from '@/utils'
import { AuthActionType } from '@/components/authentication/api/auth'

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
  | 'CLAIM_BRAND_PROFILE'
  | 'IMAGE_CROPPER'
  /**
   * This step is used to crop the image for settings page.
   */
  | 'IMAGE_CROPPER_SETTINGS'
  | 'CATEGORY_SELECTION'
  /**
   * This step is used to select the categories for settings page.
   */
  | 'CATEGORY_SELECTION_SETTINGS'
  | 'COMPLETE_PROFILE'
  | 'USERNAME_INPUT'
  | 'GUIDELINES'
  | 'KS_CB_WEB'
  | 'KS_CB_SUBDOMAIN'
  | 'LOGOUT'
  | 'DELETE_CONFIRMATION'
  | 'DELETE_CONFIRMED'
  | 'WALLET_HOW_IT_WORKS'
  | 'WITHDRAW_CASH'
  | 'REDEEM_CREDITS'

export type FormDataType = {
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

type AuthModalContextType = {
  step: StepsType
  previousStep?: StepsType
  formData: Partial<FormDataType>
  isOpen: boolean
  note?: React.ReactNode
  action?: AuthActionType
  isImageUploaded: boolean
  onCloseCallback?: () => void
  open: (onCloseCallback?: () => void) => void
  openWithStep: (
    action?: AuthActionType,
    step?: StepsType,
    onCloseCallback?: () => void,
  ) => void
  goToPrevious: () => void
  close: () => void
  setStep: (step: StepsType, action?: AuthActionType) => void
  reset: () => void
  setFormData: (formData: Partial<FormDataType>) => void
  setIsImageUploaded: (isImageUploaded: boolean) => void
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(
  undefined,
)

const initialStates: Omit<
  AuthModalContextType,
  | 'open'
  | 'openWithStep'
  | 'close'
  | 'setStep'
  | 'goToPrevious'
  | 'reset'
  | 'setFormData'
  | 'setIsImageUploaded'
> = {
  step: 'STARTER' as StepsType,
  formData: {
    image: getRandomAvatar(),
    isAvatar: true,
    flowType: 'email' as FlowType,
  },
  isImageUploaded: false,
  isOpen: false,
  onCloseCallback: undefined,
}

export const AuthModalProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [state, setState] = useState(initialStates)

  const open = useCallback((onCloseCallback?: () => void) => {
    setState((prev) => ({ ...prev, isOpen: true, onCloseCallback }))
  }, [])

  const openWithStep = useCallback(
    (
      action?: AuthActionType,
      step: StepsType = 'STARTER',
      onCloseCallback?: () => void,
    ) => {
      setState((prev) => ({
        ...prev,
        isOpen: true,
        step,
        action,
        onCloseCallback,
      }))
    },
    [],
  )

  const close = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }))
    if (state.onCloseCallback) {
      state.onCloseCallback()
    }
  }, [state.onCloseCallback])

  const setStep = useCallback((step: StepsType, action?: AuthActionType) => {
    setState((prev) => ({ ...prev, previousStep: prev.step, step, action }))
  }, [])

  const goToPrevious = useCallback(() => {
    setState((prev) => ({ ...prev, step: prev.previousStep ?? 'STARTER' }))
  }, [])

  const reset = useCallback(() => {
    setState(initialStates)
  }, [])

  const setFormData = useCallback((formData: Partial<FormDataType>) => {
    setState((prev) => ({
      ...prev,
      formData: { ...prev.formData, ...formData },
    }))
  }, [])

  const setIsImageUploaded = useCallback((isImageUploaded: boolean) => {
    setState((prev) => ({ ...prev, isImageUploaded }))
  }, [])

  return (
    <AuthModalContext.Provider
      value={{
        ...state,
        open,
        openWithStep,
        close,
        setStep,
        goToPrevious,
        reset,
        setFormData,
        setIsImageUploaded,
      }}>
      {children}
    </AuthModalContext.Provider>
  )
}

export const useAuthModalContext = () => {
  const context = useContext(AuthModalContext)
  if (!context) {
    throw new Error('useAuthModal must be used within an AuthModalProvider')
  }
  return context
}
