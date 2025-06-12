import { NavBar } from '@components/common/nav-bar'

interface Props {
  children: React.ReactNode
}

export default function Layout({ children }: Props) {
  return (
    <main
      className="absolute inset-0 h-full w-full"
      style={{
        background:
          'transparent radial-gradient(closest-side at 50% 50%, #00189f 0%, #000000 100%) 0% 0% no-repeat padding-box',
      }}>
      <NavBar variant="transparent" isMobile />
      <section className="container mt-navbar h-body w-full overflow-clip">{children}</section>
    </main>
  )
}
