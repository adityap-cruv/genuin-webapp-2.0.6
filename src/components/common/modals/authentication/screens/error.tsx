import { ModalShell } from '../modal-shell'
import icErrorInForm from '@icons/ic-error-in-form.svg'
import { Button } from '@components/ui/button'
import { useAuthenticationModalStore } from '../store'

export function Error() {
  const setStep = useAuthenticationModalStore().setStep
  return (
    <ModalShell>
      <img src={icErrorInForm.src} className="h-20 w-20" />
      <h3 className="text-heading-3">Oops! Something went wrong</h3>
      <p className="text-center text-title-3-med">
        We're sorry, but it looks like something has gone wrong on our end. Please try logging in again.
      </p>
      <Button
        variant="default"
        className="w-full bg-new-off-black text-title-3-med !text-new-off-white hover:bg-new-dark-grey"
        onClick={() => {
          setStep('EMAIL_INPUT')
        }}>
        Login
      </Button>
    </ModalShell>
  )
}
