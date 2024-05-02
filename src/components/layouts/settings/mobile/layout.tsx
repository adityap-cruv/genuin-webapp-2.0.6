'use client'
import { HamBurgerMenuIcon } from '@components/ui/ham-burger'
import { Button } from '@components/ui/button'
import { Sheet, SheetClose, SheetContent, SheetTrigger } from '@components/ui/sheet'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { PATH_NAME } from '@lib/utils/constants/path'
import { Search, X } from 'lucide-react'
import { AccountIcon, ContactUsIcon, EditIcon, LogOutIcon, NotificationIcon } from '@icons/settings-side-bar-icons'
import { cn } from '@lib/utils'

export function SettingsLayout({ hamBurgerVariant = 'dark' }: { hamBurgerVariant: 'dark' | 'light' }) {
  const pathName = usePathname()

  return (
    <Sheet>
      <SheetTrigger>
        <HamBurgerMenuIcon toggleToClose={false} variant={hamBurgerVariant} />
      </SheetTrigger>
      <SheetContent showDefaultClose={false} side="right" className="w-full border-none shadow-none outline-none">
        <SheetClose className="shadow-none outline-none">
          <X strokeWidth="3px" className="h-6 w-6 stroke-new-off-black" />
        </SheetClose>
        <div className="flex h-full flex-col justify-between pb-5">
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

            <Item title="Log out">
              <LogOutIcon isActive={false} />
            </Item>
          </div>
          <div className="text-monochrome">
            <span className="flex gap-x-2 pb-2">
              <Link href={PATH_NAME.terms}>
                <p className="text-body-1-demi">Terms and Conditions</p>
              </Link>
              <Link href={PATH_NAME.privacy}>
                <p className="text-body-1-demi">Privacy Policy</p>
              </Link>
            </span>
            <p className="text-body-1-demi"> &#169; 2023 Genuin Inc.</p>
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
    <div className="flex w-full max-w-full items-center gap-x-3 rounded-md p-2 hover:cursor-pointer hover:bg-monochrome-6/10">
      {children}
      <p className={cn('break-all !text-title-3-demi', isActive && 'text-primary')}>{title}</p>
    </div>
  )
}
