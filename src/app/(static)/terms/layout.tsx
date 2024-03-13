import { NavBar } from '@components/pages/home/nav-bar'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main>
      <NavBar />
      <section className="container mt-navbar">{children}</section>
    </main>
  )
}
