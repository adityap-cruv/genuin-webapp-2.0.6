import { useBaseContext } from '@/context/base'
import { SearchBar } from '@/components/search-bar'
import { AuthenticationModal } from '../authentication'
import { SearchIcon } from '@/components/icons/search-icon'
import { useAuth } from '@/context/auth'
import { Button } from '@/components/ui/button'
import { ComponentProps } from 'react'
import { cn } from '@/utils'
import { UserTick } from '@/components/user-tick'
import { useBrandDetails } from '@/context/brand-details'
import { SidebarMobile } from '../side-bar/mobile'

export type HeaderMobileVariantType = 'transparent' | 'white'

type HeaderMobilePropsType = ComponentProps<'nav'> & {
  variant?: HeaderMobileVariantType
}

// TODO: convert this component to adapt CVA.
/**
 * This will get automatically hidden after 768px.
 * @returns
 */
export function HeaderMobile({
  className,
  style,
  variant = 'transparent',
  ...restProps
}: HeaderMobilePropsType) {
  const { user } = useAuth()
  const { brandDetails } = useBaseContext()
  const { customizations } = useBrandDetails()
  const showNavigationBar = customizations?.show_navigation
  const showSideBar = customizations?.show_side_panel

  if (!showNavigationBar && !showSideBar) return undefined

  return (
    <nav
      className={cn(
        'm-auto sticky justify-between h-16 items-center flex md:hidden gap-4 left-0 w-full z-50 py-3 px-4',
        className,
        variant !== 'transparent' &&
          'bg-background border-b-2 border-tertiary-200',
      )}
      style={{
        background:
          showNavigationBar && variant === 'transparent'
            ? 'linear-gradient(180deg, rgba(0, 0, 0, 0.60) 0%, rgba(17, 17, 17, 0.00) 100%)'
            : undefined,
        ...style,
      }}
      {...restProps}>
      <div className='items-center flex gap-4'>
        {showSideBar && <SidebarMobile variant={variant} />}
        {showNavigationBar && (
          <img
            src={brandDetails?.logo}
            className='h-10'
          />
        )}
      </div>
      {showNavigationBar && (
        <div className='flex gap-4'>
          <SearchBar.mobile>
            <div
              className={cn(
                'box-border rounded-full h-8 w-8 p-1',
                variant === 'transparent' && 'bg-black/20',
              )}>
              <SearchIcon
                variant={variant === 'transparent' ? 'transparent' : 'light'}
              />
            </div>
          </SearchBar.mobile>
          {user ? (
            <UserTick />
          ) : (
            <Button
              onClick={() => {
                // @ts-expect-error desc
                if (window.genuinAuth) {
                  // @ts-expect-error desc
                  window.genuinAuth({ path: '/', action: 'login' })
                } else {
                  AuthenticationModal.open()
                }
                return
              }}
              className='hover:bg-primary-700 bg-primary py-1 px-4 leading-6'>
              <p className='__gen__sdk__text__body__2 text-white font-semibold'>
                Log in
              </p>
            </Button>
          )}
        </div>
      )}
    </nav>
  )
}
