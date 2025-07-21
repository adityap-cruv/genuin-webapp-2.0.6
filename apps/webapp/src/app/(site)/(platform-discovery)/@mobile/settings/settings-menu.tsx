'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { PATH_NAME } from '@lib/utils/constants/path'
import { AccountIcon, ContactUsIcon, EditIcon, PersonalizationIcon } from '@icons/settings-side-bar-icons'
import { cn } from '@lib/utils'
import { useEffect, type ReactNode } from 'react'
import { AuthenticationModal } from '@components/common/modals/authentication'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Analytics from '@/services/analytics'
import { LogoutIcon } from '@icons/logout'

export default function SettingsMenu({ isMobile }: { isMobile: boolean }) {
  const pathName = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!isMobile && pathName === '/settings') {
      router.push(PATH_NAME.settings('edit'))
    }
  }, [])

  return (
    <div className="w-full border-none p-0 shadow-none outline-none">
      <div className={`m-4 flex items-center justify-between`}>
        <ChevronLeft
          className="block md:hidden"
          onClick={() => {
            const path = localStorage.getItem('previous_path')
            router.push(path ?? PATH_NAME.home())
            void Analytics.track({
              eventName: 'Settings Closed',
              properties: {},
            })
          }}
        />
        <p className="text-title-2-bold">Settings</p>

        <div></div>
      </div>
      <hr className="bg-tertiary-300" />
      <div className="flex h-body flex-col justify-between p-4">
        <div>
          <Link href={{ pathname: PATH_NAME.settings('edit') }}>
            <Item title="Edit Profile" isActive={pathName === PATH_NAME.settings('edit')}>
              <EditIcon className="m-1" isActive={pathName === PATH_NAME.settings('edit')} />
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
            }}>
            <Item title="Log out">
              <LogoutIcon className="stroke-secondary" />
            </Item>
          </div>
        </div>
      </div>
    </div>
  )
}

type ItemProps = {
  title: string
  isActive?: boolean
  children?: ReactNode
}

function Item({ title, isActive, children }: ItemProps) {
  return (
    <div className="flex w-full max-w-full items-center justify-between gap-x-3 rounded-md p-2 hover:cursor-pointer hover:bg-monochrome-6/10">
      <div className="flex items-center gap-4">
        {children}
        <p className={cn('break-all !text-title-3-demi', isActive && 'text-primary')}>{title}</p>
      </div>
      <ChevronRight />
    </div>
  )
}
