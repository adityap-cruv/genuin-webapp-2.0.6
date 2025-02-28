'use client'
import {
  CustomDialog,
  CustomDialogClose,
  CustomDialogContent,
  CustomDialogTrigger,
} from '@components/custom/custom-dialog'
import { Loader } from '@components/ui/loader'
import { cn } from '@lib/utils'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { type VideoPlayerModalType } from '@lib/schemas/player/video'
import { UnseenMessageRibbon } from '../../unseen-message-ribbon'
import { FeedContextProvider, useFeedListContext } from '@/components/providers/feed-provider'
import { Player } from '../../player'
import { usePlayerControlStore } from '../../player/player-control-store'
import { DesktopDetails } from '../desktop-details'
import Analytics from '@/services/analytics'
import { type CommunityUserRoleType } from '@/lib/schemas/roles'
import { useIHeartDemoStates } from '@/components/providers/iheart-demo-provider'
import { IHeartDemo } from '@/components/layouts/desktop/iheart-demo'
import { useCallback, useEffect, useState } from 'react'
import { CloseIcon } from '@icons/close-icon'
import { type Swiper as SwiperType } from 'swiper/types'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Mousewheel, Keyboard } from 'swiper/modules'
import { Actions } from '../../player/control-layer/actions'
import FullScreenCommentBox from '../../full-screen-comment-box'
import FullScreenSideButtons from '../../full-screen-side-buttons'
import FullScreenVideoDetails from '../../full-screen-video-details'
import { motion, AnimatePresence } from 'framer-motion'

type Props = {
  children?: React.ReactNode
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
  open: boolean
  close: () => void
  isLoading: boolean
  unreadMessageCount?: number
  isInModal?: boolean
  hasNextPage?: boolean
  onCommunityJoin?: (communityId: string, role: CommunityUserRoleType) => void
}

export function Desktop({
  children,
  open = false,
  hasNextPage,
  close,
  fetchNextVideos,
  isFetchingNextPage,
  isLoading,
  startIndex,
  videos,
  isInModal,
  unreadMessageCount,
  onCommunityJoin,
}: Props) {
  const { setRenderIn: setIHeartDemoRenderIn } = useIHeartDemoStates()
  const { mute, isFullScreen, isCommentBoxOpen, toggleFullScreen } = usePlayerControlStore()

  // This is to show the iheart demo in the modal.
  useEffect(() => {
    setIHeartDemoRenderIn(open ? 'modal' : 'root')
    return () => {
      setIHeartDemoRenderIn('root')
      mute()
    }
  }, [open])

  return (
    <CustomDialog open={open}>
      <CustomDialogTrigger>{children}</CustomDialogTrigger>
      <CustomDialogContent
        className="flex-col"
        onCloseAutoFocus={(e) => {
          e.preventDefault()
        }}
        showDefaultClose={false}>
        <div
          className={cn('relative flex items-center gap-x-6', {
            'fixed inset-0 z-50 h-full w-full justify-center bg-monochrome-black': isFullScreen,
          })}>
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
              <Content
                unreadMessageCount={unreadMessageCount}
                isInModal={isInModal}
                close={close}
                isFullScreen={isFullScreen}
                isCommentBoxOpen={isCommentBoxOpen}
                toggleFullScreen={toggleFullScreen}
              />
            </FeedContextProvider>
          )}
        </div>
      </CustomDialogContent>
    </CustomDialog>
  )
}

type ContentPropsType = {
  unreadMessageCount?: number
  isInModal?: boolean
  close?: () => void
  isFullScreen: boolean
  isCommentBoxOpen: boolean
  toggleFullScreen: () => void
}

function Content({
  unreadMessageCount,
  isInModal,
  close,
  isFullScreen,
  isCommentBoxOpen,
  toggleFullScreen,
}: ContentPropsType) {
  const sizeBox = useGenuinOptions().sizeBoxes
  const { videos, updateCurrentIndex, currentIndex } = useFeedListContext()
  const { shouldShowIHeartDemo, renderIn } = useIHeartDemoStates()
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null)
  const [isMobileCommentView, setIsMobileCommentView] = useState(window.innerWidth < 1280)

  const handleActiveIndexChange = useCallback(
    (swiper: SwiperType) => {
      updateCurrentIndex(swiper.activeIndex)
    },
    [updateCurrentIndex]
  )

  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout

    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        setIsMobileCommentView(window.innerWidth < 1280)
      }, 100) // Debounce effect
    }

    window.addEventListener('resize', handleResize)
    return () => {
      clearTimeout(resizeTimeout)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullScreen) {
        toggleFullScreen()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isFullScreen])

  return (
    <>
      <div
        style={{ width: isFullScreen ? '100%' : sizeBox.modal.width }}
        className={cn('relative min-w-[800px] overflow-clip rounded-2xl transition-all', {
          'flex h-full w-full justify-center gap-20': isFullScreen,
        })}>
        <div style={{ height: isFullScreen ? '100%' : sizeBox.modal.height }} className="relative">
          {!isFullScreen && (
            <CustomDialogClose
              onClick={() => {
                close?.()
              }}
              className="absolute right-4 top-4 z-10 border-none outline-none">
              <CloseIcon />
            </CustomDialogClose>
          )}
          {/* Please done modify below condition to  unreadMessageCount && unreadMessageCount !== 0,
             it is creating the problem on showing the 0 on the UI */}
          {!isFullScreen && unreadMessageCount !== undefined && unreadMessageCount !== 0 && (
            <div
              style={{ width: sizeBox.modal.player.width }}
              className="absolute inset-0 z-10 flex h-fit w-full items-center justify-center">
              <UnseenMessageRibbon messageCount={unreadMessageCount ?? 0} />
            </div>
          )}
          <div className={cn('flex h-full w-full')}>
            <div
              style={{
                width: isFullScreen ? undefined : sizeBox.modal.player.width,
                height: isFullScreen ? '100vh' : sizeBox.modal.player.height,
                aspectRatio: isFullScreen ? '9 / 16' : undefined,
              }}
              className="hide-scrollbar overflow-x-clip bg-red">
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
                  width: isFullScreen ? undefined : sizeBox.modal.player.width,
                  height: isFullScreen ? '100%' : sizeBox.modal.player.height,
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
                              <>
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

                                {isFullScreen && (
                                  <div className="fixed absolute inset-0 h-full w-full">
                                    <FullScreenVideoDetails
                                      videos={videos}
                                      currentIndex={currentIndex}
                                      isActive={isActive}
                                    />
                                  </div>
                                )}
                              </>
                            )
                      }}
                    </SwiperSlide>
                  )
                })}
              </Swiper>
            </div>
            {!isFullScreen && <DesktopDetails {...videos[currentIndex]} />}
            {isFullScreen && (
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
            )}
          </div>
        </div>
        {shouldShowIHeartDemo && renderIn === 'modal' && (
          <div id="iframe-modal" style={{ height: '70px' }}>
            <IHeartDemo inModal />
          </div>
        )}
        {isFullScreen && (
          <div className="absolute right-2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col gap-4">
            <FullScreenSideButtons videos={videos} currentIndex={currentIndex} swiperInstance={swiperInstance} />
          </div>
        )}
        {isFullScreen && (
          <AnimatePresence>
            {isCommentBoxOpen && (
              <motion.div
                key="fullscreen-comment-box"
                className="z-0 h-full"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: isMobileCommentView ? 0 : '25%', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}>
                <FullScreenCommentBox
                  videos={videos}
                  currentIndex={currentIndex}
                  isMobileCommentView={isMobileCommentView}
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
      {!isFullScreen && (
        <div className="flex flex-col gap-4">
          <FullScreenSideButtons videos={videos} currentIndex={currentIndex} swiperInstance={swiperInstance} />
        </div>
      )}
    </>
  )
}
