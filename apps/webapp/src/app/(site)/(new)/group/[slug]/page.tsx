import { type Metadata } from 'next'
import { GroupClientPage } from './client-page'
import { fetchMetadata } from '@lib/api/meta-data'
import { PATH_NAME } from '@lib/utils/constants/path'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, unknown>>
}

export default async function GroupPage({ params, searchParams }: Props) {
  const resolvedParams = await params
  return <GroupClientPage slug={resolvedParams.slug} />
}

interface GroupDataType {
  title: string
  description: string
  preview_image: string
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params
  const groupData: GroupDataType = await fetchMetadata({ type: 3, slug: resolvedParams.slug })
  return {
    title: groupData?.title,
    description: groupData?.description,
    openGraph: {
      title: groupData?.title,
      description: groupData?.description,
      url: `${process.env.NEXT_PUBLIC_HOST_URL}` + PATH_NAME.loop(resolvedParams.slug),
      images: [{ url: groupData?.preview_image }],
    },
  }
}
