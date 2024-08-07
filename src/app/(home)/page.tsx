import { type Metadata } from 'next'
import { HomeComponent } from '@/components/pages/index-pages/home'

// TODO: optimize uses of dynamic function.
export default async function Page() {
  return (
    <main className="font-manrope absolute inset-0 text-new-off-black">
      <HomeComponent />
    </main>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Launch a Community Media Network for your Retail Media Network.',
    applicationName: 'genuin',
    description:
      'Video-based communities that connect consumers with their favorite brands and creators, while boosting consumer engagement and revenue for retailers.',
    openGraph: {
      title: 'Learn, connect and engage—all under one roof.',
      description:
        'Video-based communities that connect consumers with their favorite brands and creators, while boosting consumer engagement and revenue for retailers.',
      url: 'https://begenuin.com',
      images: [
        {
          url: 'https://media.begenuin.com/backend_assets/new_genuin_preview.png',
        },
      ],
    },
  }
}
