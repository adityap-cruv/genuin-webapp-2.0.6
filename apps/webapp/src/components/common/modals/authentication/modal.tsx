'use client'
import { Dialog, DialogTrigger, DialogContent, DialogClose } from '@components/ui/dialog'
import { type DialogProps } from '@radix-ui/react-dialog'
import { type StepsType, useAuthenticationModalStore } from './store'
import {
  ImageCropper,
  UsernameInput,
  CompleteProfile,
  Guidelines,
  KsToCbWeb,
  KsToCbSubdomain,
  EditUsername,
  Logout,
  CategoryInput,
  ClaimBrandProfile,
  Starter,
  OtpInput,
  BirthInput,
  EditEmail,
  EditNumber,
  Note,
  DeleteConfirmation,
  DeleteConfirmed,
} from './screens'
import { useEffect } from 'react'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { useShallow } from 'zustand/react/shallow'
import { CloseIcon } from '@icons/close-icon'
import { useSearchParams } from 'next/navigation'
import { HowItWorks } from '../wallet/how-it-works'
import { WithdrawDialog } from '../wallet/withdraw-cash'
import { RedeemCredits } from '../wallet/redeem-credits'
import { getUserDataForSSO } from './api/auth'
import { signIn } from 'next-auth/react'
import { setAuthTokenInAxiosInstance } from '@/lib/api/instance'
import { getAppLink } from '@/lib/get-deeplink'
import { DownloadDialogModal } from '../download-app'

type Props = DialogProps & { showClose?: boolean }

function removeQueryParams() {
  const url = new URL(window.location.href)
  url.searchParams.delete('code')
  url.searchParams.delete('provider')
  window.history.replaceState({}, '', url.href)
}

export function Modal({ children, showClose, ...props }: Props) {
  const searchParams = useSearchParams()
  const { user, webCTA } = useGenuinOptions(
    useShallow((state) => ({
      user: state.user,
      webCTA: state.webCTA,
    }))
  )
  const { action, isModalOpen, closeModal, step, setFormData, open, openWithStep } = useAuthenticationModalStore(
    useShallow((state) => ({
      isModalOpen: state.isOpen,
      closeModal: state.close,
      step: state.step,
      setFormData: state.setFormData,
      action: state.action,
      open: state.open,
      openWithStep: state.openWithStep,
    }))
  )

  useEffect(() => {
    const code = searchParams.get('code')
    const provider = searchParams.get('provider')

    if (!code || !provider) return
    void getUserDataForSSO(code, provider).then(async (res) => {
      setAuthTokenInAxiosInstance(res.user?.accessToken)
      await signIn('credentials', { ...res.user, redirect: false }).then((value) => {
        removeQueryParams()
        if (value?.ok) {
          if (!res.user?.brandGuidelines) {
            openWithStep(undefined, 'GUIDELINES')
          } else if (!res.user.hasTopics) {
            openWithStep(undefined, 'CATEGORY_SELECTION')
          } else if (!res.user.usernameSet) {
            openWithStep(undefined, 'USERNAME_INPUT')
          }
        }
      })
    })
  }, [searchParams])

  useEffect(() => {
    if (!user) {
      const showPopup = searchParams.get('show_login') === '1'
      if (!showPopup) return

      if (webCTA === 'app') {
        void getAppLink().then((generatedLink) => {
          DownloadDialogModal.open({
            title: <>Download the app</>,
            deepLink: generatedLink,
          })
        })
      } else {
        open()
      }
      return
    }
    setFormData({
      ...user,
      username: user.nickname,
      displayName: user.name ?? '',
      email: user?.email ?? '',
      image: user?.image ?? '',
      phoneNumber: user?.phoneNumber ?? '',
      birth: user.birth ?? undefined,
    })
  }, [user])
  const stepSet: Set<StepsType> = new Set<StepsType>([
    'LOGIN_OTP_INPUT',
    'VERIFY_MAIL_OTP',
    'VERIFY_PHONE_OTP',
    'GUIDELINES',
    // 'CATEGORY_SELECTION', // Made it optional for Surprise Me
    'DELETE_CONFIRMATION',
    'DELETE_CONFIRMED',
    'IMAGE_CROPPER',
  ])

  const shouldShowClose = !stepSet.has(step) && !(action === 'DELETE_ACCOUNT' && step === 'STARTER')

  return (
    <Dialog modal={action !== 'DELETE_ACCOUNT'} open={isModalOpen} {...props}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        showClose={false}
        onInteractOutside={(e) => {
          e.preventDefault()
        }}
        className="rounded-t-lg !py-10">
        {shouldShowClose && (
          <DialogClose className="absolute right-4 top-4 outline-none">
            <CloseIcon
              onClick={() => {
                setFormData({ flowType: 'email', phoneNumber: '', email: '' })
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
  const { step, setStep, closeModal } = useAuthenticationModalStore(
    useShallow((state) => ({ step: state.step, setStep: state.setStep, closeModal: state.close }))
  )

  switch (step) {
    case 'STARTER':
      return (
        <Starter
          onNext={() => {
            setStep('LOGIN_OTP_INPUT')
          }}
        />
      )
    case 'LOGIN_OTP_INPUT':
      return (
        <OtpInput
          verificationType="login"
          onNext={(step) => {
            setStep(step ?? 'GUIDELINES')
          }}
          onBack={() => {
            setStep('STARTER')
          }}
        />
      )
    case 'VERIFY_PHONE_OTP':
      return (
        <OtpInput
          title="Verify your phone"
          verificationType="number"
          onNext={() => {
            setStep('EDIT_PHONE_NUMBER_SUCCESS')
          }}
          onBack={() => {
            setStep('EDIT_PHONE_NUMBER')
          }}
        />
      )
    case 'VERIFY_MAIL_OTP':
      return (
        <OtpInput
          title="Verify your email"
          verificationType="email"
          onNext={() => {
            setStep('EDIT_EMAIL_SUCCESS')
          }}
          onBack={() => {
            setStep('EDIT_EMAIL')
          }}
        />
      )
    case 'EDIT_BIRTHDATE':
      return <BirthInput onNext={closeModal} />
    case 'EDIT_EMAIL':
      return (
        <EditEmail
          onNext={() => {
            setStep('VERIFY_MAIL_OTP')
          }}
        />
      )
    case 'EDIT_EMAIL_SUCCESS':
      return <Note title="Your email has been changed" />
    case 'EDIT_PHONE_NUMBER':
      return (
        <EditNumber
          onNext={() => {
            setStep('VERIFY_PHONE_OTP')
          }}
        />
      )
    case 'EDIT_PHONE_NUMBER_SUCCESS':
      return <Note title="Your phone has been changed" />
    case 'IMAGE_CROPPER':
      return <ImageCropper />
    case 'CATEGORY_SELECTION':
      return (
        <CategoryInput
          onNext={(step) => {
            if (step) {
              setStep(step)
            } else {
              closeModal()
            }
          }}
        />
      )
    case 'USERNAME_INPUT':
      return (
        <UsernameInput
          onNext={() => {
            setStep('COMPLETE_PROFILE')
          }}
        />
      )
    case 'COMPLETE_PROFILE':
      return <CompleteProfile />
    case 'GUIDELINES':
      return (
        <Guidelines
          onNext={(step) => {
            if (step) {
              setStep(step)
            } else {
              closeModal()
            }
          }}
        />
      )
    case 'EDIT_USERNAME':
      return <EditUsername />
    case 'LOGOUT':
      return <Logout />
    case 'CLAIM_BRAND_PROFILE':
      return <ClaimBrandProfile />
    case 'KS_CB_WEB':
      return <KsToCbWeb />
    case 'KS_CB_SUBDOMAIN':
      return <KsToCbSubdomain />
    case 'DELETE_CONFIRMATION':
      return (
        <DeleteConfirmation
          onNext={() => {
            setStep('DELETE_CONFIRMED')
          }}
        />
      )
    case 'DELETE_CONFIRMED':
      return <DeleteConfirmed />
    case 'WALLET_HOW_IT_WORKS':
      return <HowItWorks />
    case 'WITHDRAW_CASH':
      return <WithdrawDialog />
    case 'REDEEM_CREDITS':
      return <RedeemCredits />
  }
}
