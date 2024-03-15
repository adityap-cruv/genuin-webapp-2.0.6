import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { cn } from '@lib/utils'
import { type ReactNode } from 'react'
import { useLocalStorage } from '@lib/stores/local-storage'
import { PATH_NAME } from '@lib/utils/constants/path'

export function RecentCommunities() {
  const communities = useLocalStorage((state) => state.communities)
  const pathName = usePathname()
  if (communities.length > 0)
    return (
      <>
        <hr className="border-1 mb-4 mt-1 border-monochrome-black/10" />
        <p className="hidden w-full break-all pb-1 pl-1 text-title-2-demi text-monochrome lg:line-clamp-1">
          Recent Communities
        </p>
        {communities.map((item, index) => {
          return (
            <Link
              key={item.handle}
              href={{
                pathname: PATH_NAME.community(item.slug),
                query: { feed: '1' },
              }}>
              <CommunityItem title={item.name} isActive={pathName === PATH_NAME.community(item.slug)}>
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

type ItemProps = {
  title: string
  isActive?: boolean
  children: ReactNode
}

function CommunityItem({ children, title, isActive }: ItemProps) {
  return (
    <div className="flex w-full max-w-full items-center gap-x-2 rounded-md p-3 text-title-2-demi hover:bg-monochrome-6/10">
      {children}
      <p
        className={cn(
          'hidden break-all !text-title-2-demi lg:line-clamp-1',
          isActive ? 'text-primary' : 'text-new-off-black'
        )}>
        {title}
      </p>
    </div>
  )
}
