import { useSession } from 'next-auth/react'
import { Button } from '@components/ui/button'
import { ModalShell } from '../modal-shell'
import { useAuthenticationModalStore } from '../store'
import imgError from '@images/verify-email/error.svg'
import { resendVerificationMail } from '@lib/api/auth'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

export const MagicLinkVerification = {
  success: Success,
  failure: Failure,
}

export function Success() {
  const { data, status } = useSession()
  const setStep = useAuthenticationModalStore().setStep

  if (status !== 'loading')
    return (
      <ModalShell>
        <h3 className="text-heading-3">Welcome back, {data?.user.name} </h3>
        <Button
          className="w-full bg-monochrome-black hover:bg-new-dark-grey"
          onClick={() => {
            setStep('PASSWORD_INPUT')
          }}>
          <p>Continue</p>
        </Button>
      </ModalShell>
    )
}

export function Failure() {
  const [error, setError] = useState('')
  const setStep = useAuthenticationModalStore().setStep
  const searchParams = useSearchParams()

  return (
    <ModalShell>
      <img src={imgError.src} className="h-28 w-28" />
      <h3 className="text-heading-3">Magic link expired</h3>
      <p className="text-center text-title-3-med">
        We're sorry, but it looks like the magic link has expired. Please request a new magic link.
      </p>
      <Button
        className="w-full bg-monochrome-black hover:bg-new-dark-grey"
        onClick={async () => {
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
          }
        }}>
        <p className="text-title-3-med">Resend magic link</p>
      </Button>
      {error && <p className="flex items-center justify-center text-title-3-med text-supplementary-red">{error}</p>}
    </ModalShell>
  )
}
