import { NavBar } from '@components/common/nav-bar'
import { cookies } from 'next/headers'

interface Props {
  children: React.ReactNode
}

export default function Layout({ children }: Props) {
  const isMobile = cookies().get('mobile')?.value === 'true'
  return (
    <main>
      <NavBar variant="dark" isMobile={isMobile} />
      <section className="container mt-navbar h-body">{children}</section>
    </main>
  )
}
