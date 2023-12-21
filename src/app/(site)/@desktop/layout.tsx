import { SideBar } from './side-bar'
import { TopBar } from './top-bar'

export default function AppLayout(props: any) {
  return (
    <main className="absolute inset-0 flex h-full min-h-max w-full flex-col items-center overflow-clip">
      <TopBar />
      <section className="flex h-body w-full max-w-[1536px]">
        <section className="lg:flex-[2] xl:flex-[3]">
          <SideBar />
        </section>
        <section className="relative xl:flex-[9]">{props.children}</section>
      </section>
    </main>
  )
}
