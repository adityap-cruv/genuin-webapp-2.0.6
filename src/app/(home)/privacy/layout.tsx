import { Footer } from '@/components/pages/index-pages/footer'
// import { NavBar } from '@/components/pages/index-pages/nav-bar'
import { NavBar } from '@/components/new/nav-bar'
interface Props {
  children: React.ReactNode
}

export default function Layout({ children }: Props) {
  // const isMobile = cookies().get('mobile')?.value === 'true'
  return (
    <main className="h-full w-full overflow-y-auto">
      <NavBar />
      <section className="container">{children}</section>
      <Footer />
    </main>
  )
}
