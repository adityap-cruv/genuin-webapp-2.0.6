'use client'
import { SideBar } from './side-bar'
import { TopBar } from './top-bar'
import { cn } from '@lib/utils'
import { useGenuinOptions } from '@lib/stores/genuin-options'

export function EmbedLayout(props: any) {
  const { showNavbar } = useGenuinOptions()

  return (
    <>
      {showNavbar && <TopBar />}
      <main className="inset-0 flex h-body w-full flex-col items-center overflow-scroll">
        <section className={cn('flex h-full w-full overflow-visible px-0 2xl:container xl:px-10 2xl:px-0')}>
          <div className="fixed z-20">
            <SideBar isCollapsed={!!props.isCollapsed} />
          </div>
          <section id="root-element" className="relative flex w-full min-w-0 flex-1 flex-col pl-20">
            {props.children}
          </section>
        </section>
      </main>
    </>
  )
}
