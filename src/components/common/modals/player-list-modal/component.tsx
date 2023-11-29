'use client'
import { useEffect, type ReactNode } from 'react'
import Player from '@components/common/player'
import { PlayerDialog, PlayerDialogContent } from '@components/custom/player-dialog'
import Image from 'next/image'
import icArrowUp from '@icons/player-controls/icArrowUp.svg'
import icArrowDown from '@icons/player-controls/icArrowDown.svg'
import { usePlayerListModalStore } from './store'
import { type VideoDataListType } from '@lib/schemas/video'

interface Props {
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
}

export function Component({ videosData, startIndex, onOpenChange }: Props) {
  const { currentIndex, setCurrentIndex, videos, setVideosData } = usePlayerListModalStore((state) => ({
    currentIndex: state.currentIndex,
    setCurrentIndex: state.setCurrentIndex,
    videos: state.videos,
    setVideosData: state.setVideos,
  }))

  const videoDetails = videos[currentIndex]

  useEffect(() => {
    setVideosData(videosData)
  }, [videosData])

  useEffect(() => {
    setCurrentIndex(startIndex)
  }, [startIndex])

  return (
    <PlayerDialog open onOpenChange={onOpenChange}>
      <PlayerDialogContent>
        <div className="flex items-center">
          <Player videoData={videoDetails} shouldPlay shouldShowBackgroundBlurImage={false} loop />
          <div className="flex flex-col gap-y-4 pl-4">
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
