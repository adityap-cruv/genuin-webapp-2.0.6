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
    <main className="bg-new-off-white text-new-off-black">
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
      title: 'Learn, connect and engage—all under one roof.',
      description:
        'Discover videos that level up your life. Learn new things, share your knowledge, and create authentic connections.',
      url: 'https://begenuin.com',
      images: [
        {
          url: 'https://genuin-media.s3.amazonaws.com/backend_assets/new_genuin_preview.png',
        },
      ],
    },
  }
}
