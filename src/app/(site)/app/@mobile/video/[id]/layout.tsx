import { NavBar } from '@components/common/nav-bar'
import { cookies } from 'next/headers'

type Props = {
  children: React.ReactNode
}

export default function Layout({ children }: Props) {
  const isMobile = cookies().get('mobile')?.value === 'true'

  return (
    <main className="absolute left-0 top-0 h-full w-full bg-monochrome-3">
      <NavBar variant="transparent" isMobile={isMobile} />
      <section className="w-full">{children}</section>
    </main>
  )
}
