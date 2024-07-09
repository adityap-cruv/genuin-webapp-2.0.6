'use client'
import { Dialog, DialogTrigger, DialogContent, DialogClose } from '@components/ui/dialog'
import { type DialogProps } from '@radix-ui/react-dialog'
import { type StepsType, useAuthenticationModalStore } from './store'
import {
  EmailInput,
  EmailVerification,
  ImageCropper,
  MagicLinkVerification,
  PasswordInput,
  Note,
  UsernameInput,
  CompleteProfile,
  Guidelines,
  KsToCbWeb,
  KsToCbSubdomain,
  Error,
  EditUsername,
  ChangePassword,
  Logout,
  ForgotPassword,
  ResetPassword,
  CategoryInput,
  GetStarted,
  ClaimBrandProfile,
} from './screens'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import icClose from '@icons/icClose.svg'
import { PasswordInputLogin } from './screens/password-input-login'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import icBack from '@icons/icBack.svg'

type Props = DialogProps

export function Modal({ children, ...props }: Props) {
  const user = useGenuinOptions().user
  const { isModalOpen, openModal, setStep, closeModal, step, setFormData, previousStep } = useAuthenticationModalStore(
    (state) => ({
      isModalOpen: state.isOpen,
      openModal: state.open,
      setStep: state.setStep,
      closeModal: state.close,
      step: state.step,
      setFormData: state.setFormData,
      previousStep: state.previousStep,
    })
  )
  const searchParams = useSearchParams()

  useEffect(() => {
    if (user)
      setFormData({
        ...user,
        username: user.nickname,
        displayName: user.name ?? '',
        email: user?.email ?? '',
        image: user?.image ?? '',
      })
  }, [user])

  const stepSet: Set<StepsType> = new Set<StepsType>([
    'EMAIL_VERIFICATION_FAILURE',
    'EMAIL_VERIFICATION_SUCCESS',
    'MAGIC_LINK_VERIFICATION_FAILURE',
    'MAGIC_LINK_VERIFICATION_SUCCESS',
    'IMAGE_CROPPER',
    'RESET_PASSWORD',
    'GET_STARTED',
    'GUIDELINES',
  ])
  const showClose = !stepSet.has(step)

  const stepForBack: Set<StepsType> = new Set<StepsType>(['PASSWORD_INPUT_LOGIN'])
  const showBack = stepForBack.has(step)

  useEffect(() => {
    const resetPasswordEmailVerification = searchParams.get('reset_password_status') ?? ''
    const emailVerification = searchParams.get('email_verification_status') ?? ''
    const magicLinkVerification = searchParams.get('magic_link_verification') ?? ''
    const error = searchParams.get('error_in_verification') ?? ''
    const smsVerificationStatus = searchParams.get('sms_verification_status') ?? ''

    if (
      Boolean(emailVerification) ||
      Boolean(magicLinkVerification) ||
      Boolean(error) ||
      Boolean(resetPasswordEmailVerification) ||
      Boolean(smsVerificationStatus)
    ) {
      if (resetPasswordEmailVerification === '1') setStep('RESET_PASSWORD')
      if (emailVerification === '0') setStep('EMAIL_VERIFICATION_FAILURE')
      if (emailVerification === '1') setStep('EMAIL_VERIFICATION_SUCCESS')
      if (magicLinkVerification === '0') setStep('MAGIC_LINK_VERIFICATION_FAILURE')
      if (magicLinkVerification === '1') setStep('MAGIC_LINK_VERIFICATION_SUCCESS')
      if (smsVerificationStatus === '1') setStep('GET_STARTED')
      if (error === '1') setStep('ERROR')
      openModal()
    }
  }, [searchParams])

  return (
    <Dialog modal open={isModalOpen} {...props}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        showClose={false}
        onInteractOutside={(e) => {
          e.preventDefault()
        }}
        className="rounded-t-lg !py-10">
        {showBack && (
          <img
            src={icBack.src}
            alt="back"
            className="absolute left-4 top-4 h-6 hover:cursor-pointer"
            onClick={() => {
              if (previousStep !== undefined) {
                setStep(previousStep)
              }
            }}
          />
        )}
        {showClose && (
          <DialogClose className="absolute right-4 top-4 outline-none">
            <img
              src={icClose.src}
              alt="close"
              className="h-6"
              onClick={() => {
                closeModal()
              }}
            />
          </DialogClose>
        )}
        <Content />
      </DialogContent>
    </Dialog>
  )
}

export function Content() {
  const step = useAuthenticationModalStore().step

  switch (step) {
    case 'EMAIL_INPUT':
      return <EmailInput />
    // case 'SIGN_UP':
    //   return <Signup />
    // case 'NUMBER_INPUT':
    //   return <NumberInput />
    case 'IMAGE_CROPPER':
      return <ImageCropper />
    case 'PASSWORD_INPUT':
      return <PasswordInput />
    // case 'OTP_INPUT':
    //   return <OtpInput />
    case 'EMAIL_VERIFICATION_FAILURE':
      return <EmailVerification.failure />
    case 'EMAIL_VERIFICATION_SUCCESS':
      return <EmailVerification.success />
    case 'MAGIC_LINK_VERIFICATION_FAILURE':
      return <MagicLinkVerification.failure />
    case 'MAGIC_LINK_VERIFICATION_SUCCESS':
      return <MagicLinkVerification.success />
    case 'EMAIL_SENT_NOTE':
      return <Note.email />
    case 'EMAIL_SENT_NOTE_ACCOUNT_EXISTS':
      return <Note.email acountExists />
    case 'ERROR':
      return <Error />
    case 'USERNAME_INPUT':
      return <UsernameInput />
    case 'COMPLETE_PROFILE':
      return <CompleteProfile />
    case 'MAGIC_LINK_SENT_NOTE':
      return <Note.magicLink />
    case 'PASSWORD_INPUT_LOGIN':
      return <PasswordInputLogin />
    case 'GUIDELINES':
      return <Guidelines />
    case 'KS_CB_WEB':
      return <KsToCbWeb />
    case 'KS_CB_SUBDOMAIN':
      return <KsToCbSubdomain />
    case 'VERIFY_MAIL':
      return <EmailVerification.verifymail />
    case 'MINI_PROFILE_SUCCESS':
      return <Note.miniprofilesuccess />
    case 'EDIT_USERNAME':
      return <EditUsername />
    case 'CHANGE_PASSWORD':
      return <ChangePassword />
    case 'LOGOUT':
      return <Logout />
    case 'CHANGE_PASSWORD_SUCCESS_NOTE':
      return <Note.changepasswordsuccess />
    case 'SET_PASSWORD_SUCCESS_NOTE':
      return <Note.setpasswordsuccess />
    case 'FORGOT_PASSWORD':
      return <ForgotPassword />
    case 'PASSWORD_RESET_LINK_SENT_NOTE':
      return <Note.passwordresetlink />
    case 'RESET_PASSWORD':
      return <ResetPassword />
    case 'RESET_PASSWORD_SUCCESS_NOTE':
      return <Note.resetpasswordsuccess />
    case 'CATEGORY_INPUT':
      return <CategoryInput />
    case 'GET_STARTED':
      return <GetStarted />
    case 'CLAIM_BRAND_PROFILE':
      return <ClaimBrandProfile />
  }
}
