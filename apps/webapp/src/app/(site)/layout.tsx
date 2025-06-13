'use client'
import { AuthProvider } from '@genuin/components/context/auth'
import React from 'react'

interface SiteLayoutProps {
  children: React.ReactNode
}

export default function SiteLayout({ children }: SiteLayoutProps) {
  return (
    <AuthProvider user={null} onSignIn={() => {}} onSignOut={() => {}} onUpdateUser={() => {}}>
      {children}
    </AuthProvider>
  )
}
