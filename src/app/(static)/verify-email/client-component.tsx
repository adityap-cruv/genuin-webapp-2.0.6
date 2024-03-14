'use client'

import { signIn } from 'next-auth/react'
import { useEffect } from 'react'

export function ClientComponent({ user, redirectTo }: { user: any; redirectTo: string }) {
  useEffect(() => {
    console.log('::signing in with::', JSON.stringify(user))
    void signIn('credentials', { ...user, callbackUrl: redirectTo, redirect: true })
      .then((val) => {
        if (val?.ok) {
          console.log('signed in..')
          console.log('redirectTo:', redirectTo)
          // router.replace(redirectTo)
        }
      })
      .catch((e) => {
        console.log('::Error in signin::', e)
      })
  }, [])

  return <></>
}
