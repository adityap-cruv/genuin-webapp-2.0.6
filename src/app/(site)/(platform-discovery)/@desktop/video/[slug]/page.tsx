import { type Metadata } from 'next'
import { Root } from './root'
import { PATH_NAME } from '@lib/utils/constants/path'
import { fetchMetadata } from '@lib/api/meta-data'
import { getVideoDetails } from '@lib/api/video'
import EmptyView from '@/components/common/empty-view'
import { NOT_FOUND_ERROR_CODES } from '@/lib/constants'

type PageProps = {
  params: {
    slug: string
  }
  searchParams: {
    community: string
    group: string
    utm_source: string
    share_image_id?: number
  }
}

export default async function Component({ params, searchParams }: PageProps) {
  try {
    const videoDetails = await getVideoDetails(params.slug)
    return (
      <main className="h-full w-full">
        <Root videoDetails={videoDetails} />
      </main>
    )
  } catch (error) {
    if ((error as Error).message === NOT_FOUND_ERROR_CODES.video) {
      return <EmptyView type="video" />
    } else {
      throw new Error((error as Error).message)
    }
  }
}

type VideoDataType = {
  title: string
  description: string
  preview_image: string
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  let shareLink = `${process.env.NEXT_PUBLIC_HOST_URL}${PATH_NAME.video(params.slug)}`
  const queryParams = []
  if (searchParams?.community) {
    queryParams.push(`community=${searchParams.community}`)
  }
  if (searchParams?.group) {
    queryParams.push(`group=${searchParams.group}`)
  }
  if (searchParams?.utm_source) {
    queryParams.push(`utm_source=${searchParams.utm_source}`)
  }
  if (searchParams?.share_image_id) {
    queryParams.push(`share_image_id=${searchParams.share_image_id}`)
  }
  if (queryParams.length > 0) {
    shareLink += `?${queryParams.join('&')}`
  }

  const videoDetails: VideoDataType = await fetchMetadata({
    type: 4,
    slug: params.slug,
    shareImageId: searchParams.share_image_id,
  })

  return {
    title: videoDetails?.title,
    description: videoDetails?.description,
    openGraph: {
      title: videoDetails?.title,
      description: videoDetails?.description,
      url: shareLink,
      type: 'video.other',
      images: [{ url: `${videoDetails?.preview_image}` }],
    },
  }
}
