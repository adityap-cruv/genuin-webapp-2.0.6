import { SettingsLayout } from '@components/layouts/settings/desktop/layout'
import { cookies } from 'next/headers'
import { auth } from '../../../../auth'
import { redirect } from 'next/navigation'
import { PATH_NAME } from '@/lib/utils/constants/path'

export default async function AppLayout(props: any) {
  const isMobile = (await cookies()).get('device_type')?.value === 'mobile'
  const userSession = await auth()
  if (userSession === null) {
    redirect(PATH_NAME.home())
  }
  return isMobile ? props.children : <SettingsLayout>{props.children}</SettingsLayout>
}
