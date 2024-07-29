import { ModalShell } from '../modal-shell'
import icErrorInForm from '@icons/ic-error-in-form.svg'
import { Button } from '@components/ui/button'
import { useAuthenticationModalStore } from '../store'
import { useGenuinOptions } from '@lib/stores/genuin-options'

export function Error() {
  const setStep = useAuthenticationModalStore().setStep
  const embed = useGenuinOptions().embed
  return (
    <ModalShell>
      <img src={icErrorInForm.src} className="h-20 w-20" />
      <h3 className="text-center text-title-1-demi sm:text-heading-3">Oops! Something went wrong</h3>
      <p className="text-center text-title-3-med">
        We're sorry, but it looks like something has gone wrong on our end. Please try logging in again.
      </p>
      {embed && (
        <Button
          variant="default"
          className="w-full text-title-3-med !text-new-off-white"
          onClick={() => {
            setStep('STARTER')
          }}>
          Login
        </Button>
      )}
    </ModalShell>
  )
}
