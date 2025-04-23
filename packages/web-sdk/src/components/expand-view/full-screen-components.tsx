import FullScreenSideButtons from '../expand-view/full-screen-side-buttons'
import FullScreenCommentBoxLayout from '../expand-view/full-screen-comment-box'
import { Actions } from '../actions'
import { FeedVideoType } from '@/type'
import { useEffect } from 'react'
import { useBaseContext } from '@/context/base'

type FullScreenComponentsProps = {
  videos: FeedVideoType[]
  activeIndex: number
  swiperInstance: any
  onSpark?: (videoId: string, isSparked: boolean) => void
}

export default function FullScreenComponents({
  videos,
  activeIndex,
  swiperInstance,
  onSpark,
}: FullScreenComponentsProps) {
  const { customizations } = useBaseContext()

  useEffect(() => {
    const rootElement = customizations?.element
    if (!rootElement) return

    // Apply inline styles directly
    rootElement.style.zIndex = '9999999999'

    return () => {
      // Clean up the inline styles when the component unmounts
      rootElement.style.zIndex = ''
    }
  }, [])

  return (
    <>
      <div className='flex h-full flex-col justify-end p-4'>
        <Actions
          videoId={videos[activeIndex]?.uuid}
          shareUrl={videos[activeIndex]?.video.share_url}
          noOfSparks={videos[activeIndex]?.video.no_of_sparks}
          noOfComments={videos[activeIndex]?.video.no_of_comments}
          isSparked={videos[activeIndex]?.video.is_sparked}
          onSpark={onSpark}
          showComment
        />
      </div>

      <div className='absolute z-10 right-2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col gap-4'>
        <FullScreenSideButtons
          videos={videos}
          currentIndex={activeIndex}
          swiperInstance={swiperInstance}
        />
      </div>

      <FullScreenCommentBoxLayout videosDetails={videos[activeIndex]} />
    </>
  )
}
