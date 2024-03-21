import { useState } from 'react'
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

  async function resendMail() {
    if (email)
      await resendVerificationMail(email, 12)
        .then((res) => {
          if (res.code === 200) {
            setEmailSentText('Email has been sent sucessfully')
          } else if (res.code === 5239) {
            setError((x) => {
              return { message: 'Email has already been verified', code: res.code }
            })
          } else {
            throw new Error()
          }
        })
        .catch((e) => {
          setError((x) => {
            return { message: 'Something went wrong.Please try again.', code: -1 }
          })
        })
  }

  return (
    <ModalShell>
      <p className="text-center text-title-1-med">
        {acountExists && 'An account with the given email already exists. '}We have sent a confirmation link to{' '}
        <span className="text-title-1-bold">{shortenedEmail(email)}</span>. Verify your email to save your profile{' '}
        {acountExists && 'and continue'}.
      </p>
      {error.code !== 5239 && (
        <p className="text-title-3-demi">
          Not seeing the email?{' '}
          <span onClick={resendMail} className="cursor-pointer text-primary">
            Resend
          </span>
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
