import { NavBar } from '@components/common/nav-bar'

interface Props {
  children: React.ReactNode
}

//todo fix navbar for this page.
export default function Layout({ children }: Props) {
  return (
    <main className="absolute left-0 top-0 h-full w-full">
      <NavBar variant="light" />
      <section className=" mt-navbar h-body w-full bg-[#F9F9F9]">
        <div className="h-full w-full overflow-clip xl:container">{children}</div>
      </section>
    </main>
  )
}
