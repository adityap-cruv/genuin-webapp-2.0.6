'use client'
import { Button } from '@components/ui/button'
import Link from 'next/link'
import { PATH_NAME } from '@lib/utils/constants/path'
import { AppLogo } from '@components/ui/app-logo'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { AuthenticationModal } from '@components/common/modals/authentication'
import { useSession, signOut } from 'next-auth/react'
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { LogoutIcon } from '@icons/logout'
import { removeAllAuthToken } from '@lib/api/instance'
import { SearchBar } from '@components/common/search-bar'
import { SettingIcon } from '@icons/settings'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { formatPhoneNumberIntl } from 'react-phone-number-input'
import { WalletAmountBadge } from '@/components/common/wallet/wallet-amount-badge'
import { Loader } from '@/components/ui/loader'
import { useEffect, useState } from 'react'
import { Shimmer } from '@/components/ui/shimmer'
import { CustomImage } from '@/components/custom/custom-image'
import { IHeartDemo } from './iheart-demo'
import { useIHeartDemoStates } from '@/components/providers/iheart-demo-provider'
import GetAppButton from '@/components/common/actions/get-app-button'
import { usePlayerControlStore } from '@/components/common/player/player-control-store'
import { useShallow } from 'zustand/react/shallow'

export function TopBar({
  showUserTick = true,
  showSearchBar = true,
}: {
  showUserTick?: boolean
  showSearchBar?: boolean
}) {
  const { config, isLoading, webCTA } = useGenuinOptions()
  const { isFullScreen } = usePlayerControlStore(
    useShallow((state) => ({
      isFullScreen: state.isFullScreen,
    }))
  )
  const { renderIn, shouldShowIHeartDemo } = useIHeartDemoStates()
  const showIHeartDemo = renderIn === 'root' && shouldShowIHeartDemo
  return (
    <>
      <div className="z-40 flex h-[76px] w-full justify-center border-b border-monochrome-9  bg-monochrome-white sm:flex">
        {isLoading ? (
          <div className="sticky top-0 flex  w-full items-center justify-between px-2 2xl:container xl:px-10 2xl:px-0 ">
            <Shimmer className="h-10 w-20" />
            <div className="flex gap-2">
              <Shimmer className="h-10 w-10" />
              <Shimmer className="h-10 w-40" />
            </div>
          </div>
        ) : (
          <nav className="sticky top-0 z-40 flex h-full w-full items-center justify-between gap-6 px-2 2xl:container xl:px-10 2xl:px-0">
            <div className="flex flex-shrink-0">
              <Link draggable={false} href={{ pathname: PATH_NAME.home() }}>
                <AppLogo.logo className="fill-new-off-black" imageHeight={44} />
              </Link>
            </div>
            {config?.slogan?.image && !showIHeartDemo && (
              <div className="relative flex h-10 w-1/3 justify-center">
                <CustomImage
                  src={config.slogan.image}
                  className="h-full w-auto object-cover"
                  alt="slogan image"
                  useWebp={false}
                  width={0}
                  height={0}
                  sizes="100vw"
                />
              </div>
            )}

            {showIHeartDemo && !isFullScreen && (
              <div className="h-full w-full">
                <IHeartDemo />
              </div>
            )}

            <div className="flex flex-shrink-0 items-center gap-x-3">
              {showSearchBar && <SearchBar.desktop />}
              <WalletAmountBadge type="dark" />

              {(webCTA === 'app' || webCTA === 'both') && (
                <GetAppButton
                  buttonText="Get App"
                  className="h-8 flex-shrink-0 px-4 py-3 text-[15px] text-new-para-2 font-semibold text-primary"
                  variant="outline"
                  size="custom"
                />
              )}
              {webCTA !== 'app' && showUserTick && <UserTick />}
            </div>
          </nav>
        )}
      </div>
    </>
  )
}

function UserTick() {
  const { data, status } = useSession()
  const router = useRouter()
  const pathName = usePathname()
  const searchParams = useSearchParams()
  const [loadingAuthData, setLoadingAuthData] = useState(false)

  useEffect(() => {
    const code = searchParams.get('code')
    const provider = searchParams.get('provider')
    if (code && provider) {
      setLoadingAuthData(true)
    } else {
      setLoadingAuthData(false)
    }
  }, [searchParams])

  if (status === 'unauthenticated' || status === 'loading')
    return (
      <Button
        disabled={status === 'loading' || loadingAuthData}
        className="h-8 gap-2 px-4"
        onClick={() => {
          AuthenticationModal.open()
        }}>
        {(status === 'loading' || loadingAuthData) && (
          <Loader size="sm" className="fill-monochrome-white stroke-monochrome-white" />
        )}
        <p className="min-w-max text-[15px] text-title-3-demi text-monochrome-white">Log in</p>
      </Button>
    )

  if (status === 'authenticated')
    return (
      <Popover>
        <PopoverTrigger>
          <div className="flex rounded-full">
            <CustomAvatar
              className="h-[40px] w-[40px]"
              fallbackString={data.user.name ?? ''}
              imageUrl={data.user.image ?? ''}
              isAvatar={data.user.isAvatar}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent
          sideOffset={0}
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
                <Link href={PATH_NAME.settings('edit')}>
                  <div
                    className="flex items-center gap-2"
                    onClick={() => {
                      if (!pathName.includes('settings')) {
                        localStorage.setItem('previous_path', pathName)
                      }
                    }}>
                    <SettingIcon isActive />
                    <p className="text-body-1-demi">Settings</p>
                  </div>
                </Link>
              </>
            )}

            <div
              className="flex cursor-pointer items-center gap-2"
              onClick={() => {
                void signOut({ callbackUrl: `${window.location.pathname}${window.location.search}`, redirect: true })
                removeAllAuthToken()
              }}>
              <LogoutIcon className="h-6 w-6 stroke-secondary" />
              <p className="text-body-1-demi">Log out</p>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    )
}
