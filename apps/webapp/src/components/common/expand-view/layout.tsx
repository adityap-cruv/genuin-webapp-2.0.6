import { type VideoPlayerModalType } from '@lib/schemas/player/video'

import { Actions } from '../player/control-layer/actions'

import { AnimatePresence } from 'framer-motion'
import { type Swiper as SwiperType } from 'swiper/types'
import NavigationButtons from '../expand-view/navigation-buttons'
import ExpandViewCommentBoxLayout from '../expand-view/comment-box'

type FullScreenLayoutProps = {
  currentIndex: number
  videos: VideoPlayerModalType[]
  isCommentBoxOpen: boolean
  swiperInstance?: SwiperType | null
}

export function FullScreenLayout({ currentIndex, videos, isCommentBoxOpen, swiperInstance }: FullScreenLayoutProps) {
  return (
    <>
      <div className="flex h-full flex-col justify-end p-4">
        <Actions.desktop
          className="gap-2"
          shareUrl={videos[currentIndex].video.shareUrl}
          sparkCount={videos[currentIndex].video.sparkCount}
          videoId={videos[currentIndex].video.id}
          videoSlug={videos[currentIndex].video.slug}
          attachedLink={videos[currentIndex].video.attachedLink}
          description={videos[currentIndex].video.descriptionText}
          isSparked={videos[currentIndex].video.isSparked}
          commentCount={videos[currentIndex].video.commentCount}
        />
      </div>

      <div className="absolute right-2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col gap-4">
        <NavigationButtons videos={videos} currentIndex={currentIndex} swiperInstance={swiperInstance ?? null} />
      </div>

      <AnimatePresence>
        {isCommentBoxOpen && <ExpandViewCommentBoxLayout videos={videos} currentIndex={currentIndex} />}
      </AnimatePresence>
    </>
  )
}
