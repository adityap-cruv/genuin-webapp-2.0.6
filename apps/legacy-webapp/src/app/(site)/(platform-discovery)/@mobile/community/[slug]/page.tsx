import { RootFeed } from './root-feed'
import { CommunityDetails } from './root-details'
import { fetchMetadata } from '@lib/api/meta-data'
import { PATH_NAME } from '@lib/utils/constants/path'
import { type Metadata } from 'next'

type Props = {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<{
    feed: string
  }>
}

export default async function Component({ params, searchParams }: Props) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams

  if (resolvedSearchParams.feed === '1') return <RootFeed slug={resolvedParams.slug} />
  return <CommunityDetails slug={resolvedParams.slug} />
}
interface CommunityDataType {
  title: string
  description: string
  preview_image: string
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params
  const communityData: CommunityDataType = await fetchMetadata({ type: 2, slug: resolvedParams.slug })

  return {
    title: communityData?.title,
    // applicationName: 'Genuin',
    description: communityData?.description,
    openGraph: {
      title: communityData?.title,
      description: communityData?.description,
      url: `${process.env.NEXT_PUBLIC_HOST_URL}` + PATH_NAME.community(resolvedParams.slug),
      images: [{ url: communityData?.preview_image ?? '' }],
    },
  }
}
