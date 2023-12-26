'use client'
import { GenuinSymbol } from '@components/ui/genuin-logo'
import { HamBurgerMenuIcon } from '@components/ui/ham-burger'
import { Button } from '@components/ui/button'
import { Sheet, SheetClose, SheetContent, SheetTrigger } from '@components/ui/sheet'
import { type ReactNode } from 'react'
import { cn } from '@lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PopularIcon, HomeIcon, LatestIcon } from '@icons/side-bar-icons'
import { cva, type VariantProps } from 'class-variance-authority'
import { PATH_NAME } from '@lib/utils/constants/path'
import { X } from 'lucide-react'
import { RecentCommunities } from './recent-communities'
import { DownloadAppDialog } from '@components/pages/home/download-app-dialog'

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
} & VariantProps<typeof navVariant>

export function TopBar({ variant = 'light', className, showClose = false }: Props) {
  return (
    <nav className={cn(navVariant({ variant }), className)}>
      <span className="flex items-center ">
        <Menu hamBurgerVariant={variant === 'trasparent' ? 'light' : 'dark'} />
        <Link href={{ pathname: '/' }}>
          <GenuinSymbol variant={variant === 'trasparent' ? 'light' : 'black'} />
        </Link>
      </span>
      <span className="flex items-center gap-x-2">
        <DownloadAppDialog>
          <Button
            className={
              variant === 'light'
                ? 'bg-new-off-black hover:bg-new-dark-grey'
                : 'bg-new-off-white text-new-off-black hover:bg-new-off-black hover:text-new-off-white'
            }>
            <p className="text-body-sm">Download Genuin</p>
          </Button>
        </DownloadAppDialog>
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
      <SheetContent showDefaultClose={false} side="left" className="w-full border-none">
        <SheetClose>
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
                <p className="text-body-sm">Terms and Conditions</p>
              </Link>
              <Link href={PATH_NAME.privacy}>
                <p className="text-body-sm">Privacy Policy</p>
              </Link>
            </span>
            <p className="text-body-sm"> &#169; 2023 Genuin Inc.</p>
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
      <p className={cn('text-title-lg font-semibold', isActive ? 'text-primary' : 'text-new-off-black')}>{title}</p>
    </div>
  )
}
