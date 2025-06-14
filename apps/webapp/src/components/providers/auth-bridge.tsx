'use client'
import { AuthProvider } from '@genuin/components/context/auth'
import { useSession } from 'next-auth/react'
import React from 'react'
import { signOut } from 'next-auth/react'
import { signIn } from 'next-auth/react'

type SiteLayoutProps = {
  children: React.ReactNode
}

export function AuthBridge({ children }: SiteLayoutProps) {
  const { data: authUser, update } = useSession()
  console.log('Auth user in layout:', authUser)
  return (
    <AuthProvider
      user={authUser?.user ?? null}
      onSignIn={async (user) => {
        console.log('Signing in user:', user)
        await signIn('credentials', { ...user, redirect: false }).then((result) => {
          console.log('Sign in result:', result)
        })
      }}
      onSignOut={(redirectPath) => signOut({ callbackUrl: redirectPath })}
      onUpdateUser={async (newUser) => {
        await update({ ...authUser, ...newUser })
      }}>
      {children}
    </AuthProvider>
  )
}
