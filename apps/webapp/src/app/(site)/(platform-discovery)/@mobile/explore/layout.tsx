import { Layout } from '@components/layouts/desktop/layout'
import { TopBar } from '@components/layouts/mobile/top-bar'
import { cookies } from 'next/headers'
import { type ReactNode } from 'react'

export default async function PageLayout({ children }: { children: ReactNode }) {
  const isMobile = (await cookies()).get('device_type')?.value === 'mobile'

  return (
    <main className="h-screen overflow-auto">
      <TopBar />
      <div className="h-full">{children}</div>
    </main>
  )
}
