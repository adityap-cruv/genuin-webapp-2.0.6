import { NavBar } from '@components/common/nav-bar'
import { cookies } from 'next/headers'

export default function Layout({ children }: { children: React.ReactNode }) {
  const isMobile = cookies().get('mobile')?.value === 'true'

  return (
    <main>
      <NavBar variant="dark" isMobile={isMobile} />
      <section className="container mt-navbar">{children}</section>
    </main>
  )
}
