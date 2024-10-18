import { type Metadata } from 'next'
import { Root } from './root'
import { PATH_NAME } from '@lib/utils/constants/path'
import { fetchMetadata } from '@lib/api/meta-data'
import { getVideoDetails } from '@lib/api/video'

type PageProps = {
  params: {
    slug: string
  }
  searchParams: {
    community: string
    group: string
    utm_source: string
  }
}

export default async function Component({ params, searchParams }: PageProps) {
  const videoDetails = await getVideoDetails(params.slug)

  return (
    <main className="h-full w-full">
      <Root videoDetails={videoDetails} />
    </main>
  )
}

type VideoDataType = {
  title: string
  description: string
  preview_image: string
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const videoDetails: VideoDataType = await fetchMetadata({ type: 4, slug: params.slug })

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
  if (queryParams.length > 0) {
    shareLink += `?${queryParams.join('&')}`
  }

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
