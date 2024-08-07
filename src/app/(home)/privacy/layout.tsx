import { HomeFooter } from '@/components/pages/home/home-footer'
import { HomeNavBar } from '@/components/pages/home/home-nav'
// import { cookies } from 'next/headers'

interface Props {
  children: React.ReactNode
}

export default function Layout({ children }: Props) {
  // const isMobile = cookies().get('mobile')?.value === 'true'
  return (
    <main>
      <HomeNavBar />
      <section className="container">{children}</section>
      <HomeFooter />
    </main>
  )
}
