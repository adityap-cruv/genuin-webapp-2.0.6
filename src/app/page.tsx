import { type Metadata } from 'next'
import { NavBar } from '@components/pages/home/nav-bar'
import { Footer } from '@components/pages/home/footer'
import { MainComponent } from '@components/pages/home/main-component'

// TODO: optimize uses of dynamic function.
export default async function Page() {
  process.env.NEXT_AUTH_URL = 'localhost:4005'
  console.log(process.env.NEXT_AUTH_URL)
  return (
    <main id="indexPage" className="absolute inset-0 text-new-off-black">
      <NavBar />
      <MainComponent />
      <Footer />
    </main>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Learn, connect and engage—all under one roof.',
    applicationName: 'genuin',
    description:
      'Discover videos that level up your life. Learn new things, share your knowledge, and create authentic connections.',
    openGraph: {
      title: 'Learn, connect and engage—all under one roof.',
      description:
        'Discover videos that level up your life. Learn new things, share your knowledge, and create authentic connections.',
      url: 'https://begenuin.com',
      images: [
        {
          url: 'https://media.begenuin.com/backend_assets/new_genuin_preview.png',
        },
      ],
    },
  }
}
