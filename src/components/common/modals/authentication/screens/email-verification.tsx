import { Button } from '@components/ui/button'
import imgSuccess from '@images/verify-email/success.svg'
import { ModalShell } from '../modal-shell'
import imgError from '@images/verify-email/error.svg'
import { useAuthenticationModalStore } from '../store'

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
  const showNote = useAuthenticationModalStore().showNote

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
        onClick={() => {
          showNote(<NextNote />)
        }}>
        <p className="text-title-3-demi">Resend verification email</p>
      </Button>
    </ModalShell>
  )
}

// TODO: Add dynamic mail.
function NextNote() {
  return (
    <ModalShell>
      <p className="text-title-1-med text-center">
        We have sent a confirmation link to your <span className="text-title-1-bold">john.doe@gmail.com</span>. Verify
        your email to save your profile.
      </p>
      <p className="text-title-3-demi">
        Not seeing the email? <span className="text-primary">Resend</span>
      </p>
    </ModalShell>
  )
}
