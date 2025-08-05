import { useBaseContext } from '@/context/base'
import { SearchBar } from '@/components/search-bar'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/auth'
import { AuthenticationModal } from '@/components/authentication'
import { UserTick } from '@/components/user-tick'
import type { ComponentProps } from 'react'
import { cn } from '@/utils'
import GetAppButton from '../get-app-button'

type HeaderDesktopPropsTypes = ComponentProps<'div'>

/**
 * This component will be hidden by default when window-size is less than 768px
 * @returns
 */
export function HeaderDesktop({
  className,
  ...restProps
}: HeaderDesktopPropsTypes) {
  const { brandDetails } = useBaseContext()
  const { user } = useAuth()
  return (
    <div
      className={cn(
        'py-3 px-6 bg-background items-center hidden justify-between border-b-2 border-tertiary-200 md:flex',
        className,
      )}
      {...restProps}>
      <img
        alt={brandDetails?.name}
        height={36}
        style={{ height: 36 }}
        src={brandDetails?.brand_web_logo}
      />
      <img
        alt={brandDetails?.slogan.text ?? undefined}
        height={36}
        style={{ height: 36 }}
        src={brandDetails?.slogan.image ?? undefined}
      />
      <div className='flex items-center gap-3'>
        {/** Hidden after discussion with product team */}
        {/* <a
          className='__gen__sdk__hover__primary __gen__sdk__hover__text__white'
          href='https://google.com'
          style={{
            padding: '4px 16px',
            borderRadius: 8,
            lineHeight: 24,
            color: 'var(--primary)',
            border: '1px solid var(--primary)',
          }}>
          <p
            style={{ color: 'inherit' }}
            className='__gen__sdk__text__body__2 __gen__sdk__font__weight__demi'>
            Get App
          </p>
        </a> */}
        <SearchBar.desktop />
        {user ? (
          <UserTick />
        ) : (
          <>
            {(brandDetails?.web_cta === 'app' ||
              brandDetails?.web_cta === 'both') && (
              <GetAppButton
                buttonText='Get App'
                className='h-8 flex-shrink-0 px-4 py-3 text-[15px] text-new-para-2 font-semibold text-primary border border-primary border-solid'
                variant='outline'
                size='custom'
              />
            )}

            {brandDetails?.web_cta !== 'app' && (
              <Button
                className='px-4 py-2 h-8'
                onClick={() => {
                  if (window.genuinAuth) {
                    window.genuinAuth({ path: '/', action: 'login' })
                  } else {
                    AuthenticationModal.open()
                  }
                  return
                }}>
                <p className='whitespace-nowrap text-white'>Log in</p>
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
