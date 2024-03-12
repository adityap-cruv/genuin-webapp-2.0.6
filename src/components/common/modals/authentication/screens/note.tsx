import { ModalShell } from '../modal-shell'
import { useAuthenticationModalStore } from '../store'

export const Note = {
  email: Email,
  magicLink: MagicLink,
}

// TODO: Add mail link to email
function Email() {
  const email = useAuthenticationModalStore().formData.email
  return (
    <ModalShell>
      <p className="text-center text-title-1-med">
        We have sent a confirmation link to your <span className="text-title-1-bold">{email}</span>. Verify your email
        to save your profile.
      </p>
      <p className="text-title-3-demi">
        Not seeing the email? <span className="text-primary">Resend</span>
      </p>
    </ModalShell>
  )
}

function MagicLink() {
  return <p>configure it.</p>
}
