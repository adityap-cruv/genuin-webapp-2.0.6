import { type ReactNode } from 'react'
import { SideBar } from './side-bar'
import { TopBar } from './top-bar'

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <main className="absolute inset-0 flex h-full min-h-max w-full min-w-max flex-col items-center overflow-clip">
      <TopBar />
      <section className="max-w-1440 flex h-body w-full">
        <section className="lg:flex-[2]">
          <SideBar />
        </section>
        <section className="flex-[10] rounded-bl-lg">{children}</section>
      </section>
    </main>
  )
}
