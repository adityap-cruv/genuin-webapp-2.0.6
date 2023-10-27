import { Dialog, DialogContent, DialogTrigger } from '@components/ui/dialog'
import type { VideoDataType } from '@lib/schemas/video'
import { ReactNode } from 'react'
import Player from './player'

interface Props {
  children: ReactNode
  videoDetails: VideoDataType
}

// todo configure dialog properly and player is not playing video
export function VideoModal({ children, videoDetails }: Props) {
  return (
    <Dialog>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent>
        <Player shouldPlay videoData={videoDetails} />
      </DialogContent>
    </Dialog>
  )
}
