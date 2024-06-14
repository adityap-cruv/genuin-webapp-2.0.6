import { type Metadata } from 'next'
import { NavBar } from '@components/pages/build/nav-bar'
import { Footer } from '@components/pages/build/footer'
import { MainComponent } from '@components/pages/build/main-component'

// TODO: optimize uses of dynamic function.
export default async function Page() {
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
    title: 'Build your Community Media Network.',
    applicationName: 'genuin',
    description:
      'Establish no-code, social communities with short videos that seamlessly integrate into  your owned digital properties and beyond.',
    openGraph: {
      title: 'Build your Community Media Network.',
      description:
        'Establish no-code, social communities with short videos that seamlessly integrate into  your owned digital properties and beyond.',
      url: 'https://begenuin.com',
      images: [
        {
          url: 'https://media.begenuin.com/backend_assets/new_genuin_preview.png',
        },
      ],
    },
  }
}
