'use client'
import Player from '@components/common/player'
import { useVideoSizeBox } from '@hooks/use-video-size-box'

interface Props {
  videoData: any
}

export function MainComponent({ videoData = undefined }: Props) {
  const sizeBox = useVideoSizeBox()
  if (sizeBox && videoData) return <Player videoData={videoData} shouldPlay={true} loop sizeBox={sizeBox} />
}
