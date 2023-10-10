import { NavBar } from '@components/common/nav-bar'

interface Props {
  children: React.ReactNode
}

export default function Layout({ children }: Props) {
  return (
    <main className="absolute left-0 top-0 h-full w-full">
      <NavBar variant="light" />
      <section className=" mt-navbar h-body w-full bg-[#F9F9F9]">
        <div className="container h-full w-full">{children}</div>
      </section>
    </main>
  )
}
