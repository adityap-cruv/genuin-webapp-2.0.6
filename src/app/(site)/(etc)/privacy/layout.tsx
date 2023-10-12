import { NavBar } from '@components/common/nav-bar'

interface Props {
  children: React.ReactNode
}

export default function Layout({ children }: Props) {
  return (
    <main>
      <NavBar variant="dark" />
      <section className="container mt-navbar h-body">{children}</section>
    </main>
  )
}
