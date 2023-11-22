import { NavBar } from '@components/common/nav-bar'

interface Props {
  children: React.ReactNode
}

export default function Layout({ children }: Props) {
  return (
    <main className="absolute inset-0 h-full w-full">
      <NavBar variant="light" />
      <section className="container mt-navbar h-body w-full overflow-clip">{children}</section>
    </main>
  )
}
