import { NavBar } from '@components/common/nav-bar'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main>
      <NavBar variant="dark" />
      <section className="container mt-navbar">{children}</section>
    </main>
  )
}
