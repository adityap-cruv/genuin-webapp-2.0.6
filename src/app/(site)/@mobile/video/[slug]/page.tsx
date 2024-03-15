import { fetchVideoDetails } from '@lib/api/video'
import { Root } from './root'
import { PATH_NAME } from '@lib/utils/constants/path'
import { type Metadata } from 'next'
type PageProps = {
  params: {
    slug: string
  }
  searchParams: {
    l: string
  }
}

export default async function Component({ params, searchParams }: PageProps) {
  const videoData = await fetchVideoDetails(params.slug)

  return <Root videoData={videoData} />
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const videoDetails = await fetchVideoDetails(params.slug)
  const description = `Watch videos from ${
    videoDetails?.owner?.username || '@' + videoDetails?.video?.nickname
  } on Genuin`
  const title = `${
    videoDetails?.video?.description ? videoDetails?.video?.description + ' • ' : ''
  }Watch and react on Genuin`
  let shareLink = `${process.env.NEXT_PUBLIC_HOST_URL}${PATH_NAME.video(videoDetails?.video?.slug)}`
  if (videoDetails?.community?.share_string) {
    shareLink += `?community=${videoDetails?.community?.share_string}`
  }
  if (videoDetails?.loop?.share_string) {
    shareLink += `&loop=${videoDetails?.loop?.share_string}`
  }

  return {
    title,
    applicationName: 'genuin',
    description,
    openGraph: {
      title,
      description,
      url: shareLink,
      images: [{ url: `${videoDetails?.video?.preview}#primaryimage` }],
    },
  }
}
