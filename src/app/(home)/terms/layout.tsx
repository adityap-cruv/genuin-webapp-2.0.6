import { Footer } from '@/components/pages/index-pages/footer'
// import { NavBar } from '@/components/pages/index-pages/nav-bar'
import { NavBar } from '@/components/new/nav-bar'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="h-full w-full overflow-y-auto">
      <NavBar />
      <section className="container">{children}</section>
      <Footer />
    </main>
  )
}
