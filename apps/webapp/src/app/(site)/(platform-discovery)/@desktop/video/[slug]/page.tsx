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

  // Ensure image URL is absolute for better SEO
  const imageUrl = videoDetails?.preview_image?.startsWith('http')
    ? videoDetails.preview_image
    : `${process.env.NEXT_PUBLIC_HOST_URL}${videoDetails?.preview_image}`

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_HOST_URL || 'https://begenuin.com'),
    title: videoDetails?.title || 'Short Video | Genuin',
    description:
      videoDetails?.description ||
      'Watch this short video on Genuin - your destination for engaging short-form video content',
    openGraph: {
      title: videoDetails?.title || 'Short Video | Genuin',
      description:
        videoDetails?.description ||
        'Watch this short video on Genuin - your destination for engaging short-form video content',
      url: shareLink,
      type: 'video.other', // Changed back to video type for proper content categorization
      videos: [
        {
          url: shareLink,
          type: 'video/mp4', // Corrected video MIME type
          // Use more generic aspect ratio indicators instead of fixed dimensions
          width: 9, // Using aspect ratio 9:16 which is standard for vertical video
          height: 16,
        },
      ],
      siteName: 'Genuin',
    },
    // Enhanced metadata specifically for video content
    other: {
      'og:image': imageUrl,
      'og:image:width': '1084',
      'og:image:height': '546',
      'og:video': shareLink,
      'og:video:type': 'video/mp4', // For MP4 videos
      // Alternative for HLS streaming
      'og:video:secure_url': shareLink, // For secure streaming
      'og:video:type:alternative': 'application/x-mpegURL', // For m3u8/HLS streams
      'og:video:width': '9', // Aspect ratio instead of fixed pixels
      'og:video:height': '16', // Maintains 9:16 vertical video aspect ratio
      'twitter:card': 'player',
      'twitter:image': imageUrl,
      'twitter:player': shareLink,
      'twitter:player:width': '100%', // Responsive width
      'twitter:player:height': 'auto', // Responsive height
      // Schema.org VideoObject markup helps with video search features
      video_type: 'short_form_video',
      video_duration: 'PT60S', // Assuming average 60 seconds for short video
      content_type: 'short_video',
      robots: 'index, follow, max-video-preview:-1',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  }
}

// Force dynamic rendering for up-to-date content
export const dynamic = 'force-dynamic'
export const revalidate = 0
