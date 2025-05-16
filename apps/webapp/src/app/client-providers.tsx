'use client'

import { SessionProvider } from 'next-auth/react'
import { ReactQueryProvider } from './providers'

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ReactQueryProvider>{children}</ReactQueryProvider>
    </SessionProvider>
  )
}
