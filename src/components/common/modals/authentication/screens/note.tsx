import { useEffect, useState } from 'react'
import { ModalShell } from '../modal-shell'
import { useAuthenticationModalStore } from '../store'
import { resendVerificationMail } from '@lib/api/auth'
import { shortenedEmail } from '@lib/utils'
import { useGenuinOptions } from '@lib/stores/genuin-options'

export const Note = {
  email: Email,
  magicLink: MagicLink,
}

function Email({ acountExists = false }: { acountExists?: boolean }) {
  const email = useAuthenticationModalStore().formData.email
  const [error, setError] = useState({ message: '', code: 0 })
  const [emailSentText, setEmailSentText] = useState('')
  const [timer, setTimer] = useState(!acountExists ? 30 : 0)

  useEffect(() => {
    const interval = setInterval(() => {
      if (timer > 0) {
        setTimer(timer - 1)
      }
    }, 1000)
    return () => {
      clearInterval(interval)
    }
  }, [timer])

  async function resendMail() {
    if (email && timer <= 0) {
      await resendVerificationMail(email, 12)
        .then((res) => {
          if (res.code === 200) {
            setEmailSentText('Email has been sent sucessfully')
            setTimer(res?.retryTime)
          } else if (res.code === 5239) {
            setError((x) => {
              return { message: 'Email has already been verified', code: res.code }
            })
          } else {
            setTimer(res?.retryTime)
            throw new Error()
          }
        })
        .catch((e) => {
          setError((x) => {
            return { message: 'Something went wrong.Please try again.', code: -1 }
          })
        })
    }
  }

  function formatTime() {
    const minutes = Math.floor(timer / 60)
    const seconds = timer % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <ModalShell>
      <p className="text-center text-title-1-med">
        {acountExists && 'An account with this email already exists. '}We have sent a confirmation link to{' '}
        <span className="text-title-1-bold">{shortenedEmail(email)}</span>. Verify your email{' '}
        {!acountExists && 'to save your profile'}
        {acountExists && 'to continue'}.
      </p>
      {error.code !== 5239 && (
        <p className="text-title-3-demi">
          Not seeing the email?{' '}
          {timer <= 0 ? (
            <span onClick={resendMail} className="cursor-pointer text-primary">
              Resend
            </span>
          ) : (
            <span className="text-center text-body-1-med text-monochrome">{formatTime()}</span>
          )}
        </p>
      )}
      {emailSentText && (
        <p className="flex items-center justify-center text-title-3-med text-supplementary-green">{emailSentText}</p>
      )}
      {error.message && !emailSentText && (
        <p className="flex items-center justify-center text-title-3-med text-supplementary-red">{error.message}</p>
      )}
    </ModalShell>
  )
}

function MagicLink() {
  const email = useAuthenticationModalStore().formData.email
  const brandName = useGenuinOptions().config?.name
  return (
    <ModalShell>
      <p className="text-center text-title-1-med">
        We have sent a magic link to <span className="text-title-1-bold">{shortenedEmail(email)}</span>. Click the link
        to Log in to {brandName}.
      </p>
    </ModalShell>
  )
}
