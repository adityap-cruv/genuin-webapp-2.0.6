import type { ComponentProps } from 'react'
import { SIDE_BAR_BREAKPOINT, SIDE_BAR_WIDTH } from '@/const'
import { useSizeContext } from '@/context/size'
import { Categories } from '../categories'
import { BecomeCbCard } from '../become-cb-card'
import { useAuth } from '@/context/auth'
import { cn } from '@/utils'
import { SidebarList } from './sidebar-list'
import { useBrandDetails } from '@/context/brand-details'

export function SidebarDesktop({
  className,
  style,
  ...restProps
}: ComponentProps<'nav'>) {
  const { user } = useAuth()
  const { brandDetails } = useBrandDetails()
  const {
    sizeBoxes: {
      element: { width: elementWidth },
      video: { height: sideBarHeight },
    },
  } = useSizeContext()

  return (
    <nav
      className={cn(
        'flex flex-col gap-4 p-4 bg-background',
        elementWidth < SIDE_BAR_BREAKPOINT && 'border-r-2 border-tertiary-200',
        className,
      )}
      style={{
        height: sideBarHeight,
        width:
          elementWidth >= SIDE_BAR_BREAKPOINT ? SIDE_BAR_WIDTH : 'min-content',
        ...style,
      }}
      {...restProps}>
      <SidebarList showTitle={elementWidth >= SIDE_BAR_BREAKPOINT} />
      {user?.ksCbRequestStatus !== 3 &&
        elementWidth >= SIDE_BAR_BREAKPOINT &&
        brandDetails.show_become_creator && <BecomeCbCard />}
      {elementWidth > SIDE_BAR_BREAKPOINT && <Categories />}
    </nav>
  )
}
