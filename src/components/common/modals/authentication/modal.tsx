'use client'

import { Dialog, DialogTrigger, DialogContent, DialogClose } from '@components/ui/dialog'
import { type DialogProps } from '@radix-ui/react-dialog'
import { useAuthenticationModalStore } from './store'
import {
  EmailInput,
  EmailSentNotice,
  EmailVerification,
  ImageCropper,
  MagicLinkVerification,
  NumberInput,
  PasswordInput,
  Signup,
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

  const stepSet = new Set([
    'EMAIL_VERIFICATION_FAILURE',
    'EMAIL_VERIFICATION_SUCCESS',
    'MAGIC_LINK_VERIFICATION_FAILURE',
    'MAGIC_LINK_VERIFICATION_SUCCESS',
    'IMAGE_INPUT',
  ])
  const showClose = !stepSet.has(step)

  useEffect(() => {
    const emailVerification = searchParams.get('email_verification_status') ?? ''
    const magicLinkVerification = searchParams.get('magic_link_verification') ?? ''
    if (Boolean(emailVerification) || Boolean(magicLinkVerification)) {
      if (emailVerification === '0') setStep('EMAIL_VERIFICATION_FAILURE')
      if (emailVerification === '1') setStep('EMAIL_VERIFICATION_SUCCESS')
      if (magicLinkVerification === '0') setStep('MAGIC_LINK_VERIFICATION_FAILURE')
      if (magicLinkVerification === '1') setStep('MAGIC_LINK_VERIFICATION_SUCCESS')
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
            <X onClick={closeModal} />
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
    case 'IMAGE_INPUT':
      return <ImageCropper />
    case 'PASSWORD_INPUT':
      return <PasswordInput />
    case 'EMAIL_SENT_NOTICE':
      return <EmailSentNotice />
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
  }
}
