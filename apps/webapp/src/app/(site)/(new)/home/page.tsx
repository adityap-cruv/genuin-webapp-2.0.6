import { Metadata } from 'next'
import { HomeClientPage } from './client-page'
import { fetchMetadata } from '@lib/api/meta-data'
import { headers } from 'next/headers'
import { getConfig } from '../../../../middleware'

type HomeMetadata = {
  title: string
  description: string
  preview_image: string
}

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers()
  const host = headersList.get('host') ?? ''
  const config = getConfig(host)
  if (config) {
    const metadataParams = { type: 5, ...config }
    const metadata: HomeMetadata = await fetchMetadata(metadataParams)
    return {
      title: metadata?.title,
      description: metadata?.description,
      openGraph: {
        title: metadata?.title,
        description: metadata?.description,
        images: [{ url: metadata?.preview_image }],
      },
    }
  } else {
    return {
      title: 'Home | Welcome to Genuin!',
    }
  }
}

export default async function ComponentHomePage() {
  // You may want to keep using useBaseContext in the client page only
  // For SSR, you can fetch config/brandDetails here if needed, or just render the client page
  // If you want to SSR brandDetails, repeat the config fetch logic here as in generateMetadata
  // Otherwise, keep this minimal:
  return <HomeClientPage />
}
