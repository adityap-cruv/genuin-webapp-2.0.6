'use client'
import { HamBurgerMenuIcon } from '@components/ui/ham-burger'
import { Button } from '@components/ui/button'
import { Sheet, SheetClose, SheetContent, SheetTrigger } from '@components/ui/sheet'
import { type ReactNode } from 'react'
import { cn, getYear, handleAppDownloadModal } from '@lib/utils'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { PopularIcon, HomeIcon, LatestIcon, ProfileIcon, ExploreIcon } from '@icons/side-bar-icons'
import { cva, type VariantProps } from 'class-variance-authority'
import { PATH_NAME } from '@lib/utils/constants/path'
import { RecentCommunities } from './recent-communities'
import { AppLogo } from '@components/ui/app-logo'
import { type User, useGenuinOptions } from '@lib/stores/genuin-options'
import { AuthenticationModal } from '@components/common/modals/authentication'
import { useSession, signOut } from 'next-auth/react'
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { LogoutIcon } from '@icons/logout'
import { removeAllAuthToken } from '@lib/api/instance'
import { SearchBar } from '@components/common/search-bar'
import { BellIcon } from '@icons/bell-icon'
import { SearchIcon } from '@icons/search-icon'
import { CloseIcon } from '@icons/close-icon'
import Analytics from '@services/analytics'
import { CategoryView, Stations } from '@components/common/category-view'
import dynamic from 'next/dynamic'
import { LoginIcon } from '@icons/login-icon'
import { VerifiedIcon } from '@icons/verified-icon'
import { formatPhoneNumberIntl } from 'react-phone-number-input'
import { useState, useEffect } from 'react'
import { Loader } from '@/components/ui/loader'
import { SettingIcon } from '@icons/settings'
import { CustomImage } from '@/components/custom/custom-image'
// import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { useIHeartDemoStates } from '@/components/providers/iheart-demo-provider'
import GetAppButton from '@/components/common/actions/get-app-button'
import { Accordion, AccordionContent, AccordionItem } from '@/components/ui/accordion'
import { AddIcon } from '@icons/add-icon'

const BecomeCbCard = dynamic(
  async () => await import('@/components/common/become-cb-card').then((comp) => comp.default),
  { ssr: false }
)

const navVariant = cva('sticky top-0 flex z-40 h-[76px] w-full items-center justify-between px-4', {
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
  const {
    user,
    brandName,
    brandId,
    notificationsCount,
    isClaimed,
    brandLogo,
    webCTA,
    privacyPolicy,
    termsAndCondition,
    showBecomeACreator,
  } = useGenuinOptions((state) => ({
    user: state.user,
    brandName: state.config?.name ? state.config?.name : 'Genuin',
    brandId: state.brandId,
    notificationsCount: state.notificationCount,
    isClaimed: state.config?.is_claimed,
    brandLogo: state.config?.logo,
    webCTA: state.webCTA,
    privacyPolicy: state.config?.privacy_policy,
    termsAndCondition: state.config?.terms_and_condition,
    showBecomeACreator: state.config?.show_become_creator ?? true,
  })) // If variant is transparent than we have removed show download button.
  // const showDownloadButton = variant !== 'transparent'
  // const searchParams = useSearchParams()

  return (
    <nav className={cn('playback-speed-class', navVariant({ variant }), className)}>
      <span className="flex items-center gap-x-3">
        <Menu
          variant={variant}
          webCTA={webCTA}
          user={user}
          brandName={brandName}
          brandId={brandId}
          isClaimed={isClaimed}
          privacyPolicy={privacyPolicy}
          termsAndCondition={termsAndCondition}
          showBecomeACreator={showBecomeACreator}
        />
        {brandLogo && (
          <Link href={{ pathname: PATH_NAME.home() }}>
            <CustomImage src={brandLogo} height={40} width={40} className="object-cover" alt="logo" />
          </Link>
        )}
      </span>
      <span className="flex items-center gap-x-3">
        {user && webCTA === 'login' && (
          <Link
            href={PATH_NAME.notification()}
            className={cn(
              'flex h-[40px] w-[40px] items-center justify-center rounded-full',
              variant === 'light' ? 'bg-tertiary-200' : 'bg-monochrome-black/20'
            )}>
            <div className="relative">
              {!notificationsCount ||
                (notificationsCount > 0 && (
                  <div
                    className="absolute right-[-2px] top-[-5px] flex h-4 w-4 items-center justify-center rounded-full bg-red text-monochrome-white"
                    style={{
                      fontSize: '8px',
                    }}>
                    {notificationsCount > 9 ? '9+' : notificationsCount}
                  </div>
                ))}
              <BellIcon variant={variant === 'light' && !showClose ? 'dark' : 'light'} size="sm" />
            </div>
          </Link>
        )}
        {/* add logic to use only variant here rather than conditions by path */}
        <SearchBar.mobile variant={variant}>
          <SearchIcon variant={variant} />
        </SearchBar.mobile>

        {(webCTA === 'app' || webCTA === 'both') && (
          <GetAppButton
            buttonText="Get App"
            className="h-8 text-[15px] text-body-1-demi text-primary"
            variant="outline"
          />
        )}
        {webCTA !== 'app' && <UserTick variant={variant} webCTA={webCTA} />}
        {showClose && (
          <span
            className={cn(
              'flex h-[40px] w-[40px] items-center justify-center rounded-full',
              variant === 'light' ? 'bg-tertiary-200' : 'bg-monochrome-black/20'
            )}>
            <CloseIcon
              onClick={() => {
                onClose?.()
              }}
              variant={variant === 'transparent' ? 'light' : 'dark'}
            />
          </span>
        )}
      </span>
    </nav>
  )
}

function Menu({
  variant = 'light',
  brandName,
  brandId,
  user,
  isClaimed,
  webCTA,
  privacyPolicy,
  termsAndCondition,
  showBecomeACreator,
}: {
  variant: 'dark' | 'light' | 'transparent' | null
  brandName: string
  brandId: string
  user?: User
  isClaimed?: boolean
  webCTA: 'app' | 'login' | 'both'
  privacyPolicy?: string
  termsAndCondition?: string
  showBecomeACreator: boolean
}) {
  const pathName = usePathname()
  const { status } = useSession()
  const { shouldShowIHeartDemo } = useIHeartDemoStates()
  const hamBurgerVariant = variant === 'transparent' ? 'light' : 'dark'

  return (
    <Sheet>
      <SheetTrigger
        className={cn(
          'flex h-[40px] w-[40px] items-center justify-center rounded-full',
          hamBurgerVariant === 'light' ? 'bg-monochrome-black/20' : 'bg-tertiary-200'
        )}>
        <HamBurgerMenuIcon toggleToClose={false} variant={hamBurgerVariant} />
      </SheetTrigger>
      <SheetContent
        showDefaultClose={false}
        side="left"
        className="z-[60] w-full overflow-auto border-none shadow-none outline-none">
        <div className="mb-4 flex justify-between">
          <AppLogo.icon imageHeight={32} className={cn('fill-monochrome-white')} />
          <SheetClose
            className={cn(
              'flex h-[40px] w-[40px] items-center justify-center rounded-full shadow-none outline-none',
              variant === 'light' || variant === 'transparent' ? 'bg-tertiary-200' : 'bg-monochrome-black/20'
            )}>
            <CloseIcon variant={variant === 'transparent' || variant === 'light' ? 'dark' : 'light'} />
          </SheetClose>
        </div>
        {shouldShowIHeartDemo && (
          <>
            <Stations />
            <hr className="my-1 border border-monochrome-9" />
          </>
        )}
        {shouldShowIHeartDemo && <p className="text-title-2-demi text-tertiary">Menu</p>}
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
        <Link href={{ pathname: PATH_NAME.explore() }}>
          <MenuItem brandName={brandName} title="Explore" isActive={pathName === PATH_NAME.explore()}>
            <ExploreIcon isActive={pathName === PATH_NAME.explore()} />
          </MenuItem>
        </Link>
        {brandId?.toString() !== '99' && (
          <Accordion type="single" collapsible>
            <AccordionItem value={'Embed'} className="border-none">
              {/* <AccordionTrigger className="p-0">
                <MenuItem brandName={brandName} title="Embed Page" isActive={pathName.includes('/embed')}>
                  <EmbedIcon isActive={pathName.includes('/embed')} />
                </MenuItem>
              </AccordionTrigger> */}
              {[
                { label: 'Home', path: 'home' },
                { label: 'Search', path: 'search' },
                { label: 'PDP', path: 'pdp' },
                { label: 'Post Sales', path: 'post_sales' },
                { label: 'Blogs', path: 'blogs' },
              ].map(({ label, path }: { label: string; path: string }) => (
                <AccordionContent key={path} className="p-0">
                  <a href={PATH_NAME.embed(path)}>
                    <p
                      className={`p-1.5 pl-14 text-title-3-demi ${
                        pathName === PATH_NAME.embed(path) && 'text-primary'
                      }`}>
                      {label}
                    </p>
                  </a>
                </AccordionContent>
              ))}
            </AccordionItem>
          </Accordion>
        )}

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
        {shouldShowIHeartDemo && <CategoryView />}
        {user?.ksCbRequestStatus === 3 && (
          <div
            className="flex w-full max-w-full shrink-0 items-center gap-x-3 rounded-md p-2 px-4 hover:bg-monochrome-6/10"
            onClick={() => {
              void handleAppDownloadModal()
            }}>
            <AddIcon className="stroke-primary" />
            <p className={cn('whitespace-nowrap !text-title-3-demi text-primary')}>Create Community</p>
          </div>
        )}
        {isClaimed && status === 'unauthenticated' && webCTA !== 'app' && (
          <>
            <hr className="border-1 my-2 border-monochrome-black/10" />
            <SheetClose>
              <div
                className="flex w-full max-w-full shrink-0 items-center gap-x-3 rounded-md p-2 px-4 hover:bg-monochrome-6/10"
                onClick={() => {
                  AuthenticationModal.open()
                }}>
                <LoginIcon className="stroke-primary" />
                <p className={cn('whitespace-nowrap !text-title-3-demi text-primary')}>Log in</p>
              </div>
            </SheetClose>
          </>
        )}
        {!isClaimed && (
          <SheetClose>
            <div
              className="flex w-full max-w-full shrink-0 items-center gap-x-3 rounded-md p-2 px-4 hover:bg-monochrome-6/10"
              onClick={() => {
                AuthenticationModal.open(undefined, 'CLAIM_BRAND_PROFILE')
              }}>
              <VerifiedIcon className="stroke-primary" />
              <p className={cn('whitespace-nowrap !text-title-3-demi text-primary')}>Claim Brand Profile</p>
            </div>
          </SheetClose>
        )}
        {(!isClaimed || user?.ksCbRequestStatus !== 3) && <hr className="border-1 my-2 border-monochrome-black/10" />}
        {user?.ksCbRequestStatus !== 3 && showBecomeACreator && (
          <SheetClose className="my-4 lg:hidden">
            <BecomeCbCard />
          </SheetClose>
        )}
        {!shouldShowIHeartDemo && (
          <>
            <CategoryView />
            <RecentCommunities />
          </>
        )}
        <div className="text-tertiary">
          <span className="flex gap-x-2 pb-2">
            <Link href={privacyPolicy ?? PATH_NAME.terms}>
              <p className="text-body-1-demi">Terms of Use</p>
            </Link>
            <Link href={termsAndCondition ?? PATH_NAME.privacy}>
              <p className="text-body-1-demi">Privacy Policy</p>
            </Link>
          </span>
          <p className="text-body-1-demi"> &#169; {getYear()} Genuin Inc.</p>
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

function UserTick({ variant = 'light', webCTA }: { variant: 'light' | 'transparent' | 'dark' | null; webCTA: string }) {
  const { data, status } = useSession()
  const searchParams = useSearchParams()
  const pathName = usePathname()
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
        <p className="min-w-max text-title-3-demi text-monochrome-white">Log in</p>
      </Button>
    )

  if (status === 'authenticated')
    return (
      <Popover>
        <PopoverTrigger>
          <div className="flex items-center gap-x-2 rounded-full">
            <CustomAvatar
              className="h-[40px] w-[40px]"
              fallbackString={data.user.name ?? ''}
              imageUrl={data.user.image ?? ''}
              isAvatar={data.user.isAvatar}
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
              {!data.user.isBrandSystemUser && <p className="text-body-1-demi text-monochrome-6">Complete profile</p>}
            </div>
          </div>
          <hr className="border-b border-monochrome-9" />
          <div className="flex flex-col gap-4 p-4">
            {!data.user.isBrandSystemUser && (
              <Link
                href={PATH_NAME.settings('')}
                className="flex items-center gap-x-2"
                onClick={() => {
                  if (!pathName.includes('settings')) {
                    localStorage.setItem('previous_path', pathName)
                  }
                }}>
                <SettingIcon isActive />
                <p className="text-body-1-demi">Settings</p>
              </Link>
            )}
            {(webCTA === 'app' || webCTA === 'both') && (
              <Link
                href={PATH_NAME.notification()}
                className="flex items-center gap-x-2"
                onClick={() => {
                  if (!pathName.includes('notifications')) {
                    localStorage.setItem('previous_path', pathName)
                  }
                }}>
                <BellIcon className="h-6 w-6 stroke-secondary" size="sm" />
                <p className="text-body-1-demi">Notifications</p>
              </Link>
            )}
            <div className="flex items-center gap-x-2">
              <LogoutIcon className="h-6 w-6 stroke-secondary" />
              <p
                className="text-body-1-demi"
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
