'use client'

import { signIn } from 'next-auth/react'
import { useEffect } from 'react'

export function ClientComponent({ user, redirectTo }: { user: any; redirectTo: string }) {
  useEffect(() => {
    console.log('::signing in::')
    void signIn('credentials', { ...user, callbackUrl: redirectTo, redirect: false })
      .then((val) => {
        if (val?.ok) {
          console.log('signed in..')
        }
      })
      .catch((e) => {
        console.log('::Error in signin::', e)
      })
  }, [])

  return <></>
}
