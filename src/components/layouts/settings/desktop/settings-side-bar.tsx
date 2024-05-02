'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { type ReactNode } from 'react'
import { cn } from '@lib/utils'
import { PATH_NAME } from '@lib/utils/constants/path'
import { AccountIcon, ContactUsIcon, EditIcon, LogOutIcon, NotificationIcon } from '@icons/settings-side-bar-icons'
import { Dialog, DialogContent, DialogTrigger } from '@components/ui/dialog'

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

        <Dialog>
          <DialogTrigger asChild>
            <>
              <Item title="Log out">
                <LogOutIcon isActive={false} />
              </Item>
            </>
          </DialogTrigger>
          <DialogContent>
            <div className="grid gap-4 py-4">Heyyyyyyyyyyyyyyyyy</div>
          </DialogContent>
        </Dialog>
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
