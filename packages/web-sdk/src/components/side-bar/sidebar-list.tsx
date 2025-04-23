import type { FeedType } from '@/type'
import { useContext, type ComponentProps } from 'react'
import { HomeIcon } from '../icons/home-icon'
import { PopularIcon } from '../icons/popular-icon'
import { LatestIcon } from '../icons/latest-icon'
import { navigate } from '@/router/context'
import { useRoute } from 'wouter'
import { ExploreIcon } from '../icons/explore-icon'
import { BellIcon } from '../icons/bell-icon'
import { BaseContext } from '@/context/base'
import { useAuth } from '@/context/auth'

const SIDE_BAR_ELEMENTS = [
  {
    id: 'HOME' as FeedType,
    title: 'Home',
    Icon: HomeIcon,
  },
  {
    id: 'POPULAR' as FeedType,
    title: 'Popular',
    Icon: PopularIcon,
  },
  {
    id: 'LATEST' as FeedType,
    title: 'Latest',
    Icon: LatestIcon,
  },
  {
    id: 'EXPLORE',
    title: 'Explore',
    Icon: ExploreIcon,
  },
  {
    id: 'NOTIFICATION',
    title: 'Notification',
    Icon: BellIcon,
  },
]

type SidebarListPropsType = {
  showTitle: boolean
}

export function SidebarList({ showTitle }: SidebarListPropsType) {
  return (
    <div className='flex flex-col gap-2'>
      {SIDE_BAR_ELEMENTS.map((item, index) => {
        const path = '/' + item.id.toLowerCase()
        return (
          <SidebarItem
            id={item.id}
            path={path}
            key={index}
            title={item.title}
            Icon={item.Icon}
            showTitle={showTitle}
            onClick={() => {
              // This will navigate to the respective feed page.
              navigate(path)
            }}
          />
        )
      })}
    </div>
  )
}

type SidebarItemPropsType = {
  title: string
  Icon: React.FC<ComponentProps<'svg'>>
  path: string
  showTitle?: boolean
} & ComponentProps<'div'>

function SidebarItem({
  title,
  Icon,
  showTitle = true,
  path,
  className = '',
  ...restProps
}: SidebarItemPropsType) {
  // Will check if the route is active of not.
  const [match] = useRoute(path)
  const { user } = useAuth()
  const { notificationCount } = useContext(BaseContext)
  const isActive = match

  if (!user && title === 'Notification') return null

  return (
    <div
      title={title}
      className={`relative flex gap-3 items-center p-2 cursor-pointer rounded-lg hover:bg-tertiary-200 hover:text-primary ${className}`}
      {...restProps}>
      <div className='relative'>
        <Icon fill={isActive ? 'var(--primary)' : 'var(--secondary)'} />
        {title === 'Notification' && notificationCount > 0 && (
          <span className='absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-cap-1-med text-white'>
            {notificationCount > 9 ? '9+' : notificationCount}
          </span>
        )}
      </div>
      {showTitle && (
        <p
          className='__gen__sdk__text__title__1 __gen__sdk__font__weight__demi'
          style={{ color: isActive ? 'var(--primary)' : 'var(--secondary)' }}>
          {title}
        </p>
      )}
    </div>
  )
}
