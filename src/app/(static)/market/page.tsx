import { cookies } from 'next/headers'
import { Desktop } from './desktop'
import { Mobile } from './mobile'

export default function Component() {
  const isMobile = cookies().get('mobile')?.value === 'true'

  return isMobile ? <Mobile /> : <Desktop />
}
