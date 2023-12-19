'use client'
import { GenuinSymbol } from '@components/ui/genuin-logo'
import { HamBurgerMenuIcon } from '@components/ui/ham-burger'
import { Button } from '@components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@components/ui/sheet'
import { type ReactNode } from 'react'
import { cn } from '@lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PopularIcon, HomeIcon, LatestIcon, SearchIcon } from '@icons/side-bar-icons'
import { cva, type VariantProps } from 'class-variance-authority'
import { Search, X } from 'lucide-react'

const navVariant = cva('sticky top-0 flex z-10 h-[76px] w-full items-center justify-between  px-2', {
  variants: {
    variant: {
      light: 'border-b-2 border-monochrome-9 bg-monochrome-white',
      trasparent: 'bg-transparent',
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
    <nav className={cn(navVariant({ variant }), className, 'bg-gradient-to-b from-monochrome-2/40 to-transparent')}>
      <span className="flex items-center ">
        <Menu hamBurgerVariant={variant === 'trasparent' ? 'light' : 'dark'} />
        <GenuinSymbol variant={variant === 'trasparent' ? 'light' : 'black'} />
      </span>
      <span className="flex items-center gap-x-2">
        <Button
          className={
            variant === 'light'
              ? 'bg-new-off-black hover:bg-new-dark-grey'
              : 'bg-new-off-white text-new-off-black hover:bg-new-off-black hover:text-new-off-white'
          }>
          <p className="text-body-sm">Download Genuin</p>
        </Button>
        {showClose ? (
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
        )}
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
      <SheetContent side="left" className="w-full border-none">
        <span>
          <Link href="/app/home">
            <MenuItem title="Home" isActive={pathName.includes('home')}>
              <HomeIcon isActive={pathName.includes('home')} />
            </MenuItem>
          </Link>
          <Link href="/app/popular">
            <MenuItem title="Popular" isActive={pathName.includes('popular')}>
              <PopularIcon isActive={pathName.includes('popular')} />
            </MenuItem>
          </Link>
          <Link href="/app/latest">
            <MenuItem title="Latest" isActive={pathName.includes('latest')}>
              <LatestIcon isActive={pathName.includes('latest')} />
            </MenuItem>
          </Link>
          <Link href="/app/search">
            <MenuItem title="Search" isActive={pathName.includes('search')}>
              <SearchIcon isActive={pathName.includes('search')} />
            </MenuItem>
          </Link>
        </span>
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
    <div className="flex w-full items-center gap-x-3 rounded-md p-3 hover:bg-monochrome-6/10">
      {children}
      <p className={cn('text-title-lg font-semibold', isActive ? 'text-primary' : 'text-new-off-black')}>{title}</p>
    </div>
  )
}
