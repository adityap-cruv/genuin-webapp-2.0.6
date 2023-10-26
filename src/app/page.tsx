import { Metadata } from 'next'
import { NavBar } from '@components/pages/home/nav-bar'
import { Footer } from '@components/pages/home/footer'
import { MainComponent } from '@components/pages/home/main-component'
import { cookies } from 'next/headers'

export default async function Page() {
  const isMobile = cookies().get('mobile')?.value === 'true'
  return (
    <main className="absolute inset-0 min-h-full w-full">
      <NavBar />
      <MainComponent isMobile={isMobile} />
      <Footer />
    </main>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Welcome to Genuin!!!' }
}
