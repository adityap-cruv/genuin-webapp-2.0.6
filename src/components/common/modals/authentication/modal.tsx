'use client'
import { Dialog, DialogTrigger, DialogContent, DialogClose } from '@components/ui/dialog'
import { type DialogProps } from '@radix-ui/react-dialog'
import { type StepsType, useAuthenticationModalStore } from './store'
import {
  EmailInput,
  EmailVerification,
  ImageCropper,
  MagicLinkVerification,
  NumberInput,
  PasswordInput,
  Signup,
  Note,
  Error,
  UsernameInput,
  CompleteProfile,
} from './screens'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { X } from 'lucide-react'

type Props = DialogProps

export function Modal({ children, ...props }: Props) {
  const { isModalOpen, openModal, setStep, closeModal, step } = useAuthenticationModalStore((state) => ({
    isModalOpen: state.isOpen,
    openModal: state.open,
    setStep: state.setStep,
    closeModal: state.close,
    step: state.step,
  }))
  const searchParams = useSearchParams()

  const stepSet: Set<StepsType> = new Set<StepsType>([
    'EMAIL_VERIFICATION_FAILURE',
    'EMAIL_VERIFICATION_SUCCESS',
    'MAGIC_LINK_VERIFICATION_FAILURE',
    'MAGIC_LINK_VERIFICATION_SUCCESS',
    'IMAGE_CROPPER',
  ])
  const showClose = !stepSet.has(step)

  useEffect(() => {
    const emailVerification = searchParams.get('email_verification_status') ?? ''
    const magicLinkVerification = searchParams.get('magic_link_verification') ?? ''
    const error = searchParams.get('error_in_verification') ?? ''

    if (Boolean(emailVerification) || Boolean(magicLinkVerification) || Boolean(error)) {
      if (emailVerification === '0') setStep('EMAIL_VERIFICATION_FAILURE')
      if (emailVerification === '1') setStep('EMAIL_VERIFICATION_SUCCESS')
      if (magicLinkVerification === '0') setStep('MAGIC_LINK_VERIFICATION_FAILURE')
      if (magicLinkVerification === '1') setStep('MAGIC_LINK_VERIFICATION_SUCCESS')
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
        {showClose && (
          <DialogClose className="absolute right-2 top-2">
            <X
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
    case 'SIGN_UP':
      return <Signup />
    case 'NUMBER_INPUT':
      return <NumberInput />
    case 'IMAGE_CROPPER':
      return <ImageCropper />
    case 'PASSWORD_INPUT':
      return <PasswordInput />
    case 'OTP_INPUT':
      return <p>otp input.</p>
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
    case 'ERROR':
      return <Error />
    case 'USERNAME_INPUT':
      return <UsernameInput />
    case 'COMPLETE_PROFILE':
      return <CompleteProfile />
  }
}
