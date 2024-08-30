import { CreatorsPage } from '@/components/pages/index-pages/creators'
import { type Metadata } from 'next'

export default function Page() {
  return (
    <main className="font-manrope absolute inset-0 h-full w-full text-new-off-black">
      <CreatorsPage />
    </main>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: 'Genuin - Build & Grow Your Community | For Creators, Influencers & Community Builders',
    description:
      "Reimagine connection with Genuin. Build communities around your passions, partner with brands, and expand your content's reach. Create meaningful connections and tap into rewards as you grow your community. Start your community with Genuin today and engage with highly-relevant audiences at scale.",
    openGraph: {
      type: 'website',
      title: 'Build & Grow Your Community | For Creators, Influencers & Community Builders',
      description:
        "Reimagine connection with Genuin. Build communities around your passions, partner with brands, and expand your content's reach. Create meaningful connections and tap into rewards as you grow your community. Start your community with Genuin today and engage with highly-relevant audiences at scale.",
      siteName: 'Genuin',
    },
  }
}
