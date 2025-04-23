import { Layout } from '@components/layouts/desktop/layout'
import { TopBar } from '@components/layouts/mobile/top-bar'
import { cookies } from 'next/headers'
import { type ReactNode } from 'react'

export default function PageLayout({ children }: { children: ReactNode }) {
  const isMobile = cookies().get('device_type')?.value === 'mobile'

  if (isMobile) {
    return (
      <main className="h-screen overflow-auto">
        <TopBar />
        <div className="h-full">{children}</div>
      </main>
    )
  }
  return <Layout>{children}</Layout>
}
