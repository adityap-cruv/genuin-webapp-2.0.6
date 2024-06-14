'use client'
import { signIn } from 'next-auth/react'
import { useEffect } from 'react'

export function ClientComponentEmail({ user, redirectTo }: { user: any; redirectTo: string }) {
  useEffect(() => {
    if (!user) {
      window.location.replace(redirectTo)
      return
    }
    user.is_email_verified = true
    void signIn('credentials', { ...user, redirect: true, callbackUrl: redirectTo })
      .then((val) => {})
      .catch((e) => {
        // console.log('::Error in signin::', e)
        // router.replace('/home?error_in_verification=1')
        window.location.replace('/home?error_in_verification=1')
      })
  }, [])

  return <></>
}

export function ClientComponentSMS({ redirectTo }: { redirectTo: string }) {
  useEffect(() => {
    window.location.replace(redirectTo)
  }, [])
  return <></>
}
