import { Button } from '@components/ui/button'
import imgSuccess from '@images/verify-email/success.svg'
import { ModalShell } from '../modal-shell'
import imgError from '@images/verify-email/error.svg'
import { useAuthenticationModalStore } from '../store'
import { usePathname, useSearchParams } from 'next/navigation'
import { resendVerificationMail } from '@lib/api/auth'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { deleteSearchParam } from '@lib/utils'
import { Loader } from '@components/ui/loader'

export const EmailVerification = {
  success: Success,
  failure: Failure,
}

function Success() {
  const setStep = useAuthenticationModalStore().setStep
  const pathName = usePathname()
  const searchParams = useSearchParams()
  const { data: sessionData, update } = useSession()

  useEffect(() => {
    void update({ ...sessionData, user: { ...sessionData?.user, isEmailVerified: true } })
  }, [])

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
          deleteSearchParam({
            paramToDelete: 'email_verification_status',
            pathName,
            searchParams: searchParams.toString(),
          })
          setStep('PASSWORD_INPUT')
        }}>
        <p className="text-title-3-med">Continue</p>
      </Button>
    </ModalShell>
  )
}

// TODO: Create a deleteSearchParam function such that it accepts array of string and delete that list search params from the url.
function Failure() {
  const { setStep, setFormData } = useAuthenticationModalStore()
  const searchParams = useSearchParams()
  const pathName = usePathname()
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setFormData({ email: searchParams.get('email') ?? '' })
  }, [searchParams])

  async function resendMail() {
    const email = searchParams.get('email')
    const emailType = Number(searchParams.get('email_type'))
    if (email && emailType) {
      setIsLoading(true)
      await resendVerificationMail(email, emailType)
        .then((res) => {
          if (res.code === 200) {
            deleteSearchParam({
              pathName,
              searchParams: searchParams.toString(),
              paramToDelete: 'email_verification_status',
            })
            deleteSearchParam({
              pathName,
              searchParams: searchParams.toString(),
              paramToDelete: 'email',
            })
            deleteSearchParam({
              pathName,
              searchParams: searchParams.toString(),
              paramToDelete: 'email_type',
            })
            setStep('EMAIL_SENT_NOTE')
          } else {
            throw new Error()
          }
        })
        .catch((e) => {
          setError('Something went wrong.')
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }

  return (
    <ModalShell>
      <img src={imgError.src} style={{ width: 120, height: 120 }} />
      <p className="text-center text-heading-3">Verification link expired</p>
      <p className="text-center text-title-3-med">
        We're sorry, but it looks like the verification link has expired. Please request a new verification link.
      </p>
      <Button
        disabled={isLoading}
        className="w-full bg-new-off-black hover:bg-new-dark-grey"
        variant="default"
        onClick={resendMail}>
        {isLoading ? (
          <Loader size="sm" className="fill-new-off-white" />
        ) : (
          <p className="text-title-3-demi">Resend verification email</p>
        )}
      </Button>
      {error && <p className="flex items-center justify-center text-title-3-med text-supplementary-red">{error}</p>}
    </ModalShell>
  )
}
