'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { type ReactNode } from 'react'
import { ExploreIcon, HomeIcon, LatestIcon, MoreIcon, PopularIcon, ProfileIcon } from '@icons/side-bar-icons'
import { cn } from '@lib/utils'
import { PATH_NAME } from '@lib/utils/constants/path'
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover'
import dynamic from 'next/dynamic'
import { Button } from '@components/ui/button'
import { AuthenticationModal } from '@components/common/modals/authentication'
import { GenuinIcon } from '@icons/genuin-icon'
import CommunityIcon from '@icons/ks-cb-flow/icCommunity.svg'
import { useSession } from 'next-auth/react'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { miniProfile } from '@lib/api/auth'
import { NotificationIcon } from '@icons/settings-side-bar-icons'
import Analytics from '@services/analytics'
import { type User } from 'next-auth'
import { CategoryView } from '@components/common/category-view'
const RecentCommunities = dynamic(
  async () => await import('./recent-communities').then((comp) => comp.RecentCommunities),
  { ssr: false }
)

// TODO: Improve active states on all items.
export function SideBar() {
  const { embed, user, brandName, notificationCount } = useGenuinOptions((state) => ({
    embed: state.embed,
    user: state.user,
    brandName: state.config?.name ? state.config?.name : 'Genuin',
    notificationCount: state.notificationCount,
  }))
  const { data: sessionData, update: updateSession, status } = useSession()
  const pathName = usePathname()

  function handleCommunityBuilderClick() {
    void miniProfile(true)
      .then((res) => {
        if (res.code === 200) {
          void updateSession({
            ...sessionData,
            user: { ...sessionData?.user, ksCbRequestStatus: res.data.ks_cb_request_status } as User,
          })
          const messageType = res?.data?.ks_cb_request_status === 3 ? 'MINI_PROFILE_SUCCESS' : 'KS_CB_SUBDOMAIN'
          AuthenticationModal.open(undefined, messageType)
          void Analytics.track({
            eventName: 'become_cb_clicked',
            properties: {},
          })
        } else {
          AuthenticationModal.open(undefined, 'KS_CB_SUBDOMAIN')
        }
      })
      .catch(() => {
        AuthenticationModal.open(undefined, 'KS_CB_SUBDOMAIN')
      })
  }

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
        {/* <Link href={PATH_NAME.search()}>
          <Item title="Search" isActive={pathName === PATH_NAME.search()}>
            <SearchIcon isActive={pathName.includes('search')} />
          </Item>
        </Link> */}
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
        {status === 'unauthenticated' && embed && (
          <div className="p-4">
            <Button
              onClick={() => {
                AuthenticationModal.open()
              }}
              variant={'outline'}
              className="hidden w-3/4 border-primary lg:block">
              <p className="text-title-3-bold text-primary">Log in</p>
            </Button>
          </div>
        )}
        {user?.ksCbRequestStatus !== 3 && (
          <>
            <hr className="border-1 mt-1 border-monochrome-black/10" />
            <div
              className="max-w-64 relative my-4 hidden max-h-16 w-11/12 rounded-lg border border-[#E9CAF4] bg-primary-200 text-title-3-demi text-monochrome-black hover:cursor-pointer lg:block lg:flex"
              style={{
                background: 'linear-gradient(30deg, var(--primary-400) -80%, #FFFFFF 50%, var(--primary-400) 120%)',
              }}
              onClick={() => {
                if (user?.isEmailVerified) {
                  handleCommunityBuilderClick()
                } else {
                  AuthenticationModal.open('KS_CB_REQUEST', embed ? 'KS_CB_SUBDOMAIN' : 'KS_CB_WEB')
                }
              }}>
              <div className="z-20 w-3/5">
                <p className="w-64 overflow-hidden p-3 text-body-1-bold">
                  Become a{' '}
                  <span className="font-semibold italic">
                    community <br /> builder{' '}
                  </span>
                  {embed ? 'for' : 'on'}{' '}
                  <span
                    className="inline-block  overflow-clip text-primary"
                    style={{ maxWidth: '12ch', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    {' '}
                    {brandName}
                  </span>{' '}
                  🚀
                </p>
              </div>
              <div className="z-10 flex w-2/5 items-end justify-center">
                <img src={CommunityIcon.src} alt="community" className="h-12" />
              </div>
            </div>
          </>
        )}
        <CategoryView classname="hidden lg:block" />
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
            eventName: `${title}_clicked`,
            properties: {
              brandName,
            },
          })
        }
      }}
      className="flex w-full max-w-full shrink-0 items-center gap-x-3 rounded-md p-3 hover:bg-monochrome-6/10">
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
