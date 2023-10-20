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
  const animationEleRef = useRef<HTMLDivElement>(null)
  const { data: videos, isLoading, isError } = getCommunityVideos(communityHandle)

  useEffect(() => {
    setTimeout(() => {
      animationEleRef.current?.classList.add('left-full')
    }, 3000)
  }, [])

  return (
    <div className="relative z-10">
      <div
        className="hide-scrollbar relative snap-y overflow-y-auto overflow-x-clip bg-blue-20"
        ref={divRef}
        style={{
          width: (divRef.current?.parentElement?.getBoundingClientRect().height || 0) * (9 / 16),
          height: divRef.current?.parentElement?.getBoundingClientRect().height || 0,
          minWidth: (divRef.current?.parentElement?.getBoundingClientRect().height || 0) * (9 / 16),
          maxWidth: (divRef.current?.parentElement?.getBoundingClientRect().height || 0) * (9 / 16),
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
      <div
        ref={animationEleRef}
        style={{
          minWidth: '85%',
        }}
        className="absolute left-0 top-0 z-[-1] h-full bg-monochrome-3 transition-[left] duration-300 ease-linear">
        <p>Hello world...</p>
      </div>
    </div>
  )
}

function NoReelsAvailable() {
  return <div>No reels available.</div>
}
