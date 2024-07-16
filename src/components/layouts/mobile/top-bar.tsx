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
import { type User, useGenuinOptions } from '@lib/stores/genuin-options'
import { AuthenticationModal } from '@components/common/modals/authentication'
import { useSession, signOut } from 'next-auth/react'
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { BurgerIcon } from '@icons/burger-icon'
import { LogoutIcon } from '@icons/logout'
import { removeAllAuthToken } from '@lib/api/instance'
import { MOBILE_DOWNLOAD_APP_LINK } from '@lib/constants'
import { SearchBar } from '@components/common/search-bar'
import { SettingsLayout } from '../settings/mobile/layout'
import { NotificationIcon } from '@icons/settings-side-bar-icons'
import { SearchIcon } from '@icons/search-icon'
import Analytics from '@services/analytics'
import { CategoryView } from '@components/common/category-view'
import dynamic from 'next/dynamic'
import BecomeCbCard from '@/components/common/become-cb-card'
import { LoginIcon } from '@icons/login-icon'
// import { VerifiedIcon } from '@icons/verified-icon'

const DownloadAppDialog = dynamic(
  async () => await import('../download-app-dialog').then((comp) => comp.DownloadAppDialog)
)

const navVariant = cva('sticky top-0 flex z-40 h-[76px] w-full items-center justify-between  px-2', {
  variants: {
    variant: {
      light: 'border-b-2 border-monochrome-9 bg-monochrome-white',
      transparent: 'bg-transparent bg-gradient-to-b from-monochrome-2/40 to-transparent',
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
  const { embed, user, brandName, notificationsCount, isClaimed, brandLogo } = useGenuinOptions((state) => ({
    embed: state.embed,
    user: state.user,
    brandName: state.config?.name ? state.config?.name : 'Genuin',
    notificationsCount: state.notificationCount,
    isClaimed: state.config?.is_claimed,
    brandLogo: state.config?.logo,
  })) // If variant is transparent than we have removed show download button.
  const showDownloadButton = variant !== 'transparent'
  const pathName = usePathname()

  return (
    <nav className={cn(navVariant({ variant }), className)}>
      <span className="flex items-center ">
        <Menu
          hamBurgerVariant={variant === 'transparent' ? 'light' : 'dark'}
          embed={embed}
          user={user}
          brandName={brandName}
          isClaimed={isClaimed}
        />
        {embed && (
          <Link href={{ pathname: PATH_NAME.home() }}>
            <img src={brandLogo} className="h-8 object-cover" alt="brand logo" />
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
        {user && (
          <Link href={PATH_NAME.notification()}>
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
                  pathName === '/home' ||
                  pathName === '/popular' ||
                  pathName === '/latest' ||
                  pathName.includes('/video')
                    ? 'white'
                    : ''
                }
                className="h-7"
              />
            </div>
          </Link>
        )}
        <SearchBar.mobile>
          <SearchIcon
            className={`${
              (pathName.includes('/home') ||
                pathName.includes('/popular') ||
                pathName.includes('/latest') ||
                pathName.includes('/video')) &&
              'stroke-monochrome-white'
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

function Menu({
  hamBurgerVariant = 'dark',
  brandName,
  user,
  embed,
  isClaimed,
}: {
  hamBurgerVariant: 'dark' | 'light'
  brandName: string
  user?: User
  embed: boolean
  isClaimed?: boolean
}) {
  const pathName = usePathname()
  const { status } = useSession()

  return (
    <Sheet>
      <SheetTrigger>
        <HamBurgerMenuIcon toggleToClose={false} variant={hamBurgerVariant} />
      </SheetTrigger>
      <SheetContent showDefaultClose={false} side="left" className="z-40 w-full border-none shadow-none outline-none">
        <div className="mb-4 flex justify-between">
          <AppLogo.icon imageHeight={32} className={cn('fill-new-off-white')} />
          <SheetClose className="shadow-none outline-none">
            <X strokeWidth="3px" className="h-6 w-6 stroke-new-off-black" />
          </SheetClose>
        </div>
        <Link href={{ pathname: PATH_NAME.home() }}>
          <MenuItem brandName={brandName} title="Home" isActive={pathName === PATH_NAME.home()}>
            <HomeIcon isActive={pathName === PATH_NAME.home()} />
          </MenuItem>
        </Link>
        <Link href={{ pathname: PATH_NAME.popular() }}>
          <MenuItem brandName={brandName} title="Popular" isActive={pathName === PATH_NAME.popular()}>
            <PopularIcon isActive={pathName === PATH_NAME.popular()} />
          </MenuItem>
        </Link>
        <Link href={{ pathname: PATH_NAME.latest() }}>
          <MenuItem brandName={brandName} title="Latest" isActive={pathName === PATH_NAME.latest()}>
            <LatestIcon isActive={pathName === PATH_NAME.latest()} />
          </MenuItem>
        </Link>
        {user && (
          <>
            <Link
              href={{
                pathname: user.isBrandSystemUser ? PATH_NAME.brand(user.brandSlug) : PATH_NAME.profile(user.nickname),
              }}>
              <MenuItem brandName={brandName} title="Profile" isActive={pathName === PATH_NAME.profile(user.nickname)}>
                <ProfileIcon isActive={pathName === PATH_NAME.profile(user.nickname)} />
              </MenuItem>
            </Link>
          </>
        )}
        {(!isClaimed ?? user?.ksCbRequestStatus !== 3) && embed && (
          <hr className="border-1 my-2 border-monochrome-black/10" />
        )}
        <DownloadAppDialog />
        {status === 'unauthenticated' && embed && (
          <div
            className="flex w-full max-w-full shrink-0 items-center gap-x-3 rounded-md p-2 px-4 hover:bg-monochrome-6/10"
            onClick={() => {
              AuthenticationModal.open()
            }}>
            <LoginIcon className="stroke-primary" />
            <p className={cn('whitespace-nowrap !text-title-3-demi text-primary')}>Log in</p>
          </div>
        )}
        {/* {!isClaimed && user && (
          <div
            className="flex w-full max-w-full shrink-0 items-center gap-x-3 rounded-md p-2 px-4 hover:bg-monochrome-6/10"
            onClick={() => {
              AuthenticationModal.open(undefined, 'CLAIM_BRAND_PROFILE')
            }}>
            <VerifiedIcon className="stroke-primary" />
            <p className={cn('whitespace-nowrap !text-title-3-demi text-primary')}>Claim Brand Profile</p>
          </div>
        )} */}
        {/* {(!isClaimed ?? user?.ksCbRequestStatus !== 3) && <hr className="border-1 my-2 border-monochrome-black/10" />} */}
        {user?.ksCbRequestStatus !== 3 && <BecomeCbCard className="my-4 lg:hidden" />}
        <CategoryView className="lg:hidden" />
        <RecentCommunities />
        <div className="text-tertiary">
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
      </SheetContent>
    </Sheet>
  )
}

type ItemProps = {
  title: string
  isActive?: boolean
  children: ReactNode
  brandName?: string
}

function MenuItem({ title, isActive, children, brandName }: ItemProps) {
  return (
    <div
      onClick={() => {
        if (title === 'Popular' || title === 'Latest') {
          void Analytics.track({
            eventName: `${title} Clicked`,
            properties: {
              brandName,
            },
          })
        }
      }}
      className="flex w-full items-center gap-x-3 rounded-md p-2 hover:bg-monochrome-6/10">
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
              {!data.user.isBrandSystemUser && (
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
            {!data.user.isBrandSystemUser && data.user?.isEmailVerified && <SettingsLayout />}
          </div>
        </PopoverContent>
      </Popover>
    )
}
