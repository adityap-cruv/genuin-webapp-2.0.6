import { useSession } from 'next-auth/react'
import { Button } from '@components/ui/button'
import { ModalShell } from '../modal-shell'
import { useAuthenticationModalStore } from '../store'
import imgError from '@images/verify-email/error.svg'
import { resendVerificationMail } from '@lib/api/auth'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { deleteSearchParam } from '@lib/utils'
import { Loader } from '@components/ui/loader'

export const MagicLinkVerification = {
  success: Success,
  failure: Failure,
}

export function Success() {
  const { data, status } = useSession()
  const pathName = usePathname()
  const searchParams = useSearchParams()
  const setStep = useAuthenticationModalStore().setStep

  if (status !== 'loading')
    return (
      <ModalShell>
        <h3 className="text-title-1-demi sm:text-heading-3">Welcome back, {data?.user.name} </h3>
        <Button
          className="w-full"
          onClick={() => {
            deleteSearchParam({
              pathName,
              searchParams: searchParams.toString(),
              paramsToDelete: ['magic_link_verification'],
            })
            setStep('PASSWORD_INPUT')
          }}>
          <p>Continue</p>
        </Button>
      </ModalShell>
    )
}

// TODO: Handle API success and failure case.
export function Failure() {
  const [error, setError] = useState('')
  const { setStep, setFormData } = useAuthenticationModalStore()
  const pathName = usePathname()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setFormData({ email: searchParams.get('email') ?? '' })
  }, [searchParams])

  async function resendMail() {
    const email = searchParams.get('email')
    const emailType = Number(searchParams.get('email_type'))
    if (email && emailType) {
      setIsLoading(false)
      await resendVerificationMail(email, emailType)
        .then((res) => {
          if (res.code === 200) {
            deleteSearchParam({
              pathName,
              searchParams: searchParams.toString(),
              paramsToDelete: ['magic_link_verification', 'email', 'email_type'],
            })
            setStep('MAGIC_LINK_SENT_NOTE')
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
      <img src={imgError.src} className="h-28 w-28" />
      <h3 className="text-title-1-demi sm:text-heading-3">Magic link expired</h3>
      <p className="text-center text-title-3-med">
        We're sorry, but it looks like the magic link has expired. Please request a new magic link.
      </p>
      <Button className="w-full" onClick={resendMail}>
        {isLoading ? (
          <Loader size="sm" className="fill-new-off-white" />
        ) : (
          <p className="text-title-3-med">Resend magic link</p>
        )}
      </Button>
      {error && <p className="flex items-center justify-center text-title-3-med text-supplementary-red">{error}</p>}
    </ModalShell>
  )
}
