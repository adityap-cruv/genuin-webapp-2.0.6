import { cookies } from 'next/headers'
import SettingsMenu from './settings-menu'

export default async function Page() {
  const isMobile = cookies().get('device_type')?.value === 'mobile'

  return <SettingsMenu isMobile={isMobile} />
}
