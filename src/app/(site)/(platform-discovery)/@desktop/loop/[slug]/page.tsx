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

// TODO: change the implementation of MainComponent.
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
  return {
    title: loopDetails?.title,
    // applicationName: 'Genuin',
    description: loopDetails?.description,
    openGraph: {
      title: loopDetails?.title,
      description: loopDetails?.description,
      url: process.env.NEXT_PUBLIC_HOST_URL + PATH_NAME.loop(params.slug),
      images: [
        {
          url: loopDetails?.preview_image,
        },
      ],
    },
  }
}
