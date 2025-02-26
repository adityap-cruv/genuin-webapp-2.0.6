// To open full-screen view directly
'use client'
import { Loader } from '@components/ui/loader'
import { cn } from '@lib/utils'
import { type VideoPlayerModalType } from '@lib/schemas/player/video'
import { FeedContextProvider, useFeedListContext } from '@/components/providers/feed-provider'
import { Player } from '../../player'
import { usePlayerControlStore } from '../../player/player-control-store'
import { CommentBox } from '../desktop-details'
import Analytics from '@/services/analytics'
import { type CommunityUserRoleType } from '@/lib/schemas/roles'
import { useCallback, useRef, useState } from 'react'
import { Actions } from '../../player/control-layer/actions'
import { ChevronDown, ChevronUp } from 'lucide-react'
import MentionInput from '../../comments/mention-input'
import { type CommentListType } from '@/lib/schemas/loop/comment'
import { type Swiper as SwiperType } from 'swiper/types'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Mousewheel, Keyboard } from 'swiper/modules'
type Props = {
  videos: VideoPlayerModalType[]
  /**
   * Index to start playing video from.
   * @default 0
   */
  startIndex: number
  fetchNextVideos: () => void
  fetchPreviousVideos?: (index: number) => void
  isFetchingNextPage: boolean
  isError: boolean
  /**
   * Controls if modal should open or not.
   * @default false
   */
  isLoading: boolean
  isInModal?: boolean
  hasNextPage?: boolean
  onCommunityJoin?: (communityId: string, role: CommunityUserRoleType) => void
}

export function Desktop({
  hasNextPage,
  fetchNextVideos,
  isFetchingNextPage,
  isLoading,
  startIndex,
  videos,
  isInModal,
  onCommunityJoin,
}: Props) {
  const { isFullScreen, isCommentBoxOpen } = usePlayerControlStore()

  // If not full screen, don't render anything
  if (!isFullScreen) return null

  return (
    <div className="fixed inset-0 z-50 flex h-full w-full items-center justify-center bg-monochrome-black">
      {isLoading ? (
        <Loader size="md" />
      ) : (
        <FeedContextProvider
          hasNextPage={hasNextPage ?? false}
          startIndex={startIndex}
          videos={videos}
          fetchNextPage={fetchNextVideos}
          isFetchingNextPage={isFetchingNextPage}
          onCommunityJoin={onCommunityJoin}>
          <Content isInModal={isInModal} isFullScreen={isFullScreen} isCommentBoxOpen={isCommentBoxOpen} />
        </FeedContextProvider>
      )}
    </div>
  )
}

type ContentPropsType = { isInModal?: boolean; isFullScreen?: boolean; isCommentBoxOpen?: boolean }

function Content({ isInModal, isFullScreen, isCommentBoxOpen }: ContentPropsType) {
  const { videos, updateCurrentIndex, currentIndex } = useFeedListContext()
  const scrollDivRef = useRef<HTMLDivElement>(null)
  const [comments, setComments] = useState<CommentListType>([])
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null)

  const handleActiveIndexChange = useCallback(
    (swiper: SwiperType) => {
      updateCurrentIndex(swiper.activeIndex)
    },
    [updateCurrentIndex]
  )

  const handleSwipeUp = () => {
    if (swiperInstance) {
      swiperInstance.slidePrev() // Moves to the previous slide
    }
  }

  const handleSwipeDown = () => {
    if (swiperInstance) {
      swiperInstance.slideNext() // Moves to the next slide
    }
  }

  return (
    <>
      <div className={cn('relative flex h-full w-full justify-center gap-20')}>
        <div className={cn('flex', { 'h-full w-full': !isFullScreen })}>
          <Swiper
            // PLAY_PAUSE gesture will end when the user takes action;
            onSwiper={setSwiperInstance} // Correctly assigns Swiper instance
            onActiveIndexChange={handleActiveIndexChange}
            // allowSlideNext={allowSlideNext}
            keyboard={true}
            // initialSlide={startIndex}
            speed={500}
            modules={[Mousewheel, Keyboard]}
            mousewheel
            style={{
              width: isFullScreen ? undefined : '',
              height: isFullScreen ? '100%' : '',
              aspectRatio: isFullScreen ? '9 / 16' : undefined,
            }}
            direction="vertical">
            {videos.map((_, index: number) => {
              return (
                <SwiperSlide key={index}>
                  {({ isActive, isPrev, isNext }) => {
                    if (isActive || isPrev || isNext)
                      if (videos[index])
                        return (
                          <Player.desktop
                            isActive
                            videoData={{
                              id: videos[currentIndex].video.id,
                              shareUrl: videos[currentIndex].video.shareUrl,
                              attachedLink: videos[currentIndex].video.attachedLink,
                              source: videos[currentIndex].video.source,
                              sparkCount: videos[currentIndex].video.sparkCount,
                              thumbnail: videos[currentIndex].video.thumbnail,
                              slug: videos[currentIndex].video.slug,
                              description: videos[currentIndex].video.descriptionText,
                              clickableUrl: videos[currentIndex].video.clickableUrl,
                              isSparked: videos[currentIndex].video.isSparked,
                            }}
                            loop
                            onEnded={() => {
                              const { currentTime, duration } = usePlayerControlStore.getState()
                              Analytics.triggerAnalyticsForVideoComplete(
                                videos[currentIndex].video.id,
                                duration,
                                currentTime
                              )
                            }}
                            isInModal={isInModal}
                          />
                        )
                  }}
                </SwiperSlide>
              )
            })}
          </Swiper>

          <div className="flex h-full flex-col justify-end p-4">
            <Actions.desktop
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
        </div>

        <div className="absolute right-2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col gap-4 text-monochrome-white">
          <div className="cursor-pointer rounded-full bg-secondary-400 p-3" onClick={handleSwipeUp}>
            <ChevronUp className="h-6 w-6" />
          </div>
          <div className="cursor-pointer rounded-full bg-secondary-400 p-3" onClick={handleSwipeDown}>
            <ChevronDown className="h-6 w-6" />
          </div>
        </div>

        {isCommentBoxOpen && (
          <div className="relative aspect-reel h-full rounded-2xl bg-monochrome-white pb-16 pl-2">
            <div ref={scrollDivRef} className="flex h-full flex-col overflow-auto overflow-x-clip rounded-2xl">
              <div className="sticky top-0 z-10">
                <p className="border-b border-t border-tertiary-200 bg-monochrome-white px-4 py-3 text-title-3-demi">
                  Comments{' '}
                  {videos[currentIndex].video.commentCount !== 0 ? `(${videos[currentIndex].video.commentCount})` : ''}
                </p>
              </div>
              <div className="h-full px-4 pt-2">
                <CommentBox
                  videoId={videos[currentIndex].video.id}
                  parentRef={scrollDivRef}
                  setComments={setComments}
                  comments={comments}
                />
              </div>
            </div>
            <MentionInput
              setComments={setComments}
              videoId={videos[currentIndex].video.id}
              loopId={videos[currentIndex].loop.id}
              videoSlug={videos[currentIndex].video.slug}
              communityId={videos[currentIndex].community.id}
            />
          </div>
        )}
      </div>
    </>
  )
}
