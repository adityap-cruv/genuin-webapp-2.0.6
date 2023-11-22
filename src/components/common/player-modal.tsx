'use client'
import type { VideoDataType } from '@lib/schemas/video'
import { type ReactNode } from 'react'
import Player from './player'
import { PlayerDialog, PlayerDialogContent, PlayerDialogTrigger } from '@components/custom/player-dialog'

interface Props {
  children: ReactNode
  videoDetails: VideoDataType
}

// todo configure dialog properly and player is not playing video
export function PlayerModal({ children, videoDetails }: Props) {
  return (
    <PlayerDialog>
      <PlayerDialogTrigger>{children}</PlayerDialogTrigger>
      <PlayerDialogContent>
        <Player videoData={videoDetails} shouldPlay shouldShowBackgroundBlurImage={false} loop />
      </PlayerDialogContent>
    </PlayerDialog>
  )
}
