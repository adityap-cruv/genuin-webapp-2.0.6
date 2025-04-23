import type { ComponentProps } from 'react'
import { Categories } from '../categories'
import { BecomeCbCard } from '../become-cb-card'
import { useAuth } from '@/context/auth'
import { Sheet, SheetClose, SheetContent, SheetTrigger } from '../ui/sheet'
import { cn } from '@/utils'
import { SidebarList } from './sidebar-list'
import { useBrandDetails } from '@/context/brand-details'
import { BurgerIcon } from '../icons/burger-icon'
import type { HeaderMobileVariantType } from '../header/mobile'
import { CloseIcon } from '../icons/close-icon'

type SidebarMobilePropsType = ComponentProps<'button'> & {
  variant: HeaderMobileVariantType
}

export function SidebarMobile({
  className,
  variant,
  ...restProps
}: SidebarMobilePropsType) {
  const { user } = useAuth()
  const { brandDetails } = useBrandDetails()
  return (
    <Sheet>
      <SheetTrigger
        className={cn(
          'p-2 h-10 w-10 rounded-[50%] ',
          className,
          variant === 'transparent' && 'bg-black/20 dark:bg-foreground/20',
        )}
        {...restProps}>
        <BurgerIcon
          className={cn(
            'h-6 w-6',
            variant === 'transparent'
              ? 'stroke-white'
              : 'stroke-black dark:stroke-foreground',
          )}
        />
      </SheetTrigger>
      <SheetContent
        side='left'
        className='w-full absolute max-w-md outline-none'>
        <div className='flex flex-col gap-4'>
          <div className='w-full flex justify-between mb-2'>
            <img
              src={brandDetails?.brand_web_logo}
              className='h-10 object-contain'
            />
            <SheetClose className='bg-tertiary-200 rounded-full p-2'>
              <CloseIcon className='h-6 w-6 stroke-black dark:stroke-foreground' />
            </SheetClose>
          </div>
          <SidebarList showTitle />
          {user?.ksCbRequestStatus !== 3 &&
            brandDetails.show_become_creator && (
              <BecomeCbCard style={{ maxWidth: '270px' }} />
            )}
          <Categories />
        </div>
      </SheetContent>
    </Sheet>
  )
}
