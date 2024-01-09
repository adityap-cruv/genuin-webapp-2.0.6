import { fetchCommunityDetails } from '@lib/api/community'
import { RootDetails } from './root-details'
import { RootFeed } from './root-feed'
import { type Metadata } from 'next'
import { PATH_NAME } from '@lib/utils/constants/path'

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
      // TODO: Handle it by sending logs.
    }
    return <RootDetails communityDetails={communityData} />
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const communityData = await fetchCommunityDetails(params.slug)
  const title = `${communityData.info.name}`
  const desc = `${communityData.info.description}`

  return {
    title,
    applicationName: 'Genuin',
    description: desc || '',
    openGraph: {
      title,
      description: desc,
      url: `${process.env.NEXT_PUBLIC_HOST_URL}` + PATH_NAME.community(params.slug),
      images: [{ url: communityData.info.preview_image }],
    },
  }
}
