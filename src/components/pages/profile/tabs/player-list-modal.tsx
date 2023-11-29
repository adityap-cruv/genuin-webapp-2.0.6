'use client'
import { type ReactNode } from 'react'
import Player from '@components/common/player'
import { PlayerDialog, PlayerDialogContent, PlayerDialogTrigger } from '@components/custom/player-dialog'
import Image from 'next/image'
import icArrowUp from '@icons/player-controls/icArrowUp.svg'
import icArrowDown from '@icons/player-controls/icArrowDown.svg'
import { useTabsStore } from './tabs-store'

interface Props {
  children: ReactNode
}

export function PlayerListModal({ children }: Props) {
  const currentIndex = useTabsStore((state) => state.currentIndex)
  const setCurrentIndex = useTabsStore((state) => state.setCurrentIndex)
  const videos = useTabsStore((state) => state.videos)
  const videoDetails = videos[currentIndex]

  return (
    <PlayerDialog>
      <PlayerDialogTrigger>{children}</PlayerDialogTrigger>
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
