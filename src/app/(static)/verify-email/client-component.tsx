'use client'

import { signIn } from 'next-auth/react'
import { useEffect } from 'react'

export function ClientComponent({ user, redirectTo }: { user: any; redirectTo: string }) {
  useEffect(() => {
    void signIn('credentials', { ...user, callbackUrl: redirectTo, redirect: true })
  }, [])

  return <></>
}
