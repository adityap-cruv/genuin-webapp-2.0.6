import { NavBar } from '@components/common/nav-bar'

type Props = {
  children: React.ReactNode
}

export default function Layout({ children }: Props) {
  return (
    <main className="absolute left-0 top-0 h-full w-full bg-monochrome-3">
      <NavBar variant="transparent" />
      <section className="h-full w-full">{children}</section>
    </main>
  )
}
