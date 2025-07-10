'use client'
import { type FC, type PropsWithChildren } from 'react'
import { TopBar } from './top-bar'
import { cn } from '../../../lib/utils'
import { SideBar } from '@genuin/components/organisms/side-bar'
import { useGenuinOptions } from '../../../lib/stores/genuin-options'

interface LayoutProps {
  isCollapsed?: boolean
}

export const Layout: FC<PropsWithChildren<LayoutProps>> = ({ children, isCollapsed }) => {
  const { showNavbar } = useGenuinOptions()

  return (
    <main className="absolute inset-0 flex h-full w-full flex-col items-center overflow-clip">
      {showNavbar && <TopBar />}
      <section className={cn('flex w-full overflow-clip px-0', showNavbar ? 'h-body' : 'h-full')}>
        <SideBar />
        <section id="root-element" className="relative flex w-full min-w-0 flex-1 flex-col items-center">
          {children}
        </section>
      </section>
    </main>
  )
}
