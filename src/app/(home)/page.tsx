import { type Metadata } from 'next'
import { HomeComponent } from '@components/pages/home/home-component'

// TODO: optimize uses of dynamic function.
export default async function Page() {
  return (
    <main id="indexPage" className="absolute inset-0 text-new-off-black">
      <HomeComponent />
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
