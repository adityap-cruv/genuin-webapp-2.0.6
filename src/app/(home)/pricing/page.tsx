import { cookies } from 'next/headers'
import Desktop from './desktop'
import Mobile from './mobile'

export default function Component() {
  const isMobile = cookies().get('device_type')?.value === 'mobile'
  return isMobile ? <Mobile /> : <Desktop />
}
