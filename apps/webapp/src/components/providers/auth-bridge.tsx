'use client'
import { AuthProvider } from '@genuin/components/context/auth'
import React from 'react'
import { signIn, useSession, signOut } from 'next-auth/react'
import { useGenuinOptions } from '@lib/stores/genuin-options'

type SiteLayoutProps = {
  children: React.ReactNode
}

export function AuthBridge({ children }: SiteLayoutProps) {
  const { data: authUser, update } = useSession()
  return (
    <AuthProvider
      user={authUser?.user ?? null}
      onSignIn={async (user) => {
        await signIn('credentials', { ...user, profileImage: user.image, redirect: false }).then((result) => {})
      }}
      onSignOut={(redirectPath) => {
        // Clear user data from Zustand store
        useGenuinOptions.getState().clearUserData()
        return signOut({ callbackUrl: redirectPath })
      }}
      onUpdateUser={async (newUser) => {
        await update({ ...authUser, user: { ...authUser?.user, ...newUser } })
      }}>
      {children}
    </AuthProvider>
  )
}
