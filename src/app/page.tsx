import { NavBar } from '@components/common/nav-bar'
import { Metadata } from 'next'
import { HomeComponent } from './home-component'

export default async function Page() {
  return (
    <main className=" absolute inset-0 h-full w-full overflow-clip bg-monochrome-black">
      <NavBar variant="transparent" />
      <section className="mt-navbar h-body w-full overflow-clip">
        <HomeComponent />
      </section>
    </main>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Welcome to Genuin!!!' }
}
