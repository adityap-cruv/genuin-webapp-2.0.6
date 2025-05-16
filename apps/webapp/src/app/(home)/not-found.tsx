import { NotFound as DesktopNotFound } from '@components/pages/not-found-screens/desktop'
import { NotFound as MobileNotFound } from '@components/pages/not-found-screens/mobile'
import { cookies } from 'next/headers'

export default async function NotFound() {
  const cookieStore = await cookies()
  const isMobile = cookieStore.get('mobile')?.value === 'true'
  return isMobile ? <MobileNotFound /> : <DesktopNotFound />
}
