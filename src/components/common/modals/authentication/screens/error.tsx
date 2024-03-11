import { ModalShell } from '../modal-shell'
import icErrorInForm from '@icons/ic-error-in-form.svg'
import { Button } from '@components/ui/button'

export function Error() {
  return (
    <ModalShell>
      <img src={icErrorInForm.src} className="h-20 w-20" />
      <h3 className="text-heading-3">Oops! Something went wrong</h3>
      <p className="text-center text-title-3-med">
        We're sorry, but it looks like something went wrong on our end. Please retry to continue.{' '}
      </p>
      <Button
        variant="default"
        className="w-full rounded-full bg-new-off-black text-title-3-med !text-new-off-white hover:bg-new-dark-grey"
        onClick={() => {}}>
        Retry
      </Button>
    </ModalShell>
  )
}
