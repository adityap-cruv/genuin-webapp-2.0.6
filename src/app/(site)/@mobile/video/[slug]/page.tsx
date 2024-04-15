import { Root } from './root'
import { PATH_NAME } from '@lib/utils/constants/path'
import { type Metadata } from 'next'
import { fetchMetadata } from '@lib/api/meta-data'
import { getVideoDetails } from '@lib/api/video'
type PageProps = {
  params: {
    slug: string
  }
  searchParams: {
    community: string
    loop: string
    utm_source: string
  }
}

export default async function Component({ params, searchParams }: PageProps) {
  const videoData = await getVideoDetails(params.slug)
  return <Root videoData={videoData} />
}

type VideoDataType = {
  title: string
  description: string
  preview_image: string
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const videoDetails: VideoDataType = await fetchMetadata({ type: 4, slug: params.slug })
  const title = videoDetails.title
  const description = videoDetails.description
  let shareLink = `${process.env.NEXT_PUBLIC_HOST_URL}${PATH_NAME.video(params.slug)}`
  const queryParams = []
  if (searchParams?.community) {
    queryParams.push(`community=${searchParams.community}`)
  }
  if (searchParams?.loop) {
    queryParams.push(`loop=${searchParams.loop}`)
  }
  if (searchParams?.utm_source) {
    queryParams.push(`utm_source=${searchParams.utm_source}`)
  }
  if (queryParams.length > 0) {
    shareLink += `?${queryParams.join('&')}`
  }

  return {
    title,
    applicationName: 'genuin',
    description,
    openGraph: {
      title,
      description,
      url: shareLink,
      images: [{ url: `${videoDetails?.preview_image}#primaryimage` }],
    },
  }
}
