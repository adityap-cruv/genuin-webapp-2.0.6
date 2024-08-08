import { Footer } from '@/components/pages/index-pages/footer'
import { NavBar } from '@/components/pages/index-pages/nav-bar'
interface Props {
  children: React.ReactNode
}

export default function Layout({ children }: Props) {
  // const isMobile = cookies().get('mobile')?.value === 'true'
  return (
    <main>
      <NavBar />
      <section className="container">{children}</section>
      <Footer />
    </main>
  )
}
