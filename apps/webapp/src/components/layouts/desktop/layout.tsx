'use client'
import { type FC, type PropsWithChildren } from 'react'
import { SideBar } from './side-bar'
import { TopBar } from './top-bar'
import { cn } from '../../../lib/utils'
import { useGenuinOptions } from '../../../lib/stores/genuin-options'

interface LayoutProps {
  isCollapsed?: boolean
}

export const Layout: FC<PropsWithChildren<LayoutProps>> = ({ children, isCollapsed }) => {
  const { showNavbar } = useGenuinOptions()

  return (
    <main className="absolute inset-0 flex h-full w-full flex-col items-center overflow-clip">
      {showNavbar && <TopBar />}
      <section
        className={cn(
          'flex w-full overflow-clip px-0 2xl:container xl:px-10 2xl:px-0',
          showNavbar ? 'h-body' : 'h-full'
        )}>
        <SideBar isCollapsed={!!isCollapsed} />
        <section id="root-element" className="relative flex w-full min-w-0 flex-1 flex-col ">
          {children}
        </section>
      </section>
    </main>
  )
}
