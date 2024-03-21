'use client'
import { signIn } from 'next-auth/react'
import { useEffect } from 'react'

export function ClientComponent({ user, redirectTo }: { user: any; redirectTo: string }) {
  user.is_email_verified = true
  useEffect(() => {
    void signIn('credentials', { ...user, redirect: false })
      .then((val) => {
        if (val?.ok) {
          // router.replace(redirectTo)
          window.location.replace(redirectTo)
        }
      })
      .catch((e) => {
        console.log('::Error in signin::', e)
        // router.replace('/home?error_in_verification=1')
        window.location.replace('/home?error_in_verification=1')
      })
  }, [])

  return <></>
}
