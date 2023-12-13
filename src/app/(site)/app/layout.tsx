import { type ReactNode } from 'react'
import { SideBar } from './side-bar'
import { TopBar } from './top-bar'
import { cookies } from 'next/headers'

export default function AppLayout({ children }: { children: { mobile: any; desktop: any } }) {
  const isMobile = cookies().get('mobile')?.value === 'true'
  if (!isMobile)
    return (
      <main className="absolute inset-0 flex h-full min-h-max w-full min-w-max flex-col items-center overflow-clip">
        <TopBar />
        <section className="flex h-body w-full max-w-1440">
          <section className="lg:flex-[2]">
            <SideBar />
          </section>
          <section className="flex-[10] rounded-bl-lg">{children.desktop}</section>
        </section>
      </main>
    )
  return <main>{children.mobile}</main>
}
