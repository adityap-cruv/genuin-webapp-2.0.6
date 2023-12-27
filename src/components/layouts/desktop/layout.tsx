import { TopBar } from './top-bar'
import { SideBar } from './side-bar'

export function Layout(props: any) {
  return (
    <main className="absolute inset-0 flex h-full min-h-max w-full flex-col items-center overflow-clip">
      <TopBar />
      <section className="flex h-body w-full xl:container">
        <section className="flex-[1] lg:flex-[3]">
          <SideBar />
        </section>
        <section className="relative flex-[11] lg:flex-[9]">{props.children}</section>
      </section>
    </main>
  )
}
