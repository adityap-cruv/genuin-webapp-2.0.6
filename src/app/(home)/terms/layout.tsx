import { HomeFooter } from '@/components/pages/home/home-footer'
import { HomeNavBar } from '@/components/pages/home/home-nav'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main>
      <HomeNavBar />
      <section className="container">{children}</section>
      <HomeFooter />
    </main>
  )
}
