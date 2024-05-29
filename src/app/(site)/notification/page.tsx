import { NotificationLayout } from './notification-layout'
import { Layout } from '@components/layouts/desktop/layout'
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
