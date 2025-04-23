import { BrandsPage } from '@/components/pages/index-pages/brands/brands-page'
import { type Metadata } from 'next'

export default function Page() {
  return (
    <main className="font-manrope absolute inset-0 h-full w-full text-new-off-black">
      <BrandsPage />
    </main>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: 'Genuin - Empower Your Brand with Video Communities | For Consumer Brands & Advertisers',
    description:
      "Reimagine audience engagement with Genuin's video-based community platform. Create and connect communities across your media channels to drive conversions, unlock first-party data, and expand your brand’s reach. Start your community today and turn consumers into lifelong advocates.",
    openGraph: {
      type: 'website',
      title: 'Genuin - Empower Your Brand with Video Communities | For Consumer Brands & Advertisers',
      description:
        "Reimagine audience engagement with Genuin's video-based community platform. Create and connect communities across your media channels to drive conversions, unlock first-party data, and expand your brand’s reach. Start your community today and turn consumers into lifelong advocates.",
      siteName: 'Genuin',
    },
  }
}
