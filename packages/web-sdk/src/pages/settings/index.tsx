import { useAuth } from '@/context/auth'
import { AccountPage } from './account'
import { ContactPage } from './contact'
import { EditPage } from './edit'
import { PersonalizationPage } from './personalization'
import { navigate } from '@/router/context'
import { useSizeContext } from '@/context/size'
import { SettingsPageMobile } from '@/components/pages/settings/mobile-page'
import { usePathNameWithSubdomain } from '@/hooks/usePathNameWithSubdomain'

type SettingsPagePropsType = {
  path?: 'edit' | 'account' | 'personalization' | 'contact'
}
export function SettingsPage({ path }: SettingsPagePropsType) {
  const pathName = usePathNameWithSubdomain()
  const { isMobile } = useSizeContext()
  const { user } = useAuth()

  if (!path && !isMobile) {
    navigate(pathName.settings('edit'))
    return
  }

  if (!user) {
    navigate(pathName.home())
    return
  }

  if (path === 'edit') {
    return <EditPage nickname={user.nickname} />
  }
  if (path === 'account') {
    return <AccountPage />
  }
  if (path === 'contact') {
    return <ContactPage />
  }
  if (path === 'personalization') {
    return <PersonalizationPage />
  }

  return <SettingsPageMobile />
}
