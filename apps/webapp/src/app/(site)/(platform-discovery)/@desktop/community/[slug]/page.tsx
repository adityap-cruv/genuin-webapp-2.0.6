import { type Metadata } from 'next'
import { CommunityClientPage } from './client-page'
import { fetchMetadata } from '@lib/api/meta-data'
import { PATH_NAME } from '@lib/utils/constants/path'

interface Props {
  params: { slug: string }
  searchParams: { feed?: string }
}

export default async function CommunityPage({ params, searchParams }: Props) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  if (resolvedSearchParams?.feed === '1') {
    // TODO: implement feed view if needed
    // return <RootFeed slug={params.slug} />
    return <div>Feed view not implemented</div>
  }
  return <CommunityClientPage slug={resolvedParams.slug} />
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
    description: communityData?.description,
    openGraph: {
      title: communityData?.title,
      description: communityData?.description,
      url: `${process.env.NEXT_PUBLIC_HOST_URL}` + PATH_NAME.community(resolvedParams.slug),
      images: [{ url: communityData?.preview_image }],
    },
  }
}
