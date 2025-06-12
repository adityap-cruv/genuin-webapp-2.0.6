'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { type ReactNode } from 'react'
import { cn } from '@lib/utils'
import { PATH_NAME } from '@lib/utils/constants/path'
import { AccountIcon, ContactUsIcon, EditIcon, PersonalizationIcon } from '@icons/settings-side-bar-icons'
import { AuthenticationModal } from '@components/common/modals/authentication'
import Analytics from '@services/analytics'
import { LogoutIcon } from '@icons/logout'

export function SideBar() {
  const pathName = usePathname()

  return (
    <nav className="flex h-full w-fit flex-col overflow-auto transition-[width] md:w-full">
      <p className="mb-3 hidden text-title-2-bold md:block">Settings</p>
      <div>
        <Link href={{ pathname: PATH_NAME.settings('edit') }}>
          <Item title="Edit Profile" isActive={pathName === PATH_NAME.settings('edit')}>
            <EditIcon isActive={pathName === PATH_NAME.settings('edit')} />
          </Item>
        </Link>
        <Link href={{ pathname: PATH_NAME.settings('account') }}>
          <Item title="Account" isActive={pathName === PATH_NAME.settings('account')}>
            <AccountIcon isActive={pathName === PATH_NAME.settings('account')} />
          </Item>
        </Link>
        <Link href={{ pathname: PATH_NAME.settings('personalization') }}>
          <Item title="Personalization" isActive={pathName === PATH_NAME.settings('personalization')}>
            <PersonalizationIcon isActive={pathName === PATH_NAME.settings('personalization')} />
          </Item>
        </Link>
        <Link href={{ pathname: PATH_NAME.settings('contact') }}>
          <Item title="Contact Us" isActive={pathName === PATH_NAME.settings('contact')}>
            <ContactUsIcon isActive={pathName === PATH_NAME.settings('contact')} />
          </Item>
        </Link>

        <div
          onClick={() => {
            AuthenticationModal.open(undefined, 'LOGOUT')
            void Analytics.track({
              eventName: 'Log Out',
              properties: {},
            })
          }}>
          <Item title="Log out">
            <LogoutIcon className="stroke-secondary" />
          </Item>
        </div>
      </div>
    </nav>
  )
}

type ItemProps = {
  title: string
  isActive?: boolean
  children: ReactNode
}

function Item({ title, isActive, children }: ItemProps) {
  return (
    <div className="flex w-full max-w-full items-center gap-x-3 rounded-md p-3 hover:cursor-pointer hover:bg-monochrome-6/10">
      {children}
      <p className={cn('hidden break-all !text-title-3-demi md:block', isActive && 'text-primary')}>{title}</p>
    </div>
  )
}
