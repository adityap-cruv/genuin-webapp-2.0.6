import { Metadata } from 'next'
import { NavBar } from '@components/pages/home/nav-bar'
import { Footer } from '@components/pages/home/footer'
import { MainComponent } from '@components/pages/home/main-component'
import { cookies } from 'next/headers'

// todo configure eslint plugin
// todo work on parallel routing for developing mobile and desktop components differently
export default async function Page() {
  const isMobile = cookies().get('mobile')?.value === 'true'
  return (
    <main className="absolute inset-0 min-h-full w-full text-new-off-black [&>div]:bg-new-off-white">
      <NavBar />
      <MainComponent isMobile={isMobile} />
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
      url: 'https://begenuin.com',
      images: [
        {
          url: 'https://media.begenuin.com/backend_assets/new_genuin_preview.png',
        },
      ],
    },
  }
}
