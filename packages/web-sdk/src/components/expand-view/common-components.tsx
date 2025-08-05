import { NavigationButtons } from './navigation-buttons'
import { Actions } from '../actions'
import { FeedVideoType } from '@/type'
import { useBaseContext } from '@/context/base'
import { ExpandViewCommentBoxLayout } from './comment-box'

type ExpandViewComponentsProps = {
  videos: FeedVideoType[]
  activeIndex: number
  swiperInstance: any
  onSpark?: (videoId: string, isSparked: boolean) => void
}

export function ExpandViewComponents({
  videos,
  activeIndex,
  swiperInstance,
  onSpark,
}: ExpandViewComponentsProps) {
  const { brandDetails } = useBaseContext()

  const baseShareUrl = videos[activeIndex]?.video.share_url
    ? videos[activeIndex]?.video.share_url.split('/video')
    : []
  const shareUrl =
    baseShareUrl.length === 2
      ? `${brandDetails?.brand_id === 2357 ? `${window.location.href}?video=${baseShareUrl[1].slice(1).replace('?', '&')}` : `${baseShareUrl[0]}?video=${baseShareUrl[1].slice(1).replace('?', '&')}`}`
      : videos[activeIndex]?.video.share_url || ''

  return (
    <>
      <div className='flex h-full flex-col justify-end p-4'>
        <Actions
          videoId={videos[activeIndex]?.uuid}
          videoSlug={videos[activeIndex]?.video.slug}
          shareUrl={shareUrl}
          videoShareUrl={videos[activeIndex]?.video.share_url}
          noOfSparks={videos[activeIndex]?.video.no_of_sparks}
          noOfComments={videos[activeIndex]?.video.no_of_comments}
          isSparked={videos[activeIndex]?.video.is_sparked}
          onSpark={onSpark}
          showComment
        />
      </div>

      <div className='absolute z-10 right-2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col gap-4'>
        <NavigationButtons
          videos={videos}
          currentIndex={activeIndex}
          swiperInstance={swiperInstance}
        />
      </div>

      <ExpandViewCommentBoxLayout videosDetails={videos[activeIndex]} />
    </>
  )
}
