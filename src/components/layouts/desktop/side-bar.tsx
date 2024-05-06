'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { type ReactNode } from 'react'
import { HomeIcon, LatestIcon, MoreIcon, PopularIcon, ProfileIcon } from '@icons/side-bar-icons'
import { cn } from '@lib/utils'
import { PATH_NAME } from '@lib/utils/constants/path'
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover'
// import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@components/ui/tooltip'
import dynamic from 'next/dynamic'
import { Button } from '@components/ui/button'
import { AuthenticationModal } from '@components/common/modals/authentication'
import { GenuinIcon } from '@icons/genuin-icon'
import CommunityIcon from '@icons/ks-cb-flow/icCommunity.svg'
import { useSession } from 'next-auth/react'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { miniProfile } from '@lib/api/auth'
import { NotificationIcon } from '@icons/settings-side-bar-icons'
// import { Popover } from '@components/ui/popover'
const RecentCommunities = dynamic(
  async () => await import('./recent-communities').then((comp) => comp.RecentCommunities),
  { ssr: false }
)

// TODO: Improve active states on all items.
export function SideBar() {
  const { embed, user, brandName } = useGenuinOptions((state) => ({
    embed: state.embed,
    user: state.user,
    brandName: state.config?.name ? state.config?.name : 'Genuin',
  }))
  const { data: sessionData, update: updateSession, status } = useSession()
  const pathName = usePathname()

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
    <nav className="flex h-full w-fit flex-col justify-between overflow-auto border border-monochrome-9 px-1 py-4 transition-[width] lg:w-full lg:max-w-[280px] lg:border-none">
      <div>
        <Link href={{ pathname: PATH_NAME.home() }}>
          <Item title="Home" isActive={pathName === PATH_NAME.home()}>
            <HomeIcon isActive={pathName === PATH_NAME.home()} />
          </Item>
        </Link>
        <Link href={{ pathname: PATH_NAME.popular() }}>
          <Item title="Popular" isActive={pathName === PATH_NAME.popular()}>
            <PopularIcon isActive={pathName === PATH_NAME.popular()} />
          </Item>
        </Link>
        <Link href={{ pathname: PATH_NAME.latest() }}>
          <Item title="Latest" isActive={pathName === PATH_NAME.latest()}>
            <LatestIcon isActive={pathName === PATH_NAME.latest()} />
          </Item>
        </Link>

        {user && (
          <>
            <Link href={{ pathname: PATH_NAME.settings('notification') }}>
              <Item title="Notification" isActive={pathName === PATH_NAME.settings('notification')}>
                <NotificationIcon isActive={pathName === PATH_NAME.settings('notification')} />
              </Item>
            </Link>
            <Link href={{ pathname: PATH_NAME.profile(user.nickname) }}>
              <Item title="Profile" isActive={pathName === PATH_NAME.profile(user.nickname)}>
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
              <p className="text-title-3-bold text-primary"> Log in</p>
            </Button>
          </div>
        )}
        {user?.ks_cb_request_status !== 3 && (
          <>
            <hr className="border-1 mt-1 border-monochrome-black/10" />
            <div
              className="max-w-72 relative my-4 hidden max-h-16 w-11/12 rounded-lg border border-[#E9CAF4] bg-primary-200 text-title-3-demi text-monochrome-black hover:cursor-pointer lg:block"
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
          </>
        )}
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
}

function Item({ title, isActive, children }: ItemProps) {
  return (
    <div className="flex w-full max-w-full items-center gap-x-3 rounded-md p-3 hover:bg-monochrome-6/10">
      {children}
      <p className={cn('hidden break-all !text-title-2-demi lg:block', isActive && 'text-primary')}>{title}</p>
    </div>
  )
}
