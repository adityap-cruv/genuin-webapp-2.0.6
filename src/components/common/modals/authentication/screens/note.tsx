import { useState } from 'react'
import { ModalShell } from '../modal-shell'
import { useAuthenticationModalStore } from '../store'
import { resendVerificationMail } from '@lib/api/auth'

export const Note = {
  email: Email,
  magicLink: MagicLink,
}

function Email({ acountExists = false }: { acountExists?: boolean }) {
  const email = useAuthenticationModalStore().formData.email
  const [error, setError] = useState('')

  return (
    <ModalShell>
      <p className="text-center text-title-1-med">
        {acountExists && 'An account with the given email already exists. '}We have sent a confirmation link to{' '}
        <span className="text-title-1-bold">{email}</span>. Verify your email to save your profile.
      </p>
      <p className="text-title-3-demi">
        Not seeing the email?{' '}
        <span
          onClick={async () => {
            if (email)
              await resendVerificationMail(email, 12)
                .then((res) => {
                  // if (res)
                })
                .catch((e) => {
                  setError('Something went wrong.Please try again.')
                })
          }}
          className="cursor-pointer text-primary">
          Resend
        </span>
      </p>
      {error && <p className="flex items-center justify-center text-title-3-med text-supplementary-red">{error}</p>}
    </ModalShell>
  )
}

function MagicLink() {
  const email = useAuthenticationModalStore().formData.email
  return (
    <ModalShell>
      <p className="text-center text-title-1-med">
        We have sent a magic link to <span className="text-title-1-bold">{email}</span>. Click the link to Log in to
        Ted.
      </p>
    </ModalShell>
  )
}
