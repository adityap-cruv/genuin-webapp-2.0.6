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
import { useCallback, useEffect, useRef } from 'react'
import { CloseIcon } from '@icons/close-icon'
import { type Swiper as SwiperType } from 'swiper/types'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Mousewheel, Keyboard, Virtual } from 'swiper/modules'
import { Actions } from '../../player/control-layer/actions'
import FullScreenSideButtons from '../../expand-view/full-screen-side-buttons'
import FullScreenVideoDetails from '../../expand-view/full-screen-video-details'
import FullScreenCommentBoxLayout from '../../expand-view/full-screen-comment-box'
import { AnimatePresence } from 'framer-motion'
import { UAParser } from 'ua-parser-js'
import FullScreenEsc from '../../expand-view/full-screen-esc'
import { useIheartBorderState } from '@/hooks/use-iheart-border'

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

const CONFIG = {
  SCROLL_DELAY: 500,
  THRESHOLD_TIME: 400, // Increased from 300
  MOUSE_THRESHOLD: {
    WINDOWS: 30, // Higher threshold for Windows
    DEFAULT: 20, // Original threshold for other OS
  },
  MOUSE_SENSITIVITY: {
    WINDOWS: 0.8, // Lower sensitivity for Windows
    DEFAULT: 1, // Original sensitivity for other OS
  },
  DEBOUNCE_TIME: 150, // New debounce time for wheel events
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
  const { mute, isFullScreen, isCommentBoxOpen, toggleFullScreen, muted } = usePlayerControlStore()

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
                muted={muted}
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
  muted?: boolean
}

function Content({
  unreadMessageCount,
  isInModal,
  close,
  isFullScreen,
  isCommentBoxOpen,
  toggleFullScreen,
  muted,
}: ContentPropsType) {
  const sizeBox = useGenuinOptions().sizeBoxes
  const { videos, updateCurrentIndex, currentIndex } = useFeedListContext()
  const { shouldShowIHeartDemo, renderIn, isIHeartPlaying } = useIHeartDemoStates()
  const isWindows = new UAParser().getResult().os.name === 'Windows'
  const touchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const wheelTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const swiperRef = useRef<SwiperType | null>(null)
  const lastWheelTime = useRef<number>(0)
  const showBorder = useIheartBorderState(!isIHeartPlaying && !muted && shouldShowIHeartDemo)

  const clearTimeouts = useCallback(() => {
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current)
      touchTimeoutRef.current = null
    }
    if (wheelTimeoutRef.current) {
      clearTimeout(wheelTimeoutRef.current)
      wheelTimeoutRef.current = null
    }
  }, [])

  const handleWheel = useCallback((swiper: SwiperType, event: WheelEvent) => {
    const now = Date.now()
    if (now - lastWheelTime.current < CONFIG.DEBOUNCE_TIME) {
      event.preventDefault()
      return false
    }
    lastWheelTime.current = now
    return true
  }, [])

  const handleSlideChange = useCallback(
    (swiper: SwiperType) => {
      clearTimeouts()
      swiper.mousewheel.disable()

      touchTimeoutRef.current = setTimeout(() => {
        swiper.mousewheel.enable()
      }, CONFIG.SCROLL_DELAY)
    },
    [clearTimeouts]
  )

  const handleActiveIndexChange = useCallback(
    (swiper: SwiperType) => {
      updateCurrentIndex(swiper.activeIndex)
    },
    [updateCurrentIndex]
  )

  return (
    <>
      <div
        style={{ width: isFullScreen ? '100%' : sizeBox.modal.width }}
        className={cn('relative min-w-[800px] overflow-clip rounded-2xl transition-all', {
          'flex h-full w-full justify-center': isFullScreen,
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
                height: isFullScreen ? '100%' : sizeBox.modal.player.height,
                aspectRatio: isFullScreen ? '9 / 16' : undefined,
              }}
              className={cn('hide-scrollbar relative flex flex-col overflow-x-clip', {
                'w-full flex-row': !isFullScreen,
              })}>
              {isFullScreen && (
                <div
                  style={{
                    height: 'calc(100% - 75px)',
                  }}
                  className={cn(
                    'pointer-events-none absolute z-40 w-full border-4 bg-transparent transition-all ease-in-out',
                    { 'animated-border': showBorder },
                    { 'border-transparent': !showBorder }
                  )}
                />
              )}
              <Swiper
                onSwiper={(swiper) => {
                  swiperRef.current = swiper
                  ;(swiper as any).on('wheel', handleWheel)
                }}
                direction="vertical"
                modules={[Mousewheel, Keyboard, Virtual]}
                slidesPerView={1}
                speed={CONFIG.SCROLL_DELAY}
                // initialSlide={startIndex}
                // allowSlideNext={allowSlideNext}
                allowSlidePrev={true}
                keyboard={{
                  enabled: true,
                  onlyInViewport: true,
                }}
                // virtual={{
                //   enabled: true,
                //   addSlidesAfter: 1,
                //   addSlidesBefore: 1,
                // }}
                mousewheel={{
                  forceToAxis: true,
                  releaseOnEdges: true,
                  thresholdDelta: isWindows ? CONFIG.MOUSE_THRESHOLD.WINDOWS : CONFIG.MOUSE_THRESHOLD.DEFAULT,
                  thresholdTime: CONFIG.THRESHOLD_TIME,
                  sensitivity: isWindows ? CONFIG.MOUSE_SENSITIVITY.WINDOWS : CONFIG.MOUSE_SENSITIVITY.DEFAULT,
                }}
                followFinger={false}
                longSwipesRatio={0.2}
                onActiveIndexChange={handleActiveIndexChange}
                onSlideChange={handleSlideChange}
                style={{
                  width: isFullScreen ? '100%' : sizeBox.modal.player.width,
                  height: isFullScreen ? '100%' : sizeBox.modal.player.height,
                }}>
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
                                      isFullScreen={isFullScreen}
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
              {shouldShowIHeartDemo && isFullScreen && <IHeartDemo />}
              {isFullScreen && (
                <FullScreenEsc
                  isFullScreen={isFullScreen}
                  toggleFullScreen={toggleFullScreen}
                  videoId={videos[currentIndex].video.id}
                />
              )}
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
        {shouldShowIHeartDemo && !isFullScreen && renderIn === 'modal' && (
          <div id="iframe-modal" style={{ height: '70px' }}>
            <IHeartDemo inModal />
          </div>
        )}
        {isFullScreen && (
          <div className="absolute right-2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col gap-4">
            <FullScreenSideButtons videos={videos} currentIndex={currentIndex} swiperInstance={swiperRef.current} />
          </div>
        )}
        {isFullScreen && (
          <AnimatePresence>
            {isCommentBoxOpen && <FullScreenCommentBoxLayout videos={videos} currentIndex={currentIndex} />}
          </AnimatePresence>
        )}
      </div>
      {!isFullScreen && (
        <div className="flex flex-col gap-4">
          <FullScreenSideButtons videos={videos} currentIndex={currentIndex} swiperInstance={swiperRef.current} />
        </div>
      )}
    </>
  )
}
