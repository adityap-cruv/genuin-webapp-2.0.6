'use client'
import {
  CustomDialog,
  CustomDialogClose,
  CustomDialogContent,
  CustomDialogTrigger,
} from '@components/custom/custom-dialog'
import icUpArrow from '@icons/player-controls/icArrowUp.svg'
import icDownArrow from '@icons/player-controls/icArrowDown.svg'
import Image from 'next/image'
import { Loader } from '@components/ui/loader'
import { cn } from '@lib/utils'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { type VideoPlayerModalType } from '@lib/schemas/player/video'
import { UnseenMessageRibbon } from '../../unseen-message-ribbon'
import { Button } from '@/components/ui/button'
import { FeedContextProvider, useFeedListContext } from '@/components/providers/feed-provider'
import { Player } from '../../player'
import { type VideoSizeBoxType } from '@lib/stores/genuin-options'
import { usePlayerControlStore } from '../../player/player-control-store'
import { DesktopDetails } from '../desktop-details'
import Analytics from '@/services/analytics'
import { type CommunityUserRoleType } from '@/lib/schemas/roles'
import { useIHeartDemoStates } from '@/components/providers/iheart-demo-provider'
import { IHeartDemo } from '@/components/layouts/desktop/iheart-demo'
import { useEffect } from 'react'
import { CloseIcon } from '@icons/close-icon'

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
  const { mute } = usePlayerControlStore()

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
        <div className="relative flex items-center gap-x-6">
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
              <Content unreadMessageCount={unreadMessageCount} isInModal={isInModal} close={close} />
            </FeedContextProvider>
          )}
        </div>
      </CustomDialogContent>
    </CustomDialog>
  )
}

type ContentPropsType = { unreadMessageCount?: number; isInModal?: boolean; close?: () => void }

function Content({ unreadMessageCount, isInModal, close }: ContentPropsType) {
  const sizeBox = useGenuinOptions().sizeBoxes
  const { videos, updateCurrentIndex, currentIndex } = useFeedListContext()
  const { shouldShowIHeartDemo, renderIn } = useIHeartDemoStates()

  return (
    <>
      <div
        style={{ width: sizeBox.modal.width }}
        className="relative min-w-[800px] overflow-clip rounded-2xl bg-monochrome-white">
        <div style={{ height: sizeBox.modal.height }} className="relative">
          <CustomDialogClose
            onClick={() => {
              close?.()
            }}
            className="absolute right-4 top-4 z-10 border-none outline-none">
            <CloseIcon />
          </CustomDialogClose>
          {/* Please done modify below condition to  unreadMessageCount && unreadMessageCount !== 0,
             it is creating the problem on showing the 0 on the UI */}
          {unreadMessageCount !== undefined && unreadMessageCount !== 0 && (
            <div
              style={{ width: sizeBox.modal.player.width }}
              className="absolute inset-0 z-10 flex h-fit w-full items-center justify-center">
              <UnseenMessageRibbon messageCount={unreadMessageCount ?? 0} />
            </div>
          )}
          <SinglePlayer videoData={{ ...videos[currentIndex] }} sizeBox={sizeBox.modal.player} isInModal={isInModal} />
        </div>
        {shouldShowIHeartDemo && renderIn === 'modal' && (
          <div id="iframe-modal" style={{ height: '70px' }}>
            <IHeartDemo />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-y-4">
        <Button
          disabled={currentIndex === 0}
          onClick={() => {
            updateCurrentIndex(currentIndex - 1)
          }}
          className={cn(
            'rounded-full bg-monochrome-white/10 p-2 hover:bg-monochrome-white/20',
            currentIndex === 0 ? 'opacity-40' : undefined
          )}>
          <Image src={icUpArrow} alt="" />
        </Button>
        <Button
          disabled={currentIndex === videos.length - 1}
          onClick={() => {
            updateCurrentIndex(currentIndex + 1)
          }}
          className={cn(
            'rounded-full bg-monochrome-white/10 p-2 hover:bg-monochrome-white/20',
            currentIndex === videos?.length - 1 ? 'opacity-40' : undefined
          )}>
          <Image src={icDownArrow} alt="" />
        </Button>
      </div>
    </>
  )
}

type SinglePlayerProps = {
  videoData: VideoPlayerModalType
  sizeBox: VideoSizeBoxType
  className?: string
  isInModal?: boolean
}

// TODO: Remove this component and use swiper instead.
export function SinglePlayer({ sizeBox, className, videoData, isInModal }: SinglePlayerProps) {
  return (
    <div className={cn('flex h-full w-full', className)}>
      <div style={{ ...sizeBox }} className="hide-scrollbar overflow-x-clip">
        <Player.desktop
          isActive
          videoData={{
            id: videoData.video.id,
            shareUrl: videoData.video.shareUrl,
            attachedLink: videoData.video.attachedLink,
            source: videoData.video.source,
            sparkCount: videoData.video.sparkCount,
            thumbnail: videoData.video.thumbnail,
            slug: videoData.video.slug,
            description: videoData.video.descriptionText,
            clickableUrl: videoData.video.clickableUrl,
            isSparked: videoData.video.isSparked,
          }}
          loop
          onEnded={(event) => {
            const { currentTime, duration } = usePlayerControlStore.getState()
            Analytics.triggerAnalyticsForVideoComplete(videoData.video.id, duration, currentTime)
          }}
          isInModal={isInModal}
        />
      </div>
      <DesktopDetails {...videoData} />
    </div>
  )
}
