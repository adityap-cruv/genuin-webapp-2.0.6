import { Metadata } from 'next'
import { NavBar } from '@components/pages/home/nav-bar'
import { Footer } from '@components/pages/home/footer'
import { MainComponent } from '@components/pages/home/main-component'

export default async function Page() {
  return (
    <main className="absolute inset-0 min-h-full w-full">
      <NavBar />
      <MainComponent />
      <Footer />
    </main>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Welcome to Genuin!!!' }
}
