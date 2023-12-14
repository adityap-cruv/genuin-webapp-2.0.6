import { SideBar } from './side-bar'
import { TopBar } from './top-bar'
import { cookies } from 'next/headers'

export default function AppLayout(props: any) {
  const isMobile = cookies().get('mobile')?.value === 'true'
  if (!isMobile)
    return (
      <main className="absolute inset-0 flex h-full min-h-max w-full flex-col items-center overflow-clip">
        <TopBar />
        <section className="flex h-body w-full max-w-1440">
          <section className="lg:flex-[2]">
            <SideBar />
          </section>
          <section className="flex-[10] rounded-bl-lg">{props.desktop}</section>
        </section>
      </main>
    )
  return <main>{props.mobile}</main>
}
