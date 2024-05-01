import Mobile from './mobile'
import Desktop from './desktop'
import { cookies } from 'next/headers'

export default function Component() {
  const isMobile = cookies().get('device_type')?.value === 'mobile'
  return isMobile ? <Mobile /> : <Desktop />
}
