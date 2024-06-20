import { RootFeed } from './root-feed'
import { CommunityDetails } from './root-details'
import { fetchMetadata } from '@lib/api/meta-data'
import { PATH_NAME } from '@lib/utils/constants/path'
import { type Metadata } from 'next'

type Props = {
  params: {
    slug: string
  }
  searchParams: {
    feed: string
  }
}

export default async function Component({ params, searchParams }: Props) {
  if (searchParams.feed === '1') return <RootFeed slug={params.slug} />
  return <Details slug={params.slug} />
}

async function Details({ slug }: { slug: string }) {
  return <CommunityDetails slug={slug} />
}

interface CommunityDataType {
  title: string
  description: string
  preview_image: string
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const communityData: CommunityDataType = await fetchMetadata({ type: 2, slug: params.slug })

  return {
    title: communityData.title,
    // applicationName: 'Genuin',
    description: communityData.description,
    openGraph: {
      title: communityData.title,
      description: communityData.description,
      url: `${process.env.NEXT_PUBLIC_HOST_URL}` + PATH_NAME.community(params.slug),
      images: [{ url: communityData?.preview_image ?? '' }],
    },
  }
}
