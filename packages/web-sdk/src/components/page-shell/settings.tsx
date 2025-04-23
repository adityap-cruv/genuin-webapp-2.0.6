import { cn } from '@/utils'
import { PageShellProps } from '.'
import { useSizeContext } from '@/context/size'
import { useBrandDetails } from '@/context/brand-details'
import { HeaderDesktop } from '@/components/header/desktop'
import { SideBar } from '@/components/pages/settings/sidebar'
import { BackIcon } from '@/components/icons/back-icon'
import { goBackToNonSettingsPath } from '@/router/context'
import { Analytics } from '@/analytics'

export function Settings({
  className,
  children,
  style,
  ...restProps
}: PageShellProps) {
  const {
    isMobile,
    sizeBoxes: {
      video: { height: elementHeight },
    },
  } = useSizeContext()
  const { customizations } = useBrandDetails()
  // const showSideBar = customizations?.show_side_panel && !isMobile
  const showNavigationBar = customizations?.show_navigation && !isMobile

  return (
    <main
      className='h-full mx-auto bg-black my-0 w-full bg-tertiary-200'
      style={{ maxWidth: 1300 }}>
      {showNavigationBar && <HeaderDesktop />}
      <section
        className={cn(
          'w-full md:p-4 justify-center flex gap-6 h-full',
          className,
        )}
        style={{ ...style, height: elementHeight }}
        {...restProps}>
        <div
          onClick={() => {
            goBackToNonSettingsPath('/home')
            Analytics.track(Analytics.EventNames.SettingsClosed)
          }}
          className='mt-2 shrink-0 hidden md:flex h-12 w-12 items-center justify-center rounded-full bg-tertiary-300 hover:cursor-pointer'>
          <BackIcon />
        </div>
        <SideBar />
        <div className='h-full w-full bg-background md:rounded-2xl max-w-lg md:border-tertiary-300 md:border overflow-clip'>
          {children}
        </div>
      </section>
    </main>
  )
}
