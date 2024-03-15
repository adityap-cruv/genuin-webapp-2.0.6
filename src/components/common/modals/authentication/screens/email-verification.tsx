import { Button } from '@components/ui/button'
import imgSuccess from '@images/verify-email/success.svg'
import { ModalShell } from '../modal-shell'
import imgError from '@images/verify-email/error.svg'
import { useAuthenticationModalStore } from '../store'
import { useSearchParams } from 'next/navigation'
import { resendVerificationMail } from '@lib/api/auth'
import { useState } from 'react'
import { Loader } from '@components/ui/loader'

export const EmailVerification = {
  success: Success,
  failure: Failure,
}

function Success() {
  const setStep = useAuthenticationModalStore().setStep
  return (
    <ModalShell>
      <img src={imgSuccess.src} style={{ width: 120, height: 120 }} />
      <p className="text-center text-heading-3">Email successfully verified</p>
      <p className="text-center text-title-3-med">
        Now you’ll receive important updates and notifications about your account, new features, and exciting news
        straight to your inbox. You can use the app now.{' '}
      </p>
      <Button
        className="w-full bg-new-off-black hover:bg-new-dark-grey"
        variant="default"
        onClick={() => {
          setStep('PASSWORD_INPUT')
        }}>
        <p className="text-title-3-med">Continue</p>
      </Button>
    </ModalShell>
  )
}

function Failure() {
  const setStep = useAuthenticationModalStore().setStep
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  return (
    <ModalShell>
      <img src={imgError.src} style={{ width: 120, height: 120 }} />
      <p className="text-center text-heading-3">Verification link expired</p>
      <p className="text-center text-title-3-med">
        We're sorry, but it looks like the verification link has expired. Please request a new verification link.
      </p>
      <Button
        className="w-full bg-new-off-black hover:bg-new-dark-grey"
        variant="default"
        onClick={async () => {
          setIsLoading(true)
          const email = searchParams.get('email')
          const emailType = Number(searchParams.get('email_type'))
          if (email && emailType) {
            await resendVerificationMail(email, emailType)
              .then((res) => {
                if (res) setStep('EMAIL_SENT_NOTE')
              })
              .catch((e) => {
                setError('Something went wrong.')
              })
              .finally(() => {
                setIsLoading(false)
              })
          }
        }}>
        {isLoading ? (
          <Loader size="sm" className="fill-new-off-white" />
        ) : (
          <p className="text-title-3-demi">Resend verification email</p>
        )}
        {error && <p className="flex items-center justify-center text-title-3-med text-supplementary-red">{error}</p>}
      </Button>
    </ModalShell>
  )
}
