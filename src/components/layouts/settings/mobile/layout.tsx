'use client'
import { Sheet, SheetClose, SheetContent, SheetTrigger } from '@components/ui/sheet'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PATH_NAME } from '@lib/utils/constants/path'
import { AccountIcon, ContactUsIcon, EditIcon, LogOutIcon, NotificationIcon } from '@icons/settings-side-bar-icons'
import { cn } from '@lib/utils'
import icBack from '@icons/icBack.svg'
import { type ReactNode } from 'react'
import Image from 'next/image'
import { SettingIcon } from '@icons/settings'
import { AuthenticationModal } from '@components/common/modals/authentication'

export function SettingsLayout() {
  const pathName = usePathname()

  return (
    <Sheet>
      <SheetTrigger>
        <div className="flex items-center gap-x-2">
          <SettingIcon className="fill-secondary" />
          <p className="text-body-1-demi">Settings</p>
        </div>
      </SheetTrigger>
      <SheetContent showDefaultClose={false} side="right" className="w-full border-none p-0 shadow-none outline-none">
        <div className={`m-4 flex items-center justify-between`}>
          <SheetClose className="shadow-none outline-none">
            <Image src={icBack} alt="back" />
          </SheetClose>
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
            <Link href={{ pathname: PATH_NAME.settings('notification') }}>
              <Item title="Notifications" isActive={pathName === PATH_NAME.settings('notification')}>
                <NotificationIcon isActive={pathName === PATH_NAME.settings('notification')} />
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
                <LogOutIcon isActive={false} />
              </Item>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
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
      <Image src={icBack} alt="back" className="rotate-180" />
    </div>
  )
}
