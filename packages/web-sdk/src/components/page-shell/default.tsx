import { SidebarDesktop } from '@/components/side-bar/desktop'
import { HeaderDesktop } from '@/components/header/desktop'
import { useBrandDetails } from '@/context/brand-details'
import { useSizeContext } from '@/context/size'
import { cn } from '@/utils'
import { PageShellProps } from '.'

export function Default({ children, className, ...restProps }: PageShellProps) {
  const {
    isMobile,
    sizeBoxes: {
      video: { height: elementHeight },
    },
  } = useSizeContext()
  const { customizations } = useBrandDetails()
  const showSideBar = customizations?.show_side_panel && !isMobile
  const showNavigationBar = customizations?.show_navigation && !isMobile

  return (
    <main
      className='h-full mx-auto my-0 w-full bg-background'
      style={{ maxWidth: 1300 }}>
      {showNavigationBar && <HeaderDesktop />}
      <section
        className='flex w-full h-full'
        style={{
          height: elementHeight,
        }}>
        {showSideBar && <SidebarDesktop className='sticky top-0' />}
        <section
          className={cn('relative h-full w-full overflow-hidden', className)}
          {...restProps}>
          {children}
        </section>
      </section>
    </main>
  )
}
