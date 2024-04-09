import { ModalShell } from '../modal-shell'
import icErrorInForm from '@icons/ic-error-in-form.svg'
import { Button } from '@components/ui/button'
import { useAuthenticationModalStore } from '../store'

export function Error() {
  const setStep = useAuthenticationModalStore().setStep
  return (
    <ModalShell>
      <img src={icErrorInForm.src} className="h-20 w-20" />
      <h3 className="text-center text-heading-3 text-secondary">Oops! Something went wrong</h3>
      <p className="text-center text-title-3-med text-secondary">
        We're sorry, but it looks like something has gone wrong on our end. Please try logging in again.
      </p>
      <Button
        variant="default"
        className="w-full text-title-3-med !text-new-off-white"
        onClick={() => {
          setStep('EMAIL_INPUT')
        }}>
        Login
      </Button>
    </ModalShell>
  )
}
