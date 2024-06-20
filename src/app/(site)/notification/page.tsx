import { NotificationLayout } from './notification-layout'
import { Layout } from '@components/layouts/desktop/layout'
import { type Metadata } from 'next'
import { cookies } from 'next/headers'

export default function Page() {
  const isMobile = cookies().get('device_type')?.value === 'mobile'
  if (isMobile) return <NotificationLayout />
  return (
    <Layout>
      <NotificationLayout />
    </Layout>
  )
}

export function generateMetadata(): Metadata {
  return {
    robots: { index: false, follow: false },
  }
}
