'use client'
import { HamBurgerMenuIcon } from '@components/ui/ham-burger'
import { Button } from '@components/ui/button'
import { Sheet, SheetClose, SheetContent, SheetTrigger } from '@components/ui/sheet'
import { type ReactNode } from 'react'
import { cn, generateDeepLink, openGeneratedLink } from '@lib/utils'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { PopularIcon, HomeIcon, LatestIcon } from '@icons/side-bar-icons'
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
import { removeAllAuthToken } from '@lib/api/instance'

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
  const isEmbed = useGenuinOptions().embed
  const searchParams = Object.fromEntries(useSearchParams())
  return (
    <nav className={cn(navVariant({ variant }), className)}>
      <span className="flex items-center ">
        <Menu hamBurgerVariant={variant === 'trasparent' ? 'light' : 'dark'} />
        {isEmbed && (
          <Link href={{ pathname: PATH_NAME.home() }}>
            <AppLogo.icon
              imageHeight={32}
              className={cn(variant === 'trasparent' ? 'fill-new-off-white' : 'fill-new-off-black')}
            />
          </Link>
        )}
      </span>
      <span className="flex items-center gap-x-2">
        {!isEmbed ? (
          <>
            {/* <Link href={MOBILE_DOWNLOAD_APP_LINK} target="_blank"> */}
            <Button
              onClick={() => {
                void generateDeepLink({
                  pathName: window.location.pathname,
                  searchParams,
                  title: '',
                  description: '',
                  utmSource: 'app_web',
                  utmCampaign: 'download',
                })
                  .then((generatedLink) => {
                    openGeneratedLink(generatedLink)
                  })
                  .catch((e) => window.open(process.env.NEXT_PUBLIC_HOST_URL))
              }}
              className={
                variant === 'light'
                  ? 'bg-new-off-black hover:bg-new-dark-grey'
                  : 'bg-new-off-white text-new-off-black hover:bg-new-off-black hover:text-new-off-white'
              }>
              <p className="text-body-1-demi">Download Genuin</p>
            </Button>
            {/* </Link> */}
          </>
        ) : (
          <UserTick />
        )}

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
        {/* {showClose ? (
          <X
            className={cn(
              'h-6 w-6',
              variant === 'light' ? 'stroke-new-off-black' : 'stroke-new-off-white stroke-[3px]'
            )}
          />
        ) : (
          <Search
            className={cn(
              'h-7 w-7',
              variant === 'light'
                ? 'stroke-new-off-black'
                : 'rounded-full bg-monochrome-black/20 stroke-new-off-white p-1.5'
            )}
          />
        )} */}
      </span>
    </nav>
  )
}

function Menu({ hamBurgerVariant = 'dark' }: { hamBurgerVariant: 'dark' | 'light' }) {
  const pathName = usePathname()
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
            {/* <Link href={{ pathname: PATH_NAME.search() }}>
              <MenuItem title="Search" isActive={pathName.includes('search')}>
                <SearchIcon isActive={pathName === PATH_NAME.search()} />
              </MenuItem>
            </Link> */}
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
      <p className={cn('text-title-2-bold font-semibold', isActive ? 'text-primary' : 'text-new-off-black')}>{title}</p>
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
              <p className="text-body-1-demi text-monochrome-6">
                {!data.user.isEmailVerified ? 'Send verification email' : 'Complete profile'}
              </p>
            </div>
          </div>
          <hr className="border-b border-monochrome-9" />
          <div className="flex items-center gap-x-2 p-4">
            <LogoutIcon />
            <p
              className="text-body-1-demi"
              onClick={() => {
                void signOut({ callbackUrl: `${window.location.pathname}${window.location.search}`, redirect: true })
                removeAllAuthToken()
              }}>
              Log out
            </p>
          </div>
        </PopoverContent>
      </Popover>
    )
}
