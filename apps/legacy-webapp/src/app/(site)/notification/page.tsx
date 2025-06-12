import { NotificationLayout } from './notification-layout'
import { Layout } from '@components/layouts/desktop/layout'
import { type Metadata } from 'next'
import { cookies } from 'next/headers'
import { auth } from '../../../../auth'
import { PATH_NAME } from '@/lib/utils/constants/path'
import { redirect } from 'next/navigation'

export default async function Page() {
  const isMobile = (await cookies()).get('device_type')?.value === 'mobile'
  const userSession = await auth()
  if (userSession === null) {
    redirect(PATH_NAME.home())
  }
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
