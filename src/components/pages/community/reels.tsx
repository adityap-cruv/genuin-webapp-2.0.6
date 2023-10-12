import Player from '@components/common/player'
import { Loader } from '@components/ui/loader'
import { getCommunityVideos } from '@lib/api/community'
import type { VideoDataListType } from '@lib/schemas/video'
import { useEffect, useRef, useState } from 'react'

interface CommunityReelsProps {
  communityHandle: string
}

export function CommunityReels({ communityHandle }: CommunityReelsProps) {
  const divRef = useRef<HTMLDivElement>(null)
  const { data: videos, isLoading, isError } = getCommunityVideos(communityHandle)

  const [parentElementHeight, setParentElementHeight] = useState(-1)

  useEffect(() => {
    const divElement = divRef.current
    if (!divElement) return
    setParentElementHeight(divElement.parentElement?.getBoundingClientRect().height || -1)
  }, [divRef])

  return (
    <div
      className="hide-scrollbar snap-y overflow-y-auto overflow-x-clip"
      ref={divRef}
      style={{ width: parentElementHeight * (9 / 16), height: parentElementHeight }}>
      {isLoading && <Loader size="lg" />}
      {isError && <div>Something went wrong with api.</div>}
      {videos?.length === 0 && <NoReelsAvailable />}
      {videos &&
        videos.map((video, index) => {
          return (
            <Player
              key={index}
              shouldPlay={index === 1}
              videoData={video}
              sizeBox={{ height: parentElementHeight, width: (parentElementHeight * 9) / 16 }}
              
            />
          )
        })}
    </div>
  )
}

function NoReelsAvailable() {
  return <div>No reels available.</div>
}
