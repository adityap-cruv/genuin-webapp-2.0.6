'use client'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useEffect } from 'react'

export function ClientComponent({ user, redirectTo }: { user: any; redirectTo: string }) {
  const router = useRouter()
  useEffect(() => {
    void signIn('credentials', { ...user, redirect: false })
      .then((val) => {
        if (val?.ok) {
          console.log('signed in..')
          console.log('redirectTo:', redirectTo)
          router.replace(redirectTo)
        }
      })
      .catch((e) => {
        console.log('::Error in signin::', e)
      })
  }, [])

  return <></>
}
