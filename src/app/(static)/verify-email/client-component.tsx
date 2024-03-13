'use client'

import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function ClientComponent({ user, redirectTo }: { user: any; redirectTo: string }) {
  const router = useRouter()
  useEffect(() => {
    console.log('::signing in::')
    void signIn('credentials', { ...user, callbackUrl: redirectTo, redirect: false })
      .then((val) => {
        if (val?.ok) {
          console.log('signed in..')
          router.replace(redirectTo)
        }
      })
      .catch((e) => {
        console.log('::Error in signin::', e)
      })
  }, [])

  return <></>
}
