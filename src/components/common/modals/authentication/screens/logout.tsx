import { ModalShell } from '../modal-shell'
import { Button } from '@components/ui/button'
import { removeAllAuthToken } from '@lib/api/instance'
import { signOut } from 'next-auth/react'
import { useAuthenticationModalStore } from '../store'

export function Logout() {
  const { close } = useAuthenticationModalStore()

  return (
    <ModalShell>
      <h3 className="text-center text-title-1-demi sm:text-heading-3">Log out?</h3>
      <p className="text-center text-title-3-med">
        You won’t be able to contribute in any community or receive notifications.{' '}
      </p>
      <Button
        variant="default"
        className="w-full text-title-3-med !text-new-off-white"
        onClick={() => {
          void signOut({ callbackUrl: `${window.location.pathname}${window.location.search}`, redirect: true })
          removeAllAuthToken()
        }}>
        Logout
      </Button>
      <p
        className="text-title-3-med hover:cursor-pointer"
        onClick={() => {
          close()
        }}>
        Cancel
      </p>
    </ModalShell>
  )
}
