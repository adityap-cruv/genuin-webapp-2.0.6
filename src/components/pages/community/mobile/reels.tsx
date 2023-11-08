'use client'
import { Loader } from '@components/ui/loader'
import dynamic from 'next/dynamic'
import { getCommunityVideos } from '@lib/api/community'
import { useEffect, useRef } from 'react'

const Player = dynamic(() => import('@components/common/player').then((comp) => comp.default), {
  loading: (state) => {
    return <Loader size="lg" />
  },
})

interface CommunityReelsProps {
  communityHandle: string
}

//todo create error in api component
export function CommunityReels({ communityHandle }: CommunityReelsProps) {
  const divRef = useRef<HTMLDivElement>(null)
  const { data: videos, isLoading, isError, isFetched } = getCommunityVideos(communityHandle)

  useEffect(() => {
    const div = divRef.current
    if (!div) return
    function scrollHandler(event: Event) {
      console.log('event::', event)
    }

    div.addEventListener('scroll', scrollHandler)
    return div.removeEventListener('scroll', scrollHandler)
  }, [])

  return (
    <div className="absolute left-0 top-0 z-10 h-full w-full overflow-clip">
      <div
        className="hide-scrollbar relative h-full snap-y snap-mandatory snap-always overflow-y-auto overflow-x-clip"
        ref={divRef}>
        {isLoading && <Loader size="lg" className="h-full w-full" />}
        {isError && <div>Something went wrong with api.</div>}
        {videos?.length === 0 && <NoReelsAvailable />}
        {isFetched &&
          videos.map((video: any, index: number) => {
            return (
              <Player
                key={index}
                shouldPlay
                videoData={video}
                isFirstPlayerInList={index === 0}
                loop
                playIfInViewPort
                showCommunityControl
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
