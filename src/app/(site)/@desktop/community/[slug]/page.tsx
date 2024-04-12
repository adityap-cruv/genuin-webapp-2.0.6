import { fetchCommunityDetails } from '@lib/api/community'
import { RootDetails } from './root-details'
import { RootFeed } from './root-feed'
import { type Metadata } from 'next'
import { PATH_NAME } from '@lib/utils/constants/path'
import { fetchMetadata } from '@lib/api/meta-data'

interface Props {
  params: {
    slug: string
  }
  searchParams: {
    feed: string
  }
}

// TODO: change the fetchCommunityDetails separate this component.
export default async function Component({ params, searchParams }: Props) {
  if (searchParams.feed === '1') {
    return <RootFeed slug={params.slug} />
  } else {
    let communityData
    try {
      communityData = await fetchCommunityDetails(params.slug)
    } catch (error) {
      throw new Error()
    }
    return <RootDetails communityDetails={communityData} />
  }
}

interface CommunityDataType {
  title: string
  description: string
  preview_image: string
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const communityData: CommunityDataType = await fetchMetadata({ type: 2, slug: params.slug })
  const title = `${communityData.title}`
  const desc = `${communityData.description}`

  return {
    title,
    applicationName: 'Genuin',
    description: desc || '',
    openGraph: {
      title,
      description: desc,
      url: `${process.env.NEXT_PUBLIC_HOST_URL}` + PATH_NAME.community(params.slug),
      images: [{ url: communityData?.preview_image ?? '' }],
    },
  }
}
