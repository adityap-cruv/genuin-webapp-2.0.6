'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { type ReactNode } from 'react'
import { HomeIcon, LatestIcon, MoreIcon, PopularIcon, SearchIcon } from '@icons/side-bar-icons'
import { cn } from '@lib/utils'
import { PATH_NAME } from '@lib/utils/constants/path'
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { useRecentCommunitiesStore } from '@lib/stores/recent-communities'

export function SideBar() {
  const communities = useRecentCommunitiesStore((state) => state.communities)
  const pathName = usePathname()
  return (
    <nav className="flex h-full w-fit flex-col border-r border-monochrome-9  transition-[width] lg:w-full">
      <span className="px-1 py-4">
        <Link href={PATH_NAME.home()}>
          <Item title="Home" isActive={pathName.includes('home')}>
            <HomeIcon isActive={pathName.includes('home')} />
          </Item>
        </Link>
        <Link href={PATH_NAME.popular()}>
          <Item title="Popular" isActive={pathName.includes('popular')}>
            <PopularIcon isActive={pathName.includes('popular')} />
          </Item>
        </Link>
        <Link href={PATH_NAME.latest()}>
          <Item title="Latest" isActive={pathName.includes('latest')}>
            <LatestIcon isActive={pathName.includes('latest')} />
          </Item>
        </Link>
        <Link href={PATH_NAME.search()}>
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
        {communities.length > 0 && <RecentCommunities communities={communities} />}
      </span>
    </nav>
  )
}

// Causing hydration issue fix it.
function RecentCommunities({ communities }: { communities: any[] }) {
  const pathName = usePathname()
  return (
    <>
      <hr className="mb-4 mt-1 border border-monochrome-black/10" />
      <p className="hidden pb-1 text-title-lg font-semibold text-monochrome lg:block">Recent Communities</p>
      {communities.map((item: any, index: any) => {
        const communityPathName = '/community/' + item.handle
        return (
          <Link key={index} href={{ pathname: communityPathName }}>
            <CommunityItem title={item.name} isActive={pathName.includes(communityPathName)}>
              <CustomAvatar
                imageUrl={item.profileImage}
                fallbackString={item.name}
                isAvatar={false}
                className="h-8 w-8"
              />
            </CommunityItem>
          </Link>
        )
      })}
    </>
  )
}

function CommunityItem({ children, title, isActive }: ItemProps) {
  return (
    <div className="flex w-full max-w-full items-center gap-x-2 rounded-md px-3 py-1 hover:bg-monochrome-6/10">
      {children}
      <p
        className={cn(
          'hidden break-all text-title-lg font-semibold lg:line-clamp-1',
          isActive ? 'text-primary' : 'text-new-off-black'
        )}>
        {title}
      </p>
    </div>
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
      <p
        className={cn(
          'hidden break-all text-title-lg font-semibold lg:line-clamp-1',
          isActive ? 'text-primary' : 'text-new-off-black'
        )}>
        {title}
      </p>
    </div>
  )
}
