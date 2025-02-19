'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { type ReactNode } from 'react'
import { ExploreIcon, HomeIcon, LatestIcon, MoreIcon, PopularIcon, ProfileIcon } from '@icons/side-bar-icons'
import { cn } from '@lib/utils'
import { PATH_NAME } from '@lib/utils/constants/path'
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover'
import dynamic from 'next/dynamic'
import { GenuinIcon } from '@icons/genuin-icon'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { BellIcon } from '@icons/bell-icon'
import Analytics from '@services/analytics'
import { useShallow } from 'zustand/react/shallow'
import { LoginIcon } from '@icons/login-icon'
import { VerifiedIcon } from '@icons/verified-icon'
import BecomeCbCard from '@/components/common/become-cb-card'
import { useSession } from 'next-auth/react'
import { AuthenticationModal } from '@/components/common/modals/authentication'
import { useIHeartDemoStates } from '@/components/providers/iheart-demo-provider'

const DownloadAppDialog = dynamic(
  async () => await import('../download-app-dialog').then((comp) => comp.DownloadAppDialog)
)

const CategoryViewDynamic = dynamic(
  async () => await import('@components/common/category-view').then((comp) => comp.CategoryView)
)

const Stations = dynamic(async () => await import('@components/common/category-view').then((comp) => comp.Stations), {
  ssr: false,
})
const RecentCommunities = dynamic(
  async () => await import('./recent-communities').then((comp) => comp.RecentCommunities),
  { ssr: false }
)

// TODO: Improve active states on all items.
export function SideBar() {
  const {
    user,
    brandName,
    notificationCount,
    isClaimed,
    sizeboxHeight,
    webCTA,
    brandId,
    privacyPolicy,
    termsAndCondition,
  } = useGenuinOptions(
    useShallow((state) => ({
      user: state.user,
      brandId: state.config?.brand_id,
      brandName: state.config?.name ? state.config?.name : 'Genuin',
      notificationCount: state.notificationCount,
      isClaimed: state.config?.is_claimed,
      sizeboxHeight: state.sizeBoxes.default.height,
      webCTA: state.config?.web_cta,
      privacyPolicy: state.config?.privacy_policy,
      termsAndCondition: state.config?.terms_and_condition,
    }))
  )
  const pathName = usePathname()
  const { status } = useSession()
  const { shouldShowIHeartDemo } = useIHeartDemoStates()

  return (
    <nav
      style={{ height: sizeboxHeight }}
      className="flex h-full w-fit flex-col justify-between overflow-auto border border-monochrome-9 px-4 py-4 transition-[width] xl:mr-16 xl:w-full xl:max-w-[280px] xl:border-none xl:px-0">
      <div>
        <Link href={{ pathname: PATH_NAME.home() }}>
          <Item brandName={brandName} title="Home" isActive={pathName === PATH_NAME.home()}>
            <HomeIcon isActive={pathName === PATH_NAME.home()} />
          </Item>
        </Link>
        <Link href={{ pathname: PATH_NAME.popular() }}>
          <Item brandName={brandName} title="Popular" isActive={pathName === PATH_NAME.popular()}>
            <PopularIcon isActive={pathName === PATH_NAME.popular()} />
          </Item>
        </Link>
        <Link href={{ pathname: PATH_NAME.latest() }}>
          <Item brandName={brandName} title="Latest" isActive={pathName === PATH_NAME.latest()}>
            <LatestIcon isActive={pathName === PATH_NAME.latest()} />
          </Item>
        </Link>
        <Link href={{ pathname: PATH_NAME.explore() }}>
          <Item brandName={brandName} title="Explore" isActive={pathName === PATH_NAME.explore()}>
            <ExploreIcon isActive={pathName === PATH_NAME.explore()} />
          </Item>
        </Link>
        {user && (
          <>
            <Link href={{ pathname: PATH_NAME.notification() }}>
              <Item
                brandName={brandName}
                title="Notification"
                isActive={pathName === PATH_NAME.notification()}
                notificationCount={notificationCount}>
                <BellIcon variant={pathName === PATH_NAME.notification() ? 'primary' : 'dark'} />
              </Item>
            </Link>
            <Link
              href={{
                pathname: user.isBrandSystemUser ? PATH_NAME.brand(user.brandSlug) : PATH_NAME.profile(user.nickname),
              }}>
              <Item brandName={brandName} title="Profile" isActive={pathName === PATH_NAME.profile(user.nickname)}>
                <ProfileIcon isActive={pathName === PATH_NAME.profile(user.nickname)} />
              </Item>
            </Link>
          </>
        )}
        {/* TODO: Genuin as a Brand. Check and discuss to change default true value */}
        <Popover>
          <PopoverTrigger className="w-full">
            <Item title="More">
              <MoreIcon className="fill-secondary" isActive={false} />
            </Item>
          </PopoverTrigger>
          <PopoverContent
            sideOffset={-6}
            className=" rounded-2xl p-2 shadow-lg shadow-monochrome-3/40"
            side="bottom"
            align="start">
            <Link href={{ pathname: termsAndCondition ?? PATH_NAME.terms }}>
              <p className="rounded-md p-2 text-title-2-demi hover:bg-monochrome-6/10">Terms and Conditions</p>
            </Link>
            <Link href={{ pathname: privacyPolicy ?? PATH_NAME.privacy }}>
              <p className="rounded-md p-2 text-title-2-demi hover:bg-monochrome-6/10">Privacy Policy</p>
            </Link>
          </PopoverContent>
        </Popover>
        <span className="hidden xl:block">
          {(!isClaimed || user?.ksCbRequestStatus !== 3) && <hr className="border-1 my-2 border-monochrome-black/10" />}
          <DownloadAppDialog />
          {isClaimed && status === 'unauthenticated' && webCTA !== 'app' && (
            <>
              <div
                className="flex w-full max-w-full shrink-0 items-center gap-x-3 rounded-md p-2 px-4 hover:bg-monochrome-6/10"
                onClick={() => {
                  AuthenticationModal.open()
                }}>
                <LoginIcon className="stroke-primary" />
                <p className={cn('hidden whitespace-nowrap !text-title-3-demi text-primary xl:block')}>Log in</p>
              </div>
              <hr className="border-1 my-2 border-monochrome-black/10" />
            </>
          )}
          {!isClaimed && (
            <>
              <div
                className="flex w-full max-w-full shrink-0 items-center gap-x-3 rounded-md p-2 px-4 hover:bg-monochrome-6/10"
                onClick={() => {
                  AuthenticationModal.open(undefined, 'CLAIM_BRAND_PROFILE')
                }}>
                <VerifiedIcon className="stroke-primary" />
                <p className={cn('hidden whitespace-nowrap !text-title-3-demi text-primary xl:block')}>
                  Claim Brand Profile
                </p>
              </div>
              <hr className="border-1 my-2 border-monochrome-black/10" />
            </>
          )}
        </span>{' '}
        {/* {(!isClaimed || user?.ksCbRequestStatus !== 3) && <hr className="border-1 my-2 border-monochrome-black/10" />} */}
        {user?.ksCbRequestStatus !== 3 && <BecomeCbCard className="my-4 hidden xl:block" />}
        {shouldShowIHeartDemo ? (
          <>
            <Stations className="hidden xl:block" />
            <CategoryViewDynamic className="hidden xl:block" />
          </>
        ) : (
          <>
            <CategoryViewDynamic className="hidden xl:block" />
            <RecentCommunities />
          </>
        )}
      </div>
      {/* TODO: Genuin as a Brand. Check and discuss to change default true value */}
      {brandId?.toString() !== '99' && (
        <div className="hidden xl:block">
          <hr className="border-1 mb-4 mt-1 border-monochrome-black/10" />
          <div className="flex items-center">
            <p className="text-cap-1-demi text-monochrome">Powered by</p>
            <Link href={{ pathname: PATH_NAME.home() }}>
              <GenuinIcon.logo className="ml-1 h-5 w-full fill-new-off-black" />
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

type ItemProps = {
  title: string
  isActive?: boolean
  children: ReactNode
  notificationCount?: number
  brandName?: string
}

function Item({ title, isActive, children, notificationCount = 0, brandName }: ItemProps) {
  return (
    <div
      onClick={() => {
        void Analytics.track({
          eventName: `${title} Clicked`,
          properties: {
            brandName,
          },
        })
      }}
      className="flex w-full max-w-full shrink-0 items-center gap-x-3 rounded-md p-2 hover:bg-monochrome-6/10">
      <div className="relative">
        {children}
        {notificationCount !== 0 && (
          <div className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary  text-cap-1-med text-monochrome-white">
            {notificationCount}
          </div>
        )}
      </div>
      <p className={cn('hidden whitespace-nowrap !text-title-2-demi xl:block', isActive && 'text-primary')}>{title}</p>
    </div>
  )
}
