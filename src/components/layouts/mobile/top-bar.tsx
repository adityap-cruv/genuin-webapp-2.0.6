'use client'
import { HamBurgerMenuIcon } from '@components/ui/ham-burger'
import { Button } from '@components/ui/button'
import { Sheet, SheetClose, SheetContent, SheetTrigger } from '@components/ui/sheet'
import { type ReactNode } from 'react'
import { cn } from '@lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PopularIcon, HomeIcon, LatestIcon, ProfileIcon } from '@icons/side-bar-icons'
import { cva, type VariantProps } from 'class-variance-authority'
import { PATH_NAME } from '@lib/utils/constants/path'
import { X } from 'lucide-react'
import { RecentCommunities } from './recent-communities'
import { AppLogo } from '@components/ui/app-logo'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { AuthenticationModal } from '@components/common/modals/authentication'
import { useSession, signOut } from 'next-auth/react'
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { BurgerIcon } from '@icons/burger-icon'
import { LogoutIcon } from '@icons/logout'
import CommunityIcon from '@icons/ks-cb-flow/icCommunity.svg'
import { removeAllAuthToken } from '@lib/api/instance'
import { MOBILE_DOWNLOAD_APP_LINK } from '@lib/constants'
import { SearchBar } from '@components/common/search-bar'
import { miniProfile } from '@lib/api/auth'
import { SettingsLayout } from '../settings/mobile/layout'
import { NotificationIcon } from '@icons/settings-side-bar-icons'
import icBack from '@icons/icBack.svg'
import Image from 'next/image'
import { SearchIcon } from '@icons/search-icon'
import { NotificationLayout } from '@components/common/notification/notification-layout'

const navVariant = cva('sticky top-0 flex z-40 h-[76px] w-full items-center justify-between  px-2', {
  variants: {
    variant: {
      light: 'border-b-2 border-monochrome-9 bg-monochrome-white',
      trasparent: 'bg-transparent bg-gradient-to-b from-monochrome-2/40 to-transparent',
    },
  },
})

type Props = {
  className?: string
  /**
   * Pass true if you want to show close icon on top right corner.
   * If you show close icon than notice that on click of it will go back one page.
   * @default false
   */
  showClose?: boolean
  onClose?: () => void
} & VariantProps<typeof navVariant>

export function TopBar({ variant = 'light', className, showClose = false, onClose }: Props) {
  // TODO: Added for redirection to https
  // const protocol = window.location.protocol
  // if (protocol === 'http:') {
  //   window.location.href = window.location.href.replace(/^http:/, 'https:')
  // }
  const { embed, user, brandName, notificationsCount } = useGenuinOptions((state) => ({
    embed: state.embed,
    user: state.user,
    brandName: state.config?.name ? state.config?.name : 'Genuin',
    notificationsCount: state.notificationCount,
  })) // If variant is transparent than we have removed show download button.
  const showDownloadButton = variant !== 'trasparent'
  const pathName = usePathname()

  return (
    <nav className={cn(navVariant({ variant }), className)}>
      <span className="flex items-center ">
        <Menu
          hamBurgerVariant={variant === 'trasparent' ? 'light' : 'dark'}
          embed={embed}
          user={user}
          brandName={brandName}
        />
        {embed && (
          <Link href={{ pathname: PATH_NAME.home() }}>
            <AppLogo.icon
              imageHeight={32}
              className={cn(variant === 'trasparent' ? 'fill-new-off-white' : 'fill-new-off-black', 'max-w-[100px]')}
            />
          </Link>
        )}
      </span>
      <span className="flex items-center gap-x-2">
        {!embed && showDownloadButton && (
          <Link href={MOBILE_DOWNLOAD_APP_LINK} target="_blank">
            <Button
              className={
                variant === 'light'
                  ? 'bg-new-off-black text-monochrome-white hover:bg-new-dark-grey'
                  : 'bg-new-off-white text-new-off-black hover:bg-new-off-black hover:text-new-off-white'
              }>
              <p className="text-body-1-demi">Download Genuin</p>
            </Button>
          </Link>
        )}
        {user && <NotificationSheet notificationsCount={notificationsCount} pathName={pathName} />}
        <SearchBar.mobile>
          <SearchIcon
            className={`${
              pathName === '/home' || pathName === '/popular' || pathName === '/latest' || pathName.includes('/video')
                ? 'stroke-monochrome-white'
                : ''
            }`}
          />
        </SearchBar.mobile>
        {embed && <UserTick />}
        {showClose && (
          <X
            onClick={() => {
              onClose?.()
            }}
            className={cn(
              'h-6 w-6',
              variant === 'light' ? 'stroke-new-off-black' : 'stroke-new-off-white stroke-[3px]'
            )}
          />
        )}
      </span>
    </nav>
  )
}

function NotificationSheet({
  notificationsCount,
  pathName,
}: {
  notificationsCount: number | null | undefined
  pathName: string
}) {
  return (
    <>
      <Sheet>
        <SheetTrigger>
          <div className="relative">
            {!notificationsCount ||
              (notificationsCount > 0 && (
                <div
                  className="absolute right-0 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-monochrome-white"
                  style={{
                    fontSize: '8px',
                  }}>
                  {notificationsCount}
                </div>
              ))}
            <NotificationIcon
              variant={
                pathName === '/home' || pathName === '/popular' || pathName === '/latest' || pathName.includes('/video')
                  ? 'white'
                  : ''
              }
              className="h-7"
            />
          </div>
        </SheetTrigger>
        <SheetContent showDefaultClose={false} side="right" className="w-full border-none p-0 shadow-none outline-none">
          <div className={`relative m-4 flex w-full items-center justify-center`}>
            <SheetClose className="absolute left-0 shadow-none outline-none">
              <Image src={icBack} alt="back" />
            </SheetClose>
            <p className="text-title-2-bold">Notifications</p>
          </div>
          <hr className="bg-tertiary-300" />
          <NotificationLayout />
        </SheetContent>
      </Sheet>
    </>
  )
}

function Menu({
  hamBurgerVariant = 'dark',
  brandName,
  user,
  embed,
}: {
  hamBurgerVariant: 'dark' | 'light'
  brandName: string
  user: any
  embed: boolean
}) {
  const pathName = usePathname()
  const { data: sessionData, update: updateSession } = useSession()

  function handleCommunityBuilderClick() {
    void miniProfile(true)
      .then((res) => {
        if (res.code === 200) {
          void updateSession({
            ...sessionData,
            user: { ...sessionData?.user, ...res.data },
          })
          const messageType = res?.data?.ks_cb_request_status === 3 ? 'MINI_PROFILE_SUCCESS' : 'KS_CB_SUBDOMAIN'
          AuthenticationModal.open(undefined, messageType)
        } else {
          AuthenticationModal.open(undefined, 'KS_CB_SUBDOMAIN')
        }
      })
      .catch(() => {
        AuthenticationModal.open(undefined, 'KS_CB_SUBDOMAIN')
      })
  }
  return (
    <Sheet>
      <SheetTrigger>
        <HamBurgerMenuIcon toggleToClose={false} variant={hamBurgerVariant} />
      </SheetTrigger>
      <SheetContent showDefaultClose={false} side="left" className="w-full border-none shadow-none outline-none">
        <SheetClose className="shadow-none outline-none">
          <X strokeWidth="3px" className="h-6 w-6 stroke-new-off-black" />
        </SheetClose>
        <div className="flex h-full flex-col justify-between pb-5">
          <div>
            <Link href={{ pathname: PATH_NAME.home() }}>
              <MenuItem title="Home" isActive={pathName === PATH_NAME.home()}>
                <HomeIcon isActive={pathName === PATH_NAME.home()} />
              </MenuItem>
            </Link>
            <Link href={{ pathname: PATH_NAME.popular() }}>
              <MenuItem title="Popular" isActive={pathName === PATH_NAME.popular()}>
                <PopularIcon isActive={pathName === PATH_NAME.popular()} />
              </MenuItem>
            </Link>
            <Link href={{ pathname: PATH_NAME.latest() }}>
              <MenuItem title="Latest" isActive={pathName === PATH_NAME.latest()}>
                <LatestIcon isActive={pathName === PATH_NAME.latest()} />
              </MenuItem>
            </Link>
            {user && (
              <>
                <Link
                  href={{
                    pathname: user.is_brand_system_user
                      ? PATH_NAME.brand(user.brand_slug)
                      : PATH_NAME.profile(user.nickname),
                  }}>
                  <MenuItem title="Profile" isActive={pathName === PATH_NAME.profile(user.nickname)}>
                    <ProfileIcon isActive={pathName === PATH_NAME.profile(user.nickname)} />
                  </MenuItem>
                </Link>
              </>
            )}
            {/* <Link href={{ pathname: PATH_NAME.search() }}>
              <MenuItem title="Search" isActive={pathName.includes('search')}>
                <SearchIcon isActive={pathName === PATH_NAME.search()} />
              </MenuItem>
            </Link> */}
            <hr className="border-1 mt-1 border-monochrome-black/10" />
            {user?.ks_cb_request_status !== 3 && (
              <div
                className="max-w-72 relative my-4 max-h-16 rounded-lg border border-[#E9CAF4] bg-primary-200 text-title-3-demi text-monochrome-black hover:cursor-pointer"
                style={{
                  background: 'linear-gradient(30deg, var(--primary-400) -80%, #FFFFFF 50%, var(--primary-400) 120%)',
                }}
                onClick={() => {
                  if (user?.isEmailVerified) {
                    handleCommunityBuilderClick()
                  } else {
                    AuthenticationModal.open(undefined, embed ? 'KS_CB_SUBDOMAIN' : 'KS_CB_WEB')
                  }
                }}>
                <p className="z-10 p-3 text-body-1-bold">
                  Become a{' '}
                  <span className="font-semibold italic">
                    community <br /> builder{' '}
                  </span>
                  {embed ? 'for' : 'on'} <span className="text-primary"> {brandName}</span> 🚀
                </p>
                <img src={CommunityIcon.src} alt="community" className="absolute bottom-0 right-4 h-12" />
              </div>
            )}
            <RecentCommunities />
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
  children: ReactNode
}

function MenuItem({ title, isActive, children }: ItemProps) {
  return (
    <div className="flex w-full items-center gap-x-3 rounded-md p-2 hover:bg-monochrome-6/10">
      {children}
      <p className={`text-title-2-bold font-semibold ${isActive && 'text-primary'}`}>{title}</p>
    </div>
  )
}

function UserTick() {
  const { data, status } = useSession()

  if (status === 'unauthenticated')
    return (
      <Button
        className="px-4 "
        onClick={() => {
          AuthenticationModal.open()
        }}>
        <p className="text-title-3-demi">Log in</p>
      </Button>
    )

  if (status === 'authenticated')
    return (
      <Popover>
        <PopoverTrigger>
          <div className="flex items-center gap-x-2 rounded-full border border-monochrome-9 p-1 pr-2">
            <CustomAvatar
              className="h-6 w-6"
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
              <p className="line-clamp-1 break-words break-all text-title-3-bold">{data.user.email}</p>
              {!data.user.is_brand_system_user && (
                <p className="text-body-1-demi text-monochrome-6">
                  {!data.user.isEmailVerified ? 'Send verification email' : 'Complete profile'}
                </p>
              )}
            </div>
          </div>
          <hr className="border-b border-monochrome-9" />
          <div className="flex flex-col gap-4 p-4">
            <div className="flex items-center gap-x-2">
              <LogoutIcon className="stroke-secondary" />
              <p
                className="text-body-1-demi"
                onClick={() => {
                  void signOut({ callbackUrl: `${window.location.pathname}${window.location.search}`, redirect: true })
                  removeAllAuthToken()
                }}>
                Log out
              </p>
            </div>
            {!data.user.is_brand_system_user && <SettingsLayout />}
          </div>
        </PopoverContent>
      </Popover>
    )
}
