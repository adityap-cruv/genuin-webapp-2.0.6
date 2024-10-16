'use client'
import { SideBar } from './side-bar'
import { TopBar } from './top-bar'
import { cn } from '@lib/utils'
import { useGenuinOptions } from '@lib/stores/genuin-options'

export function Layout(props: any) {
  const showNavbar = useGenuinOptions().showNavbar
  return (
    <main className="absolute inset-0 flex h-full w-full flex-col items-center overflow-clip">
      {showNavbar && <TopBar />}
      <section
        className={cn(
          'flex w-full overflow-clip px-0 2xl:container xl:px-10 2xl:px-0',
          showNavbar ? 'h-body' : 'h-full'
        )}>
        <SideBar />
        <section className="relative w-full">{props.children}</section>
      </section>
    </main>
  )
}
