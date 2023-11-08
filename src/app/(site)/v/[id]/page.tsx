import { Metadata } from 'next'
import { MainComponent } from './main-component'
import { fetchVideoDetails } from '@lib/api/video'

interface PageProps {
  params: {
    id: string
  }
  searchParams: {
    l: string
  }
}

export default async function Component({ params, searchParams }: PageProps) {
  const videoData = await fetchVideoDetails(params.id)

  return <MainComponent videoData={videoData} />
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const videoDetails = await fetchVideoDetails(params.id)
  const description = `Watch videos from ${
    videoDetails?.owner?.username || '@' + videoDetails?.video?.nickname
  } on Genuin`
  const title = `${
    videoDetails?.video?.description ? videoDetails?.video?.description + ' • ' : ''
  }Watch and react on Genuin`
  let shareLink = `${process.env.NEXT_PUBLIC_HOST_URL}v/${videoDetails?.video?.share_string}`
  if (videoDetails?.loop?.share_string) {
    shareLink += `?l=${videoDetails?.loop?.share_string}`
  }
  const author = {
    '@type': 'Person',
    name: '@' + videoDetails?.owner?.nickname,
    url: `${process.env.NEXT_PUBLIC_HOST_URL}p/${videoDetails?.owner?.nickname}`,
  }

  return {
    title: title,
    applicationName: 'genuin',
    description: description,
    openGraph: {
      title: title,
      description: description,
      url: shareLink,
      images: [{ url: `${videoDetails?.video?.thumbnail}/#primaryimage` }],
    },
  }
}
