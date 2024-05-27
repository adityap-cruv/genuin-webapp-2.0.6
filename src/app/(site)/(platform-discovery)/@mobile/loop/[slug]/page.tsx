import { LoopDetails } from './main-component'
import { type Metadata } from 'next'
import { PATH_NAME } from '@lib/utils/constants/path'
import { fetchMetadata } from '@lib/api/meta-data'

interface Props {
  params: {
    slug: string
  }
  searchParams: Record<string, unknown>
}

export default async function Component({ params }: Props) {
  return <LoopDetails slug={params.slug} />
}

interface LoopDataType {
  title: string
  description: string
  preview_image: string
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const loopDetails: LoopDataType = await fetchMetadata({ type: 3, slug: params.slug })
  const title = loopDetails.title
  const description = loopDetails.description

  return {
    title,
    // applicationName: 'Genuin',
    description,
    openGraph: {
      title,
      description,
      url: process.env.NEXT_PUBLIC_HOST_URL + PATH_NAME.loop(params.slug),
      images: [
        {
          url: loopDetails.preview_image,
        },
      ],
    },
  }
}
