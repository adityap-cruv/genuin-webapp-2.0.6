'use client'
import { usePathname } from 'next/navigation'
import { AuthenticationModal } from '@components/common/modals/authentication'
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { LogoutIcon } from '@icons/logout'
import { signOut } from 'next-auth/react'
import { removeAllAuthToken } from '@lib/api/instance'
import { Button } from '@components/ui/button'
import { formatPhoneNumberIntl } from 'react-phone-number-input'
import { type User } from 'next-auth'
import { PATH_NAME } from '@/lib/utils/constants/path'
import Link from 'next/link'
import { AccountIcon } from '@icons/settings-side-bar-icons'
import { BellIcon } from '@icons/bell-icon'

export function UserTick({ user }: { user: User | null }) {
  const pathName = usePathname()

  if (!user)
    return (
      <Button
        className="gap-2 px-4"
        onClick={() => {
          AuthenticationModal.open()
        }}>
        <p className="min-w-max text-title-3-demi text-monochrome-white">Log in</p>
      </Button>
    )

  return (
    <Popover>
      <PopoverTrigger>
        <div className="flex items-center gap-x-2 rounded-full border border-monochrome-9 p-1 pr-2">
          <CustomAvatar
            className="h-8 w-8"
            fallbackString={user.name ?? ''}
            imageUrl={user.image ?? ''}
            isAvatar={user.isAvatar}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent
        sideOffset={-6}
        className="rounded-2xl p-2 shadow-lg shadow-monochrome-3/40"
        side="bottom"
        align="end">
        <div className="my-2 flex items-center gap-2">
          <CustomAvatar
            className="h-12 w-12"
            fallbackString={user.name ?? ''}
            imageUrl={user.image ?? ''}
            isAvatar={user.isAvatar}
          />
          <div>
            <p className="line-clamp-1 break-words break-all text-title-3-bold">
              {user.usernameSet
                ? '@' + user.nickname
                : user.email
                  ? user.email
                  : formatPhoneNumberIntl(
                      user.phoneNumber?.startsWith('+') ? user.phoneNumber : `+${user.phoneNumber}`
                    )}
            </p>
            {!user?.isBrandSystemUser && (
              <Link
                href={PATH_NAME.settings('edit')}
                className="text-body-1-demi text-monochrome-6 hover:cursor-pointer">
                Complete profile
              </Link>
            )}
          </div>
        </div>
        <hr className="border-b border-monochrome-9" />
        <div className="flex flex-col gap-3 p-4">
          {!user?.isBrandSystemUser && (
            <>
              <Link href={PATH_NAME.settings('account')}>
                <div
                  className="flex items-center gap-2"
                  onClick={() => {
                    if (!pathName.includes('settings')) {
                      localStorage.setItem('previous_path', pathName)
                    }
                  }}>
                  <AccountIcon isActive={false} className="h-6 w-6" />
                  <p className="text-body-1-demi">Account Settings</p>
                </div>
              </Link>

              <Link href={PATH_NAME.settings('notification')}>
                <div
                  className="flex items-center gap-2"
                  onClick={() => {
                    if (!pathName.includes('settings')) {
                      localStorage.setItem('previous_path', pathName)
                    }
                  }}>
                  <BellIcon size="sm" />
                  <p className="text-body-1-demi">Notification Settings</p>
                </div>
              </Link>
            </>
          )}

          <div className="flex items-center gap-2">
            <LogoutIcon className="stroke-secondary" />
            <p
              className="cursor-pointer text-body-1-demi"
              onClick={() => {
                'use client'
                void signOut({ redirect: true })
                removeAllAuthToken()
              }}>
              Log out
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
