'use client'
import { TopBar } from './top-bar'
import { SideBar } from './side-bar'
import { useSearchParams } from 'next/navigation'

export function Layout(props: any) {
  // TODO: Remove this code.
  const showTopbar = useSearchParams().get('embed') !== '1'

  return (
    <main className="absolute inset-0 flex h-full min-h-max w-full flex-col items-center overflow-clip">
      {showTopbar && <TopBar />}
      <section className="flex h-body w-full xl:container overflow-clip">
        <section className="flex-[1] lg:flex-[3]">
          <SideBar />
        </section>
        <section className="relative flex-[11] lg:flex-[9]">{props.children}</section>
      </section>
    </main>
  )
}
