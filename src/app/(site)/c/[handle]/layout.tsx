import { NavBar } from '@components/common/nav-bar'
import { isMobile } from 'react-device-detect'

interface Props {
  children: React.ReactNode
}

//todo fix navbar for this page.
export default function Layout({ children }: Props) {
  return (
    <main className="absolute left-0 top-0 h-full w-full">
      {!isMobile && <NavBar variant="light" />}
      <section className="mt-navbar h-body w-full">
        <div className="h-full w-full xl:container">{children}</div>
      </section>
    </main>
  )
}
