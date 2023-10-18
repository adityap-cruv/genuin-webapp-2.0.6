import { Loader } from '@components/ui/loader'
import dynamic from 'next/dynamic'
import { getCommunityVideos } from '@lib/api/community'
import { useEffect, useRef, useState } from 'react'
const Player = dynamic(() => import('@components/common/player').then((comp) => comp.default), {
  loading: (state) => {
    return <Loader size="lg" />
  },
})
interface CommunityReelsProps {
  communityHandle: string
}

export function CommunityReels({ communityHandle }: CommunityReelsProps) {
  const divRef = useRef<HTMLDivElement>(null)
  const { data: videos, isLoading, isError } = getCommunityVideos(communityHandle)

  const [parentElementHeight, setParentElementHeight] = useState(0)

  useEffect(() => {
    const divElement = divRef.current
    if (!divElement) return
    setParentElementHeight(divElement.parentElement?.getBoundingClientRect().height || 0)
  }, [])

  return (
    <div
      className="hide-scrollbar snap-y overflow-y-auto overflow-x-clip bg-blue-20"
      ref={divRef}
      style={{
        width: parentElementHeight * (9 / 16),
        height: parentElementHeight,
        minWidth: parentElementHeight * (9 / 16),
      }}>
      {isLoading && <Loader size="lg" />}
      {isError && <div>Something went wrong with api.</div>}
      {videos?.length === 0 && <NoReelsAvailable />}
      {videos &&
        videos.map((video, index) => {
          return (
            <Player
              key={index}
              shouldPlay={index === 0}
              videoData={video}
              sizeBox={{ height: parentElementHeight, width: (parentElementHeight * 9) / 16 }}
              loop
              playIfInViewPort
            />
          )
        })}
    </div>
  )
}

function NoReelsAvailable() {
  return <div>No reels available.</div>
}
