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

const navVariant = cva('sticky top-0 flex h-[76px] w-full items-center justify-between  px-2', {
  variants: {
    variant: {
      light: 'border-b-2 border-monochrome-9',
      trasparent: 'bg-gradient-to-b from-opacity-0 to-opacity-70 ',
    },
  },
})

type Props = VariantProps<typeof navVariant> & {
  className?: string
}

export function TopBar({ variant = 'light', className }: Props) {
  return (
    <nav className={cn(navVariant({ variant }), className)}>
      <span className="bg-[linear-gradient(180deg, rgba(17, 17, 17, 0.00) 0%, rgba(17, 17, 17, 0.70) 100%)] flex items-center">
        <Menu />
        <GenuinSymbol variant="black" />
      </span>
      <span className="flex items-center gap-x-2">
        <Button className="bg-new-off-black hover:bg-new-dark-grey">
          <p className="text-body-sm">Download Genuin</p>
        </Button>
        <SearchIcon isActive={false} />
      </span>
    </nav>
  )
}

function Menu() {
  const pathName = usePathname()
  return (
    <Sheet>
      <SheetTrigger>
        <HamBurgerMenuIcon toggleToClose={false} />
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
