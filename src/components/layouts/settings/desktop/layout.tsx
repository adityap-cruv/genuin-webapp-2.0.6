'use client'
import { TopBar } from '@components/layouts/desktop/top-bar'
import { SideBar } from './settings-side-bar'

export function SettingsLayout(props: any) {
  return (
    <>
      <main className="absolute inset-0 flex h-full min-h-max w-full flex-col items-center overflow-clip bg-monochrome-11">
        <TopBar />
        <section className="container flex h-body gap-4 overflow-clip p-4 md:w-3/5">
          <section className="flex-[1] rounded-2xl border border-monochrome-9 bg-monochrome-white p-4 md:flex-[4]">
            <SideBar />
          </section>
          <section className="relative flex-[11] overflow-auto rounded-2xl border border-monochrome-9 bg-monochrome-white md:flex-[8]">
            {props.children}
          </section>
        </section>
      </main>
    </>
  )
}
