'use client'
import type { VideoDataType } from '@lib/schemas/video'
import { type ReactNode } from 'react'
import Player from './player'
import { PlayerDialog, PlayerDialogContent, PlayerDialogTrigger } from '@components/custom/player-dialog'
import { useVideoSizeBox } from '@hooks/use-video-size-box'

interface Props {
  children: ReactNode
  videoDetails: VideoDataType
}

export function PlayerModal({ children, videoDetails }: Props) {
  const sizeBox = useVideoSizeBox(false)
  if (sizeBox)
    return (
      <PlayerDialog>
        <PlayerDialogTrigger>{children}</PlayerDialogTrigger>
        <PlayerDialogContent>
          <Player videoData={videoDetails} sizeBox={sizeBox} shouldPlay shouldShowBackgroundBlurImage={false} loop />
        </PlayerDialogContent>
      </PlayerDialog>
    )
}
