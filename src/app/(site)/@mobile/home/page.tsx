import { fetchMetadata } from '@lib/api/meta-data'
import { Root } from './root'
import { type Metadata } from 'next'
import { headers } from 'next/headers'
import { PATH_NAME } from '@lib/utils/constants/path'
import { getConfig } from '../../../../middleware'

export default async function Page() {
  return <Root />
}

type HomeMetadata = {
  title: string
  description: string
  preview_image: string
}

export async function generateMetadata(): Promise<Metadata> {
  const host = headers().get('host') ?? ''
  const config = getConfig(host)
  if (config) {
    const metadataParams = { type: 5, ...config }
    const metadata: HomeMetadata = await fetchMetadata(metadataParams)
    return {
      title: metadata.title || '',
      // applicationName: 'Genuin',
      description: metadata.description || '',
      openGraph: {
        title: metadata.title || '',
        description: metadata.description || '',
        url: `${process.env.NEXT_PUBLIC_HOST_URL}` + PATH_NAME.home(),
        images: [{ url: metadata.preview_image ?? '' }],
      },
    }
  } else {
    return {
      title: 'Home | Welcome to Genuin!',
    }
  }
}
