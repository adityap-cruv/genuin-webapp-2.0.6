import { cn } from '@/utils'
import {
  AccountIcon,
  ContactUsIcon,
  EditIcon,
  PersonalizationIcon,
} from '@/components/icons/settings'
import { AuthenticationModal } from '@/components/authentication'
import { LogoutIcon } from '@/components/icons/logout-icon'
import { CustomLink } from '@/router/custom-link'
import { useLocation } from 'wouter'
import { ListItem } from './list-item'
import {
  SettingsPageType,
  usePathNameWithSubdomain,
} from '@/hooks/usePathNameWithSubdomain'
import { Analytics } from '@/analytics'

// Navigation items configuration
const NAV_ITEMS = [
  {
    title: 'Edit Profile',
    path: 'edit',
    icon: EditIcon,
  },
  {
    title: 'Account',
    path: 'account',
    icon: AccountIcon,
  },
  {
    title: 'Personalization',
    path: 'personalization',
    icon: PersonalizationIcon,
  },
  {
    title: 'Contact Us',
    path: 'contact',
    icon: ContactUsIcon,
  },
]

type SettingsMenuProps = {
  /**
   * If true, the menu will be displayed for mobile devices.
   */
  forMobile?: boolean
}

export function SettingsMenu({ forMobile = false }: SettingsMenuProps) {
  const pathName = usePathNameWithSubdomain()
  const [location] = useLocation()

  const handleLogout = () => {
    AuthenticationModal.open(undefined, 'LOGOUT')
    Analytics.track(Analytics.EventNames.LogOut)
  }

  return (
    <>
      <p
        className={cn(
          'mb-3 text-title-2-bold',
          forMobile && 'hidden',
          !forMobile && 'hidden md:block',
        )}>
        Settings
      </p>
      {NAV_ITEMS.map(({ title, path, icon: Icon }) => {
        const isActive = location === '/settings/' + path
        return (
          <CustomLink
            key={path}
            href={pathName.settings(path as SettingsPageType)}>
            <ListItem
              title={title}
              isActive={isActive}
              className={cn(
                forMobile && 'flex',
                !forMobile && 'hidden md:flex',
              )}
              showRightElement={forMobile}>
              <Icon
                className='h-6 w-6 shrink-0'
                isActive={isActive}
              />
            </ListItem>
          </CustomLink>
        )
      })}
      <ListItem
        title='Log out'
        onClick={handleLogout}
        showRightElement={false}>
        <LogoutIcon className='stroke-secondary h-6 w-6 shrink-0' />
      </ListItem>
    </>
  )
}
