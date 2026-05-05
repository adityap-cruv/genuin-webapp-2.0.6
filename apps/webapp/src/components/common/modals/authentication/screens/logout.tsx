import { signOut } from 'next-auth/react'

import { checkIfUrlIncludesProtectedRoute } from '@/lib/utils'
import { Button } from '@components/ui/button'
import { removeAllAuthToken } from '@lib/api/instance'

import { ModalShell } from '../modal-shell'
import { useAuthenticationModalStore } from '../store'


export function Logout() {
  const { close } = useAuthenticationModalStore()

  return (
    <ModalShell>
      <h3 className="text-title-1-demi sm:text-heading-3 text-center">Log out?</h3>
      <p className="text-title-3-med text-center">
        You won’t be able to contribute in any community or receive notifications.{' '}
      </p>
      <Button
        variant="default"
        className="text-title-3-med !text-monochrome-white w-full"
        onClick={() => {
          let redirectUrl = window.location.pathname
          if (checkIfUrlIncludesProtectedRoute(redirectUrl)) {
            redirectUrl = '/home'
          }
          redirectUrl += window.location.search
          void signOut({ callbackUrl: redirectUrl, redirect: true })
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
