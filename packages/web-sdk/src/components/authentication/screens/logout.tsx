import { ModalShell } from '../modal-shell'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/auth'
import { useAuthModalContext } from '@/components/authentication/context'

export function Logout() {
  const { signOut } = useAuth()
  const { close } = useAuthModalContext()

  return (
    <ModalShell>
      <h3 className='text-center text-title-1-demi sm:text-heading-3'>
        Log out?
      </h3>
      <p className='text-center text-title-3-med'>
        You won’t be able to contribute in any community or receive
        notifications.
      </p>
      <Button
        variant='default'
        className='w-full text-title-3-med !text-white'
        onClick={() => {
          signOut()
          close()
        }}>
        Logout
      </Button>
      <p
        className='text-title-3-med hover:cursor-pointer'
        onClick={close}>
        Cancel
      </p>
    </ModalShell>
  )
}
