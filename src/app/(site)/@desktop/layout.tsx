import { SideBar } from './side-bar'
import { TopBar } from './top-bar'

export default function AppLayout(props: any) {
  return (
    <main className="absolute inset-0 flex h-full min-h-max w-full flex-col items-center overflow-clip">
      <TopBar />
      <section className="flex h-body w-full max-w-1440">
        <section className="lg:flex-[2]">
          <SideBar />
        </section>
        <section className="relative flex-[10]">{props.children}</section>
      </section>
    </main>
  )
}
