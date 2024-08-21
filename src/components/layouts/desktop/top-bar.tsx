'use client'
import { Button } from '@components/ui/button'
import Link from 'next/link'
import { PATH_NAME } from '@lib/utils/constants/path'
import { DownloadAppDialog } from '@components/pages/build/download-app-dialog'
import { AppLogo } from '@components/ui/app-logo'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { AuthenticationModal } from '@components/common/modals/authentication'
import { useSession, signOut } from 'next-auth/react'
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { LogoutIcon } from '@icons/logout'
import { BurgerIcon } from '@icons/burger-icon'
import { removeAllAuthToken } from '@lib/api/instance'
import { SearchBar } from '@components/common/search-bar'
import { AccountIcon, NotificationIcon } from '@icons/settings-side-bar-icons'
import { usePathname, useRouter } from 'next/navigation'
import { formatPhoneNumberIntl } from 'react-phone-number-input'
import { WalletAmountBadge } from '@/components/common/wallet/wallet-amount-badge'

export function TopBar({
  showUserTick = true,
  showSearchBar = true,
}: {
  showUserTick?: boolean
  showSearchBar?: boolean
}) {
  const { config, embed: isEmbed } = useGenuinOptions()

  return (
    <>
      <div className="z-20 flex w-full justify-center border-b border-monochrome-9  bg-monochrome-white sm:flex">
        <nav className="sticky top-0 flex h-[76px] w-full items-center justify-between px-2 xl:container">
          <Link draggable={false} href={{ pathname: PATH_NAME.home() }}>
            <AppLogo.logo className="shrink-0 fill-new-off-black" imageHeight={44} />
            {/* <GenuinIcon.logo className="fill-new-off-black" /> */}
          </Link>
          {config?.slogan?.image && (
            <img src={config.slogan.image} className="h-10 object-cover" alt="brand_web_logo" />
          )}
          <div className="flex gap-x-3">
            {showSearchBar && <SearchBar.desktop />}
            <WalletAmountBadge />
            {!isEmbed ? (
              <>
                <DownloadAppDialog>
                  <Button
                    variant="default"
                    size={'custom'}
                    className="bg-new-off-black px-4 py-3 hover:bg-new-dark-grey">
                    <p className="text-new-para-2 font-semibold text-tertiary-100">Download Genuin</p>
                  </Button>
                </DownloadAppDialog>
              </>
            ) : (
              showUserTick && <UserTick />
            )}
          </div>
        </nav>
      </div>
    </>
  )
}

function UserTick() {
  const { data, status } = useSession()
  const router = useRouter()
  const pathName = usePathname()

  if (status === 'unauthenticated')
    return (
      <Button
        className="px-4"
        onClick={() => {
          AuthenticationModal.open()
        }}>
        <p className="min-w-max text-title-3-demi">Log in</p>
      </Button>
    )

  if (status === 'authenticated')
    return (
      <Popover>
        <PopoverTrigger>
          <div className="flex items-center gap-x-2 rounded-full border border-monochrome-9 p-1 pr-2">
            <CustomAvatar
              className="h-8 w-8"
              fallbackString={data.user.name ?? ''}
              imageUrl={data.user.image ?? ''}
              isAvatar={data.user.isAvatar}
            />
            <BurgerIcon />
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
              fallbackString={data.user.name ?? ''}
              imageUrl={data.user.image ?? ''}
              isAvatar={data.user.isAvatar}
            />
            <div>
              <p className="line-clamp-1 break-words break-all text-title-3-bold">
                {data.user.usernameSet
                  ? '@' + data.user.nickname
                  : data.user.email
                  ? data.user.email
                  : formatPhoneNumberIntl(
                      data.user.phoneNumber?.startsWith('+') ? data.user.phoneNumber : `+${data.user.phoneNumber}`
                    )}
              </p>
              {!data.user?.isBrandSystemUser && (
                <p
                  className="text-body-1-demi text-monochrome-6 hover:cursor-pointer"
                  onClick={() => {
                    router.push(PATH_NAME.settings('edit'))

                    // if (!pathName.includes('settings')) {
                    //   localStorage.setItem('previous_path', pathName)
                    // }
                  }}>
                  Complete profile
                </p>
              )}
            </div>
          </div>
          <hr className="border-b border-monochrome-9" />
          <div className="flex flex-col gap-3 p-4">
            {!data.user?.isBrandSystemUser && (
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
                    <NotificationIcon isActive={false} className="h-6 w-6" />
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
                  void signOut({ callbackUrl: `${window.location.pathname}${window.location.search}`, redirect: true })
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
