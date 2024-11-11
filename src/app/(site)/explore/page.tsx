import { cookies } from 'next/headers'
import { Root } from './root'

export default function Page() {
  const isMobile = cookies().get('device_type')?.value === 'mobile'
  return <Root isMobile={isMobile} />
}
