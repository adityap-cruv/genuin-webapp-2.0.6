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
} from './screens'
import { useEffect } from 'react'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { useShallow } from 'zustand/react/shallow'
import { X } from 'lucide-react'

type Props = DialogProps

export function Modal({ children, ...props }: Props) {
  const user = useGenuinOptions().user
  const { isModalOpen, closeModal, step, setFormData } = useAuthenticationModalStore((state) => ({
    isModalOpen: state.isOpen,
    closeModal: state.close,
    step: state.step,
    setFormData: state.setFormData,
  }))

  useEffect(() => {
    if (user)
      setFormData({
        ...user,
        username: user.nickname,
        displayName: user.name ?? '',
        email: user?.email ?? '',
        image: user?.image ?? '',
        phoneNumber: user?.phoneNumber ?? '',
      })
  }, [user])

  const stepSet: Set<StepsType> = new Set<StepsType>([])
  const showClose = !stepSet.has(step)

  return (
    <Dialog modal open={isModalOpen} {...props}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        showClose={false}
        onInteractOutside={(e) => {
          e.preventDefault()
        }}
        className="rounded-t-lg !py-10">
        {showClose && (
          <DialogClose className="absolute right-4 top-4 outline-none">
            <X
              className="stroke-secondary"
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
          onNext={() => {
            setStep('GUIDELINES')
          }}
          onBack={() => {
            setStep('STARTER')
          }}
        />
      )
    case 'VERIFY_PHONE_OTP':
      return (
        <OtpInput
          verificationType="number"
          onNext={() => {
            setStep('EDIT_PHONE_NUMBER_SUCCESS')
          }}
        />
      )
    case 'VERIFY_MAIL_OTP':
      return <OtpInput verificationType="email" onNext={closeModal} />
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
    case 'CATEGORY_INPUT':
      return <CategoryInput />
    case 'USERNAME_INPUT':
      return <UsernameInput />
    case 'COMPLETE_PROFILE':
      return <CompleteProfile />
    case 'GUIDELINES':
      return (
        <Guidelines
          onNext={() => {
            setStep('USERNAME_INPUT')
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
  }
}
