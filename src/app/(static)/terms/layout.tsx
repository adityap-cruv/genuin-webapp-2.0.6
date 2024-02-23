import { NavBar } from '@components/pages/home/nav-bar'
import { cookies } from 'next/headers'

export default function Layout({ children }: { children: React.ReactNode }) {
  const isMobile = cookies().get('mobile')?.value === 'true'

  return (
    <main>
      <NavBar />
      <section className="container mt-navbar">{children}</section>
    </main>
  )
}
