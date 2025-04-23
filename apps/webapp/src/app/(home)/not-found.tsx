import { NotFound as DesktopNotFound } from '@components/pages/not-found-screens/desktop'
import { NotFound as MobileNotFound } from '@components/pages/not-found-screens/mobile'
import { cookies } from 'next/headers'

export default function NotFound() {
  const isMobile = cookies().get('mobile')?.value === 'true'
  return isMobile ? <MobileNotFound /> : <DesktopNotFound />
}
