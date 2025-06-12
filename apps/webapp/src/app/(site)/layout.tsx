'use client'
import { AuthProvider } from '@genuin/components/context/auth'
import { ReactQueryClientProvider } from '@genuin/components/react-query/react-query-provider'
import { useBaseContext } from '@genuin/components/context/base/context'
import { parseBrandColors } from '@genuin/components/lib/utils/brand-color-parser'
import { BaseLayout } from '@genuin/components/templates/base-layout/base-layout'
import React from 'react'

interface SiteLayoutProps {
  children: React.ReactNode
}

export default function SiteLayout({ children }: SiteLayoutProps) {
  const { brandDetails } = useBaseContext()
  const parsedColors = parseBrandColors(brandDetails?.brand_colors)
  return (
    <AuthProvider user={null} onSignIn={() => {}} onSignOut={() => {}} onUpdateUser={() => {}}>
      <ReactQueryClientProvider>
        <main style={{ ...parsedColors }}>
          <BaseLayout>{children}</BaseLayout>
        </main>
      </ReactQueryClientProvider>
    </AuthProvider>
  )
}
