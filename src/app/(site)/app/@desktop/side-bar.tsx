'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { type ReactNode } from 'react'
import { HomeIcon, LatestIcon, MoreIcon, PopularIcon, SearchIcon } from '@icons/side-bar-icons'
import { cn } from '@lib/utils'
import { PATH_NAME } from '@lib/utils/constants/path'
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover'

export function SideBar() {
  const pathName = usePathname()
  return (
    <nav className="flex h-full w-fit flex-col border-r border-monochrome-9  transition-[width] lg:w-full">
      <span className="px-1 py-4">
        <Link href="/app/home">
          <Item title="Home" isActive={pathName.includes('home')}>
            <HomeIcon isActive={pathName.includes('home')} />
          </Item>
        </Link>
        <Link href="/app/popular">
          <Item title="Popular" isActive={pathName.includes('popular')}>
            <PopularIcon isActive={pathName.includes('popular')} />
          </Item>
        </Link>
        <Link href="/app/latest">
          <Item title="Latest" isActive={pathName.includes('latest')}>
            <LatestIcon isActive={pathName.includes('latest')} />
          </Item>
        </Link>
        <Link href="/app/search">
          <Item title="Search" isActive={pathName.includes('search')}>
            <SearchIcon isActive={pathName.includes('search')} />
          </Item>
        </Link>
        <Popover>
          <PopoverTrigger className="w-full">
            <Item title="More">
              <MoreIcon />
            </Item>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-1" side="bottom" align="start">
            <Link href={PATH_NAME.terms}>
              <p className="rounded-md p-3 text-title-lg font-semibold hover:bg-monochrome-6/10">Terms of Service</p>
            </Link>
            <Link href={PATH_NAME.privacy}>
              <p className="rounded-md p-3 text-title-lg font-semibold hover:bg-monochrome-6/10">Privacy Policy</p>
            </Link>
          </PopoverContent>
        </Popover>
      </span>
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
    <div className="flex w-full items-center gap-x-3 rounded-md p-3 hover:bg-monochrome-6/10">
      {children}
      <p
        className={cn('hidden text-title-lg font-semibold lg:block', isActive ? 'text-primary' : 'text-new-off-black')}>
        {title}
      </p>
    </div>
  )
}
