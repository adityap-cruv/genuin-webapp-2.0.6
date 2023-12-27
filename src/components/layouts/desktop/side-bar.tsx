'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { type ReactNode } from 'react'
import { HomeIcon, LatestIcon, MoreIcon, PopularIcon } from '@icons/side-bar-icons'
import { cn } from '@lib/utils'
import { PATH_NAME } from '@lib/utils/constants/path'
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover'
// import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@components/ui/tooltip'
import dynamic from 'next/dynamic'
// import { Popover } from '@components/ui/popover'
const RecentCommunities = dynamic(
  async () => await import('./recent-communities').then((comp) => comp.RecentCommunities),
  { ssr: false }
)

// TODO: Improve active states on all items.
export function SideBar() {
  const pathName = usePathname()
  return (
    <nav className="flex h-full w-fit  flex-col border border-monochrome-9 transition-[width] lg:w-full lg:border-none">
      <span className="px-1 py-4">
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
        {/* <Link href={PATH_NAME.search()}>
          <Item title="Search" isActive={pathName === PATH_NAME.search()}>
            <SearchIcon isActive={pathName.includes('search')} />
          </Item>
        </Link> */}
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
            align="start"
            >
            <Link href={{ pathname: PATH_NAME.terms }}>
              <p
                style={{ fontSize: '20px', lineHeight: '32px', fontWeight: 600 }}
                className="rounded-md p-2 hover:bg-monochrome-6/10">
                Terms and Conditions
              </p>
            </Link>
            <Link href={{ pathname: PATH_NAME.privacy }}>
              <p
                style={{ fontSize: '20px', lineHeight: '32px', fontWeight: 600 }}
                className="rounded-md p-2 hover:bg-monochrome-6/10">
                Privacy Policy
              </p>
            </Link>
          </PopoverContent>
        </Popover>
        <RecentCommunities />
      </span>
    </nav>
  )
}

type ItemProps = {
  title: string
  isActive?: boolean
  children: ReactNode
}

// TODO: remove hard coding of font styles
function Item({ title, isActive, children }: ItemProps) {
  return (
    <div className="flex w-full max-w-full items-center gap-x-3 rounded-md p-3 hover:bg-monochrome-6/10">
      {children}
      <p
        className={cn('hidden break-all lg:block', isActive ? 'text-primary' : 'text-new-off-black')}
        style={{ fontSize: '20px', lineHeight: '32px', fontWeight: 600 }}>
        {title}
      </p>
    </div>
  )
}
