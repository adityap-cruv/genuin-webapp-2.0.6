'use client'
import { useEffect, type ReactNode } from 'react'
import { PlayerDialog, PlayerDialogContent } from '@components/custom/player-dialog'
import Image from 'next/image'
import icArrowUp from '@icons/player-controls/icArrowUp.svg'
import icArrowDown from '@icons/player-controls/icArrowDown.svg'
import { usePlayerListModalStore } from './store'
import { type VideoDataListType } from '@lib/schemas/video'
import dynamic from 'next/dynamic'
import { useVideoSizeBox } from '@hooks/use-video-size-box'
import { Loader } from '@components/ui/loader'
import { replaceUrlWithoutReload } from '@lib/utils'
import { PATH_NAME } from '@lib/utils/constants/path'
const Player = dynamic(async () => await import('@components/common/player').then((comp) => comp.Player.desktop), {
  loading(loadingProps) {
    return <Loader size="lg" />
  },
})

type Props = {
  /**
   * List of videos.
   */
  videosData: VideoDataListType
  /**
   * This is index from videosData.
   */
  startIndex: number
  /**
   * This function is mendatory because it will help to close the modal.
   * @param open
   * @returns
   */
  onOpenChange: (open: boolean) => void
  /**
   * Function to close modal.
   */
  closeModal?: () => void
}

export function Component({ videosData, startIndex, onOpenChange, closeModal }: Props) {
  const { currentIndex, setCurrentIndex, videos, setVideosData } = usePlayerListModalStore((state) => ({
    currentIndex: state.currentIndex,
    setCurrentIndex: state.setCurrentIndex,
    videos: state.videos,
    setVideosData: state.setVideos,
  }))
  const sizeBox = useVideoSizeBox(false)

  const videoDetails = videos[currentIndex]

  useEffect(() => {
    setVideosData(videosData)
  }, [videosData])

  useEffect(() => {
    setCurrentIndex(startIndex)
  }, [startIndex])

  useEffect(() => {
    function handlePopState() {
      closeModal?.()
    }
    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  useEffect(() => {
    if (currentIndex !== -1) {
      const query = videoDetails.loop?.share_string
        ? [{ key: 'l', value: videoDetails.loop?.share_string ?? null }]
        : []
      replaceUrlWithoutReload({
        pathname: PATH_NAME.video(videoDetails?.video?.share_string),
        query,
      })
    }
  }, [currentIndex])

  return (
    <PlayerDialog modal open onOpenChange={onOpenChange}>
      <PlayerDialogContent>
        <div className="flex h-full w-full items-center">
          {sizeBox && (
            <div style={{ height: sizeBox.height, width: sizeBox.width }}>
              <Player
                sizeBox={sizeBox}
                videoData={videoDetails}
                shouldPlay
                shouldShowBackgroundBlurImage={false}
                loop
              />
            </div>
          )}
          <div className="hidden flex-col gap-y-4 pl-4 md:flex">
            {currentIndex !== 0 && (
              <NavigationButton
                onClick={() => {
                  if (currentIndex - 1 > -1) {
                    setCurrentIndex(currentIndex - 1)
                  }
                }}>
                <Image src={icArrowUp} alt="up" className="h-6 w-6" />
              </NavigationButton>
            )}
            {currentIndex !== videos.length - 1 && (
              <NavigationButton
                onClick={() => {
                  if (currentIndex + 1 < videos.length) {
                    setCurrentIndex(currentIndex + 1)
                  }
                }}>
                <Image src={icArrowDown} alt="down" className="h-6 w-6" />
              </NavigationButton>
            )}
          </div>
        </div>
      </PlayerDialogContent>
    </PlayerDialog>
  )
}

type NavigationButtonProps = {
  children: ReactNode
  onClick: () => void
}

function NavigationButton({ children, onClick }: NavigationButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex h-12 w-12 items-center justify-center rounded-full bg-monochrome-white/10 backdrop-blur-md hover:bg-monochrome-white/20">
      {children}
    </button>
  )
}
