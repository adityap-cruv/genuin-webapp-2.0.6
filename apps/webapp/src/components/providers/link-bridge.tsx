'use client'
import { LinkProvider } from '@genuin/components/context/link'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function LinkBridge({ children }: { children: React.ReactNode }) {
  return (
    <LinkProvider LinkComponent={Link} isNextJS usePathname={usePathname}>
      {children}
    </LinkProvider>
  )
}
