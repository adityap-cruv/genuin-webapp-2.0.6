'use client'
import { Loader } from '@components/ui/loader'
import dynamic from 'next/dynamic'
import { getCommunityVideos } from '@lib/api/community'
import { useRef } from 'react'

const Player = dynamic(() => import('@components/common/player').then((comp) => comp.default), {
  loading: (state) => {
    return <Loader size="lg" />
  },
})
const Comments = dynamic(() => import('./comments').then((comp) => comp.Comments))
interface CommunityReelsProps {
  communityHandle: string
}

//todo create error in api component
export function CommunityReels({ communityHandle }: CommunityReelsProps) {
  const divRef = useRef<HTMLDivElement>(null)
  const { data: videos, isLoading, isError, isFetched } = getCommunityVideos(communityHandle)

  return (
    <div className="relative z-10">
      <div
        className="hide-scrollbar relative h-full snap-y overflow-y-auto overflow-x-clip"
        ref={divRef}
        style={{
          width: (divRef.current?.parentElement?.getBoundingClientRect().height || 0) * (9 / 16),
        }}>
        {isLoading && <Loader size="lg" className="h-full w-full" />}
        {isError && <div>Something went wrong with api.</div>}
        {videos?.length === 0 && <NoReelsAvailable />}
        {isFetched &&
          videos &&
          videos.map((video: any, index: number) => {
            return (
              <Player
                key={index}
                shouldPlay={index === 0}
                videoData={video}
                sizeBox={{
                  height: divRef.current?.parentElement?.getBoundingClientRect().height || 0,
                  width: ((divRef.current?.parentElement?.getBoundingClientRect().height || 0) * 9) / 16,
                }}
                loop
                playIfInViewPort
              />
            )
          })}
      </div>
      {/* {isFetched && <Comments communityHandle="genuincommunity" videoId="23" />} */}
    </div>
  )
}

function NoReelsAvailable() {
  return <div>No reels available.</div>
}
