'use client'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogClose,
} from '@/components/ui/dialog'
import { type DialogProps } from '@radix-ui/react-dialog'
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
import { CloseIcon } from '../icons/close-icon'
import { useAuth } from '@/context/auth'
import { useCallback, useEffect } from 'react'
import {
  StepsType,
  useAuthModalContext,
} from '@/components/authentication/context'

type Props = DialogProps & { showClose?: boolean }

export function Modal({ children, ...props }: Props) {
  const { user } = useAuth()
  const {
    action,
    isOpen,
    close,
    step,
    setFormData,
    isImageUploaded,
    setIsImageUploaded,
  } = useAuthModalContext()

  const stepSet: Set<StepsType> = new Set<StepsType>([
    'LOGIN_OTP_INPUT',
    'VERIFY_MAIL_OTP',
    'VERIFY_PHONE_OTP',
    'GUIDELINES',
    'DELETE_CONFIRMATION',
    'DELETE_CONFIRMED',
    'IMAGE_CROPPER',
  ])

  const handleClose = useCallback(() => {
    if (step === 'STARTER') {
      setFormData({ flowType: 'email', phoneNumber: '', email: '' })
    }
    if (!isImageUploaded) {
      setFormData({ image: user?.image, isAvatar: user?.isAvatar })
      setIsImageUploaded(false)
    }
    close()
  }, [step, setFormData, close, isImageUploaded, setIsImageUploaded, user])

  useEffect(() => {
    if (!user) return
    setFormData({
      username: user.nickname,
      displayName: user.name,
      email: user.email,
      image: user.image,
      phoneNumber: user.phoneNumber,
      birth: user.birth,
      bio: user.bio,
      isAvatar: user.isAvatar,
      userId: user.id,
    })
  }, [user])

  const shouldShowClose =
    !stepSet.has(step) && !(action === 'DELETE_ACCOUNT' && step === 'STARTER')

  return (
    <Dialog
      modal={action !== 'DELETE_ACCOUNT'}
      open={isOpen}
      {...props}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        showClose={false}
        onInteractOutside={(e) => {
          e.preventDefault()
        }}
        className='rounded-t-lg !py-10'>
        {shouldShowClose && (
          <DialogClose
            className='absolute z-10 right-4 top-4 outline-none'
            onClick={handleClose}>
            <CloseIcon className='h-6 w-6 stroke-foreground' />
          </DialogClose>
        )}
        <Content />
      </DialogContent>
    </Dialog>
  )
}

export function Content() {
  const { step, setStep, close } = useAuthModalContext()

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
          verificationType='login'
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
          title='Verify your phone'
          verificationType='number'
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
          title='Verify your email'
          verificationType='email'
          onNext={() => {
            setStep('EDIT_EMAIL_SUCCESS')
          }}
          onBack={() => {
            setStep('EDIT_EMAIL')
          }}
        />
      )
    case 'EDIT_BIRTHDATE':
      return <BirthInput onNext={close} />
    case 'EDIT_EMAIL':
      return (
        <EditEmail
          onNext={() => {
            setStep('VERIFY_MAIL_OTP')
          }}
        />
      )
    case 'EDIT_EMAIL_SUCCESS':
      return <Note title='Your email has been changed' />
    case 'EDIT_PHONE_NUMBER':
      return (
        <EditNumber
          onNext={() => {
            setStep('VERIFY_PHONE_OTP')
          }}
        />
      )
    case 'EDIT_PHONE_NUMBER_SUCCESS':
      return <Note title='Your phone has been changed' />
    case 'IMAGE_CROPPER':
      return <ImageCropper />
    case 'IMAGE_CROPPER_SETTINGS':
      return <ImageCropper forSettings />
    case 'CATEGORY_SELECTION':
      return (
        <CategoryInput
          forSettings={false}
          onNext={(step) => {
            if (step) {
              setStep(step)
            } else {
              close()
            }
          }}
        />
      )
    case 'CATEGORY_SELECTION_SETTINGS':
      return (
        <CategoryInput
          forSettings
          onNext={close}
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
              close()
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
  }
}
