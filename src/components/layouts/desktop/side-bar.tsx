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
import { NotificationIcon } from '@icons/settings-side-bar-icons'
import Analytics from '@services/analytics'
import { CategoryView } from '@components/common/category-view'
import { useShallow } from 'zustand/react/shallow'
import { LoginIcon } from '@icons/login-icon'
// import { VerifiedIcon } from '@icons/verified-icon'
import BecomeCbCard from '@/components/common/become-cb-card'
import { useSession } from 'next-auth/react'
import { AuthenticationModal } from '@/components/common/modals/authentication'

const DownloadAppDialog = dynamic(
  async () => await import('../download-app-dialog').then((comp) => comp.DownloadAppDialog)
)

const RecentCommunities = dynamic(
  async () => await import('./recent-communities').then((comp) => comp.RecentCommunities),
  { ssr: false }
)

// TODO: Improve active states on all items.
export function SideBar() {
  const { embed, user, brandName, notificationCount, isClaimed } = useGenuinOptions(
    useShallow((state) => ({
      embed: state.embed,
      user: state.user,
      brandName: state.config?.name ? state.config?.name : 'Genuin',
      notificationCount: state.notificationCount,
      isClaimed: state.config?.is_claimed,
    }))
  )
  const pathName = usePathname()
  const { status } = useSession()

  return (
    <nav className="flex h-full w-fit flex-col justify-between overflow-auto border border-monochrome-9 px-1 py-4 transition-[width] lg:w-full lg:max-w-[280px] lg:border-none">
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
                <NotificationIcon isActive={pathName === PATH_NAME.notification()} />
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
        {!embed && (
          <Popover>
            <PopoverTrigger className="w-full">
              <Item title="More">
                <MoreIcon isActive={false} />
              </Item>
            </PopoverTrigger>
            <PopoverContent
              sideOffset={-6}
              className=" rounded-2xl p-2 shadow-lg shadow-monochrome-3/40"
              side="bottom"
              align="start">
              <Link href={{ pathname: PATH_NAME.terms }}>
                <p className="rounded-md p-2 text-title-2-demi hover:bg-monochrome-6/10">Terms and Conditions</p>
              </Link>
              <Link href={{ pathname: PATH_NAME.privacy }}>
                <p className="rounded-md p-2 text-title-2-demi hover:bg-monochrome-6/10">Privacy Policy</p>
              </Link>
            </PopoverContent>
          </Popover>
        )}
        <span className="hidden lg:block">
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
              <p className={cn('hidden whitespace-nowrap !text-title-3-demi text-primary lg:block')}>Log in</p>
            </div>
          )}
          {/* {!isClaimed && user && (
            <div
              className="flex w-full max-w-full shrink-0 items-center gap-x-3 rounded-md p-2 px-4 hover:bg-monochrome-6/10"
              onClick={() => {
                AuthenticationModal.open(undefined, 'CLAIM_BRAND_PROFILE')
              }}>
              <VerifiedIcon className="stroke-primary" />
              <p className={cn('hidden whitespace-nowrap !text-title-3-demi text-primary lg:block')}>
                Claim Brand Profile
              </p>
            </div>
          )} */}
        </span>{' '}
        {(!isClaimed ?? user?.ksCbRequestStatus !== 3) && <hr className="border-1 my-2 border-monochrome-black/10" />}
        {user?.ksCbRequestStatus !== 3 && <BecomeCbCard className="my-4 hidden lg:block" />}
        <CategoryView className="hidden lg:block" />
        <RecentCommunities />
      </div>
      {embed && (
        <div className="hidden lg:block">
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
  notificationCount?: number | null
  brandName?: string
}

function Item({ title, isActive, children, notificationCount, brandName }: ItemProps) {
  return (
    <div
      onClick={() => {
        if (title === 'Popular' || title === 'Latest') {
          void Analytics.track({
            eventName: `${title.toLocaleLowerCase()}_clicked`,
            properties: {
              brandName,
            },
          })
        }
      }}
      className="flex w-full max-w-full shrink-0 items-center gap-x-3 rounded-md p-2 hover:bg-monochrome-6/10">
      <div className="relative">
        {children}
        {!notificationCount ||
          (notificationCount > 0 && (
            <>
              <div className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary  text-cap-1-med text-monochrome-white">
                {notificationCount}
              </div>
            </>
          ))}
      </div>
      <p className={cn('hidden whitespace-nowrap !text-title-2-demi lg:block', isActive && 'text-primary')}>{title}</p>
    </div>
  )
}
