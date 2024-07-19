'use client'
import { Feed } from '@components/common/feed'
import { type VideoPlayerModalType } from '@lib/schemas/player/video'
import { useRef } from 'react'

type Props = {
  videoDetails: VideoPlayerModalType
}
// TODO: Fix comment component bug. scrolling issue.
export function Root({ videoDetails }: Props) {
  const videosRef = useRef<VideoPlayerModalType[]>([videoDetails])
  return (
    <div className="h-full w-full pl-6">
      <Feed.desktop isFetchingNextPage={false} videosRef={videosRef} />
    </div>
  )
}
