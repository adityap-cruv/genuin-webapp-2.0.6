import { NavBar } from '@components/common/nav-bar'
import { cookies } from 'next/headers'

interface Props {
  children: React.ReactNode
}

export default function Layout({ children }: Props) {
  const isMobile = cookies().get('mobile')?.value === 'true'
  return (
    <main className="absolute inset-0 h-full w-full">
      <NavBar variant="light" isMobile={isMobile} />
      <section className="container mt-navbar h-body w-full ">{children}</section>
    </main>
  )
}
