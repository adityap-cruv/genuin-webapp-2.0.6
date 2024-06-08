'use client'
import { SideBar } from './side-bar'
import { TopBar } from './top-bar'
import { cn } from '@lib/utils'
import { useGenuinOptions } from '@lib/stores/genuin-options'

export function Layout(props: any) {
  const showNavbar = useGenuinOptions().showNavbar
  return (
    <main className="absolute inset-0 flex h-full min-h-max w-full flex-col items-center overflow-clip">
      {showNavbar && <TopBar />}
      <section className={cn('flex w-full overflow-clip xl:container', showNavbar ? 'h-body' : 'h-full')}>
        <section className="flex-[1] lg:flex-[3]">
          <SideBar />
        </section>
        <section className="relative flex-[11] lg:flex-[9]">{props.children}</section>
      </section>
    </main>
  )
}
