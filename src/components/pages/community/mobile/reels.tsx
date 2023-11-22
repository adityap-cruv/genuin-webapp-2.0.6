'use client'
import { Loader } from '@components/ui/loader'
import dynamic from 'next/dynamic'
import { getCommunityVideos } from '@lib/api/community'
import { useRef } from 'react'
import { useMotionValueEvent, useScroll } from 'framer-motion'

const Player = dynamic(async () => await import('@components/common/player').then((comp) => comp.default), {
  loading: (state) => {
    return <Loader size="lg" />
  },
})
// const Comments = dynamic(() => import('./comments').then((comp) => comp.Comments))
interface CommunityReelsProps {
  communityHandle: string
}

// todo create error in api component
export function CommunityReels({ communityHandle }: CommunityReelsProps) {
  const divRef = useRef<HTMLDivElement>(null)
  const { data, isLoading, fetchNextPage, isFetchingNextPage } = getCommunityVideos(communityHandle)
  const { scrollYProgress } = useScroll({ container: divRef })
  const videos = data?.pages.flatMap((item) => item.videos)
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (isFetchingNextPage) return
    if (Number(latest.toFixed(1)) >= 0.9) {
      void fetchNextPage()
    }
  })

  return (
    <div className="absolute left-0 top-0 z-10 h-full w-full overflow-clip">
      <div
        className="hide-scrollbar relative h-full snap-y snap-mandatory snap-always overflow-y-auto overflow-x-clip"
        ref={divRef}>
        <InnerReelList videos={videos} isLoading={isLoading} divRef={divRef} />
      </div>
      {/* {isFetched && <Comments communityHandle="genuincommunity" videoId="23" />} */}
    </div>
  )
}

interface InnerReelListProps {
  videos?: any[]
  isLoading: boolean
  divRef: React.RefObject<HTMLDivElement>
}
function InnerReelList({ videos, isLoading, divRef }: InnerReelListProps) {
  if (isLoading) {
    return (
      <Loader
        size="lg"
        style={{
          height: divRef.current?.parentElement?.getBoundingClientRect().height ?? 0,
          width: ((divRef.current?.parentElement?.getBoundingClientRect().height ?? 0) * 9) / 16,
        }}
      />
    )
  }
  if (!videos?.length) {
    return <NoReelsAvailable />
  }
  return videos.map((video, index) => {
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
  })
}

function NoReelsAvailable() {
  return <div>No reels available.</div>
}
